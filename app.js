require('dotenv').config();

const express = require('express');

const app = express();
const path = require('path');
const mongoose = require('mongoose');
const { errors, celebrate, Joi } = require('celebrate');
const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');

const { PORT = 3000 } = process.env;

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', express.json()); // встроенный парсер express

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).max(16),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).max(16),
    name: Joi.string().min(2).max(30),
    avatar: Joi.string().min(6),
    about: Joi.string().min(2).max(30),
  }),
}), createUser);

app.use(auth);

app.use('/', userRouter);
app.use('/', cardRouter);

app.use((req, res) => {
  res.status(404).send({ message: 'Ресурс не найден' });
});

// обработчик ошибок celebrate
app.use(errors());
// централизованный обработчик
app.use((err, req, res, next) => {
  res.status(err.statusCode).send({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
