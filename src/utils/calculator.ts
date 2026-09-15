import { DailyLiquidation, TotalesCalculados, CashDenominations } from '../types';

export const formatEuro = (value: number): string => {
  if (isNaN(value) || value === null || value === undefined) return '0,00 €';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  if (isNaN(value) || value === null || value === undefined) return '0';
  return new Intl.NumberFormat('es-ES').format(value);
};

export const parseLocaleNumber = (input: string | number): number => {
  if (typeof input === 'number') return isNaN(input) ? 0 : input;
  if (!input) return 0;
  // Replace Spanish decimal comma with dot
  const sanitized = input.toString().replace(/\s/g, '').replace(/€/g, '').replace(/\./g, '').replace(',', '.');
  const num = parseFloat(sanitized);
  return isNaN(num) ? 0 : num;
};

export const formatDateToES = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export const calculateDenominationsTotal = (d: CashDenominations): number => {
  if (!d) return 0;
  return (
    (d.b500 || 0) * 500 +
    (d.b200 || 0) * 200 +
    (d.b100 || 0) * 100 +
    (d.b50 || 0) * 50 +
    (d.b20 || 0) * 20 +
    (d.b10 || 0) * 10 +
    (d.b5 || 0) * 5 +
    (d.m2 || 0) * 2 +
    (d.m1 || 0) * 1 +
    (d.m050 || 0) * 0.5 +
    (d.m020 || 0) * 0.2 +
    (d.m010 || 0) * 0.1 +
    (d.m005 || 0) * 0.05
  );
};

export const calculateTotals = (liq: DailyLiquidation): TotalesCalculados => {
  // Adultos: del al
  const paxAdultos = Math.max(0, (liq.tickets.adultos.al || 0) - (liq.tickets.adultos.del || 0));
  const subtotalAdultos = paxAdultos * (liq.tickets.adultos.precio || 0);

  // Niños
  const paxNinos = Math.max(0, (liq.tickets.ninos.al || 0) - (liq.tickets.ninos.del || 0));
  const subtotalNinos = paxNinos * (liq.tickets.ninos.precio || 0);

  // Imserso
  const paxImserso = Math.max(0, (liq.tickets.imserso.al || 0) - (liq.tickets.imserso.del || 0));
  const subtotalImserso = paxImserso * (liq.tickets.imserso.precio || 0);

  // Grupos
  const paxGrupos = liq.tickets.grupos.pax || 0;
  const subtotalGrupos = paxGrupos * (liq.tickets.grupos.precio || 0);

  const totalPaxTickets = paxAdultos + paxNinos + paxImserso + paxGrupos;
  const totalTicketsEuros = subtotalAdultos + subtotalNinos + subtotalImserso + subtotalGrupos;

  // Departamentos
  const totalBar = liq.bar.totalZ || 0;
  const totalTienda = liq.tienda.totalZ || 0;
  const totalMiradorYoga = liq.miradorYoga.total || 0;
  const totalOtrosIngresos = (liq.otrosIngresos || []).reduce((acc, curr) => acc + (curr.importe || 0), 0);

  const totalBruto = totalTicketsEuros + totalBar + totalTienda + totalMiradorYoga + totalOtrosIngresos;

  // Guías y comisiones
  const totalGuias =
    (liq.guias.guia1.importe || 0) +
    (liq.guias.guia2.importe || 0) +
    (liq.guias.guia3.importe || 0) +
    (liq.guias.guia4.importe || 0);

  const totalComisiones =
    (liq.guias.comisionBar || 0) +
    (liq.guias.comisionTienda || 0) +
    (liq.guias.comisionTickets || 0);

  const totalGastosYComisiones = totalGuias + totalComisiones;

  // Visas / Tarjeta
  const totalVisaBar = liq.cobroVisa.bar || 0;
  const totalVisaTienda = liq.cobroVisa.tienda || 0;
  const totalVisaTickets = liq.cobroVisa.tickets || 0;
  const totalVisa = totalVisaBar + totalVisaTienda + totalVisaTickets;

  // Total Neto = Total Bruto - Total Cobro Visa
  const totalNeto = totalBruto - totalVisa;

  // Efectivo teórico: Lo que debe haber en efectivo después de restar las tarjetas y comisiones entregadas
  const efectivoTeorico = totalNeto - totalGastosYComisiones;

  // Efectivo contado en caja
  const contadoDesglose = calculateDenominationsTotal(liq.arqueo.desglose);
  const totalEfectivoContado = liq.arqueo.efectivoManual !== undefined && liq.arqueo.efectivoManual > 0
    ? liq.arqueo.efectivoManual
    : contadoDesglose;

  const descuadreCaja = totalEfectivoContado - efectivoTeorico;

  // Pax Buses y General
  const totalPaxBuses = (liq.paxBreakdown.buses || []).reduce((acc, curr) => acc + (curr.pax || 0), 0);
  const totalPaxGeneral = (liq.paxBreakdown.onLine || 0) + (liq.paxBreakdown.particulares || 0) + totalPaxBuses;

  return {
    paxAdultos,
    subtotalAdultos,
    paxNinos,
    subtotalNinos,
    paxImserso,
    subtotalImserso,
    paxGrupos,
    subtotalGrupos,
    totalPaxTickets,
    totalTicketsEuros,
    totalBar,
    totalTienda,
    totalMiradorYoga,
    totalOtrosIngresos,
    totalBruto,
    totalGuias,
    totalComisiones,
    totalGastosYComisiones,
    totalVisaBar,
    totalVisaTienda,
    totalVisaTickets,
    totalVisa,
    totalNeto,
    efectivoTeorico,
    totalEfectivoContado,
    descuadreCaja,
    totalPaxBuses,
    totalPaxGeneral,
  };
};

