const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const DriverModel = require('../models/driver.model');

const JWT_SECRET = process.env.JWT_SECRET || 'shift_secret_2026';

class AuthController {
  static async register(req, res) {
    try {
      const { name, email, password, role, plate } = req.body;

      // 1. Validations
      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
      }

      if (role !== 'driver' && role !== 'passenger') {
        return res.status(400).json({ error: 'Tipo de utilizador inválido.' });
      }

      if (role === 'driver' && !plate) {
        return res.status(400).json({ error: 'Condutores necessitam de indicar a matrícula do veículo.' });
      }

      // 2. Check if email already registered
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Este e-mail já se encontra registado.' });
      }

      // 3. Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 4. Save to User Table
      const formattedPlate = plate ? plate.toUpperCase().trim() : null;
      const userId = await UserModel.create({
        name,
        email,
        passwordHash,
        role,
        plate: formattedPlate
      });

      // 5. If driver, ensure public profile exists in drivers table for searchability
      if (role === 'driver' && formattedPlate) {
        const publicDriver = await DriverModel.findByPlate(formattedPlate);
        if (!publicDriver) {
          await DriverModel.create(
            formattedPlate,
            name,
            100, // Score starts at 100
            0,   // Trips count starts at 0
            'excellent',
            ['Novato'],
            5.0  // Stars rating starts at 5.0
          );
        }
      }

      // 6. Generate Token
      const token = jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        message: 'Utilizador registado com sucesso!',
        token,
        user: {
          id: userId,
          name,
          email,
          role,
          plate: formattedPlate
        }
      });

    } catch (error) {
      console.error('AuthController.register error:', error);
      return res.status(500).json({ error: 'Erro interno ao registar utilizador.' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
      }

      // 1. Fetch user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
      }

      // 2. Validate password
      const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordMatch) {
        return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
      }

      // 3. Generate Token
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

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
