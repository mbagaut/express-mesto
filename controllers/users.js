const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const InternalServerError = require('../errors/internal-server-error');
const UnauthorizedError = require('../errors/unauthorized-error');
const ConflictError = require('../errors/conflict-error');

const getUser = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(() => {
      throw new NotFoundError('Пользователь по заданному id отсутствует в базе');
    })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(`${err.message}, проверьте корректность переданных параметров`));
      } else if (err.statusCode === 404) {
        next(err);
      } else {
        next(new InternalServerError('Ошибка сервера'));
      }
    });
};

const passwordValidator = (obj, password) => {
  const errorMessages = [];

  Object.keys(obj).forEach((prop) => (
    obj[prop].regex.test(password) ? false : errorMessages.push(obj[prop].message)
  ));

  return errorMessages.length > 0 ? errorMessages : true;
};

const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  // const regex = /^(?=.*[0-9])(?=.*[a-z])(?=\S+$).{6, 16}$/;
  // (?=.*[@#$%^&+=]) - при необходимости можно добавить требование к содержанию символов
  const requiredPatterns = {
    one: {
      regex: /^(?=.*[0-9])/g,
      message: 'Пароль должен содержать хотя бы одно число',
    },
    two: {
      regex: /^(?=.*[a-zа-яё])/g,
      message: 'Пароль должен содержать хотя бы одну букву в нижнем регистре',
    },
    three: {
      regex: /^(?=\S+$)/g,
      message: 'Пароль не должен содержать пробелов',
    },
    four: {
      regex: /^(?=.{6,16}$)/,
      message: 'Пароль должен содержать от 6 до 16 символов',
    },
  };
  const isPasswordValid = passwordValidator(requiredPatterns, password);
  if (isPasswordValid !== true) {
    throw new BadRequestError(isPasswordValid);
  } else {
    bcrypt.hash(password, 10)
      .then((hash) => User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      }))
      .then((user) => {
        res.status(201).send({
          _id: user._id,
          email: user.email,
          name: user.name,
          about: user.about,
          avatar: user.avatar,
        });
      })
      .catch((err) => {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
          next(new BadRequestError(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
        } else if (err.name === 'MongoError' && err.code === 11000) {
          next(new ConflictError('Данная почта уже зарегистрирована'));
        } else {
          next(new InternalServerError('Ошибка сервера'));
        }
      });
  }
};

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch(() => next(new InternalServerError('Ошибка сервера')));
};

const changeProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about },
    {
      new: true,
      runValidators: true,
    })
    .orFail(() => {
      throw new NotFoundError('Пользователь по заданному id отсутствует в базе');
    })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
      } else if (err.statusCode === 404) {
        next(err);
      } else {
        next(new InternalServerError('Ошибка сервера'));
      }
    });
};

const changeAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar },
    {
      new: true,
      runValidators: true,
    })
    .orFail(() => {
      throw new NotFoundError('Пользователь по заданному id отсутствует в базе');
    })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
      } else if (err.statusCode === 404) {
        next(err);
      } else {
        next(new InternalServerError('Ошибка сервера'));
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const { NODE_ENV, JWT_SECRET } = process.env;
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res
        .cookie('jwt', token, {
          maxAge: 3600000,
          httpOnly: true,
        })
        .send({ message: 'Вы успешно авторизованны!' });
    })
    .catch((err) => {
      if (err.name === 'AuthorizationError') {
        next(new UnauthorizedError(err.message));
      } else if (!email || !password) {
        next(new BadRequestError('Не передан один из требуемых параметров в body'));
      } else {
        next(new InternalServerError('Ошибка сервера'));
      }
    });
};

const getMyData = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new NotFoundError('Пользователь по заданному id отсутствует в базе');
    })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(err.message));
      } else if (err.statusCode === 404) {
        next(err);
      } else {
        next(new InternalServerError('Ошибка сервера'));
      }
    });
};

module.exports = {
  createUser,
  getUser,
  getUsers,
  changeProfile,
  changeAvatar,
  login,
  getMyData,
};
