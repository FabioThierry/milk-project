import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, ShieldCheck, Upload } from 'lucide-react';
import { db } from '../db';
import Button from '../components/Button';
import { APP_FILE_PREFIX, APP_NAME } from '../config/brand';

const Backup = () => {
  const [status, setStatus] = useState(null);
  const [importando, setImportando] = useState(false);

  const exportarDados = async () => {
    try {
      const [clientes, vendas, configuracoes] = await Promise.all([
        db.clientes.toArray(),
        db.vendas.toArray(),
        db.configuracoes.toArray(),
      ]);

      const dados = {
        formato: 'leite-facil-backup',
        versao: 2,
        exportadoEm: new Date().toISOString(),
        dados: {
          clientes,
          vendas,
          configuracoes,
        },
      };

      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${APP_FILE_PREFIX}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus({ tipo: 'sucesso', texto: 'Backup exportado com sucesso.' });
    } catch (error) {
      console.error(error);
      setStatus({ tipo: 'erro', texto: 'Erro ao exportar os dados.' });
    }
  };

  const importarDados = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setImportando(true);
      setStatus(null);
      const texto = await file.text();
      const conteudo = JSON.parse(texto);
      const dados = conteudo.dados || conteudo;
      const clientes = Array.isArray(dados.clientes) ? dados.clientes : null;
      const vendas = Array.isArray(dados.vendas) ? dados.vendas : null;
      const configuracoes = Array.isArray(dados.configuracoes) ? dados.configuracoes : null;

      if (!clientes || !vendas) {
        throw new Error('Arquivo de backup inválido.');
      }

      const confirmou = window.confirm(
        'A restauração substituirá todos os clientes e vendas atuais. Deseja continuar?'
      );
      if (!confirmou) return;

      await db.transaction('rw', db.clientes, db.vendas, db.configuracoes, async () => {
        await db.clientes.clear();
        await db.vendas.clear();
        if (clientes.length > 0) await db.clientes.bulkPut(clientes);
        if (vendas.length > 0) await db.vendas.bulkPut(vendas);
        if (configuracoes && configuracoes.length > 0) {
          await db.configuracoes.clear();
          await db.configuracoes.bulkPut(configuracoes);
        }
      });

      setStatus({ tipo: 'sucesso', texto: 'Backup restaurado com sucesso.' });
    } catch (error) {
      console.error(error);
      setStatus({ tipo: 'erro', texto: 'Arquivo inválido ou não foi possível restaurar o backup.' });
    } finally {
      setImportando(false);
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-5 pb-[calc(7rem+env(safe-area-inset-bottom))] text-slate-900 sm:px-6 md:px-8 md:pt-8">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/configuracoes"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft size={17} aria-hidden="true" /> Voltar para ajustes
        </Link>

        <header className="mb-6 sm:mb-8">
          <p className="mb-1 text-sm font-bold tracking-wide text-blue-600 uppercase">Segurança</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Backup do {APP_NAME} 🛡️</h1>
          <p className="mt-2 text-base leading-relaxed text-slate-600 sm:text-lg">
            Exporte uma cópia dos seus dados ou restaure um backup anterior.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
          <div className="mb-7 flex flex-col gap-4 rounded-2xl bg-blue-50 p-4 sm:flex-row sm:items-center sm:p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <ShieldCheck size={24} aria-hidden="true" />
            </span>
            <p className="text-sm leading-relaxed font-medium text-blue-950 sm:text-base">
              Seus dados ficam salvos apenas neste aparelho. Se os dados do navegador forem apagados, o backup é a forma de recuperá-los.
            </p>
          </div>

          <div className="space-y-8">
            <section aria-labelledby="exportar-backup" className="flex flex-col items-center gap-4">
              <h2 id="exportar-backup" className="text-center text-xl font-bold text-slate-800 sm:text-2xl">
                Exportar backup
              </h2>
              <Button onClick={exportarDados} size="lg" className="w-full">
                <Download size={23} aria-hidden="true" /> Baixar meu backup
              </Button>
            </section>

            <section aria-labelledby="importar-backup" className="flex flex-col items-center gap-4 border-t border-slate-200 pt-8">
              <h2 id="importar-backup" className="text-center text-xl font-bold text-slate-800 sm:text-2xl">
                Restaurar backup
              </h2>
              <label className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-blue-300 hover:bg-blue-50">
                <Upload size={22} aria-hidden="true" className="text-slate-500" />
                <span className="text-sm font-bold text-slate-700">
                  {importando ? 'Restaurando...' : 'Escolher arquivo de backup'}
                </span>
                <span className="text-xs text-slate-500">Arquivo .json exportado pelo aplicativo</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={importarDados}
                  disabled={importando}
                  className="sr-only"
                />
              </label>
              <p className="text-center text-sm leading-relaxed text-slate-500 sm:text-base">
                A restauração substitui os dados atuais. Confirme somente se tiver certeza.
              </p>
            </section>
          </div>

          {status && (
            <div
              role={status.tipo === 'erro' ? 'alert' : 'status'}
              className={`mt-7 rounded-2xl p-4 text-center text-sm font-bold sm:text-base ${
                status.tipo === 'erro'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              {status.texto}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Backup;
