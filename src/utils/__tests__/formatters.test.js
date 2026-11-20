import { describe, it, expect } from 'vitest';
import {
  numeroSeguro,
  arredondarValor,
  formatarDinheiro,
  formatarLitros,
  formatarData,
  formatarDataHora,
  inicioDoDia,
  fimDoDia,
  inicioDaSemana,
} from '../formatters';

describe('formatters', () => {
  it('numeroSeguro converts valid and invalid values safely', () => {
    expect(numeroSeguro(10)).toBe(10);
    expect(numeroSeguro('15.5')).toBe(15.5);
    expect(numeroSeguro(null)).toBe(0);
    expect(numeroSeguro(undefined)).toBe(0);
    expect(numeroSeguro('invalido')).toBe(0);
  });

  it('arredondarValor rounds to 2 decimal places', () => {
    expect(arredondarValor(10.555)).toBe(10.56);
    expect(arredondarValor(10.554)).toBe(10.55);
    expect(arredondarValor('20.4')).toBe(20.4);
  });

  it('formatarDinheiro formats currency string with BRL', () => {
    const formatted = formatarDinheiro(15.5);
    expect(formatted).toContain('15,50');
  });

  it('formatarLitros formats liters correctly', () => {
    expect(formatarLitros(2)).toBe('2 L');
    expect(formatarLitros(2.5)).toBe('2,5 L');
  });

  it('formatarData and formatarDataHora handle null/undefined and valid timestamps', () => {
    expect(formatarData(null)).toBe('Sem data');
    expect(formatarDataHora(null)).toBe('Sem data');

    const timestamp = new Date(2026, 10, 20, 12, 0).getTime();
    expect(formatarData(timestamp)).toContain('2026');
  });

  it('inicioDoDia and fimDoDia calculate boundary timestamps', () => {
    const date = new Date(2026, 4, 15, 14, 30);
    const start = new Date(inicioDoDia(date));
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);

    const end = new Date(fimDoDia(date));
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
  });

  it('inicioDaSemana calculates Monday start correctly', () => {
    // 2026-05-13 is a Wednesday (day 3)
    const wednesday = new Date(2026, 4, 13);
    const start = new Date(inicioDaSemana(wednesday));
    expect(start.getDay()).toBe(1); // Monday
    expect(start.getDate()).toBe(11);
  });
});
