const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SUCCESS, CREATED } = require('../utils/responceCodes');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

const {
  USER_LOGIN_SUCCESS,
  USER_LOGOUT_SUCCESS,
  USER_CAST_ERROR,
  USER_CREATE_ERROR,
  USER_UPDATE_ERROR,
  USER_NOT_FOUND_ERROR,
  USER_CONFLICT_ERROR,
} = require('../utils/constants');

const User = require('../models/user');

module.exports.findUserById = (req, res, next) => User.findById(req.user._id)
  .then((user) => {
    if (!user) {
      throw new NotFoundError(USER_NOT_FOUND_ERROR);
    }
    return res.status(SUCCESS).send(user);
  })
  .catch((err) => {
    if (err instanceof mongoose.Error.CastError) {
      next(new BadRequestError(USER_CAST_ERROR));
    } else {
      next(err);
    }
  });

module.exports.createUser = (req, res, next) => {
  const { email, password, name } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    })).then((newUser) => {
      const token = jwt.sign(
        { _id: newUser._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.status(CREATED).cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      }).send({
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError(USER_CONFLICT_ERROR));
      } else if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(USER_CREATE_ERROR));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        })
        .send({ message: USER_LOGIN_SUCCESS });
    })
    .catch(next);
};

module.exports.logout = (req, res, next) => {
  res
    .clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    })
    .send({ message: USER_LOGOUT_SUCCESS })
    .catch(next);
};

module.exports.updateUserData = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError(USER_NOT_FOUND_ERROR);
      }
      return res.status(SUCCESS).send(user);
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError(USER_CONFLICT_ERROR));
      } else if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(USER_UPDATE_ERROR));
      } else {
        next(err);
      }
    });
};
