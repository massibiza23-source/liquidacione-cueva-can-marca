export interface TicketCategory {
  del: number;
  al: number;
  precio: number;
}

export interface GroupTickets {
  pax: number;
  precio: number;
  tipo: string;
}

export interface OtherIncome {
  id: string;
  concepto: string;
  importe: number;
}

export interface BusEntry {
  id: string;
  nombre: string;
  pax: number;
}

export interface GuiaEntry {
  nombre: string;
  importe: number;
}

export interface CashDenominations {
  b500: number;
  b200: number;
  b100: number;
  b50: number;
  b20: number;
  b10: number;
  b5: number;
  m2: number;
  m1: number;
  m050: number;
  m020: number;
  m010: number;
  m005: number;
}

export interface DailyLiquidation {
  id: string;
  fecha: string; // Formato YYYY-MM-DD
  fechaDisplay?: string; // Formato DD/MM/YYYY

  // Entradas (Tickets numerados)
  tickets: {
    adultos: TicketCategory;
    ninos: TicketCategory;
    imserso: TicketCategory;
    grupos: GroupTickets;
  };

  // Departamentos complementarios
  bar: {
    zNumero: string | number;
    totalZ: number;
  };
  tienda: {
    zNumero: string | number;
    totalZ: number;
  };
  miradorYoga: {
    total: number;
    concepto: string;
  };
  otrosIngresos: OtherIncome[];

  // Guías y comisiones
  guias: {
    guia1: GuiaEntry;
    guia2: GuiaEntry;
    guia3: GuiaEntry;
    guia4: GuiaEntry;
    comisionBar: number;
    comisionTienda: number;
    comisionTickets: number;
  };

  // Cobros con tarjeta (Visa / TPV)
  cobroVisa: {
    bar: number;
    tienda: number;
    tickets: number;
  };

  // Arqueo de efectivo
  arqueo: {
    fondoCaja: number;
    desglose: CashDenominations;
    efectivoManual?: number; // Por si ingresan el total directamente
  };

  // Desglose de Pax
  paxBreakdown: {
    onLine: number;
    particulares: number;
    buses: BusEntry[];
  };

  observaciones: string;
  cerrado: boolean;
  actualizadoEn: string;
}

export interface TotalesCalculados {
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

  totalGuias: number;
  totalComisiones: number;
  totalGastosYComisiones: number;

  totalVisaBar: number;
  totalVisaTienda: number;
  totalVisaTickets: number;
  totalVisa: number;
  totalNeto: number; // Total Bruto - Total Visa

  efectivoTeorico: number; // Bruto - Tarjetas - Comisiones
  totalEfectivoContado: number;
  descuadreCaja: number; // EfectivoContado - EfectivoTeórico

  totalPaxBuses: number;
  totalPaxGeneral: number; // On-line + Particulares + Buses
}
