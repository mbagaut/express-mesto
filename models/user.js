const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const isEmail = require('validator/lib/isEmail');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    required: [true, 'Не введено имя пользователя'],
    minlength: [2, 'В строке должно быть не менее 2 символов'],
    maxlength: [30, 'В строке не должно быть более 30 символов'],
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    required: [true, 'Нет ссылки на картинку для аватара'],
    validate: {
      validator: (v) => /^((ftp|http|https):\/\/)?(www\.)?([A-Za-zА-Яа-я0-9]{1}[A-Za-zА-Яа-я0-9-]*\.?)*\.{1}[A-Za-zА-Яа-я0-9-]{2,8}(\/([\w#!:.?+=&%@!\-/])*)?/.test(v),
      message: 'Ссылка на аватар должна быть валидным url-адресом',
    },
  },
  about: {
    type: String,
    default: 'Исследователь',
    required: [true, 'Поле about должно быть заполнено'],
    minlength: [2, 'В строке должно быть не менее 2 символов'],
    maxlength: [30, 'В строке не должно быть более 30 символов'],
  },
  email: {
    type: String,
    required: [true, 'Поле email должно быть заполнено'],
    unique: true,
    validate: {
      validator: (v) => isEmail(v),
      message: 'Неправильный формат почты',
    },
  },
  password: {
    type: String,
    required: [true, 'Поле password должно быть заполнено'],
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        const error = new Error('Неправильные почта или пароль');
        error.name = 'AuthorizationError';
        return Promise.reject(error);
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            const error = new Error('Неправильные почта или пароль');
            error.name = 'AuthorizationError';
            return Promise.reject(error);
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
