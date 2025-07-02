const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const { validateUser, checkValidation } = require('../middleware/validation');

const router = express.Router();

// Importar users do auth (em uma aplicação real, isso viria do banco de dados)
const authModule = require('./auth');

// Simulação de banco de dados em memória (compartilhado com auth.js)
let users = [
  {
    id: 1,
    name: 'Admin',
    email: 'admin@example.com',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMye.Pk7mEt9vfA1w5PmKp7SaOF5Z8wBOq.',
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

// Listar todos os usuários (apenas admin)
router.get('/', auth, adminAuth, (req, res) => {
  const usersWithoutPassword = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  }));

  res.json({
    users: usersWithoutPassword,
    total: usersWithoutPassword.length
  });
});

// Buscar usuário por ID
router.get('/:id', auth, (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Usuários comuns só podem ver seus próprios dados
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({
      error: 'Acesso negado'
    });
  }

  const user = users.find(u => u.id === userId);
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

// Atualizar usuário
router.put('/:id', auth, (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Usuários comuns só podem atualizar seus próprios dados
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({
      error: 'Acesso negado'
    });
  }

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({
      error: 'Usuário não encontrado'
    });
  }

  const { name, email } = req.body;
  
  // Verificar se email já existe (exceto o próprio usuário)
  if (email) {
    const emailExists = users.find(u => u.email === email && u.id !== userId);
    if (emailExists) {
      return res.status(400).json({
        error: 'Email já está em uso'
      });
    }
  }

  // Atualizar dados
  if (name) users[userIndex].name = name.trim();
  if (email) users[userIndex].email = email.trim().toLowerCase();
  users[userIndex].updatedAt = new Date().toISOString();

  res.json({
    message: 'Usuário atualizado com sucesso',
    user: {
      id: users[userIndex].id,
      name: users[userIndex].name,
      email: users[userIndex].email,
      role: users[userIndex].role,
      createdAt: users[userIndex].createdAt,
      updatedAt: users[userIndex].updatedAt
    }
  });
});

// Deletar usuário (apenas admin)
router.delete('/:id', auth, adminAuth, (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Não permitir deletar a si mesmo
  if (req.user.id === userId) {
    return res.status(400).json({
      error: 'Você não pode deletar sua própria conta'
    });
  }

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({
      error: 'Usuário não encontrado'
    });
  }

  const deletedUser = users.splice(userIndex, 1)[0];

  res.json({
    message: 'Usuário deletado com sucesso',
    user: {
      id: deletedUser.id,
      name: deletedUser.name,
      email: deletedUser.email
    }
  });
});

// Alterar role do usuário (apenas admin)
router.patch('/:id/role', auth, adminAuth, (req, res) => {
  const userId = parseInt(req.params.id);
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    return res.status(400).json({
      error: 'Role deve ser "user" ou "admin"'
    });
  }

  // Não permitir alterar própria role
  if (req.user.id === userId) {
    return res.status(400).json({
      error: 'Você não pode alterar sua própria role'
    });
  }

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({
      error: 'Usuário não encontrado'
    });
  }

  users[userIndex].role = role;
  users[userIndex].updatedAt = new Date().toISOString();

  res.json({
    message: 'Role do usuário atualizada com sucesso',
    user: {
      id: users[userIndex].id,
      name: users[userIndex].name,
      email: users[userIndex].email,
      role: users[userIndex].role,
      updatedAt: users[userIndex].updatedAt
    }
  });
});

module.exports = router;
