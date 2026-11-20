import 'fake-indexeddb/auto';
import { db } from './src/db.js';

async function testDatabase() {
  try {
    console.log('--- Iniciando Testes de Banco de Dados ---');

    // Limpar dados antigos
    await db.clientes.clear();
    await db.vendas.clear();
    console.log('Banco de dados limpo.');

    // Teste 1: Cadastro de Cliente
    console.log('Testando cadastro de cliente...');
    const clienteId = await db.clientes.add({
      nome: 'Dona Maria',
      telefone: '(11) 99999-9999',
      status: 'ativo'
    });
    const clientesList = await db.clientes.toArray();
    console.assert(clientesList.length === 1, 'Deve haver 1 cliente cadastrado');
    console.assert(clientesList[0].nome === 'Dona Maria', 'Nome do cliente deve ser Dona Maria');
    console.log('✅ Cadastro de cliente funcionou.');

    // Teste 2: Registro de Venda
    console.log('Testando registro de venda...');
    const vendaId = await db.vendas.add({
      clienteId: clienteId,
      quantidade: 2,
      valor: 20.00,
      statusPagamento: 'pendente',
      data: Date.now()
    });
    const vendasList = await db.vendas.toArray();
    console.assert(vendasList.length === 1, 'Deve haver 1 venda registrada');
    console.assert(vendasList[0].valor === 20.00, 'Valor da venda deve ser 20.00');
    console.log('✅ Registro de venda funcionou.');

    // Teste 3: Atualização de Status
    console.log('Testando atualização de status de pagamento...');
    await db.vendas.update(vendaId, { statusPagamento: 'pago' });
    const vendaAtualizada = await db.vendas.get(vendaId);
    console.assert(vendaAtualizada.statusPagamento === 'pago', 'Status da venda deve ser "pago"');
    console.log('✅ Atualização de status funcionou.');

    console.log('--- Todos os testes passaram com sucesso! ---');
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    process.exit(1);
  }
}

testDatabase();
