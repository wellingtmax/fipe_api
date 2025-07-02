const express = require('express');
const { auth } = require('../middleware/auth');
const { validateFavorite } = require('../middleware/validation');

const router = express.Router();

// Simulação de banco de dados em memória (em produção, use um banco real)
let favorites = [];
let nextId = 1;

/**
 * @route GET /api/favorites
 * @desc Lista todos os favoritos do usuário
 * @access Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userFavorites = favorites.filter(fav => fav.userId === userId);
    
    res.json({
      success: true,
      data: userFavorites,
      total: userFavorites.length,
      message: `${userFavorites.length} favoritos encontrados`
    });
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao buscar favoritos'
    });
  }
});

/**
 * @route POST /api/favorites
 * @desc Adiciona um veículo aos favoritos
 * @access Private
 */
router.post('/', auth, validateFavorite, async (req, res) => {
  try {
    const userId = req.user.id;
    const { codigoFipe, marca, modelo, anoModelo, valor, tipo, combustivel } = req.body;
    
    // Verificar se já existe nos favoritos
    const existingFavorite = favorites.find(fav => 
      fav.userId === userId && fav.codigoFipe === codigoFipe
    );
    
    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        error: 'Este veículo já está nos seus favoritos'
      });
    }
    
    const newFavorite = {
      id: nextId++,
      userId,
      codigoFipe,
      marca,
      modelo,
      anoModelo,
      valor,
      tipo,
      combustivel,
      adicionadoEm: new Date().toISOString(),
      anotacoes: req.body.anotacoes || '',
      tags: req.body.tags || []
    };
    
    favorites.push(newFavorite);
    
    res.status(201).json({
      success: true,
      data: newFavorite,
      message: 'Veículo adicionado aos favoritos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao adicionar favorito'
    });
  }
});

/**
 * @route PUT /api/favorites/:id
 * @desc Atualiza anotações ou tags de um favorito
 * @access Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { anotacoes, tags } = req.body;
    
    const favoriteIndex = favorites.findIndex(fav => 
      fav.id === parseInt(id) && fav.userId === userId
    );
    
    if (favoriteIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Favorito não encontrado'
      });
    }
    
    // Atualizar campos permitidos
    if (anotacoes !== undefined) {
      favorites[favoriteIndex].anotacoes = anotacoes;
    }
    if (tags !== undefined && Array.isArray(tags)) {
      favorites[favoriteIndex].tags = tags;
    }
    
    favorites[favoriteIndex].atualizadoEm = new Date().toISOString();
    
    res.json({
      success: true,
      data: favorites[favoriteIndex],
      message: 'Favorito atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar favorito:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao atualizar favorito'
    });
  }
});

/**
 * @route DELETE /api/favorites/:id
 * @desc Remove um veículo dos favoritos
 * @access Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const favoriteIndex = favorites.findIndex(fav => 
      fav.id === parseInt(id) && fav.userId === userId
    );
    
    if (favoriteIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Favorito não encontrado'
      });
    }
    
    const removedFavorite = favorites.splice(favoriteIndex, 1)[0];
    
    res.json({
      success: true,
      data: removedFavorite,
      message: 'Favorito removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover favorito:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao remover favorito'
    });
  }
});

/**
 * @route GET /api/favorites/search
 * @desc Busca favoritos por marca, modelo ou tags
 * @access Private
 */
router.get('/search', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { q, marca, tipo } = req.query;
    
    let userFavorites = favorites.filter(fav => fav.userId === userId);
    
    // Filtrar por query de busca
    if (q) {
      const query = q.toLowerCase();
      userFavorites = userFavorites.filter(fav => 
        fav.marca.toLowerCase().includes(query) ||
        fav.modelo.toLowerCase().includes(query) ||
        fav.tags.some(tag => tag.toLowerCase().includes(query)) ||
        fav.anotacoes.toLowerCase().includes(query)
      );
    }
    
    // Filtrar por marca
    if (marca) {
      userFavorites = userFavorites.filter(fav => 
        fav.marca.toLowerCase().includes(marca.toLowerCase())
      );
    }
    
    // Filtrar por tipo
    if (tipo) {
      userFavorites = userFavorites.filter(fav => fav.tipo === tipo);
    }
    
    res.json({
      success: true,
      data: userFavorites,
      total: userFavorites.length,
      filters: { q, marca, tipo },
      message: `${userFavorites.length} favoritos encontrados`
    });
  } catch (error) {
    console.error('Erro na busca de favoritos:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor na busca'
    });
  }
});

