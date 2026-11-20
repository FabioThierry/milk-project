import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, RotateCcw, Trash2, UserRound, UserX } from 'lucide-react';
import { db } from '../db';
import Button from '../components/Button';
import { agruparVendasPorCliente } from '../services/metricsService';
import { formatarDinheiro, formatarLitros } from '../utils/formatters';

const resumoVazio = {
  litrosComprados: 0,
  litrosPagos: 0,
  litrosPendentes: 0,
  valorPendente: 0,
};

const Clientes = () => {
  const [searchParams] = useSearchParams();
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [novoNome, setNovoNome] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [editandoNome, setEditandoNome] = useState('');
  const [editandoTelefone, setEditandoTelefone] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const carregarClientes = async () => {
    const [clientesDb, vendasDb] = await Promise.all([
      db.clientes.toArray(),
      db.vendas.toArray(),
    ]);
    setClientes(clientesDb);
    setVendas(vendasDb);
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  useEffect(() => {
    if (searchParams.get('novo') === '1') {
      const timer = window.setTimeout(() => document.getElementById('cliente-nome')?.focus(), 150);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [searchParams]);

  const resumos = useMemo(() => agruparVendasPorCliente(vendas), [vendas]);
  const clientesAtivos = clientes.filter((cliente) => cliente.status === 'ativo');
  const clientesInativos = clientes.filter((cliente) => cliente.status !== 'ativo');

  const limparFormulario = () => {
    setNovoNome('');
    setNovoTelefone('');
    setEditandoId(null);
    setEditandoNome('');
    setEditandoTelefone('');
    setErro('');
  };

  const salvarCliente = async (event) => {
    event.preventDefault();
    const nome = (editandoId ? editandoNome : novoNome).trim();
    const telefone = (editandoId ? editandoTelefone : novoTelefone).trim();

    if (!nome) {
      setErro('Informe o nome do cliente.');
      return;
    }

    try {
      setErro('');
      if (editandoId) {
        await db.clientes.update(editandoId, { nome, telefone });
        setMensagem('Cliente atualizado com sucesso.');
      } else {
        await db.clientes.add({ nome, telefone, status: 'ativo' });
        setMensagem('Cliente cadastrado com sucesso.');
      }
      limparFormulario();
      await carregarClientes();
    } catch (error) {
      console.error(error);
      setErro('Não foi possível salvar o cliente.');
    }
  };

  const excluirCliente = async (cliente) => {
    const quantidadeVendas = await db.vendas.where('clienteId').equals(cliente.id).count();

    if (quantidadeVendas > 0) {
      const confirmou = window.confirm(
        `${cliente.nome} possui ${quantidadeVendas} venda(s) registrada(s). O cliente será desativado para preservar o histórico. Continuar?`
      );
      if (!confirmou) return;
      await db.clientes.update(cliente.id, { status: 'inativo' });
      setMensagem('Cliente desativado. O histórico de vendas foi preservado.');
    } else {
      const confirmou = window.confirm(`Tem certeza que deseja excluir ${cliente.nome}?`);
      if (!confirmou) return;
      await db.clientes.delete(cliente.id);
      setMensagem('Cliente excluído.');
    }

    if (editandoId === cliente.id) limparFormulario();
    await carregarClientes();
  };

  const reativarCliente = async (cliente) => {
    await db.clientes.update(cliente.id, { status: 'ativo' });
    setMensagem(`${cliente.nome} foi reativado.`);
    await carregarClientes();
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-5 pb-[calc(7rem+env(safe-area-inset-bottom))] text-slate-900 sm:px-6 md:px-8 md:pt-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 sm:mb-8">
          <p className="mb-1 text-sm font-bold tracking-wide text-blue-600 uppercase">Cadastros</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Seus clientes 👥</h1>
          <p className="mt-2 text-base leading-relaxed text-slate-600 sm:text-lg">
            Cadastre, edite e acompanhe os litros comprados e pagos por cada pessoa.
          </p>
        </header>

        <section aria-labelledby="cadastrar-cliente" className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <UserRound size={23} aria-hidden="true" />
            </span>
            <h2 id="cadastrar-cliente" className="text-xl font-bold text-slate-800 sm:text-2xl">
              {editandoId ? 'Editar cliente' : 'Cadastrar novo cliente'}
            </h2>
          </div>

          <form onSubmit={salvarCliente} className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="cliente-nome" className="mb-2 block text-sm font-bold text-slate-700 sm:text-base">
                Nome do cliente
              </label>
              <input
                id="cliente-nome"
                type="text"
                className="w-full min-w-0 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-lg"
                placeholder="Ex: Dona Maria"
                value={editandoId ? editandoNome : novoNome}
                onChange={(event) => editandoId ? setEditandoNome(event.target.value) : setNovoNome(event.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="cliente-telefone" className="mb-2 block text-sm font-bold text-slate-700 sm:text-base">
                Telefone <span className="font-medium text-slate-500">(opcional)</span>
              </label>
              <input
                id="cliente-telefone"
                type="tel"
                inputMode="tel"
                className="w-full min-w-0 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-lg"
                placeholder="Ex: (11) 99999-9999"
                value={editandoId ? editandoTelefone : novoTelefone}
                onChange={(event) => editandoId ? setEditandoTelefone(event.target.value) : setNovoTelefone(event.target.value)}
              />
            </div>

            {erro && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{erro}</p>}
            {mensagem && <p role="status" className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">{mensagem}</p>}

            <div className="mt-5 flex flex-col gap-3">
              <Button type="submit" size="lg" className="w-full">
                {editandoId ? 'Atualizar cliente' : 'Salvar cliente'}
              </Button>
              {editandoId && (
                <Button type="button" variant="ghost" onClick={limparFormulario}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </section>

        <section aria-labelledby="lista-clientes" className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 id="lista-clientes" className="text-xl font-bold text-slate-800 sm:text-2xl">
              Clientes ativos
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">
              {clientesAtivos.length}
            </span>
          </div>
          {clientesAtivos.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-5 py-8 text-center">
              <p className="text-base font-semibold text-slate-500">Nenhum cliente cadastrado.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {clientesAtivos.map((cliente) => {
                const resumo = resumos.get(cliente.id) || resumoVazio;
                return (
                  <li
                    key={cliente.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/clientes/${cliente.id}`}
                        className="group inline-flex max-w-full items-center gap-1 break-words text-base font-bold text-slate-800 hover:text-blue-700 sm:text-lg"
                      >
                        {cliente.nome}
                        <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-slate-400 group-hover:text-blue-600" />
                      </Link>
                      <p className="mt-1 break-all text-sm text-slate-500 sm:text-base">
                        {cliente.telefone || 'Telefone não informado'}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {formatarLitros(resumo.litrosComprados)} comprados · {formatarLitros(resumo.litrosPagos)} pagos
                        {resumo.valorPendente > 0 && (
                          <span className="font-bold text-red-600"> · {formatarDinheiro(resumo.valorPendente)} a receber</span>
                        )}
                      </p>
                    </div>
                    <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:shrink-0">
                      <Link
                        to={`/clientes/${cliente.id}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:w-auto"
                      >
                        Histórico
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          setEditandoId(cliente.id);
                          setEditandoNome(cliente.nome);
                          setEditandoTelefone(cliente.telefone || '');
                          setErro('');
                          setMensagem('');
                          document.getElementById('cadastrar-cliente')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="icon"
                        variant="danger"
                        aria-label={`Excluir ou desativar ${cliente.nome}`}
                        onClick={() => excluirCliente(cliente)}
                      >
                        <Trash2 size={19} aria-hidden="true" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {clientesInativos.length > 0 && (
            <details className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer text-sm font-bold text-slate-600">
                Clientes inativos ({clientesInativos.length})
              </summary>
              <ul className="mt-3 divide-y divide-slate-200">
                {clientesInativos.map((cliente) => {
                  const resumo = resumos.get(cliente.id) || resumoVazio;
                  return (
                    <li key={cliente.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <Link to={`/clientes/${cliente.id}`} className="break-words font-bold text-slate-700 hover:text-blue-700">
                          {cliente.nome}
                        </Link>
                        <p className="text-sm text-slate-500">
                          {formatarLitros(resumo.litrosComprados)} comprados · {formatarDinheiro(resumo.valorPendente)} a receber
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => reativarCliente(cliente)}>
                        <RotateCcw size={16} aria-hidden="true" /> Reativar
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </details>
          )}

          {clientesInativos.length === 0 && clientesAtivos.length > 0 && (
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <UserX size={15} aria-hidden="true" /> Clientes com histórico não são apagados, apenas desativados.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Clientes;
