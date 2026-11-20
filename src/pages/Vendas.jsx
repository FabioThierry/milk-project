import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  History,
  Pencil,
  Settings,
  ShoppingCart,
  UserPlus,
} from 'lucide-react';
import { db } from '../db';
import Button from '../components/Button';
import QuickClientForm from '../components/QuickClientForm';
import SaleModal from '../components/SaleModal';
import { buscarConfiguracoes } from '../services/settingsService';
import {
  arredondarValor,
  formatarDataHora,
  formatarDinheiro,
  formatarLitros,
} from '../utils/formatters';

const Vendas = () => {
  const [searchParams] = useSearchParams();
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [valor, setValor] = useState(0);
  const [precoLitro, setPrecoLitro] = useState(0);
  const [vendaPaga, setVendaPaga] = useState(false);
  const [mostrarCadastroRapido, setMostrarCadastroRapido] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [vendaEditando, setVendaEditando] = useState(null);

  const carregarDados = async () => {
    const [clientesDb, vendasDb] = await Promise.all([
      db.clientes.toArray(),
      db.vendas.orderBy('data').reverse().toArray(),
    ]);
    setClientes(clientesDb);
    setVendas(vendasDb);
  };

  useEffect(() => {
    let ativo = true;

    Promise.all([db.clientes.toArray(), db.vendas.orderBy('data').reverse().toArray(), buscarConfiguracoes()])
      .then(([clientesDb, vendasDb, configuracoes]) => {
        if (!ativo) return;
        setClientes(clientesDb);
        setVendas(vendasDb);
        setPrecoLitro(configuracoes.precoLitro);
        setValor(arredondarValor(1 * configuracoes.precoLitro));

        const clienteParam = searchParams.get('cliente');
        if (clienteParam && clientesDb.some((cliente) => String(cliente.id) === clienteParam)) {
          setClienteSelecionadoId(clienteParam);
        }
      })
      .catch((error) => {
        console.error(error);
        setMensagem({ tipo: 'erro', texto: 'Não foi possível carregar os dados da venda.' });
      });

    return () => {
      ativo = false;
    };
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get('novo') === '1' || searchParams.get('cliente')) {
      const timer = window.setTimeout(() => {
        document.getElementById('venda-quantidade')?.focus();
      }, 150);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [searchParams]);

  const clientesAtivos = clientes.filter((cliente) => cliente.status === 'ativo');
  const clienteSelecionado = clientes.find(
    (cliente) => String(cliente.id) === String(clienteSelecionadoId)
  );

  const alterarQuantidade = (event) => {
    const novaQuantidade = Math.max(0, Number(event.target.value));
    setQuantidade(novaQuantidade);
    if (precoLitro > 0) {
      setValor(arredondarValor(novaQuantidade * precoLitro));
    }
  };

  const registrarVenda = async () => {
    if (!clienteSelecionado || quantidade <= 0 || valor <= 0) {
      setMensagem({ tipo: 'erro', texto: 'Selecione o cliente e informe os litros e o valor.' });
      return;
    }

    try {
      setSalvando(true);
      setMensagem(null);
      await db.vendas.add({
        clienteId: clienteSelecionado.id,
        quantidade,
        valor: arredondarValor(valor),
        precoLitro: precoLitro > 0
          ? arredondarValor(precoLitro)
          : arredondarValor(valor / quantidade),
        statusPagamento: vendaPaga ? 'pago' : 'pendente',
        data: Date.now(),
        dataPagamento: vendaPaga ? Date.now() : null,
      });

      await carregarDados();
      setClienteSelecionadoId('');
      setQuantidade(1);
      setValor(arredondarValor(precoLitro));
      setVendaPaga(false);
      setMensagem({ tipo: 'sucesso', texto: 'Venda registrada com sucesso.' });
    } catch (error) {
      console.error(error);
      setMensagem({ tipo: 'erro', texto: 'Não foi possível registrar a venda.' });
    } finally {
      setSalvando(false);
    }
  };

  const marcarComoPago = async (id) => {
    await db.vendas.update(id, {
      statusPagamento: 'pago',
      dataPagamento: Date.now(),
    });
    await carregarDados();
    setMensagem({ tipo: 'sucesso', texto: 'Pagamento recebido.' });
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
    setMensagem({ tipo: 'sucesso', texto: 'Venda atualizada com sucesso.' });
  };

  const excluirVenda = async (id) => {
    await db.vendas.delete(id);
    await carregarDados();
    setVendaEditando(null);
    setMensagem({ tipo: 'sucesso', texto: 'Venda excluída com sucesso.' });
  };

  const clienteCadastrado = (cliente) => {
    setClientes((atuais) => [...atuais, cliente]);
    setClienteSelecionadoId(String(cliente.id));
    setMostrarCadastroRapido(false);
    setMensagem({ tipo: 'sucesso', texto: `${cliente.nome} foi cadastrado e selecionado.` });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-5 pb-[calc(7rem+env(safe-area-inset-bottom))] text-slate-900 sm:px-6 md:px-8 md:pt-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 sm:mb-8">
          <p className="mb-1 text-sm font-bold tracking-wide text-blue-600 uppercase">Pedidos</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Registrar venda 🥛</h1>
          <p className="mt-2 text-base leading-relaxed text-slate-600 sm:text-lg">
            Selecione o cliente, informe os litros e o valor já é calculado pelo preço configurado.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section aria-labelledby="nova-venda" className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ShoppingCart size={23} aria-hidden="true" />
              </span>
              <div>
                <h2 id="nova-venda" className="text-xl font-bold text-slate-800 sm:text-2xl">Nova venda</h2>
                <p className="text-sm text-slate-500">Preço atual: {formatarDinheiro(precoLitro)} por litro</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="venda-cliente" className="block text-sm font-bold text-slate-700 sm:text-base">
                    Cliente
                  </label>
                  <button
                    type="button"
                    onClick={() => setMostrarCadastroRapido((aberto) => !aberto)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-bold text-blue-600 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  >
                    <UserPlus size={17} aria-hidden="true" />
                    Novo cliente
                  </button>
                </div>
                <select
                  id="venda-cliente"
                  className="w-full min-w-0 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-lg"
                  value={clienteSelecionadoId}
                  onChange={(event) => setClienteSelecionadoId(event.target.value)}
                >
                  <option value="">Selecione um cliente...</option>
                  {clientesAtivos.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                  ))}
                </select>
                {clientesAtivos.length === 0 && !mostrarCadastroRapido && (
                  <button
                    type="button"
                    onClick={() => setMostrarCadastroRapido(true)}
                    className="mt-3 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700"
                  >
                    <UserPlus size={18} aria-hidden="true" />
                    Nenhum cliente ativo. Cadastre o primeiro aqui.
                  </button>
                )}
              </div>

              {mostrarCadastroRapido && (
                <QuickClientForm
                  onSaved={clienteCadastrado}
                  onCancel={() => setMostrarCadastroRapido(false)}
                />
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col">
                  <label htmlFor="venda-quantidade" className="mb-2 block text-sm font-bold text-slate-700 sm:text-base">
                    Quantidade (L)
                  </label>
                  <input
                    id="venda-quantidade"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    className="w-full min-w-0 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-lg"
                    value={quantidade}
                    onChange={alterarQuantidade}
                    min="0.1"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="venda-valor" className="mb-2 block text-sm font-bold text-slate-700 sm:text-base">
                    Valor total (R$)
                  </label>
                  <input
                    id="venda-valor"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    className="w-full min-w-0 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-lg"
                    value={valor}
                    onChange={(event) => setValor(Math.max(0, Number(event.target.value)))}
                    min="0"
                  />
                  {precoLitro > 0 ? (
                    <p className="mt-1 text-xs text-slate-500">Calculado automaticamente. Pode ajustar se precisar.</p>
                  ) : (
                    <Link to="/configuracoes" className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-blue-600">
                      <Settings size={14} aria-hidden="true" /> Defina o preço do litro nos ajustes
                    </Link>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={vendaPaga}
                  onChange={(event) => setVendaPaga(event.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-slate-700 sm:text-base">Pagamento já recebido</span>
              </label>

              {mensagem && (
                <p
                  role={mensagem.tipo === 'erro' ? 'alert' : 'status'}
                  className={`rounded-xl px-3 py-2 text-sm font-bold ${
                    mensagem.tipo === 'erro'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {mensagem.texto}
                </p>
              )}

              <Button
                onClick={registrarVenda}
                disabled={salvando || !clienteSelecionado || quantidade <= 0 || valor <= 0}
                size="lg"
                className="mt-2 w-full"
              >
                {salvando ? 'Registrando...' : 'Confirmar venda'}
              </Button>
            </div>
          </section>

          <section aria-labelledby="historico-vendas" className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <History size={23} aria-hidden="true" />
              </span>
              <h2 id="historico-vendas" className="text-xl font-bold text-slate-800 sm:text-2xl">Histórico recente</h2>
            </div>
            <div className="space-y-3 lg:max-h-[720px] lg:overflow-y-auto lg:pr-2">
              {vendas.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 px-5 py-8 text-center">
                  <p className="text-base font-semibold text-slate-500">Nenhuma venda registrada.</p>
                </div>
              ) : (
                vendas.map((venda) => {
                  const cliente = clientes.find((item) => item.id === venda.clienteId);
                  return (
                    <article
                      key={venda.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-base font-bold text-slate-800 sm:text-lg">
                          {cliente?.nome || 'Cliente não encontrado'}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 sm:text-base">
                          {formatarLitros(venda.quantidade)} · {formatarDinheiro(venda.valor)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">{formatarDataHora(venda.data)}</p>
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Editar venda de ${cliente?.nome || 'cliente'}`}
                          onClick={() => setVendaEditando(venda)}
                        >
                          <Pencil size={18} aria-hidden="true" />
                        </Button>
                        {venda.statusPagamento === 'pago' ? (
                          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 sm:text-base">
                            <CheckCircle size={19} aria-hidden="true" /> Pago
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 sm:text-base">
                              <AlertTriangle size={19} aria-hidden="true" /> Pendente
                            </span>
                            <Button
                              size="icon"
                              variant="success"
                              aria-label={`Marcar venda de ${cliente?.nome || 'cliente'} como paga`}
                              onClick={() => marcarComoPago(venda.id)}
                            >
                              <CheckCircle size={19} aria-hidden="true" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      {vendaEditando && (
        <SaleModal
          venda={vendaEditando}
          clientes={clientes.filter((cliente) => cliente.status === 'ativo' || cliente.id === vendaEditando.clienteId)}
          precoLitroAtual={precoLitro}
          onSave={salvarEdicao}
          onDelete={excluirVenda}
          onClose={() => setVendaEditando(null)}
        />
      )}
    </div>
  );
};

export default Vendas;
