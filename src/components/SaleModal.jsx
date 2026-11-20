import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, Trash2, X } from 'lucide-react';
import Button from './Button';
import {
  arredondarValor,
  formatarDataHora,
  formatarDinheiro,
  numeroSeguro,
} from '../utils/formatters';

const SaleModal = ({ venda, clientes, precoLitroAtual, onSave, onClose, onDelete }) => {
  const [clienteId, setClienteId] = useState(String(venda.clienteId));
  const [quantidade, setQuantidade] = useState(numeroSeguro(venda.quantidade));
  const [valor, setValor] = useState(numeroSeguro(venda.valor));
  const [vendaPaga, setVendaPaga] = useState(venda.statusPagamento === 'pago');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const precoOriginal = numeroSeguro(venda.precoLitro) > 0
    ? numeroSeguro(venda.precoLitro)
    : numeroSeguro(venda.valor) / Math.max(numeroSeguro(venda.quantidade), 0.0001);
  const [precoUnitario, setPrecoUnitario] = useState(arredondarValor(precoOriginal));
  const primeiroCampo = useRef(null);

  useEffect(() => {
    const aoPressionarTecla = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', aoPressionarTecla);
    primeiroCampo.current?.focus();
    return () => window.removeEventListener('keydown', aoPressionarTecla);
  }, [onClose]);

  const alterarQuantidade = (event) => {
    const novaQuantidade = Math.max(0, Number(event.target.value));
    setQuantidade(novaQuantidade);
    if (precoUnitario > 0) {
      setValor(arredondarValor(novaQuantidade * precoUnitario));
    }
  };

  const usarPrecoAtual = () => {
    setPrecoUnitario(precoLitroAtual);
    setValor(arredondarValor(quantidade * precoLitroAtual));
  };

  const salvar = async (event) => {
    event.preventDefault();
    if (!clienteId || quantidade <= 0 || valor <= 0) {
      setErro('Selecione o cliente e informe os litros e o valor.');
      return;
    }

    try {
      setSalvando(true);
      setErro('');
      await onSave({
        ...venda,
        clienteId: Number(clienteId),
        quantidade,
        valor: arredondarValor(valor),
        precoLitro: precoUnitario,
        statusPagamento: vendaPaga ? 'pago' : 'pendente',
        dataPagamento: vendaPaga ? venda.dataPagamento || Date.now() : null,
      });
      onClose();
    } catch (error) {
      console.error(error);
      setErro('Não foi possível salvar a venda.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="editar-venda-titulo"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-sm font-bold tracking-wide text-blue-600 uppercase">Correção de venda</p>
            <h2 id="editar-venda-titulo" className="text-xl font-bold text-slate-800 sm:text-2xl">
              Editar venda
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar edição de venda"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={salvar} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="edicao-cliente" className="mb-2 block text-sm font-bold text-slate-700 sm:text-base">
              Cliente
            </label>
            <select
              id="edicao-cliente"
              className="w-full min-w-0 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-lg"
              value={clienteId}
              onChange={(event) => setClienteId(event.target.value)}
            >
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col">
              <label htmlFor="edicao-quantidade" className="mb-2 block text-sm font-bold text-slate-700 sm:text-base">
                Quantidade (L)
              </label>
              <input
                id="edicao-quantidade"
                ref={primeiroCampo}
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0.1"
                className="w-full min-w-0 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-lg"
                value={quantidade}
                onChange={alterarQuantidade}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="edicao-valor" className="mb-2 block text-sm font-bold text-slate-700 sm:text-base">
                Valor total (R$)
              </label>
              <input
                id="edicao-valor"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                className="w-full min-w-0 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-lg"
                value={valor}
                onChange={(event) => setValor(Math.max(0, Number(event.target.value)))}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600 sm:p-4 sm:text-base">
            <p className="font-bold text-slate-700">
              Preço usado: {formatarDinheiro(precoUnitario)} por litro
            </p>
            {precoLitroAtual > 0 && precoUnitario !== precoLitroAtual && (
              <button
                type="button"
                onClick={usarPrecoAtual}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:text-sm"
              >
                <RefreshCw size={15} aria-hidden="true" />
                Usar preço atual ({formatarDinheiro(precoLitroAtual)})
              </button>
            )}
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

          <div className="space-y-1 text-sm text-slate-500 sm:text-base">
            <p>Venda em {formatarDataHora(venda.data)}</p>
            {vendaPaga && (
              <p>Pagamento em {formatarDataHora(venda.dataPagamento || Date.now())}</p>
            )}
          </div>

          {erro && (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
              <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
              {erro}
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button type="submit" variant="primary" disabled={salvando || !clienteId || quantidade <= 0 || valor <= 0}>
              <CheckCircle2 size={19} aria-hidden="true" />
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} disabled={salvando}>
              Cancelar
            </Button>
            {onDelete && (
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
                    onDelete(venda.id);
                  }
                }}
                disabled={salvando}
                className="w-full sm:col-span-2"
              >
                <Trash2 size={18} aria-hidden="true" />
                Excluir esta venda
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleModal;
