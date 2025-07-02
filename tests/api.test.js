const request = require('supertest');
const app = require('../server');

describe('FIPE API Tests', () => {
  let authToken;

  // Teste de health check
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body).toHaveProperty('status', 'OK');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('message', 'FIPE API está funcionando');
    });
  });

  // Testes de autenticação
  describe('Auth Routes', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User FIPE',
        email: 'testfipe@example.com',
        password: 'Test123456'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(userData.email);
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'admin@example.com',
        password: '123456'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(res.body).toHaveProperty('token');
      authToken = res.body.token;
    });

    it('should verify token', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('user');
    });
  });

  // Testes das rotas FIPE
  describe('FIPE Routes', () => {
    it('should get FIPE tables', async () => {
      const res = await request(app)
        .get('/api/fipe/tabelas')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get car brands', async () => {
      const res = await request(app)
        .get('/api/fipe/marcas/carros')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('tipo', 'carros');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get motorcycles brands', async () => {
      const res = await request(app)
        .get('/api/fipe/marcas/motos')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('tipo', 'motos');
    });

    it('should return error for invalid vehicle type', async () => {
      const res = await request(app)
        .get('/api/fipe/marcas/invalid')
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
    });

    it('should get vehicles by brand (using a common brand code)', async () => {
      // Primeiro buscar uma marca válida
      const brandsRes = await request(app)
        .get('/api/fipe/marcas/carros')
        .expect(200);

      if (brandsRes.body.data && brandsRes.body.data.length > 0) {
        const firstBrand = brandsRes.body.data[0];
        
        const res = await request(app)
          .get(`/api/fipe/veiculos/carros/${firstBrand.valor}`)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('tipo', 'carros');
        expect(res.body).toHaveProperty('marca', firstBrand.valor);
      }
    });

    it('should search for vehicles', async () => {
      const res = await request(app)
        .get('/api/fipe/search?q=palio')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('query', 'palio');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return error for short search query', async () => {
      const res = await request(app)
        .get('/api/fipe/search?q=a')
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toContain('pelo menos 3 caracteres');
    });
  });

  // Testes de favoritos
  describe('Favorites Routes', () => {
    it('should get empty favorites list initially', async () => {
      const res = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBe(0);
    });

    it('should add a vehicle to favorites', async () => {
      const favoriteData = {
        codigoFipe: '001004-9',
        marca: 'Fiat',
        modelo: 'Palio EX 1.0 mpi 2p',
        anoModelo: 1998,
        valor: 'R$ 6.022,00',
        tipo: 'carros',
        combustivel: 'Álcool',
        anotacoes: 'Primeiro carro que tive interesse'
      };

      const res = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send(favoriteData)
        .expect(201);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.codigoFipe).toBe(favoriteData.codigoFipe);
      expect(res.body.data.marca).toBe(favoriteData.marca);
    });

    it('should not allow duplicate favorites', async () => {
      const favoriteData = {
        codigoFipe: '001004-9',
        marca: 'Fiat',
        modelo: 'Palio EX 1.0 mpi 2p',
        anoModelo: 1998,
        valor: 'R$ 6.022,00',
        tipo: 'carros',
        combustivel: 'Álcool'
      };

      const res = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send(favoriteData)
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toContain('já está nos seus favoritos');
    });

    it('should get favorites stats', async () => {
      const res = await request(app)
        .get('/api/favorites/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data.total).toBeGreaterThan(0);
    });

    it('should require authentication for favorites', async () => {
      const res = await request(app)
        .get('/api/favorites')
        .expect(401);

      expect(res.body).toHaveProperty('success', false);
    });
  });

  // Testes de histórico
  describe('History Routes', () => {
    it('should get empty history initially', async () => {
      const res = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should add item to history', async () => {
      const historyData = {
        tipo: 'consulta_preco',
        acao: 'GET',
        codigoFipe: '001004-9',
        marca: 'Fiat',
        modelo: 'Palio EX 1.0',
        anoModelo: 1998,
        valor: 'R$ 6.022,00'
      };

      const res = await request(app)
        .post('/api/history')
        .set('Authorization', `Bearer ${authToken}`)
        .send(historyData)
        .expect(201);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.tipo).toBe(historyData.tipo);
    });

    it('should get history stats', async () => {
      const res = await request(app)
        .get('/api/history/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('total');
    });

    it('should get recent history', async () => {
      const res = await request(app)
        .get('/api/history/recent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('consultas');
      expect(res.body.data).toHaveProperty('sugestoes');
    });
  });

  // Teste de rota não encontrada
  describe('404 Handler', () => {
    it('should return 404 for non-existent route', async () => {
      const res = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
    });
  });

  // Testes de validação
  describe('Validation Tests', () => {
    it('should validate favorite data', async () => {
      const invalidData = {
        codigoFipe: '123', // muito curto
        marca: '', // vazio
        modelo: '',
        anoModelo: 1800, // muito antigo
        valor: '',
        tipo: 'invalid' // tipo inválido
      };

      const res = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('details');
      expect(Array.isArray(res.body.details)).toBe(true);
    });

    it('should validate registration data', async () => {
      const invalidData = {
        name: 'A', // muito curto
        email: 'invalid-email',
        password: '123' // muito curta
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('details');
    });
  });
});
