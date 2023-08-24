const router = require('express').Router();

const {
  updateUserDataByIdValidation,
} = require('../utils/requestValidation');

const {
  findUserById,
  updateUserData,
} = require('../controllers/users');

router.get('/me', findUserById);
router.patch('/me', updateUserDataByIdValidation, updateUserData);

module.exports = router;
