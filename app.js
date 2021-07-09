const express = require('express');

const app = express();
const path = require('path');
const mongoose = require('mongoose');
const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');

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
app.use((req, res, next) => {
  req.user = {
    _id: '60e72337c17a3b4818d8ac45',
  };
  next();
});

app.use('/', userRouter);
app.use('/', cardRouter);

app.get('/', (req, res) => {
  res.send(
    `<html>
      <body>
        <p>Тут должен быть какой-то код.. Наверное</p>
      </body>
    </html>`,
  );
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
