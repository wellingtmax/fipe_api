const notFound = (req, res, next) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method,
    message: `A rota ${req.method} ${req.originalUrl} não existe`
  });
};

module.exports = { notFound };