/**
 * Exporta al formato CSV exacto del usuario
 */
export const exportToCSV = (liq: DailyLiquidation, totals: TotalesCalculados): string => {
  const dateFormatted = formatDateToES(liq.fecha);
  const lines: string[] = [];

  lines.push(',,,,,,,,');
  lines.push(`COBROS,,,${dateFormatted},,,,,`);
  lines.push(',del,al,Total Pax,,,,,');
  lines.push(`Adultos,${liq.tickets.adultos.del},${liq.tickets.adultos.al},${totals.paxAdultos},,"${formatEuro(liq.tickets.adultos.precio)}","${formatEuro(totals.subtotalAdultos)}",,`);
  lines.push(`Niños,${liq.tickets.ninos.del},${liq.tickets.ninos.al},${totals.paxNinos},,"${formatEuro(liq.tickets.ninos.precio)}","${formatEuro(totals.subtotalNinos)}",,`);
  lines.push(`Imserso,${liq.tickets.imserso.del},${liq.tickets.imserso.al},${totals.paxImserso},,"${formatEuro(liq.tickets.imserso.precio)}","${formatEuro(totals.subtotalImserso)}",,`);
  lines.push(`Grupos,,,${totals.paxGrupos},${liq.tickets.grupos.tipo || 'niños'},"${formatEuro(liq.tickets.grupos.precio)}","${formatEuro(totals.subtotalGrupos)}",,`);
  lines.push(`Bar       Z,${liq.bar.zNumero}, , ,,Z bar,"${formatEuro(totals.totalBar)}",,`);
  lines.push(`Tienda  Z,${liq.tienda.zNumero},, ,,Z tienda,"${formatEuro(totals.totalTienda)}",,`);
  lines.push(`mirador,,,,,${liq.miradorYoga.concepto || 'yoga'},"${formatEuro(totals.totalMiradorYoga)}",,`);
  lines.push(`,,,,,,total brutto,"${formatEuro(totals.totalBruto)}",`);
  lines.push(`Cobro Visa,Bar,"${formatEuro(liq.cobroVisa.bar)}",Tienda,"${formatEuro(liq.cobroVisa.tienda)}",Tickets,"${formatEuro(liq.cobroVisa.tickets)}","${formatEuro(totals.totalVisa)}",`);
  lines.push(`Total Neto,,,,,,,"${formatEuro(totals.totalNeto)}",`);
  lines.push(`Efectivo Teórico,,,,,,,"${formatEuro(totals.efectivoTeorico)}",`);
  lines.push(`Efectivo Contado,,,,,,,"${formatEuro(totals.totalEfectivoContado)}",`);
  lines.push(`Descuadre Caja,,,,,,,"${formatEuro(totals.descuadreCaja)}",`);
  lines.push(',,,,,,,,');
  lines.push(`total Pax,${totals.totalPaxTickets},on line,${liq.paxBreakdown.onLine},,, ,,`);
  lines.push(`${liq.paxBreakdown.particulares},Particulares,BUS,${totals.totalPaxBuses},,,,,`);

  liq.paxBreakdown.buses.forEach((b) => {
    lines.push(`,,${b.nombre || 'BUS'},${b.pax},,,,,`);
  });

  return lines.join('\n');
};

