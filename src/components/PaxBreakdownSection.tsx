import React from 'react';
import { Bus, Users, Globe, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { DailyLiquidation, TotalesCalculados } from '../types';

interface PaxBreakdownSectionProps {
  liquidation: DailyLiquidation;
  totals: TotalesCalculados;
  onChange: (updated: DailyLiquidation) => void;
}

export const PaxBreakdownSection: React.FC<PaxBreakdownSectionProps> = ({
  liquidation,
  totals,
  onChange,
}) => {
  const handleOnLineChange = (val: string) => {
    const updated = { ...liquidation };
    updated.paxBreakdown.onLine = Math.max(0, parseInt(val, 10) || 0);
    onChange(updated);
  };

  const handleParticularesChange = (val: string) => {
    const updated = { ...liquidation };
    updated.paxBreakdown.particulares = Math.max(0, parseInt(val, 10) || 0);
    onChange(updated);
  };

  const handleBusChange = (id: string, field: 'nombre' | 'pax', val: any) => {
    const updated = { ...liquidation };
    updated.paxBreakdown.buses = updated.paxBreakdown.buses.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          [field]: field === 'pax' ? Math.max(0, parseInt(val, 10) || 0) : val,
        };
      }
      return b;
    });
    onChange(updated);
  };

  const addBus = () => {
    const updated = { ...liquidation };
    const nextIdx = (updated.paxBreakdown.buses || []).length + 1;
    updated.paxBreakdown.buses = [
      ...(updated.paxBreakdown.buses || []),
      { id: `b_${Date.now()}`, nombre: `BUS ${nextIdx}`, pax: 0 },
    ];
    onChange(updated);
  };

  const removeBus = (id: string) => {
    const updated = { ...liquidation };
    updated.paxBreakdown.buses = updated.paxBreakdown.buses.filter((b) => b.id !== id);
    onChange(updated);
  };

  // Check reconciliation: do the breakdowns equal the ticket count?
  const diffPax = totals.totalPaxGeneral - totals.totalPaxTickets;

  return (
    <div id="section-pax" className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
      
      {/* Header */}
      <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-900">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900">
              Desglose de Visitantes (Pax) y Autobuses
            </h2>
            <p className="text-xs text-stone-500">
              Control de procedencia: Particulares, Grupos BUS y Venta On-line
            </p>
          </div>
        </div>

        {/* Quick reconciliation indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-stone-500">Total Desglose:</span>
          <span className="font-bold text-stone-900 font-mono bg-stone-100 px-2 py-0.5 rounded-md">
            {totals.totalPaxGeneral} pax
          </span>
          
          {diffPax === 0 ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <CheckCircle className="w-3 h-3" />
              Cuadra con Taquilla ({totals.totalPaxTickets})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <AlertTriangle className="w-3 h-3" />
              Diferencia: {diffPax > 0 ? `+${diffPax}` : diffPax} con Taquilla ({totals.totalPaxTickets})
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        
        {/* Top channels: On-line & Particulares */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Particulares */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-stone-200 text-stone-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800">
                  Particulares
                </label>
                <span className="text-[11px] text-stone-400">Público general / Taquilla directa</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <input
                id="input-pax-particulares"
                type="number"
                min="0"
                value={liquidation.paxBreakdown.particulares || ''}
                onChange={(e) => handleParticularesChange(e.target.value)}
                placeholder="0"
                className="w-20 px-2 py-1 text-center font-mono font-bold text-stone-900 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
              />
              <span className="text-xs text-stone-500 font-semibold">pax</span>
            </div>
          </div>

          {/* On-line */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800">
                  On-line / Web
                </label>
                <span className="text-[11px] text-stone-400">Reservas y cupones web</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <input
                id="input-pax-online"
                type="number"
                min="0"
                value={liquidation.paxBreakdown.onLine || ''}
                onChange={(e) => handleOnLineChange(e.target.value)}
                placeholder="0"
                className="w-20 px-2 py-1 text-center font-mono font-bold text-stone-900 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
              />
              <span className="text-xs text-stone-500 font-semibold">pax</span>
            </div>
          </div>

        </div>

        {/* Buses section */}
        <div className="pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bus className="w-4 h-4 text-amber-800" />
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                Registro de Autobuses y Excursiones ({totals.totalPaxBuses} pax total)
              </span>
            </div>
            <button
              type="button"
              onClick={addBus}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Bus</span>
            </button>
          </div>

          {/* Grid of buses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {liquidation.paxBreakdown.buses.map((bus, idx) => (
              <div
                key={bus.id}
                className="p-2 rounded-lg border border-stone-200 bg-stone-50/70 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-[10px] font-mono text-stone-400">#{idx + 1}</span>
                  <input
                    type="text"
                    value={bus.nombre}
                    onChange={(e) => handleBusChange(bus.id, 'nombre', e.target.value)}
                    placeholder="BUS / Agencia"
                    className="w-full text-xs font-semibold text-stone-700 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-amber-800 focus:outline-hidden"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={bus.pax || ''}
                    onChange={(e) => handleBusChange(bus.id, 'pax', e.target.value)}
                    placeholder="0"
                    className="w-14 px-1.5 py-0.5 text-center font-mono font-bold text-xs bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-stone-400">pax</span>
                  <button
                    type="button"
                    onClick={() => removeBus(bus.id)}
                    className="p-0.5 text-stone-300 hover:text-red-600 rounded transition-colors"
                    title="Eliminar este bus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