/**
 * @route GET /api/favorites/stats
 * @desc Estatísticas dos favoritos do usuário
 * @access Private
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userFavorites = favorites.filter(fav => fav.userId === userId);
    
    const stats = {
      total: userFavorites.length,
      porTipo: {},
      porMarca: {},
      porAno: {},
      valorMedio: 0,
      valorTotal: 0,
      maisRecente: null,
      maisAntigo: null
    };
    
    if (userFavorites.length > 0) {
      // Calcular estatísticas
      userFavorites.forEach(fav => {
        // Por tipo
        stats.porTipo[fav.tipo] = (stats.porTipo[fav.tipo] || 0) + 1;
        
        // Por marca
        stats.porMarca[fav.marca] = (stats.porMarca[fav.marca] || 0) + 1;
        
        // Por ano do modelo
        stats.porAno[fav.anoModelo] = (stats.porAno[fav.anoModelo] || 0) + 1;
        
        // Valores
        const valor = parseFloat(fav.valor.replace(/[R$\s.]/g, '').replace(',', '.'));
        stats.valorTotal += valor;
      });
      
      stats.valorMedio = stats.valorTotal / userFavorites.length;
      
      // Mais recente e mais antigo
      const sortedByDate = userFavorites.sort((a, b) => 
        new Date(b.adicionadoEm) - new Date(a.adicionadoEm)
      );
      stats.maisRecente = sortedByDate[0];
      stats.maisAntigo = sortedByDate[sortedByDate.length - 1];
    }
    
    res.json({
      success: true,
      data: stats,
      message: 'Estatísticas calculadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao calcular estatísticas'
    });
  }
});

/**
 * @route POST /api/favorites/compare
 * @desc Compara dois ou mais veículos favoritos
 * @access Private
 */
router.post('/compare', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { favoriteIds } = req.body;
    
    if (!Array.isArray(favoriteIds) || favoriteIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Selecione pelo menos 2 favoritos para comparar'
      });
    }
    
    const favoritesToCompare = favorites.filter(fav => 
      fav.userId === userId && favoriteIds.includes(fav.id)
    );
    
    if (favoritesToCompare.length !== favoriteIds.length) {
      return res.status(404).json({
        success: false,
        error: 'Alguns favoritos não foram encontrados'
      });
    }
    
    // Análise comparativa
    const comparison = {
      veiculos: favoritesToCompare,
      analise: {
        maisBarato: null,
        maisCaro: null,
        maisNovo: null,
        maisAntigo: null,
        diferencaPreco: 0,
        diferencaAno: 0
      }
    };
    
    // Encontrar extremos
    let menorValor = Infinity;
    let maiorValor = 0;
    let menorAno = Infinity;
    let maiorAno = 0;
    
    favoritesToCompare.forEach(fav => {
      const valor = parseFloat(fav.valor.replace(/[R$\s.]/g, '').replace(',', '.'));
      const ano = parseInt(fav.anoModelo);
      
      if (valor < menorValor) {
        menorValor = valor;
        comparison.analise.maisBarato = fav;
      }
      if (valor > maiorValor) {
        maiorValor = valor;
        comparison.analise.maisCaro = fav;
      }
      if (ano < menorAno) {
        menorAno = ano;
        comparison.analise.maisAntigo = fav;
      }
      if (ano > maiorAno) {
        maiorAno = ano;
        comparison.analise.maisNovo = fav;
      }
    });
    
    comparison.analise.diferencaPreco = maiorValor - menorValor;
    comparison.analise.diferencaAno = maiorAno - menorAno;
    
    res.json({
      success: true,
      data: comparison,
      message: `Comparação realizada entre ${favoritesToCompare.length} veículos`
    });
  } catch (error) {
    console.error('Erro na comparação:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor na comparação'
    });
  }
});

module.exports = router;
