const mongoose = require('mongoose');

const Movie = require('../models/movie');
const { SUCCESS, CREATED } = require('../utils/responceCodes');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getMovies = (req, res, next) => Movie.find({})
  .populate(['owner'])
  .then((movies) => res.status(SUCCESS).send(movies.reverse()))
  .catch(next);

module.exports.deleteMovie = (req, res, next) => {
  const { _id } = req.params;
  return Movie.findById(_id)
    .then((movie) => {
      if (movie) {
        if (movie.owner.equals(req.user._id)) {
          return movie.deleteOne().then(() => res.status(SUCCESS).send(movie));
        }
        throw new ForbiddenError('Недостаточно прав для выполнения данного действия.');
      }
      throw new NotFoundError('Фильм с указанным _id не найден.');
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Переданы некорректные данные при удалении фильма.'));
      } else {
        next(err);
      }
    });
};

module.exports.createMovie = (req, res, next) => {
  const owner = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  return Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner,
  }).then((newMovie) => {
    newMovie.populate('owner').then(() => res.status(CREATED).send(newMovie));
  })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError('Переданы некорректные данные при создании фильма.'));
      } else {
        next(err);
      }
    });
};
