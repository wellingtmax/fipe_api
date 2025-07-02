const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Gerar token JWT
 */
const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verificar token JWT
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Hash de senha
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verificar senha
 */
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Formatar resposta de sucesso
 */
const successResponse = (res, data, message = 'Sucesso', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Formatar resposta de erro
 */
const errorResponse = (res, message = 'Erro interno', statusCode = 500, details = null) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details }),
    timestamp: new Date().toISOString()
  });
};

/**
 * Validar email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitizar string
 */
const sanitizeString = (str) => {
  return str?.toString().trim().replace(/[<>]/g, '');
};

/**
 * Gerar ID único simples
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Formatar tamanho de arquivo
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validar se é um número
 */
const isNumeric = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

/**
 * Escape HTML
 */
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  verifyPassword,
  successResponse,
  errorResponse,
  isValidEmail,
  sanitizeString,
  generateId,
  formatFileSize,
  isNumeric,
  escapeHtml
};
