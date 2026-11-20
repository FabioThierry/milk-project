import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const dismissedKey = 'leite-facil-install-dismissed';

const InstallAppButton = () => {
  const [promptInstalacao, setPromptInstalacao] = useState(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const aoExibirPrompt = (evento) => {
      evento.preventDefault();
      if (window.localStorage.getItem(dismissedKey) === 'true') return;
      setPromptInstalacao(evento);
      setVisivel(true);
    };
    const aoInstalar = () => {
      setPromptInstalacao(null);
      setVisivel(false);
    };

    window.addEventListener('beforeinstallprompt', aoExibirPrompt);
    window.addEventListener('appinstalled', aoInstalar);
    return () => {
      window.removeEventListener('beforeinstallprompt', aoExibirPrompt);
      window.removeEventListener('appinstalled', aoInstalar);
    };
  }, []);

  const fecharAviso = () => {
    window.localStorage.setItem(dismissedKey, 'true');
    setPromptInstalacao(null);
    setVisivel(false);
  };

  const instalar = async () => {
    if (!promptInstalacao) return;
    await promptInstalacao.prompt();
    await promptInstalacao.userChoice;
    setPromptInstalacao(null);
    setVisivel(false);
  };

  if (!visivel || !promptInstalacao) return null;

  return (
    <div className="fixed right-4 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] left-4 z-50 mx-auto max-w-md rounded-2xl border border-blue-100 bg-white p-4 shadow-xl sm:right-auto sm:left-1/2 sm:w-[420px] sm:-translate-x-1/2">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Download size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-800">Instalar o Leite Fácil</p>
          <p className="mt-0.5 text-sm text-slate-600">Use o aplicativo mesmo sem internet.</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={instalar}
              className="min-h-10 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
            >
              Instalar agora
            </button>
            <button
              type="button"
              onClick={fecharAviso}
              className="min-h-10 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              Agora não
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={fecharAviso}
          aria-label="Fechar aviso de instalação"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          <X size={17} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default InstallAppButton;
