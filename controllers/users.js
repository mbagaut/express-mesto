const User = require('../models/user');

const userNotExist = 'Запрашиваемый пользователь не найден';

const getUser = (req, res) => {
  const { _id } = req.body;
  User.findById({ _id })
    .then((user) => {
      if (!user) {
        res.status(404).send({ message: userNotExist });
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.status(200).send({ user }))
    .catch((err) => res.status(400).send({ message: err.message }));
};

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

const changeProfile = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about },
    {
      new: true,
      runValidators: true,
    })
    .then((user) => {
      if (!user) {
        res.status(404).send({ message: userNotExist });
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => res.status(400).send({ message: err.message }));
};

const changeAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar },
    {
      new: true,
      runValidators: true,
    })
    .then((user) => {
      if (!user) {
        res.status(404).send({ message: userNotExist });
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => res.status(400).send({ message: err.message }));
};

module.exports = {
  createUser,
  getUser,
  getUsers,
  changeProfile,
  changeAvatar,
};