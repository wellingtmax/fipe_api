# 🚗 DEMONSTRAÇÃO DA FIPE BACKEND API

## Comandos para testar a API localmente

### 1. Iniciar o servidor
```bash
npm start
# ou para desenvolvimento:
npm run dev
```

### 2. Testar Health Check
```bash
curl http://localhost:3000/health
```

### 3. Registrar usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "MinhaSenh@123"
  }'
```

### 4. Fazer login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "MinhaSenh@123"
  }'
```

### 5. Buscar tabelas FIPE
```bash
curl http://localhost:3000/api/fipe/tabelas
```

### 6. Buscar marcas de carros
```bash
curl http://localhost:3000/api/fipe/marcas/carros
```

### 7. Buscar marcas de motos
```bash
curl http://localhost:3000/api/fipe/marcas/motos
```

### 8. Buscar veículos por marca (exemplo: marca 1 = Acura)
```bash
curl http://localhost:3000/api/fipe/veiculos/carros/1
```

### 9. Consultar preço de um veículo (código FIPE de exemplo)
```bash
curl http://localhost:3000/api/fipe/preco/001004-9
```

### 10. Buscar veículos por nome
```bash
curl "http://localhost:3000/api/fipe/search?q=palio"
```

### 11. Adicionar aos favoritos (requer token)
```bash
curl -X POST http://localhost:3000/api/favorites \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "codigoFipe": "001004-9",
    "marca": "Fiat",
    "modelo": "Palio EX 1.0 mpi 2p",
    "anoModelo": 1998,
    "valor": "R$ 6.022,00",
    "tipo": "carros",
    "combustivel": "Álcool",
    "anotacoes": "Primeiro carro que pesquisei"
  }'
```

### 12. Listar favoritos
```bash
curl -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  http://localhost:3000/api/favorites
```

### 13. Ver estatísticas dos favoritos
```bash
curl -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  http://localhost:3000/api/favorites/stats
```

### 14. Ver histórico de consultas
```bash
curl -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  http://localhost:3000/api/history
```

### 15. Ver estatísticas do histórico
```bash
curl -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  http://localhost:3000/api/history/stats
```

## 🎯 Exemplos de Respostas

### Busca de marcas de carros:
```json
{
  "success": true,
  "data": [
    {
      "nome": "Acura",
      "valor": "1",
      "tipo_veiculo": "carros",
      "total_marcas": 103
    },
    {
      "nome": "Agrale",
      "valor": "2",
      "tipo_veiculo": "carros",
      "total_marcas": 103
    }
  ],
  "cached": false,
  "tipo": "carros",
  "total": 103,
  "message": "103 marcas de carros encontradas"
}
```

### Consulta de preço:
```json
{
  "success": true,
  "data": {
    "valor": "R$ 6.022,00",
    "marca": "Fiat",
    "modelo": "Palio EX 1.0 mpi 2p",
    "anoModelo": 1998,
    "combustivel": "Álcool",
    "codigoFipe": "001004-9",
    "mesReferencia": "dezembro de 2024",
    "tipoVeiculo": 1,
    "siglaCombustivel": "Á",
    "dataConsulta": "segunda-feira, 1 de julho de 2025 15:30",
    "valor_numerico": 6022.00,
    "data_consulta_formatada": "01/07/2025",
    "idade_veiculo": 27,
    "categoria_preco": "Econômico"
  },
  "cached": false,
  "codigoFipe": "001004-9",
  "message": "Preço consultado com sucesso"
}
```

## 🔧 Configurações Importantes

### Variáveis de Ambiente (.env):
```env
PORT=3000
JWT_SECRET=sua_chave_secreta_forte
FIPE_CACHE_TIME=3600
MAX_FAVORITES=100
MAX_HISTORY_ITEMS=1000
```

### Cache:
- Tabelas e marcas: 1 hora
- Preços: 30 minutos
- Busca de veículos: 1 hora

### Rate Limiting:
- 1000 requisições por IP a cada 15 minutos

## 🚀 Para usar em produção:

1. Configure um JWT_SECRET forte
2. Configure CORS para seu domínio
3. Use HTTPS
4. Configure logs apropriados
5. Considere usar um banco de dados real para favoritos/histórico
6. Configure monitoramento

## 📊 Métricas disponíveis:

- Cache hits/misses
- Consultas por usuário
- Marcas mais pesquisadas
- Tipos de veículos mais consultados
- Histórico de preços
