const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const InternalServerError = require('../errors/internal-server-error');
const ForbiddenError = require('../errors/forbidden-error');

const createCard = (req, res, next) => {
  const { _id } = req.user;
  const { name, link } = req.body;

  Card.create({ name, link, owner: _id })
    .then((card) => res.status(200).send({ card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
      }
      return res.status(500).send({ message: 'Ошибка сервера' });
    });
};

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(200).send({ data: cards }))
    .catch(() => next(new InternalServerError('Ошибка сервера')));
};

const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(() => {
      throw new NotFoundError('Карточка по заданному id отсутствует в базе');
    })
    .then((card) => {
      if (req.user._id === card.owner.toHexString()) {
        Card.deleteOne(card)
          .then(() => res.status(200).send({ data: card }));
      } else {
        throw new ForbiddenError('Это чужая карточка, её нельзя удалить, но нам она тоже не нравится');
      }
    })
    .catch((err) => {
      if (err.statusCode === 404 || err.statusCode === 403) {
        next(err);
      } else {
        next(new InternalServerError('Ошибка сервера'));
      }
    });
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail(() => {
      throw new NotFoundError('Карточка по заданному id отсутствует в базе');
    })
    .then((card) => res.status(200).send({ data: card }))
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

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail(() => {
      throw new NotFoundError('Карточка по заданному id отсутствует в базе');
    })
    .then((card) => res.status(200).send({ data: card }))
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
  createCard,
  getCards,
  deleteCard,
  likeCard,
  dislikeCard,
};
