const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');
const { USER_UNAUTHORIZED_ERROR } = require('../utils/constants');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    return next(new UnauthorizedError(USER_UNAUTHORIZED_ERROR));
  }

  req.user = payload;

  return next();
};
