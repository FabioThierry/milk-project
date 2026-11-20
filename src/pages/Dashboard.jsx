import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  HandCoins,
  TrendingUp,
  UserPlus,
  Wallet,
} from 'lucide-react';
import { db } from '../db';
import { useMilkData } from '../hooks/useMilkData';
import { APP_NAME } from '../config/brand';
import { formatarData, formatarDinheiro, formatarLitros } from '../utils/formatters';
import Button from '../components/Button';

const ResumoCard = ({ icone: Icone, titulo, valor, detalhe, corIcone, corValor, borda }) => (
  <article className={`rounded-3xl border border-slate-200 border-l-4 ${borda} bg-white p-5 shadow-sm sm:p-6`}>
    <div className="flex items-center gap-3">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${corIcone}`}>
        <Icone size={23} aria-hidden="true" />
      </span>
      <h2 className="text-base font-bold text-slate-700 sm:text-lg">{titulo}</h2>
    </div>
    <p className={`mt-5 text-3xl font-black tracking-tight tabular-nums [overflow-wrap:anywhere] sm:text-4xl ${corValor}`}>
      {valor}
    </p>
    <p className="mt-2 text-sm font-medium text-slate-500">{detalhe}</p>
  </article>
);

const acaoRapidaBase =
  'flex min-h-24 items-center gap-3 rounded-3xl px-4 py-5 text-left font-bold shadow-md transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 active:scale-[0.98] sm:min-h-28';

const Dashboard = () => {
  const {
    totalVendidoHoje,
    litrosVendidosHoje,
    totalVendidoSemana,
    litrosVendidosSemana,
    totalRecebidoSemana,
    totalPendente,
    litrosPendentes,
    vendasPendentes,
    refreshData,
  } = useMilkData();

  const marcarComoPago = async (id) => {
    await db.vendas.update(id, {
      statusPagamento: 'pago',
      dataPagamento: Date.now(),
    });
    await refreshData();
  };

  const irParaPendencias = () => {
    document.getElementById('pendencias')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-5 pb-[calc(7rem+env(safe-area-inset-bottom))] text-slate-900 sm:px-6 md:px-8 md:pt-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 sm:mb-8">
          <p className="mb-1 text-sm font-bold tracking-wide text-blue-600 uppercase">Visão geral</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            {APP_NAME} 🥛
          </h1>
          <p className="mt-2 text-base leading-relaxed text-slate-600 sm:text-lg">
            Controle simples das suas vendas de leite
          </p>
        </header>

        <section aria-label="Resumo das vendas" className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ResumoCard
            icone={TrendingUp}
            titulo="Vendido hoje"
            valor={formatarDinheiro(totalVendidoHoje)}
            detalhe={`${formatarLitros(litrosVendidosHoje)} vendidos hoje`}
            corIcone="bg-emerald-50 text-emerald-600"
            corValor="text-emerald-700"
            borda="border-l-emerald-500"
          />
          <ResumoCard
            icone={CalendarDays}
            titulo="Vendido na semana"
            valor={formatarDinheiro(totalVendidoSemana)}
            detalhe={`${formatarLitros(litrosVendidosSemana)} desde segunda-feira`}
            corIcone="bg-blue-50 text-blue-600"
            corValor="text-blue-700"
            borda="border-l-blue-500"
          />
          <ResumoCard
            icone={HandCoins}
            titulo="Recebido na semana"
            valor={formatarDinheiro(totalRecebidoSemana)}
            detalhe="Pagamentos confirmados nesta semana"
            corIcone="bg-teal-50 text-teal-600"
            corValor="text-teal-700"
            borda="border-l-teal-500"
          />
          <ResumoCard
            icone={AlertCircle}
            titulo="A receber"
            valor={formatarDinheiro(totalPendente)}
            detalhe={`${formatarLitros(litrosPendentes)} em ${vendasPendentes.length} venda(s) em aberto`}
            corIcone="bg-red-50 text-red-600"
            corValor="text-red-700"
            borda="border-l-red-500"
          />
        </section>

        <section aria-labelledby="acoes-rapidas" className="mb-6">
          <h2 id="acoes-rapidas" className="mb-3 text-xl font-bold text-slate-800 sm:text-2xl">
            Ações rápidas
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <Link
              to="/vendas?novo=1"
              className={`${acaoRapidaBase} bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <Wallet size={24} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-base sm:text-lg">Nova venda</span>
                <span className="block text-sm font-medium text-blue-100">Registrar litros e valor</span>
              </span>
            </Link>
            <Link
              to="/clientes?novo=1"
              className={`${acaoRapidaBase} border-2 border-slate-200 bg-white text-slate-800 hover:border-blue-200 hover:bg-blue-50`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <UserPlus size={24} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-base sm:text-lg">Novo cliente</span>
                <span className="block text-sm font-medium text-slate-500">Cadastrar rapidamente</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={irParaPendencias}
              className={`${acaoRapidaBase} border-2 border-slate-200 bg-white text-slate-800 hover:border-emerald-200 hover:bg-emerald-50`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <HandCoins size={24} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-base sm:text-lg">Receber pagamentos</span>
                <span className="block text-sm font-medium text-slate-500">Ver contas em aberto</span>
              </span>
            </button>
          </div>
        </section>

        <section
          id="pendencias"
          aria-labelledby="pendencias-titulo"
          className="scroll-mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 id="pendencias-titulo" className="text-xl font-bold text-slate-800 sm:text-2xl">
              Contas a receber
            </h2>
            <Link to="/vendas" className="text-sm font-bold text-blue-600 hover:text-blue-700">
              Ver vendas
            </Link>
          </div>
          {vendasPendentes.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {vendasPendentes.map((venda) => (
                <li key={venda.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words text-base font-bold text-slate-800 sm:text-lg">{venda.clienteNome}</p>
                    <p className="mt-1 text-sm text-slate-500 sm:text-base">
                      {formatarLitros(venda.quantidade)} · {formatarData(venda.data)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <p className="text-2xl font-black text-red-600 tabular-nums sm:text-3xl">
                      {formatarDinheiro(venda.valor)}
                    </p>
                    <Button size="sm" variant="success" onClick={() => marcarComoPago(venda.id)}>
                      <CheckCircle2 size={18} aria-hidden="true" /> Receber
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={26} aria-hidden="true" />
              </span>
              <p className="text-lg font-bold text-slate-700">Tudo pago por enquanto! 🎉</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
