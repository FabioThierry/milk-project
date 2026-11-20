import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { db } from '../db';
import Button from './Button';

const QuickClientForm = ({ onSaved, onCancel }) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const salvar = async (event) => {
    event.preventDefault();
    const nomeLimpo = nome.trim();

    if (!nomeLimpo) {
      setErro('Informe o nome do cliente.');
      return;
    }

    try {
      setSalvando(true);
      setErro('');
      const cliente = {
        nome: nomeLimpo,
        telefone: telefone.trim(),
        status: 'ativo',
      };
      const id = await db.clientes.add(cliente);
      setNome('');
      setTelefone('');
      onSaved({ ...cliente, id });
    } catch (error) {
      console.error(error);
      setErro('Não foi possível cadastrar o cliente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form
      onSubmit={salvar}
      className="rounded-2xl border-2 border-blue-100 bg-blue-50/60 p-4"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          <UserPlus size={19} aria-hidden="true" />
        </span>
        <div>
          <p className="text-base font-bold text-slate-800">Cadastro rápido</p>
          <p className="text-sm text-slate-600">O cliente já entra selecionado na venda.</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="cliente-rapido-nome" className="mb-1.5 block text-sm font-bold text-slate-700">
            Nome do cliente
          </label>
          <input
            id="cliente-rapido-nome"
            type="text"
            autoFocus
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            className="w-full min-w-0 rounded-xl border-2 border-slate-200 bg-white px-3.5 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Ex: Dona Maria"
          />
        </div>
        <div>
          <label htmlFor="cliente-rapido-telefone" className="mb-1.5 block text-sm font-bold text-slate-700">
            Telefone <span className="font-medium text-slate-500">(opcional)</span>
          </label>
          <input
            id="cliente-rapido-telefone"
            type="tel"
            inputMode="tel"
            value={telefone}
            onChange={(event) => setTelefone(event.target.value)}
            className="w-full min-w-0 rounded-xl border-2 border-slate-200 bg-white px-3.5 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Ex: (11) 99999-9999"
          />
        </div>
        {erro && (
          <p role="alert" className="text-sm font-semibold text-red-600">
            {erro}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button type="submit" size="sm" disabled={salvando || !nome.trim()}>
            {salvando ? 'Salvando...' : 'Cadastrar e usar'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={salvando}>
            Cancelar
          </Button>
        </div>
      </div>
    </form>
  );
};

export default QuickClientForm;