export interface MonthlyTotals {
  yearMonth: string; // YYYY-MM
  monthLabel: string; // e.g. "Septiembre 2026"
  daysCount: number;
  paxAdultos: number;
  subtotalAdultos: number;
  paxNinos: number;
  subtotalNinos: number;
  paxImserso: number;
  subtotalImserso: number;
  paxGrupos: number;
  subtotalGrupos: number;
  totalPaxTickets: number;
  totalTicketsEuros: number;
  totalBar: number;
  totalTienda: number;
  totalMiradorYoga: number;
  totalOtrosIngresos: number;
  totalBruto: number;
  totalVisa: number;
  totalVisaBar: number;
  totalVisaTienda: number;
  totalVisaTickets: number;
  totalNeto: number;
  totalGuias: number;
  totalComisiones: number;
  totalEfectivoContado: number;
  totalEfectivoTeorico: number;
}

export const getMonthLabel = (yearMonth: string): string => {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const idx = parseInt(month, 10) - 1;
  if (idx >= 0 && idx < 12) {
    return `${monthNames[idx]} ${year}`;
  }
  return yearMonth;
};

export const calculateMonthlyTotals = (liquidations: DailyLiquidation[], yearMonth?: string): MonthlyTotals => {
  const filtered = yearMonth
    ? liquidations.filter((liq) => liq.fecha && liq.fecha.startsWith(yearMonth))
    : liquidations;

  const targetKey = yearMonth || (liquidations[0]?.fecha ? liquidations[0].fecha.substring(0, 7) : 'Total');

  const acc: MonthlyTotals = {
    yearMonth: targetKey,
    monthLabel: yearMonth ? getMonthLabel(yearMonth) : 'Todos los registros',
    daysCount: filtered.length,
    paxAdultos: 0,
    subtotalAdultos: 0,
    paxNinos: 0,
    subtotalNinos: 0,
    paxImserso: 0,
    subtotalImserso: 0,
    paxGrupos: 0,
    subtotalGrupos: 0,
    totalPaxTickets: 0,
    totalTicketsEuros: 0,
    totalBar: 0,
    totalTienda: 0,
    totalMiradorYoga: 0,
    totalOtrosIngresos: 0,
    totalBruto: 0,
    totalVisa: 0,
    totalVisaBar: 0,
    totalVisaTienda: 0,
    totalVisaTickets: 0,
    totalNeto: 0,
    totalGuias: 0,
    totalComisiones: 0,
    totalEfectivoContado: 0,
    totalEfectivoTeorico: 0,
  };

  for (const liq of filtered) {
    const t = calculateTotals(liq);
    acc.paxAdultos += t.paxAdultos;
    acc.subtotalAdultos += t.subtotalAdultos;
    acc.paxNinos += t.paxNinos;
    acc.subtotalNinos += t.subtotalNinos;
    acc.paxImserso += t.paxImserso;
    acc.subtotalImserso += t.subtotalImserso;
    acc.paxGrupos += t.paxGrupos;
    acc.subtotalGrupos += t.subtotalGrupos;
    acc.totalPaxTickets += t.totalPaxTickets;
    acc.totalTicketsEuros += t.totalTicketsEuros;
    acc.totalBar += t.totalBar;
    acc.totalTienda += t.totalTienda;
    acc.totalMiradorYoga += t.totalMiradorYoga;
    acc.totalOtrosIngresos += t.totalOtrosIngresos;
    acc.totalBruto += t.totalBruto;
    acc.totalVisa += t.totalVisa;
    acc.totalVisaBar += t.totalVisaBar;
    acc.totalVisaTienda += t.totalVisaTienda;
    acc.totalVisaTickets += t.totalVisaTickets;
    acc.totalNeto += t.totalNeto;
    acc.totalGuias += t.totalGuias;
    acc.totalComisiones += t.totalComisiones;
    acc.totalEfectivoContado += t.totalEfectivoContado;
    acc.totalEfectivoTeorico += t.efectivoTeorico;
  }

  return acc;
};

