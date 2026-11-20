import Dexie from 'dexie';
import { arredondarValor } from './utils/formatters.js';

export class MilkDatabase extends Dexie {
  constructor() {
    super('MilkManagerDB');
    this.version(1).stores({
      clientes: '++id, nome, telefone, status',
      vendas: '++id, clienteId, quantidade, valor, statusPagamento, data'
    });
    this.version(2).stores({
      clientes: '++id, nome, telefone, status',
      vendas: '++id, clienteId, quantidade, valor, statusPagamento, data, dataPagamento',
      configuracoes: '&id'
    });
    this.version(3).stores({
      clientes: '++id, nome, telefone, status',
      vendas: '++id, clienteId, quantidade, valor, statusPagamento, data, dataPagamento',
      configuracoes: '&id'
    }).upgrade(async (transacao) => {
      const vendas = await transacao.table('vendas').toArray();
      await Promise.all(
        vendas.map((venda) => {
          if (venda.precoLitro !== undefined) return Promise.resolve();
          const precoLitro = venda.quantidade > 0
            ? arredondarValor(venda.valor / venda.quantidade)
            : 0;
          return transacao.table('vendas').update(venda.id, { precoLitro });
        })
      );
    });
  }
}

export const db = new MilkDatabase();
