const router = require('express').Router();

const userRoutes = require('./users');
const moviesRoutes = require('./movies');
const auth = require('../middlewares/auth');
const { createUser, login, logout } = require('../controllers/users');
const { loginValidaion, createUserValidation } = require('../utils/requestValidation');
const NotFoundError = require('../errors/NotFoundError');
const { NOT_FOUND_ERROR } = require('../utils/constants');

router.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

router.post('/signin', loginValidaion, login);
router.post('/signup', createUserValidation, createUser);
router.get('/signout', logout);
router.use('/users', auth, userRoutes);
router.use('/movies', auth, moviesRoutes);

router.use('*', (req, res, next) => {
  next(new NotFoundError(NOT_FOUND_ERROR));
});

module.exports = router;
