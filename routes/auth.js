const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Simulação de banco de dados em memória
let users = [
  {
    id: 1,
    name: 'Admin',
    email: 'admin@example.com',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMye.Pk7mEt9vfA1w5PmKp7SaOF5Z8wBOq.', // senha: 123456
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

let userIdCounter = 2;

// Registrar usuário
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar se usuário já existe
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        error: 'Usuário já existe com este email'
      });
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criar usuário
    const newUser = {
      id: userIdCounter++,
      name,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Gerar token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      },
      token
    });

  } catch (error) {
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Gerar token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    });

  } catch (error) {
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Verificar token
router.get('/verify', auth, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({
      error: 'Usuário não encontrado'
    });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// Logout (invalidar token do lado cliente)
router.post('/logout', auth, (req, res) => {
  res.json({
    message: 'Logout realizado com sucesso'
  });
});

module.exports = router;
