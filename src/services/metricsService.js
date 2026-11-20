import {
  arredondarValor,
  fimDoDia,
  inicioDaSemana,
  inicioDoDia,
  numeroSeguro,
} from '../utils/formatters';

const vendaEstaPaga = (venda) => venda.statusPagamento === 'pago';

const dataDeRecebimento = (venda) => venda.dataPagamento || venda.data;

export const resumirCliente = (vendas = []) => {
  const resumo = vendas.reduce(
    (acc, venda) => {
      const litros = numeroSeguro(venda.quantidade);
      const valor = numeroSeguro(venda.valor);
      const paga = vendaEstaPaga(venda);

      acc.litrosComprados += litros;
      acc.valorTotal += valor;
      acc.quantidadeVendas += 1;

      if (paga) {
        acc.litrosPagos += litros;
        acc.valorPago += valor;
      } else {
        acc.litrosPendentes += litros;
        acc.valorPendente += valor;
      }

      return acc;
    },
    {
      litrosComprados: 0,
      litrosPagos: 0,
      litrosPendentes: 0,
      valorTotal: 0,
      valorPago: 0,
      valorPendente: 0,
      quantidadeVendas: 0,
    }
  );

  return {
    ...resumo,
    litrosComprados: arredondarValor(resumo.litrosComprados),
    litrosPagos: arredondarValor(resumo.litrosPagos),
    litrosPendentes: arredondarValor(resumo.litrosPendentes),
    valorTotal: arredondarValor(resumo.valorTotal),
    valorPago: arredondarValor(resumo.valorPago),
    valorPendente: arredondarValor(resumo.valorPendente),
  };
};

export const agruparVendasPorCliente = (vendas = []) => {
  const grupos = new Map();

  vendas.forEach((venda) => {
    const lista = grupos.get(venda.clienteId) || [];
    lista.push(venda);
    grupos.set(venda.clienteId, lista);
  });

  const resumos = new Map();
  grupos.forEach((lista, clienteId) => {
    resumos.set(clienteId, resumirCliente(lista));
  });
  return resumos;
};

export const calcularResumoDashboard = (vendas = [], clientes = []) => {
  const hojeInicio = inicioDoDia();
  const hojeFim = fimDoDia();
  const semanaInicio = inicioDaSemana();

  const vendasHoje = vendas.filter(
    (venda) => venda.data >= hojeInicio && venda.data <= hojeFim
  );
  const vendasSemana = vendas.filter((venda) => venda.data >= semanaInicio);
  const vendasRecebidasSemana = vendas.filter(
    (venda) => vendaEstaPaga(venda) && dataDeRecebimento(venda) >= semanaInicio
  );
  const vendasPendentes = vendas.filter((venda) => !vendaEstaPaga(venda));
  const nomesDosClientes = new Map(clientes.map((cliente) => [cliente.id, cliente.nome]));

  const somar = (lista, campo) =>
    arredondarValor(lista.reduce((total, item) => total + numeroSeguro(item[campo]), 0));

  return {
    totalVendidoHoje: somar(vendasHoje, 'valor'),
    litrosVendidosHoje: somar(vendasHoje, 'quantidade'),
    totalVendidoSemana: somar(vendasSemana, 'valor'),
    litrosVendidosSemana: somar(vendasSemana, 'quantidade'),
    totalRecebidoSemana: somar(vendasRecebidasSemana, 'valor'),
    totalPendente: somar(vendasPendentes, 'valor'),
    litrosPendentes: somar(vendasPendentes, 'quantidade'),
    vendasPendentes: [...vendasPendentes]
      .sort((a, b) => b.data - a.data)
      .map((venda) => ({
        ...venda,
        clienteNome: nomesDosClientes.get(venda.clienteId) || 'Cliente não encontrado',
      })),
  };
};
