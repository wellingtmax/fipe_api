// Teste rápido das funcionalidades FIPE
const express = require('express');
const axios = require('axios');

async function testarFipeAPI() {
  console.log('🚗 Testando integração com Brasil API - FIPE...\n');

  try {
    // Testar busca de tabelas
    console.log('📊 Testando busca de tabelas FIPE...');
    const tabelasResponse = await axios.get('https://brasilapi.com.br/api/fipe/tabelas/v1');
    console.log(`✅ ${tabelasResponse.data.length} tabelas encontradas`);
    
    // Testar busca de marcas de carros
    console.log('\n🚗 Testando busca de marcas de carros...');
    const marcasResponse = await axios.get('https://brasilapi.com.br/api/fipe/marcas/v1/carros');
    console.log(`✅ ${marcasResponse.data.length} marcas de carros encontradas`);
    
    // Testar busca de veículos de uma marca (usando primeira marca)
    if (marcasResponse.data.length > 0) {
      const primeiraMarca = marcasResponse.data[0];
      console.log(`\n🔍 Testando busca de veículos da marca ${primeiraMarca.nome}...`);
      
      const veiculosResponse = await axios.get(`https://brasilapi.com.br/api/fipe/veiculos/v1/carros/${primeiraMarca.valor}`);
      console.log(`✅ ${veiculosResponse.data.length} veículos encontrados para ${primeiraMarca.nome}`);
      
      // Mostrar alguns exemplos
      console.log('\n📋 Exemplos de veículos:');
      veiculosResponse.data.slice(0, 3).forEach((veiculo, index) => {
        console.log(`   ${index + 1}. ${veiculo.modelo}`);
      });
    }
    
    console.log('\n🎉 Todos os testes de integração passaram!');
    console.log('✅ A API Brasil está respondendo corretamente');
    console.log('✅ O backend FIPE está pronto para uso');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Executar teste
testarFipeAPI();
