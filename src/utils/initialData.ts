import { DailyLiquidation } from '../types';

export const emptyCashDenominations = {
  b500: 0,
  b200: 0,
  b100: 0,
  b50: 0,
  b20: 0,
  b10: 0,
  b5: 0,
  m2: 0,
  m1: 0,
  m050: 0,
  m020: 0,
  m010: 0,
  m005: 0,
};

export const sampleLiquidation: DailyLiquidation = {
  id: '2026-09-15',
  fecha: '2026-09-15',
  fechaDisplay: '15/09/2026',
  tickets: {
    adultos: { del: 51499, al: 51499, precio: 15.0 },
    ninos: { del: 7863, al: 7863, precio: 9.0 },
    imserso: { del: 4529, al: 4529, precio: 12.0 },
    grupos: { pax: 0, precio: 4.5, tipo: 'niños' },
  },
  bar: {
    zNumero: '128',
    totalZ: 0,
  },
  tienda: {
    zNumero: '511',
    totalZ: 0,
  },
  miradorYoga: {
    total: 0,
    concepto: 'yoga',
  },
  otrosIngresos: [],
  guias: {
    guia1: { nombre: 'Guia 1', importe: 0 },
    guia2: { nombre: 'Guia 2', importe: 0 },
    guia3: { nombre: 'Guia 3', importe: 0 },
    guia4: { nombre: 'Guia 4', importe: 0 },
    comisionBar: 0,
    comisionTienda: 0,
    comisionTickets: 0,
  },
  cobroVisa: {
    bar: 0,
    tienda: 0,
    tickets: 0,
  },
  arqueo: {
    fondoCaja: 300,
    desglose: { ...emptyCashDenominations },
    efectivoManual: 0,
  },
  paxBreakdown: {
    onLine: 0,
    particulares: 0,
    buses: [
      { id: 'b1', nombre: 'BUS', pax: 0 },
      { id: 'b2', nombre: 'BUS', pax: 0 },
      { id: 'b3', nombre: 'BUS', pax: 0 },
      { id: 'b4', nombre: 'BUS', pax: 0 },
      { id: 'b5', nombre: 'BUS', pax: 0 },
      { id: 'b6', nombre: 'BUS', pax: 0 },
      { id: 'b7', nombre: 'BUS', pax: 0 },
      { id: 'b8', nombre: 'BUS', pax: 0 },
      { id: 'b9', nombre: 'BUS', pax: 0 },
    ],
  },
  observaciones: 'Hoja de liquidación inicial taquilla cueva',
  cerrado: false,
  actualizadoEn: new Date().toISOString(),
};

/**
 * Función clave solicitada por el usuario:
 * "quiero que al crear nuevo dia la app avera todo y done el numero de tickes al nr al del nr"
 *
 * Toma la última liquidación (o la seleccionada) y transfiere:
 * - Nuevo del = anterior al (para adultos, niños, imserso)
 * - Nuevo al = nuevo del (inicialmente 0 pax vendidos hasta que el taquillero digite el cierre)
 * - Incrementa Z de Bar y Z de Tienda si son números
 * - Pone a cero los importes diarios de caja, ventas, visas y arqueo para arrancar el nuevo día limpio.
 */
export const createNewDayFromPrevious = (
  previous: DailyLiquidation,
  newDateStr?: string
): DailyLiquidation => {
  // Calcular fecha siguiente
  let nextDate = newDateStr;
  if (!nextDate) {
    const prevDateObj = new Date(previous.fecha);
    if (!isNaN(prevDateObj.getTime())) {
      prevDateObj.setDate(prevDateObj.getDate() + 1);
      nextDate = prevDateObj.toISOString().split('T')[0];
    } else {
      nextDate = new Date().toISOString().split('T')[0];
    }
  }

  // El nuevo "del" es el "al" del día anterior:
  const newAdultosDel = previous.tickets.adultos.al || previous.tickets.adultos.del;
  const newNinosDel = previous.tickets.ninos.al || previous.tickets.ninos.del;
  const newImsersoDel = previous.tickets.imserso.al || previous.tickets.imserso.del;

  // Incremento Z
  const prevBarZ = parseInt(String(previous.bar.zNumero), 10);
  const nextBarZ = !isNaN(prevBarZ) ? String(prevBarZ + 1) : previous.bar.zNumero;

  const prevTiendaZ = parseInt(String(previous.tienda.zNumero), 10);
  const nextTiendaZ = !isNaN(prevTiendaZ) ? String(prevTiendaZ + 1) : previous.tienda.zNumero;

  return {
    id: nextDate,
    fecha: nextDate,
    fechaDisplay: nextDate.split('-').reverse().join('/'),
    tickets: {
      adultos: {
        del: newAdultosDel,
        al: newAdultosDel, // Comienza en el mismo número (0 vendidos al iniciar)
        precio: previous.tickets.adultos.precio || 15.0,
      },
      ninos: {
        del: newNinosDel,
        al: newNinosDel,
        precio: previous.tickets.ninos.precio || 9.0,
      },
      imserso: {
        del: newImsersoDel,
        al: newImsersoDel,
        precio: previous.tickets.imserso.precio || 12.0,
      },
      grupos: {
        pax: 0,
        precio: previous.tickets.grupos.precio || 4.5,
        tipo: previous.tickets.grupos.tipo || 'niños',
      },
    },
    bar: {
      zNumero: nextBarZ,
      totalZ: 0,
    },
    tienda: {
      zNumero: nextTiendaZ,
      totalZ: 0,
    },
    miradorYoga: {
      total: 0,
      concepto: previous.miradorYoga.concepto || 'yoga',
    },
    otrosIngresos: [],
    guias: {
      guia1: { nombre: previous.guias.guia1.nombre || 'Guia 1', importe: 0 },
      guia2: { nombre: previous.guias.guia2.nombre || 'Guia 2', importe: 0 },
      guia3: { nombre: previous.guias.guia3.nombre || 'Guia 3', importe: 0 },
      guia4: { nombre: previous.guias.guia4.nombre || 'Guia 4', importe: 0 },
      comisionBar: 0,
      comisionTienda: 0,
      comisionTickets: 0,
    },
    cobroVisa: {
      bar: 0,
      tienda: 0,
      tickets: 0,
    },
    arqueo: {
      fondoCaja: previous.arqueo.fondoCaja || 300,
      desglose: { ...emptyCashDenominations },
      efectivoManual: 0,
    },
    paxBreakdown: {
      onLine: 0,
      particulares: 0,
      buses: (previous.paxBreakdown.buses || []).map((b, idx) => ({
        id: `b${idx + 1}`,
        nombre: b.nombre || 'BUS',
        pax: 0,
      })),
    },
    observaciones: `Liquidación abierta para ${nextDate}. Numeración de tickets arrastrada del cierre anterior.`,
    cerrado: false,
    actualizadoEn: new Date().toISOString(),
  };
};

const STORAGE_KEY = 'cueva_liquidaciones_data_v1';
const CURRENT_ID_KEY = 'cueva_current_selected_id';

export const loadStoredLiquidations = (): DailyLiquidation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error al cargar datos guardados:', e);
  }
  return [sampleLiquidation];
};

export const saveLiquidationsToStorage = (list: DailyLiquidation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error al guardar datos:', e);
  }
};

export const loadSelectedId = (): string => {
  try {
    return localStorage.getItem(CURRENT_ID_KEY) || sampleLiquidation.id;
  } catch {
    return sampleLiquidation.id;
  }
};

export const saveSelectedId = (id: string): void => {
  try {
    localStorage.setItem(CURRENT_ID_KEY, id);
  } catch {
    // ignore
  }
};
