export const numeroSeguro = (value) => {
  const numero = Number(value);
  return Number.isFinite(numero) ? numero : 0;
};

export const arredondarValor = (value) => Math.round(numeroSeguro(value) * 100) / 100;

export const formatarDinheiro = (value) =>
  numeroSeguro(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

export const formatarLitros = (value) =>
  `${numeroSeguro(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} L`;

export const formatarData = (timestamp) => {
  if (!timestamp) return 'Sem data';
  return new Date(timestamp).toLocaleDateString('pt-BR');
};

export const formatarDataHora = (timestamp) => {
  if (!timestamp) return 'Sem data';
  return new Date(timestamp).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

export const inicioDoDia = (date = new Date()) => {
  const inicio = new Date(date);
  inicio.setHours(0, 0, 0, 0);
  return inicio.getTime();
};

export const fimDoDia = (date = new Date()) => {
  const fim = new Date(date);
  fim.setHours(23, 59, 59, 999);
  return fim.getTime();
};

export const inicioDaSemana = (date = new Date()) => {
  const inicio = new Date(date);
  inicio.setHours(0, 0, 0, 0);
  const diaDaSemana = inicio.getDay();
  const diasDesdeSegunda = diaDaSemana === 0 ? 6 : diaDaSemana - 1;
  inicio.setDate(inicio.getDate() - diasDesdeSegunda);
  return inicio.getTime();
};
