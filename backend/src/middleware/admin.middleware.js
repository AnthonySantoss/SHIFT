const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores autorizados.' });
  }
};

module.exports = adminMiddleware;
