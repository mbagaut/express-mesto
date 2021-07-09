const router = require('express').Router();
const {
  createUser,
  getUser,
  getUsers,
  changeProfile,
  changeAvatar,
} = require('../controllers/users');

router.post('/users', createUser);
router.get('/users/:userId', getUser);
router.get('/users', getUsers);
router.patch('/users/me', changeProfile);
router.patch('/users/me/avatar', changeAvatar);

module.exports = router;
