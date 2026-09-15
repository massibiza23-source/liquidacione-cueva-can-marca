import React from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Users, 
  Coffee, 
  Store, 
  CheckCircle2, 
  AlertCircle,
  PiggyBank
} from 'lucide-react';
import { DailyLiquidation, TotalesCalculados } from '../types';
import { formatEuro } from '../utils/calculator';

interface LiquidationSummaryProps {
  liquidation: DailyLiquidation;
  totals: TotalesCalculados;
}

export const LiquidationSummary: React.FC<LiquidationSummaryProps> = ({
  liquidation,
  totals,
}) => {
  const isCuadrada = Math.abs(totals.descuadreCaja) < 0.01;

  return (
    <div id="section-summary" className="bg-stone-900 text-white rounded-2xl p-5 shadow-lg border border-stone-800">
      
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-800">
        <div>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest block">
            Resumen General del Turno
          </span>
          <h3 className="text-lg font-extrabold text-stone-100 tracking-tight">
            Liquidación {liquidation.fechaDisplay || liquidation.fecha}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {isCuadrada ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Caja Cuadrada (0,00 €)
            </span>
          ) : totals.descuadreCaja > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-700/60">
              <AlertCircle className="w-3.5 h-3.5" />
              Sobrante (+{formatEuro(totals.descuadreCaja)})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-700/60">
              <AlertCircle className="w-3.5 h-3.5" />
              Descuadre ({formatEuro(totals.descuadreCaja)})
            </span>
          )}
        </div>
      </div>

      {/* Grid of Key Financial Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4">
        
        {/* Total Pax */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium">
            <Users className="w-3.5 h-3.5 text-stone-400" />
            <span>Total Pax</span>
          </div>
          <div className="text-xl font-bold font-mono text-stone-100">
            {totals.totalPaxTickets}
          </div>
          <p className="text-[10px] text-stone-500">
            {totals.totalPaxGeneral} pax registrados
          </p>
        </div>

        {/* Total Bruto */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>Total Bruto</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-amber-300">
            {formatEuro(totals.totalBruto)}
          </div>
          <p className="text-[10px] text-stone-500">
            Tickets + Z Bar + Tienda
          </p>
        </div>

        {/* Tarjetas / Visa */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium">
            <CreditCard className="w-3.5 h-3.5 text-blue-400" />
            <span>Cobro Visa / TPV</span>
          </div>
          <div className="text-xl font-bold font-mono text-blue-200">
            {formatEuro(totals.totalVisa)}
          </div>
          <p className="text-[10px] text-stone-500">
            {((totals.totalBruto > 0 ? (totals.totalVisa / totals.totalBruto) * 100 : 0)).toFixed(1)}% del total
          </p>
        </div>

        {/* Gastos / Guías */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
            <PiggyBank className="w-3.5 h-3.5 text-rose-400" />
            <span>Guías / Comisiones</span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-200">
            {formatEuro(totals.totalGastosYComisiones)}
          </div>
          <p className="text-[10px] text-stone-500">
            Entregado a guías
          </p>
        </div>

        {/* Efectivo Teórico */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Efectivo Teórico</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-emerald-300">
            {formatEuro(totals.efectivoTeorico)}
          </div>
          <p className="text-[10px] text-stone-500">
            A ingresar / custodiar
          </p>
        </div>

        {/* Efectivo en Caja */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-stone-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-stone-400" />
            <span>Efectivo Contado</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {formatEuro(totals.totalEfectivoContado)}
          </div>
          <p className="text-[10px] text-stone-500">
            Recuento físico en gaveta
          </p>
        </div>

      </div>

    </div>
  );
};
