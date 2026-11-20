import { db } from '../db';
import { arredondarValor, numeroSeguro } from '../utils/formatters';

export const CONFIG_ID = 'principal';

export const CONFIGURACOES_PADRAO = {
  id: CONFIG_ID,
  precoLitro: 5,
};

export const buscarConfiguracoes = async () => {
  const salvas = await db.configuracoes.get(CONFIG_ID);
  if (!salvas) {
    await db.configuracoes.put(CONFIGURACOES_PADRAO);
    return { ...CONFIGURACOES_PADRAO };
  }

  return {
    ...CONFIGURACOES_PADRAO,
    ...salvas,
    precoLitro: arredondarValor(salvas.precoLitro),
  };
};

export const salvarConfiguracoes = async ({ precoLitro }) => {
  const configuracoes = {
    ...CONFIGURACOES_PADRAO,
    precoLitro: arredondarValor(Math.max(0, numeroSeguro(precoLitro))),
  };
  await db.configuracoes.put(configuracoes);
  return configuracoes;
};
