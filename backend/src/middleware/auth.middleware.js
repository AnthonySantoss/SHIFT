const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'shift_secret_2026';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Utilizador inválido ou inexistente.' });
    }

    // Attach decoded user directly to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('authMiddleware error:', error);
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

module.exports = authMiddleware;
