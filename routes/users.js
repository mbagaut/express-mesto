const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getUser,
  getUsers,
  changeProfile,
  changeAvatar,
  getMyData,
} = require('../controllers/users');

router.get('/users', getUsers);
router.get('/users/me', getMyData);
router.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24),
  }),
}), getUser);
router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), changeProfile);
router.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().min(6),
  }),
}), changeAvatar);

module.exports = router;
