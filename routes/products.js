const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const { validateProduct, checkValidation } = require('../middleware/validation');

const router = express.Router();

// Simulação de banco de dados em memória
let products = [
  {
    id: 1,
    name: 'Notebook Dell',
    description: 'Notebook Dell Inspiron 15 - Intel Core i5',
    price: 2500.00,
    category: 'Eletrônicos',
    stock: 10,
    active: true,
    createdAt: new Date().toISOString(),
    createdBy: 1
  },
  {
    id: 2,
    name: 'Mouse Gamer',
    description: 'Mouse Gamer RGB com 7 botões',
    price: 150.00,
    category: 'Acessórios',
    stock: 25,
    active: true,
    createdAt: new Date().toISOString(),
    createdBy: 1
  }
];

let productIdCounter = 3;

// Listar todos os produtos
router.get('/', (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    category, 
    search, 
    active = 'true',
    sortBy = 'name',
    sortOrder = 'asc'
  } = req.query;

  let filteredProducts = [...products];

  // Filtrar por status ativo
  if (active !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.active === (active === 'true'));
  }

  // Filtrar por categoria
  if (category) {
    filteredProducts = filteredProducts.filter(p => 
      p.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  // Buscar por nome ou descrição
  if (search) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Ordenar
  filteredProducts.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });

  // Paginação
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.json({
    products: paginatedProducts,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(filteredProducts.length / limit),
      totalItems: filteredProducts.length,
      itemsPerPage: parseInt(limit)
    },
    filters: {
      category,
      search,
      active,
      sortBy,
      sortOrder
    }
  });
});

// Buscar produto por ID
router.get('/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({
      error: 'Produto não encontrado'
    });
  }

  res.json({ product });
});

// Criar produto (requer autenticação)
router.post('/', auth, validateProduct, checkValidation, (req, res) => {
  const { name, description, price, category, stock = 0 } = req.body;

  const newProduct = {
    id: productIdCounter++,
    name: name.trim(),
    description: description?.trim() || '',
    price: parseFloat(price),
    category: category.trim(),
    stock: parseInt(stock),
    active: true,
    createdAt: new Date().toISOString(),
    createdBy: req.user.id
  };

  products.push(newProduct);

  res.status(201).json({
    message: 'Produto criado com sucesso',
    product: newProduct
  });
});

// Atualizar produto (requer autenticação)
router.put('/:id', auth, (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({
      error: 'Produto não encontrado'
    });
  }

  // Verificar se o usuário é admin ou criador do produto
  if (req.user.role !== 'admin' && products[productIndex].createdBy !== req.user.id) {
    return res.status(403).json({
      error: 'Acesso negado'
    });
  }

  const { name, description, price, category, stock, active } = req.body;

  // Atualizar campos fornecidos
  if (name) products[productIndex].name = name.trim();
  if (description !== undefined) products[productIndex].description = description.trim();
  if (price) products[productIndex].price = parseFloat(price);
  if (category) products[productIndex].category = category.trim();
  if (stock !== undefined) products[productIndex].stock = parseInt(stock);
  if (active !== undefined) products[productIndex].active = active;
  
  products[productIndex].updatedAt = new Date().toISOString();
  products[productIndex].updatedBy = req.user.id;

  res.json({
    message: 'Produto atualizado com sucesso',
    product: products[productIndex]
  });
});

// Deletar produto (apenas admin)
router.delete('/:id', auth, adminAuth, (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({
      error: 'Produto não encontrado'
    });
  }

  const deletedProduct = products.splice(productIndex, 1)[0];

  res.json({
    message: 'Produto deletado com sucesso',
    product: {
      id: deletedProduct.id,
      name: deletedProduct.name
    }
  });
});

// Ativar/Desativar produto
router.patch('/:id/toggle', auth, (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({
      error: 'Produto não encontrado'
    });
  }

  // Verificar se o usuário é admin ou criador do produto
  if (req.user.role !== 'admin' && products[productIndex].createdBy !== req.user.id) {
    return res.status(403).json({
      error: 'Acesso negado'
    });
  }

  products[productIndex].active = !products[productIndex].active;
  products[productIndex].updatedAt = new Date().toISOString();
  products[productIndex].updatedBy = req.user.id;

  res.json({
    message: `Produto ${products[productIndex].active ? 'ativado' : 'desativado'} com sucesso`,
    product: products[productIndex]
  });
});

// Listar categorias únicas
router.get('/categories/list', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.json({ categories });
});

module.exports = router;
