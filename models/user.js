const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Не введено имя пользователя'],
    minlength: [2, 'В строке должно быть не менее 2 символов'],
    maxlength: [30, 'В строке не должно быть более 30 символов'],
  },
  avatar: {
    type: String,
    required: [true, 'Нет ссылки на картинку для аватара'],
  },
  about: {
    type: String,
    required: [true, 'Поле about должно быть заполнено'],
    minlength: [2, 'В строке должно быть не менее 2 символов'],
    maxlength: [30, 'В строке не должно быть более 30 символов'],
  },
});

module.exports = mongoose.model('user', userSchema);
