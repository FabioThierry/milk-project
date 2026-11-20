import { useCallback, useEffect, useState } from 'react';
import { db } from '../db';
import { calcularResumoDashboard } from '../services/metricsService';

const resumoInicial = {
  totalVendidoHoje: 0,
  litrosVendidosHoje: 0,
  totalVendidoSemana: 0,
  litrosVendidosSemana: 0,
  totalRecebidoSemana: 0,
  totalPendente: 0,
  litrosPendentes: 0,
  vendasPendentes: [],
};

export const useMilkData = () => {
  const [resumo, setResumo] = useState(resumoInicial);
  const [carregando, setCarregando] = useState(true);

  const refreshData = useCallback(async () => {
    setCarregando(true);
    const [vendas, clientes] = await Promise.all([
      db.vendas.toArray(),
      db.clientes.toArray(),
    ]);
    setResumo(calcularResumoDashboard(vendas, clientes));
    setCarregando(false);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return { ...resumo, carregando, refreshData };
};
