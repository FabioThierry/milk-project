import { describe, it, expect } from 'vitest';
import {
  resumirCliente,
  agruparVendasPorCliente,
  calcularResumoDashboard,
} from '../metricsService';

describe('metricsService', () => {
  it('resumirCliente correctly aggregates paid and pending sales', () => {
    const vendas = [
      { id: 1, quantidade: 2, valor: 10, statusPagamento: 'pago' },
      { id: 2, quantidade: 3, valor: 15, statusPagamento: 'pendente' },
    ];

    const resumo = resumirCliente(vendas);
    expect(resumo.litrosComprados).toBe(5);
    expect(resumo.valorTotal).toBe(25);
    expect(resumo.litrosPagos).toBe(2);
    expect(resumo.valorPago).toBe(10);
    expect(resumo.litrosPendentes).toBe(3);
    expect(resumo.valorPendente).toBe(15);
    expect(resumo.quantidadeVendas).toBe(2);
  });

  it('agruparVendasPorCliente groups properly by clienteId', () => {
    const vendas = [
      { id: 1, clienteId: 10, quantidade: 2, valor: 10, statusPagamento: 'pago' },
      { id: 2, clienteId: 20, quantidade: 4, valor: 20, statusPagamento: 'pendente' },
    ];

    const mapa = agruparVendasPorCliente(vendas);
    expect(mapa.get(10).litrosComprados).toBe(2);
    expect(mapa.get(20).litrosComprados).toBe(4);
    expect(mapa.get(20).valorPendente).toBe(20);
  });

  it('calcularResumoDashboard calculates today, week, and pending sales correctly', () => {
    const now = Date.now();
    const clientes = [{ id: 1, nome: 'João' }];
    const vendas = [
      {
        id: 1,
        clienteId: 1,
        quantidade: 5,
        valor: 25,
        statusPagamento: 'pago',
        data: now,
        dataPagamento: now,
      },
      {
        id: 2,
        clienteId: 1,
        quantidade: 3,
        valor: 15,
        statusPagamento: 'pendente',
        data: now,
        dataPagamento: null,
      },
    ];

    const resumo = calcularResumoDashboard(vendas, clientes);
    expect(resumo.totalVendidoHoje).toBe(40);
    expect(resumo.litrosVendidosHoje).toBe(8);
    expect(resumo.totalRecebidoSemana).toBe(25);
    expect(resumo.totalPendente).toBe(15);
    expect(resumo.litrosPendentes).toBe(3);
    expect(resumo.vendasPendentes.length).toBe(1);
    expect(resumo.vendasPendentes[0].clienteNome).toBe('João');
  });
});
