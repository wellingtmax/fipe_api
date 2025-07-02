# Exemplos de Requisições - Backend Puro

Este arquivo contém exemplos práticos de como usar a API.

## 🔐 Autenticação

### Registrar Usuário
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "MinhaSenh@123"
}
```

### Login
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "123456"
}
```

### Verificar Token
```http
GET http://localhost:3000/api/auth/verify
Authorization: Bearer SEU_TOKEN_AQUI
```

## 👥 Usuários

### Listar Usuários (Admin)
```http
GET http://localhost:3000/api/users
Authorization: Bearer SEU_TOKEN_ADMIN
```

### Buscar Usuário por ID
```http
GET http://localhost:3000/api/users/1
Authorization: Bearer SEU_TOKEN
```

### Atualizar Usuário
```http
PUT http://localhost:3000/api/users/1
Authorization: Bearer SEU_TOKEN
Content-Type: application/json

{
  "name": "João da Silva Santos",
  "email": "joao.santos@example.com"
}
```

## 📦 Produtos

### Listar Produtos (Público)
```http
GET http://localhost:3000/api/products
```

### Listar Produtos com Filtros
```http
GET http://localhost:3000/api/products?page=1&limit=5&category=Eletrônicos&search=notebook&sortBy=price&sortOrder=desc
```

### Buscar Produto por ID
```http
GET http://localhost:3000/api/products/1
```

### Criar Produto
```http
POST http://localhost:3000/api/products
Authorization: Bearer SEU_TOKEN
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "description": "O mais novo iPhone com chip A17 Pro",
  "price": 7999.99,
  "category": "Smartphones",
  "stock": 50
}
```

### Atualizar Produto
```http
PUT http://localhost:3000/api/products/1
Authorization: Bearer SEU_TOKEN
Content-Type: application/json

{
  "name": "iPhone 15 Pro Max",
  "price": 8999.99,
  "stock": 30
}
```

### Ativar/Desativar Produto
```http
PATCH http://localhost:3000/api/products/1/toggle
Authorization: Bearer SEU_TOKEN
```

### Listar Categorias
```http
GET http://localhost:3000/api/products/categories/list
```

## 📁 Upload de Arquivos

### Upload Único
```http
POST http://localhost:3000/api/upload/single
Authorization: Bearer SEU_TOKEN
Content-Type: multipart/form-data

file: [SELECIONAR_ARQUIVO]
```

### Upload Múltiplo
```http
POST http://localhost:3000/api/upload/multiple
Authorization: Bearer SEU_TOKEN
Content-Type: multipart/form-data

files: [SELECIONAR_ARQUIVOS]
```

### Meus Arquivos
```http
GET http://localhost:3000/api/upload/my-files
Authorization: Bearer SEU_TOKEN
```

### Visualizar Arquivo
```http
GET http://localhost:3000/api/upload/files/NOME_DO_ARQUIVO
```

### Download de Arquivo
```http
GET http://localhost:3000/api/upload/download/NOME_DO_ARQUIVO
Authorization: Bearer SEU_TOKEN
```

## 🔍 Outros Endpoints

### Health Check
```http
GET http://localhost:3000/health
```

### Informações da API
```http
GET http://localhost:3000/
```

## 🌐 Exemplos com cURL

### Registrar usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva",
    "email": "maria@example.com",
    "password": "Maria123456"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "password": "Maria123456"
  }'
```

### Criar produto
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "name": "MacBook Pro M3",
    "description": "Laptop profissional da Apple",
    "price": 15999.99,
    "category": "Laptops",
    "stock": 5
  }'
```

### Upload de arquivo
```bash
curl -X POST http://localhost:3000/api/upload/single \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "file=@caminho/para/seu/arquivo.jpg"
```

## 📝 Notas Importantes

1. **Token JWT**: Sempre inclua o token no header `Authorization: Bearer SEU_TOKEN`
2. **Permissões**: Alguns endpoints requerem role de admin
3. **Validação**: Todos os dados são validados antes do processamento
4. **Rate Limiting**: Máximo de 100 requisições por IP a cada 15 minutos
5. **Tipos de Arquivo**: Upload aceita: jpeg, jpg, png, gif, pdf, doc, docx, txt
6. **Tamanho**: Máximo 5MB por arquivo

## 🎯 Dicas de Uso

- Use ferramentas como **Postman**, **Insomnia** ou **REST Client** para testar
- Configure variáveis de ambiente para o token e URL base
- Consulte o arquivo `README.md` para documentação completa
- Verifique os logs do servidor para debug
