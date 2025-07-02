const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const { validateFipeParams } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Cache para 1 hora (3600 segundos) - dados da FIPE não mudam frequentemente
const cache = new NodeCache({ stdTTL: 3600 });

// Base URL da Brasil API
const BRASIL_API_BASE = 'https://brasilapi.com.br/api/fipe';

/**
 * @route GET /api/fipe/tabelas
 * @desc Lista todas as tabelas de referência FIPE disponíveis
 * @access Public
 */
router.get('/tabelas', async (req, res) => {
  try {
    // Verificar cache primeiro
    const cacheKey = 'fipe_tabelas';
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData,
        cached: true,
        message: 'Tabelas FIPE recuperadas do cache'
      });
    }

    // Buscar da API Brasil
    const response = await axios.get(`${BRASIL_API_BASE}/tabelas/v1`);
    
    // Salvar no cache
    cache.set(cacheKey, response.data);
    
    res.json({
      success: true,
      data: response.data,
      cached: false,
      message: 'Tabelas FIPE recuperadas com sucesso'
    });

  } catch (error) {
    console.error('Erro ao buscar tabelas FIPE:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao buscar tabelas FIPE',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/fipe/marcas/:tipo
 * @desc Lista as marcas de veículos por tipo (carros, motos, caminhoes)
 * @access Public
 */
router.get('/marcas/:tipo', validateFipeParams, async (req, res) => {
  try {
    const { tipo } = req.params;
    const { tabela_referencia } = req.query;
    
    // Verificar cache
    const cacheKey = `fipe_marcas_${tipo}_${tabela_referencia || 'current'}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData,
        cached: true,
        tipo,
        message: `Marcas de ${tipo} recuperadas do cache`
      });
    }

    // Construir URL com parâmetros opcionais
    let url = `${BRASIL_API_BASE}/marcas/v1/${tipo}`;
    if (tabela_referencia) {
      url += `?tabela_referencia=${tabela_referencia}`;
    }

    const response = await axios.get(url);
    
    // Enriquecer dados com informações úteis
    const enrichedData = response.data.map(marca => ({
      ...marca,
      tipo_veiculo: tipo,
      total_marcas: response.data.length
    }));
    
    // Salvar no cache
    cache.set(cacheKey, enrichedData);
    
    res.json({
      success: true,
      data: enrichedData,
      cached: false,
      tipo,
      total: enrichedData.length,
      message: `${enrichedData.length} marcas de ${tipo} encontradas`
    });

  } catch (error) {
    console.error('Erro ao buscar marcas:', error.message);
    
    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de veículo ou tabela de referência inválida',
        validTypes: ['carros', 'motos', 'caminhoes']
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao buscar marcas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/fipe/veiculos/:tipo/:marca
 * @desc Lista os veículos de uma marca específica
 * @access Public
 */
router.get('/veiculos/:tipo/:marca', validateFipeParams, async (req, res) => {
  try {
    const { tipo, marca } = req.params;
    const { tabela_referencia } = req.query;
    
    // Verificar cache
    const cacheKey = `fipe_veiculos_${tipo}_${marca}_${tabela_referencia || 'current'}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData,
        cached: true,
        tipo,
        marca,
        message: `Veículos da marca ${marca} recuperados do cache`
      });
    }

    // Construir URL
    let url = `${BRASIL_API_BASE}/veiculos/v1/${tipo}/${marca}`;
    if (tabela_referencia) {
      url += `?tabela_referencia=${tabela_referencia}`;
    }

    const response = await axios.get(url);
    
    // Enriquecer dados
    const enrichedData = response.data.map((veiculo, index) => ({
      ...veiculo,
      tipo_veiculo: tipo,
      codigo_marca: marca,
      indice: index + 1
    }));
    
    // Salvar no cache
    cache.set(cacheKey, enrichedData);
    
    res.json({
      success: true,
      data: enrichedData,
      cached: false,
      tipo,
      marca,
      total: enrichedData.length,
      message: `${enrichedData.length} veículos encontrados para a marca`
    });

  } catch (error) {
    console.error('Erro ao buscar veículos:', error.message);
    
    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de veículo, marca ou tabela de referência inválida'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao buscar veículos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/fipe/preco/:codigoFipe
 * @desc Consulta o preço de um veículo pelo código FIPE
 * @access Public
 */
router.get('/preco/:codigoFipe', async (req, res) => {
  try {
    const { codigoFipe } = req.params;
    const { tabela_referencia } = req.query;
    
    // Validar formato do código FIPE
    if (!codigoFipe || codigoFipe.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Código FIPE inválido. Deve ter pelo menos 6 caracteres.'
      });
    }
    
    // Verificar cache
    const cacheKey = `fipe_preco_${codigoFipe}_${tabela_referencia || 'current'}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData,
        cached: true,
        codigoFipe,
        message: 'Preço recuperado do cache'
      });
    }

    // Construir URL
    let url = `${BRASIL_API_BASE}/preco/v1/${codigoFipe}`;
    if (tabela_referencia) {
      url += `?tabela_referencia=${tabela_referencia}`;
    }

    const response = await axios.get(url);
    
    // A API retorna array, pegar o primeiro item
    const priceData = Array.isArray(response.data) ? response.data[0] : response.data;
    
    // Enriquecer dados com análises úteis
    const enrichedData = {
      ...priceData,
      valor_numerico: parseFloat(priceData.valor.replace(/[R$\s.]/g, '').replace(',', '.')),
      data_consulta_formatada: new Date().toLocaleDateString('pt-BR'),
      idade_veiculo: new Date().getFullYear() - priceData.anoModelo,
      categoria_preco: categorizarPreco(priceData.valor)
    };
    
    // Salvar no cache por 30 minutos (preços podem mudar)
    cache.set(cacheKey, enrichedData, 1800);
    
    res.json({
      success: true,
      data: enrichedData,
      cached: false,
      codigoFipe,
      message: 'Preço consultado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao buscar preço:', error.message);
    
    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        error: 'Código FIPE ou tabela de referência inválida'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao buscar preço',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/fipe/search
 * @desc Busca veículos por nome/modelo
 * @access Public
 */
router.get('/search', async (req, res) => {
  try {
    const { q, tipo } = req.query;
    
    if (!q || q.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Query de busca deve ter pelo menos 3 caracteres'
      });
    }
    
    const tiposValidos = ['carros', 'motos', 'caminhoes'];
    const tiposParaBuscar = tipo && tiposValidos.includes(tipo) ? [tipo] : tiposValidos;
    
    const resultados = [];
    
    // Buscar em todos os tipos ou no tipo específico
    for (const tipoVeiculo of tiposParaBuscar) {
      try {
        // Buscar marcas primeiro
        const marcasResponse = await axios.get(`${BRASIL_API_BASE}/marcas/v1/${tipoVeiculo}`);
        
        // Para cada marca, buscar veículos que correspondam à query
        for (const marca of marcasResponse.data) {
          try {
            const veiculosResponse = await axios.get(`${BRASIL_API_BASE}/veiculos/v1/${tipoVeiculo}/${marca.valor}`);
            
            const veiculosFiltrados = veiculosResponse.data.filter(veiculo => 
              veiculo.modelo.toLowerCase().includes(q.toLowerCase())
            );
            
            veiculosFiltrados.forEach(veiculo => {
              resultados.push({
                ...veiculo,
                tipo_veiculo: tipoVeiculo,
                marca: marca.nome,
                codigo_marca: marca.valor
              });
            });
            
          } catch (error) {
            // Continuar mesmo se uma marca falhar
            console.warn(`Erro ao buscar veículos da marca ${marca.nome}:`, error.message);
          }
        }
      } catch (error) {
        console.warn(`Erro ao buscar marcas de ${tipoVeiculo}:`, error.message);
      }
    }
    
    res.json({
      success: true,
      data: resultados,
      query: q,
      tipo: tipo || 'todos',
      total: resultados.length,
      message: `${resultados.length} veículos encontrados para "${q}"`
    });

  } catch (error) {
    console.error('Erro na busca:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor na busca',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/fipe/stats
 * @desc Estatísticas do cache e uso da API
 * @access Private (Admin)
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const cacheStats = cache.getStats();
    const cacheKeys = cache.keys();
    
    res.json({
      success: true,
      cache: {
        ...cacheStats,
        total_keys: cacheKeys.length,
        keys_sample: cacheKeys.slice(0, 10)
      },
      message: 'Estatísticas recuperadas com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao recuperar estatísticas'
    });
  }
});

/**
 * @route DELETE /api/fipe/cache
 * @desc Limpa o cache da API FIPE
 * @access Private (Admin)
 */
router.delete('/cache', auth, async (req, res) => {
  try {
    cache.flushAll();
    
    res.json({
      success: true,
      message: 'Cache limpo com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar cache'
    });
  }
});

// Função auxiliar para categorizar preços
function categorizarPreco(valorStr) {
  const valor = parseFloat(valorStr.replace(/[R$\s.]/g, '').replace(',', '.'));
  
  if (valor < 20000) {
    return 'Econômico';
  }
  if (valor < 50000) {
    return 'Intermediário';
  }
  if (valor < 100000) {
    return 'Premium';
  }
  if (valor < 200000) {
    return 'Luxo';
  }
  return 'Super Luxo';
}

module.exports = router;
