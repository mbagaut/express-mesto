const Card = require('../models/card');

const cardNotExist = 'Запрашиваемая карточка не найдена';

const createCard = (req, res) => {
  const { _id } = req.user;
  const { name, link } = req.body;

  Card.create({ name, link, owner: _id })
    .then((card) => res.status(200).send({ card }))
    .catch((err) => res.status(400).send({ message: err.message }));
};

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send({ data: cards }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

const deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: cardNotExist });
      }
      res.status(200).send({ data: card });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: cardNotExist });
      }
      res.status(200).send({ data: card });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: cardNotExist });
      }
      res.status(200).send({ data: card });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports = {
  createCard,
  getCards,
  deleteCard,
  likeCard,
  dislikeCard,
};
