# Backend Puro - API RESTful

Este é um backend completo desenvolvido em Node.js com Express, incluindo autenticação, autorização, validação e upload de arquivos.

## 🚀 Características

- ✅ Autenticação JWT
- ✅ Middleware de segurança (Helmet, CORS, Rate Limiting)
- ✅ Validação de dados
- ✅ Upload de arquivos
- ✅ CRUD completo para usuários e produtos
- ✅ Autorização baseada em roles (admin/user)
- ✅ Tratamento de erros
- ✅ Logging com Morgan
- ✅ Compressão de resposta
- ✅ Paginação e filtros
- ✅ Estrutura organizada em camadas

## 📋 Pré-requisitos

- Node.js 16+ 
- npm ou yarn

## 🛠️ Instalação

1. Clone ou baixe o projeto
2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Renomeie `.env.example` para `.env`
   - Ajuste as configurações conforme necessário

4. Inicie o servidor:

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📚 Endpoints

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Registrar usuário | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/verify` | Verificar token | ✅ |
| POST | `/api/auth/logout` | Logout | ✅ |

### Usuários

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/users` | Listar usuários | Admin |
| GET | `/api/users/:id` | Buscar usuário | User/Admin |
| PUT | `/api/users/:id` | Atualizar usuário | User/Admin |
| DELETE | `/api/users/:id` | Deletar usuário | Admin |
| PATCH | `/api/users/:id/role` | Alterar role | Admin |

### Produtos

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/products` | Listar produtos | ❌ |
| GET | `/api/products/:id` | Buscar produto | ❌ |
| POST | `/api/products` | Criar produto | ✅ |
| PUT | `/api/products/:id` | Atualizar produto | Owner/Admin |
| DELETE | `/api/products/:id` | Deletar produto | Admin |
| PATCH | `/api/products/:id/toggle` | Ativar/Desativar | Owner/Admin |
| GET | `/api/products/categories/list` | Listar categorias | ❌ |

### Upload

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/upload/single` | Upload único | ✅ |
| POST | `/api/upload/multiple` | Upload múltiplo | ✅ |
| GET | `/api/upload/my-files` | Meus arquivos | ✅ |
| GET | `/api/upload/files/:filename` | Visualizar arquivo | ❌ |
| GET | `/api/upload/download/:filename` | Download arquivo | Owner/Admin |
| DELETE | `/api/upload/:id` | Deletar arquivo | Owner/Admin |

## 🔧 Exemplos de Uso

### 1. Registrar Usuário

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "MinhaSenh@123"
}
```

### 2. Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "MinhaSenh@123"
}
```

### 3. Criar Produto

```bash
POST /api/products
Authorization: Bearer SEU_TOKEN
Content-Type: application/json

{
  "name": "Produto Teste",
  "description": "Descrição do produto",
  "price": 99.99,
  "category": "Eletrônicos",
  "stock": 10
}
```

### 4. Listar Produtos com Filtros

```bash
GET /api/products?page=1&limit=10&category=Eletrônicos&search=notebook&sortBy=price&sortOrder=desc
```

### 5. Upload de Arquivo

```bash
POST /api/upload/single
Authorization: Bearer SEU_TOKEN
Content-Type: multipart/form-data

file: [seu_arquivo]
```

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) para autenticação. Após o login, inclua o token no header:

```
Authorization: Bearer SEU_TOKEN_JWT
```

## 👥 Roles

- **user**: Usuário comum
- **admin**: Administrador com permissões extras

## 📁 Estrutura do Projeto

```
backend-puro/
├── middleware/         # Middlewares customizados
│   ├── auth.js        # Autenticação e autorização
│   ├── errorHandler.js # Tratamento de erros
│   ├── notFound.js    # 404 handler
│   └── validation.js  # Validações
├── routes/            # Rotas da API
│   ├── auth.js       # Rotas de autenticação
│   ├── users.js      # Rotas de usuários
│   ├── products.js   # Rotas de produtos
│   └── upload.js     # Rotas de upload
├── utils/            # Utilitários
│   └── helpers.js    # Funções auxiliares
├── uploads/          # Arquivos enviados
├── server.js         # Arquivo principal
├── package.json      # Dependências
└── .env             # Variáveis de ambiente
```

## 🛡️ Segurança

- Rate limiting (100 req/15min por IP)
- Helmet para headers de segurança
- CORS configurado
- Validação de entrada
- Senhas hasheadas com bcrypt
- JWT com expiração
- Sanitização de dados

## 📝 Validações

### Usuário
- Nome: mínimo 2 caracteres
- Email: formato válido
- Senha: mínimo 6 caracteres, 1 maiúscula, 1 minúscula, 1 número

### Produto
- Nome: obrigatório, mínimo 2 caracteres
- Preço: numérico, maior que zero
- Categoria: obrigatória

## 🗃️ "Banco de Dados"

Este projeto usa arrays em memória para simular um banco de dados. Para produção, integre com:
- PostgreSQL
- MySQL
- MongoDB
- SQLite

## 🚀 Deploy

Para deploy em produção:

1. Configure as variáveis de ambiente
2. Use PM2 ou similar para process management
3. Configure um proxy reverso (Nginx)
4. Use HTTPS
5. Configure backups

## 🧪 Testes

```bash
npm test
```

## 📄 Licença

MIT

---

**Desenvolvido por Wellington Oliveira**
#   f i p e _ a p i  
 