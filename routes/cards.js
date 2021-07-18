const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  createCard,
  getCards,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

const cardIdValidation = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().length(24),
  }),
});

router.post('/cards', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().min(6),
  }),
}), createCard);
router.get('/cards', getCards);
router.delete('/cards/:cardId', cardIdValidation, deleteCard);
router.put('/cards/:cardId/likes', cardIdValidation, likeCard);
router.delete('/cards/:cardId/likes', cardIdValidation, dislikeCard);

module.exports = router;