export const exportMonthlySummaryToCSV = (monthlyTotals: MonthlyTotals, days: DailyLiquidation[]): string => {
  const lines: string[] = [];
  lines.push(`RESUMEN MENSUAL DE LIQUIDACIÓN - CUEVA DE CAN MARÇÀ`);
  lines.push(`Mes,${monthlyTotals.monthLabel},Días liquidados,${monthlyTotals.daysCount}`);
  lines.push('');
  lines.push('TICKET / CONCEPTO,PAX TOTAL,SUBTOTAL (€)');
  lines.push(`Adultos,${monthlyTotals.paxAdultos},"${formatEuro(monthlyTotals.subtotalAdultos)}"`);
  lines.push(`Niños,${monthlyTotals.paxNinos},"${formatEuro(monthlyTotals.subtotalNinos)}"`);
  lines.push(`Imserso,${monthlyTotals.paxImserso},"${formatEuro(monthlyTotals.subtotalImserso)}"`);
  lines.push(`Grupos,${monthlyTotals.paxGrupos},"${formatEuro(monthlyTotals.subtotalGrupos)}"`);
  lines.push(`TOTAL ENTRADAS (PAX),${monthlyTotals.totalPaxTickets},"${formatEuro(monthlyTotals.totalTicketsEuros)}"`);
  lines.push('');
  lines.push('DEPARTAMENTO / TOTALES,,TOTAL (€)');
  lines.push(`Venta Entradas Taquilla,,"${formatEuro(monthlyTotals.totalTicketsEuros)}"`);
  lines.push(`Bar Z,,"${formatEuro(monthlyTotals.totalBar)}"`);
  lines.push(`Tienda Z,,"${formatEuro(monthlyTotals.totalTienda)}"`);
  lines.push(`Mirador / Yoga,,"${formatEuro(monthlyTotals.totalMiradorYoga)}"`);
  lines.push(`TOTAL BRUTO MES,,"${formatEuro(monthlyTotals.totalBruto)}"`);
  lines.push(`Cobro Visa (Tarjetas),,"${formatEuro(monthlyTotals.totalVisa)}"`);
  lines.push(`TOTAL NETO MES (Bruto - Visa),,"${formatEuro(monthlyTotals.totalNeto)}"`);
  lines.push('');
  lines.push('DESGLOSE DÍA POR DÍA EN EL MES');
  lines.push('Fecha,Pax Adultos,Pax Niños,Pax Imserso,Total Pax,Total Bruto (€),Cobro Visa (€),Total Neto (€)');

  const sortedDays = [...days].sort((a, b) => a.fecha.localeCompare(b.fecha));
  for (const d of sortedDays) {
    const t = calculateTotals(d);
    lines.push(`${formatDateToES(d.fecha)},${t.paxAdultos},${t.paxNinos},${t.paxImserso},${t.totalPaxTickets},"${formatEuro(t.totalBruto)}","${formatEuro(t.totalVisa)}","${formatEuro(t.totalNeto)}"`);
  }

  return lines.join('\n');
};
