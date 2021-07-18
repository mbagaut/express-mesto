const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-error');
const ForbiddenError = require('../errors/forbidden-error');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Необходима авторизация');
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  const { JWT_SECRET } = process.env;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new ForbiddenError('У вас нет прав доступа');
  }
  req.user = payload;

  next();
};
