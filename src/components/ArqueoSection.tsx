import React from 'react';
import { 
  Calculator, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { DailyLiquidation, TotalesCalculados } from '../types';
import { formatEuro } from '../utils/calculator';

interface ArqueoSectionProps {
  liquidation: DailyLiquidation;
  totals: TotalesCalculados;
  onChange: (updated: DailyLiquidation) => void;
}

export const ArqueoSection: React.FC<ArqueoSectionProps> = ({
  liquidation,
  totals,
  onChange,
}) => {
  const handleManualEfectivo = (val: string) => {
    const updated = { ...liquidation };
    updated.arqueo.efectivoManual = parseFloat(val) || 0;
    onChange(updated);
  };

  const isCuadreExacto = Math.abs(totals.descuadreCaja) < 0.01;
  const isSobrante = totals.descuadreCaja > 0.01;

  return (
    <div id="section-arqueo" className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
      
      {/* Header */}
      <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-900">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900">
              Arqueo y Cuadre de Caja de Efectivo
            </h2>
            <p className="text-xs text-stone-500">
              Comparativa entre Efectivo Teórico a rendir y Efectivo Contado en Caja
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        
        {/* Comparison Bar: Teórico vs Real vs Descuadre */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          
          {/* 1. Efectivo Teórico */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Efectivo Teórico a Rendir
              </span>
              <div className="text-2xl font-mono font-extrabold text-stone-900 mt-1.5">
                {formatEuro(totals.efectivoTeorico)}
              </div>
            </div>
            <p className="text-[10px] text-stone-400 mt-2">
              (Total Bruto − Tarjetas − Comisiones)
            </p>
          </div>

          {/* 2. Efectivo Contado en Caja */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="input-efectivo-manual" className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Efectivo Contado en Caja
                </label>
                <span className="text-[10px] text-stone-400">
                  {(liquidation.arqueo.efectivoManual ?? 0) > 0 ? 'Registrado' : 'Pendiente'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  id="input-efectivo-manual"
                  type="number"
                  step="0.01"
                  min="0"
                  value={liquidation.arqueo.efectivoManual ?? ''}
                  onChange={(e) => handleManualEfectivo(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3 py-1 text-xl font-mono font-extrabold bg-white border border-stone-300 rounded-lg text-stone-900 focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                />
                <span className="text-base font-bold text-stone-600">€</span>
              </div>
            </div>
            <p className="text-[10px] text-stone-400 mt-2">
              Importe total de efectivo real contado en caja
            </p>
          </div>

          {/* 3. Descuadre / Diferencia */}
          <div
            className={`p-4 rounded-xl border transition-colors flex flex-col justify-between ${
              isCuadreExacto
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : isSobrante
                ? 'bg-blue-50/70 border-blue-300 text-blue-950'
                : 'bg-rose-50/70 border-rose-300 text-rose-950'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {isCuadreExacto
                    ? 'Caja Cuadrada'
                    : isSobrante
                    ? 'Sobrante de Caja'
                    : 'Faltante de Caja'}
                </span>
                {isCuadreExacto ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
              </div>
              <div className="text-2xl font-mono font-extrabold mt-1.5">
                {totals.descuadreCaja > 0 ? `+${formatEuro(totals.descuadreCaja)}` : formatEuro(totals.descuadreCaja)}
              </div>
            </div>
            <p className="text-[11px] opacity-80 mt-2">
              {isCuadreExacto
                ? 'Diferencia 0,00 € (Sin descuadre)'
                : isSobrante
                ? 'Hay más efectivo del esperado'
                : 'Falta dinero respecto al teórico'}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
