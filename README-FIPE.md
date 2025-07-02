# 🚗 FIPE Backend API

Backend completo para consulta da Tabela FIPE de veículos, integrado com a Brasil API. Este projeto oferece uma API robusta para consultar preços de carros, motos e caminhões, com funcionalidades de favoritos, histórico de consultas e comparação de veículos.

## 🎯 Funcionalidades

### 🔍 Consultas FIPE
- ✅ Lista de tabelas de referência FIPE
- ✅ Busca de marcas por tipo de veículo (carros, motos, caminhões)
- ✅ Lista de veículos por marca
- ✅ Consulta de preços por código FIPE
- ✅ Busca de veículos por nome/modelo
- ✅ Cache inteligente para otimizar performance

### 👤 Sistema de Usuários
- ✅ Registro e autenticação JWT
- ✅ Perfis de usuário
- ✅ Autenticação segura com bcrypt

### ⭐ Favoritos
- ✅ Adicionar veículos aos favoritos
- ✅ Gerenciar lista de favoritos
- ✅ Busca e filtros nos favoritos
- ✅ Anotações e tags personalizadas
- ✅ Estatísticas dos favoritos
- ✅ Comparação entre favoritos

### 📊 Histórico
- ✅ Registro automático de consultas
- ✅ Histórico paginado
- ✅ Estatísticas de uso
- ✅ Exportação de dados
- ✅ Sugestões baseadas no histórico

### 🔒 Segurança
- ✅ Rate limiting
- ✅ Validação de dados com Joi
- ✅ Sanitização de inputs
- ✅ Headers de segurança com Helmet
- ✅ CORS configurável

## 🚀 Como Executar

### Pré-requisitos
- Node.js >= 16.0.0
- npm ou yarn

### Instalação

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd testangulaComApi
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Inicie o servidor:**

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

5. **Execute os testes:**
```bash
npm test
```

## 📡 Endpoints da API

### 🏥 Health Check
```
GET /health
```

### 🔐 Autenticação
```
POST /api/auth/register    # Registrar usuário
POST /api/auth/login       # Login
GET  /api/auth/verify      # Verificar token
```

### 🚗 FIPE
```
GET /api/fipe/tabelas                    # Lista tabelas de referência
GET /api/fipe/marcas/:tipo               # Marcas por tipo (carros/motos/caminhoes)
GET /api/fipe/veiculos/:tipo/:marca      # Veículos por marca
GET /api/fipe/preco/:codigoFipe         # Preço por código FIPE
GET /api/fipe/search?q=termo            # Busca de veículos
GET /api/fipe/stats                     # Estatísticas (admin)
DELETE /api/fipe/cache                  # Limpar cache (admin)
```

### ⭐ Favoritos
```
GET    /api/favorites              # Listar favoritos
POST   /api/favorites              # Adicionar favorito
PUT    /api/favorites/:id          # Atualizar favorito
DELETE /api/favorites/:id          # Remover favorito
GET    /api/favorites/search       # Buscar favoritos
GET    /api/favorites/stats        # Estatísticas dos favoritos
POST   /api/favorites/compare      # Comparar favoritos
```

### 📊 Histórico
```
GET    /api/history                # Listar histórico
POST   /api/history                # Adicionar ao histórico
DELETE /api/history/:id            # Remover item
DELETE /api/history                # Limpar histórico
GET    /api/history/stats          # Estatísticas do histórico
GET    /api/history/recent         # Consultas recentes
GET    /api/history/export         # Exportar histórico
```

## 🔧 Configuração

### Variáveis de Ambiente

Consulte o arquivo `.env.example` para todas as configurações disponíveis.

**Principais configurações:**
- `PORT`: Porta do servidor (padrão: 3000)
- `JWT_SECRET`: Chave secreta para JWT
- `FIPE_CACHE_TIME`: Tempo de cache da FIPE em segundos
- `MAX_FAVORITES`: Máximo de favoritos por usuário
- `MAX_HISTORY_ITEMS`: Máximo de itens no histórico

### Cache

O sistema utiliza cache em memória para otimizar as consultas à API da FIPE:
- Tabelas e marcas: cache de 1 hora
- Preços: cache de 30 minutos
- Veículos: cache de 1 hora

## 📁 Estrutura do Projeto

```
├── routes/
│   ├── auth.js          # Autenticação
│   ├── fipe.js          # Consultas FIPE
│   ├── favorites.js     # Gerenciamento de favoritos
│   └── history.js       # Histórico de consultas
├── middleware/
│   ├── auth.js          # Middleware de autenticação
│   ├── validation.js    # Validações
│   ├── errorHandler.js  # Tratamento de erros
│   └── notFound.js      # 404 handler
├── tests/
│   └── api.test.js      # Testes da API
├── config.js            # Configurações
├── server.js            # Servidor principal
└── package.json         # Dependências
```

## 🧪 Testes

Execute os testes automatizados:

```bash
# Todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:coverage
```

## 📊 Exemplos de Uso

### Buscar marcas de carros
```bash
curl -X GET "http://localhost:3000/api/fipe/marcas/carros"
```

### Consultar preço de um veículo
```bash
curl -X GET "http://localhost:3000/api/fipe/preco/001004-9"
```

### Adicionar aos favoritos (requer autenticação)
```bash
curl -X POST "http://localhost:3000/api/favorites" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "codigoFipe": "001004-9",
    "marca": "Fiat",
    "modelo": "Palio EX 1.0",
    "anoModelo": 1998,
    "valor": "R$ 6.022,00",
    "tipo": "carros",
    "combustivel": "Álcool"
  }'
```

## 🔄 Integração com Brasil API

Este projeto utiliza a [Brasil API](https://brasilapi.com.br/) para obter dados atualizados da tabela FIPE. A integração inclui:

- ✅ Retry automático em caso de falha
- ✅ Timeout configurável
- ✅ Cache para reduzir requisições
- ✅ Tratamento robusto de erros

---

**Desenvolvido com ❤️ para consultas FIPE no Brasil** 🇧🇷
