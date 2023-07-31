const router = require('express').Router();

const {
  updateUserDataByIdValidation,
} = require('../utils/requestValidation');

const {
  findUserById,
  updateUserName,
} = require('../controllers/users');

router.get('/me', findUserById);
router.patch('/me', updateUserDataByIdValidation, updateUserName);

module.exports = router;
