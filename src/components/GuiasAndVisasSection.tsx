import React from 'react';
import { CreditCard, Award, UserCheck } from 'lucide-react';
import { DailyLiquidation, TotalesCalculados } from '../types';
import { formatEuro } from '../utils/calculator';

interface GuiasAndVisasSectionProps {
  liquidation: DailyLiquidation;
  totals: TotalesCalculados;
  onChange: (updated: DailyLiquidation) => void;
}

export const GuiasAndVisasSection: React.FC<GuiasAndVisasSectionProps> = ({
  liquidation,
  totals,
  onChange,
}) => {
  const handleGuiaChange = (
    guiaKey: 'guia1' | 'guia2' | 'guia3' | 'guia4',
    field: 'nombre' | 'importe',
    val: any
  ) => {
    const updated = { ...liquidation };
    if (field === 'importe') {
      updated.guias[guiaKey].importe = parseFloat(val) || 0;
    } else {
      updated.guias[guiaKey].nombre = val;
    }
    onChange(updated);
  };

  const handleComisionChange = (
    field: 'comisionBar' | 'comisionTienda' | 'comisionTickets',
    val: string
  ) => {
    const updated = { ...liquidation };
    updated.guias[field] = parseFloat(val) || 0;
    onChange(updated);
  };

  const handleVisaChange = (field: 'bar' | 'tienda' | 'tickets', val: string) => {
    const updated = { ...liquidation };
    updated.cobroVisa[field] = parseFloat(val) || 0;
    onChange(updated);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      
      {/* 1. Cobros con Tarjeta (Visa / TPV) */}
      <div id="section-visas" className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        
        <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-900">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Cobros con Tarjeta / Visa
              </h2>
              <p className="text-xs text-stone-500">
                Totales cobrados por datáfono / TPV
              </p>
            </div>
          </div>

          <div className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200/60">
            Total Visa: <span className="font-mono">{formatEuro(totals.totalVisa)}</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            
            {/* Visa Bar */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
              <label className="block text-[11px] font-bold text-stone-600">
                Visa Bar
              </label>
              <div className="relative">
                <input
                  id="input-visa-bar"
                  type="number"
                  step="0.01"
                  min="0"
                  value={liquidation.cobroVisa.bar || ''}
                  onChange={(e) => handleVisaChange('bar', e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-2 pr-6 py-1.5 text-xs font-mono font-bold text-stone-900 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                />
                <span className="absolute right-2 top-1.5 text-[10px] text-stone-400">€</span>
              </div>
            </div>

            {/* Visa Tienda */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
              <label className="block text-[11px] font-bold text-stone-600">
                Visa Tienda
              </label>
              <div className="relative">
                <input
                  id="input-visa-tienda"
                  type="number"
                  step="0.01"
                  min="0"
                  value={liquidation.cobroVisa.tienda || ''}
                  onChange={(e) => handleVisaChange('tienda', e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-2 pr-6 py-1.5 text-xs font-mono font-bold text-stone-900 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                />
                <span className="absolute right-2 top-1.5 text-[10px] text-stone-400">€</span>
              </div>
            </div>

            {/* Visa Tickets */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
              <label className="block text-[11px] font-bold text-stone-600">
                Visa Tickets
              </label>
              <div className="relative">
                <input
                  id="input-visa-tickets"
                  type="number"
                  step="0.01"
                  min="0"
                  value={liquidation.cobroVisa.tickets || ''}
                  onChange={(e) => handleVisaChange('tickets', e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-2 pr-6 py-1.5 text-xs font-mono font-bold text-stone-900 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                />
                <span className="absolute right-2 top-1.5 text-[10px] text-stone-400">€</span>
              </div>
            </div>

          </div>

          <p className="text-[11px] text-stone-500 italic">
            * El total de tarjetas se resta automáticamente del total bruto para calcular el efectivo teórico a entregar en caja.
          </p>
        </div>

      </div>

      {/* 2. Guías y Comisiones */}
      <div id="section-guias" className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        
        <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-900">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Guías y Comisiones
              </h2>
              <p className="text-xs text-stone-500">
                Pagos a guías y comisiones del turno
              </p>
            </div>
          </div>

          <div className="text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200/60">
            Total: <span className="font-mono">{formatEuro(totals.totalGastosYComisiones)}</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          
          {/* 4 Guides grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(['guia1', 'guia2', 'guia3', 'guia4'] as const).map((gKey, idx) => (
              <div key={gKey} className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-1">
                <input
                  type="text"
                  value={liquidation.guias[gKey].nombre}
                  onChange={(e) => handleGuiaChange(gKey, 'nombre', e.target.value)}
                  placeholder={`Guía ${idx + 1}`}
                  className="w-full text-xs font-semibold text-stone-700 bg-transparent border-b border-stone-200 pb-0.5 focus:border-amber-800 focus:outline-hidden"
                />
                <div className="relative pt-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={liquidation.guias[gKey].importe || ''}
                    onChange={(e) => handleGuiaChange(gKey, 'importe', e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-2 pr-5 py-1 text-xs font-mono font-bold text-stone-900 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-stone-400">€</span>
                </div>
              </div>
            ))}
          </div>

          {/* Commissions by department */}
          <div className="pt-2 border-t border-stone-100">
            <div className="text-xs font-semibold text-stone-700 mb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-stone-400" />
              <span>Otras comisiones entregadas:</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2.5">
              
              <div>
                <label className="block text-[11px] text-stone-500 font-medium mb-1">
                  Comisión Bar
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={liquidation.guias.comisionBar || ''}
                    onChange={(e) => handleComisionChange('comisionBar', e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-2 pr-5 py-1 text-xs font-mono font-bold text-stone-900 bg-white border border-stone-300 rounded-md focus:outline-hidden"
                  />
                  <span className="absolute right-2 top-1.5 text-[10px] text-stone-400">€</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 font-medium mb-1">
                  Comisión Tienda
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={liquidation.guias.comisionTienda || ''}
                    onChange={(e) => handleComisionChange('comisionTienda', e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-2 pr-5 py-1 text-xs font-mono font-bold text-stone-900 bg-white border border-stone-300 rounded-md focus:outline-hidden"
                  />
                  <span className="absolute right-2 top-1.5 text-[10px] text-stone-400">€</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 font-medium mb-1">
                  Comisión Tickets
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={liquidation.guias.comisionTickets || ''}
                    onChange={(e) => handleComisionChange('comisionTickets', e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-2 pr-5 py-1 text-xs font-mono font-bold text-stone-900 bg-white border border-stone-300 rounded-md focus:outline-hidden"
                  />
                  <span className="absolute right-2 top-1.5 text-[10px] text-stone-400">€</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
