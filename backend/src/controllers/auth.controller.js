const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Driver } = require('../models');
const { registerSchema, loginSchema } = require('../utils/validation');

const JWT_SECRET = process.env.JWT_SECRET || 'shift_secret_2026';

class AuthController {
  static async register(req, res) {
    try {
      // 1. Validate Schema
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Dados inválidos.', 
          details: validation.error.format() 
        });
      }

      const { name, email, password, role, plate } = validation.data;

      // 2. Business Rule: Driver must have a plate
      if (role === 'driver' && !plate) {
        return res.status(400).json({ error: 'Condutores necessitam de indicar a placa do veículo.' });
      }

      // 3. Check if email already registered
      const existingUser = await User.findOne({ where: { email: email.toLowerCase().trim() } });
      if (existingUser) {
        return res.status(400).json({ error: 'Este e-mail já se encontra registado.' });
      }

      // 4. Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 5. Save to User Table
      const formattedPlate = plate ? plate.toUpperCase().trim() : null;
      const user = await User.create({
        name,
        email,
        password_hash: passwordHash,
        role,
        plate: formattedPlate
      });

      // 6. If driver, ensure public profile exists in drivers table for searchability
      if (role === 'driver' && formattedPlate) {
        const publicDriver = await Driver.findOne({ where: { plate: formattedPlate } });
        if (!publicDriver) {
          await Driver.create({
            plate: formattedPlate,
            name,
            score: 100,
            trips: 0,
            status: 'excellent',
            badges: ['Novato'],
            rating: 5.0
          });
        }
      }

      // 7. Generate Token
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, plate: user.plate }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        message: 'Utilizador registado com sucesso!',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          plate: user.plate
        }
      });

    } catch (error) {
      console.error('AuthController.register error:', error);
      return res.status(500).json({ error: 'Erro interno ao registar utilizador.' });
    }
  }

  static async login(req, res) {
    try {
      // 1. Validate Schema
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: 'E-mail ou senha inválidos.' });
      }

      const { email, password } = validation.data;

      // 2. Fetch user by email
      const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
      if (!user) {
        return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
      }

      // 3. Validate password
      const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordMatch) {
        return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
      }

      // 4. Generate Token
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, plate: user.plate }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(200).json({
        message: 'Login efetuado com sucesso!',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          plate: user.plate
        }
      });

    } catch (error) {
      console.error('AuthController.login error:', error);
      return res.status(500).json({ error: 'Erro interno ao realizar login.' });
    }
  }
}

module.exports = AuthController;
