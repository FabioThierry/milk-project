import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  DatabaseBackup,
  Milk,
  Save,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import Button from '../components/Button';
import { buscarConfiguracoes, salvarConfiguracoes } from '../services/settingsService';
import { formatarDinheiro, numeroSeguro } from '../utils/formatters';

const Configuracoes = () => {
  const [precoLitro, setPrecoLitro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    buscarConfiguracoes()
      .then((configuracoes) => {
        setPrecoLitro(String(configuracoes.precoLitro));
        setCarregando(false);
      })
      .catch((error) => {
        console.error(error);
        setMensagem({ tipo: 'erro', texto: 'Não foi possível carregar as configurações.' });
        setCarregando(false);
      });
  }, []);

  const salvar = async (event) => {
    event.preventDefault();
    const valor = numeroSeguro(precoLitro);

    if (valor <= 0) {
      setMensagem({ tipo: 'erro', texto: 'Informe um valor maior que zero para o litro do leite.' });
      return;
    }

    try {
      setSalvando(true);
      const configuracoes = await salvarConfiguracoes({ precoLitro: valor });
      setPrecoLitro(String(configuracoes.precoLitro));
      setMensagem({ tipo: 'sucesso', texto: 'Preço do leite atualizado.' });
    } catch (error) {
      console.error(error);
      setMensagem({ tipo: 'erro', texto: 'Não foi possível salvar o preço do leite.' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-5 pb-[calc(7rem+env(safe-area-inset-bottom))] text-slate-900 sm:px-6 md:px-8 md:pt-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 sm:mb-8">
          <p className="mb-1 text-sm font-bold tracking-wide text-blue-600 uppercase">Configurações</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Ajustes do negócio ⚙️</h1>
          <p className="mt-2 text-base leading-relaxed text-slate-600 sm:text-lg">
            Defina o preço do leite para as novas vendas serem calculadas automaticamente.
          </p>
        </header>

        <section aria-labelledby="preco-leite" className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Milk size={23} aria-hidden="true" />
            </span>
            <div>
              <h2 id="preco-leite" className="text-xl font-bold text-slate-800 sm:text-2xl">Preço do leite</h2>
              <p className="text-sm text-slate-500">Valor cobrado por litro</p>
            </div>
          </div>

          <form onSubmit={salvar} className="space-y-4">
            <div>
              <label htmlFor="preco-litro" className="mb-2 block text-sm font-bold text-slate-700 sm:text-base">
                Valor por litro (R$)
              </label>
              <input
                id="preco-litro"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                value={precoLitro}
                onChange={(event) => setPrecoLitro(event.target.value)}
                disabled={carregando}
                className="w-full min-w-0 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-xl font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              />
              {precoLitro !== '' && numeroSeguro(precoLitro) > 0 && (
                <p className="mt-2 text-sm text-slate-500">
                  Exemplo: 10 litros custam {formatarDinheiro(10 * numeroSeguro(precoLitro))}.
                </p>
              )}
            </div>

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

            <Button type="submit" size="lg" className="w-full" disabled={carregando || salvando}>
              <Save size={20} aria-hidden="true" />
              {salvando ? 'Salvando...' : 'Salvar preço'}
            </Button>
          </form>
        </section>

        <section aria-labelledby="config-avancadas" className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <Settings size={23} aria-hidden="true" />
            </span>
            <h2 id="config-avancadas" className="text-xl font-bold text-slate-800 sm:text-2xl">Avançado</h2>
          </div>

          <details className="group rounded-2xl border border-slate-200 bg-slate-50">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 font-bold text-slate-700">
              <span className="inline-flex items-center gap-2">
                <DatabaseBackup size={20} aria-hidden="true" className="text-slate-500" />
                Backup e restauração
              </span>
              <ChevronRight size={19} aria-hidden="true" className="text-slate-400 transition group-open:rotate-90" />
            </summary>
            <div className="border-t border-slate-200 px-4 py-4">
              <p className="flex items-start gap-2 text-sm leading-relaxed text-slate-600">
                <ShieldCheck size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
                Exporte ou restaure seus dados quando precisar. Guarde o arquivo em um local seguro.
              </p>
              <Link
                to="/configuracoes/backup"
                className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Abrir backup
              </Link>
            </div>
          </details>
        </section>
      </div>
    </div>
  );
};

export default Configuracoes;
