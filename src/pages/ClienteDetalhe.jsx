import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Droplets,
  HandCoins,
  Pencil,
  ShoppingCart,
} from 'lucide-react';
import { db } from '../db';
import Button from '../components/Button';
import SaleModal from '../components/SaleModal';
import { resumirCliente } from '../services/metricsService';
import { buscarConfiguracoes } from '../services/settingsService';
import {
  formatarDataHora,
  formatarDinheiro,
  formatarLitros,
} from '../utils/formatters';

const ClienteDetalhe = () => {
  const { clienteId } = useParams();
  const [cliente, setCliente] = useState(null);
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [vendaEditando, setVendaEditando] = useState(null);
  const [precoLitro, setPrecoLitro] = useState(0);

  const carregarDados = async () => {
    const id = Number(clienteId);
    const [clienteDb, vendasDb, configuracoes] = await Promise.all([
      db.clientes.get(id),
      db.vendas.where('clienteId').equals(id).toArray(),
      buscarConfiguracoes(),
    ]);
    setCliente(clienteDb || null);
    setVendas([...vendasDb].sort((a, b) => b.data - a.data));
    setPrecoLitro(configuracoes.precoLitro);
    setCarregando(false);
  };

  useEffect(() => {
    carregarDados();
  }, [clienteId]);

  const marcarComoPago = async (id) => {
    await db.vendas.update(id, {
      statusPagamento: 'pago',
      dataPagamento: Date.now(),
    });
    await carregarDados();
  };

  const salvarEdicao = async (vendaAtualizada) => {
    await db.vendas.update(vendaAtualizada.id, {
      clienteId: vendaAtualizada.clienteId,
      quantidade: vendaAtualizada.quantidade,
      valor: vendaAtualizada.valor,
      precoLitro: vendaAtualizada.precoLitro,
      statusPagamento: vendaAtualizada.statusPagamento,
      dataPagamento: vendaAtualizada.dataPagamento,
    });
    await carregarDados();
  };

  const excluirVenda = async (id) => {
    await db.vendas.delete(id);
    await carregarDados();
    setVendaEditando(null);
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-5 pb-[calc(7rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500">
          Carregando cliente...
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-5 pb-[calc(7rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-lg font-bold text-slate-800">Cliente não encontrado.</p>
          <Link to="/clientes" className="mt-4 inline-flex font-bold text-blue-600">
            Voltar para clientes
          </Link>
        </div>
      </div>
    );
  }

  const resumo = resumirCliente(vendas);

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-5 pb-[calc(7rem+env(safe-area-inset-bottom))] text-slate-900 sm:px-6 md:px-8 md:pt-8">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/clientes"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft size={17} aria-hidden="true" /> Voltar para clientes
        </Link>

        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="mb-1 text-sm font-bold tracking-wide text-blue-600 uppercase">Histórico do cliente</p>
            <h1 className="break-words text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{cliente.nome}</h1>
            <p className="mt-2 text-base text-slate-600">{cliente.telefone || 'Telefone não informado'}</p>
            {cliente.status !== 'ativo' && (
              <span className="mt-2 inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                Cliente inativo
              </span>
            )}
          </div>
          <Link
            to={`/vendas?cliente=${cliente.id}&novo=1`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <ShoppingCart size={20} aria-hidden="true" /> Nova venda
          </Link>
        </header>

        <section aria-label="Resumo do cliente" className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <article className="rounded-3xl border border-slate-200 border-l-4 border-l-blue-500 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <Droplets size={21} aria-hidden="true" />
              <h2 className="font-bold">Comprou</h2>
            </div>
            <p className="mt-4 text-3xl font-black tabular-nums text-slate-900">{formatarLitros(resumo.litrosComprados)}</p>
            <p className="mt-1 text-sm text-slate-500">{formatarDinheiro(resumo.valorTotal)} em vendas</p>
          </article>
          <article className="rounded-3xl border border-slate-200 border-l-4 border-l-emerald-500 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 size={21} aria-hidden="true" />
              <h2 className="font-bold">Já pagou</h2>
            </div>
            <p className="mt-4 text-3xl font-black tabular-nums text-slate-900">{formatarLitros(resumo.litrosPagos)}</p>
            <p className="mt-1 text-sm text-slate-500">{formatarDinheiro(resumo.valorPago)} recebidos</p>
          </article>
          <article className="rounded-3xl border border-slate-200 border-l-4 border-l-red-500 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-red-700">
              <HandCoins size={21} aria-hidden="true" />
              <h2 className="font-bold">Falta pagar</h2>
            </div>
            <p className="mt-4 text-3xl font-black tabular-nums text-slate-900">{formatarLitros(resumo.litrosPendentes)}</p>
            <p className="mt-1 text-sm font-bold text-red-600">{formatarDinheiro(resumo.valorPendente)} a receber</p>
          </article>
        </section>

        <section aria-labelledby="vendas-cliente" className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="vendas-cliente" className="text-xl font-bold text-slate-800 sm:text-2xl">Vendas do cliente</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">
              {resumo.quantidadeVendas}
            </span>
          </div>

          {vendas.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-5 py-8 text-center">
              <p className="text-base font-semibold text-slate-500">Nenhuma venda registrada para este cliente.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {vendas.map((venda) => (
                <li key={venda.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-base font-bold text-slate-800">
                      {formatarLitros(venda.quantidade)} · {formatarDinheiro(venda.valor)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{formatarDataHora(venda.data)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Editar venda de ${cliente.nome}`}
                      onClick={() => setVendaEditando(venda)}
                    >
                      <Pencil size={18} aria-hidden="true" />
                    </Button>
                    {venda.statusPagamento === 'pago' ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                        <CheckCircle2 size={18} aria-hidden="true" /> Pago
                      </span>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600">
                          <AlertCircle size={18} aria-hidden="true" /> Pendente
                        </span>
                        <Button size="sm" variant="success" onClick={() => marcarComoPago(venda.id)}>
                          <CheckCircle2 size={17} aria-hidden="true" /> Receber
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {vendaEditando && (
        <SaleModal
          venda={vendaEditando}
          clientes={[cliente]}
          precoLitroAtual={precoLitro}
          onSave={salvarEdicao}
          onDelete={excluirVenda}
          onClose={() => setVendaEditando(null)}
        />
      )}
    </div>
  );
};

export default ClienteDetalhe;
