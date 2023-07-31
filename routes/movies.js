const router = require('express').Router();
const {
  createMovieValidation,
  deleteMovieValidation,
} = require('../utils/requestValidation');

const {
  getMovies,
  deleteMovie,
  createMovie,
} = require('../controllers/movies');

router.get('/', getMovies);
router.delete('/:_id', deleteMovieValidation, deleteMovie);
router.post('/', createMovieValidation, createMovie);

module.exports = router;
