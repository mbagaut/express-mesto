const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-error');
const ForbiddenError = require('../errors/forbidden-error');

module.exports = (req, res, next) => {
  const { jwt: token } = req.cookies;

  if (!token) {
    throw new UnauthorizedError('Необходима авторизация');
  }
  let payload;
  const { JWT_SECRET = 123456789101112131415161718192021222324252627282930313 } = process.env;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new ForbiddenError('У вас нет прав доступа');
  }
  req.user = payload;

  next();
};
