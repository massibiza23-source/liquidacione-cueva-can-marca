import React, { useState } from 'react';
import { Ticket, Users, Sparkles, Settings2, Info } from 'lucide-react';
import { DailyLiquidation, TotalesCalculados } from '../types';
import { formatEuro } from '../utils/calculator';

interface TicketsSectionProps {
  liquidation: DailyLiquidation;
  totals: TotalesCalculados;
  onChange: (updated: DailyLiquidation) => void;
}

export const TicketsSection: React.FC<TicketsSectionProps> = ({
  liquidation,
  totals,
  onChange,
}) => {
  const [showPriceSettings, setShowPriceSettings] = useState(false);

  const handleTicketChange = (
    category: 'adultos' | 'ninos' | 'imserso',
    field: 'del' | 'al' | 'precio',
    value: number
  ) => {
    const updated = { ...liquidation };
    updated.tickets[category][field] = value;
    onChange(updated);
  };

  const handleGruposChange = (field: 'pax' | 'precio' | 'tipo', value: any) => {
    const updated = { ...liquidation };
    if (field === 'pax') {
      updated.tickets.grupos.pax = Math.max(0, parseInt(value, 10) || 0);
    } else if (field === 'precio') {
      updated.tickets.grupos.precio = parseFloat(value) || 0;
    } else if (field === 'tipo') {
      updated.tickets.grupos.tipo = value;
    }
    onChange(updated);
  };

  // Quick increment helpers for convenience
  const addPax = (category: 'adultos' | 'ninos' | 'imserso', count: number) => {
    const currentAl = liquidation.tickets[category].al;
    handleTicketChange(category, 'al', currentAl + count);
  };

  return (
    <div id="section-tickets" className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
      
      {/* Card Header */}
      <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900">
              Venta de Entradas y Taquilla
            </h2>
            <p className="text-xs text-stone-500">
              Control de numeración continua de tickets (Desde «del» hasta «al»)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPriceSettings(!showPriceSettings)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              showPriceSettings
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{showPriceSettings ? 'Ocultar Precios' : 'Tarifas (€)'}</span>
          </button>

          <div className="flex items-center gap-2 bg-amber-50 text-amber-900 px-3 py-1 rounded-lg border border-amber-200/70 text-xs font-bold">
            <span>Pax Taquilla:</span>
            <span className="text-sm font-extrabold">{totals.totalPaxTickets}</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[620px]">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-100/75 text-[11px] font-bold uppercase tracking-wider text-stone-600">
              <th className="py-2.5 px-4">Categoría</th>
              <th className="py-2.5 px-3 text-center w-36">
                del <span className="font-normal text-stone-400 normal-case">(inicio)</span>
              </th>
              <th className="py-2.5 px-3 text-center w-36">
                al <span className="font-normal text-stone-400 normal-case">(cierre)</span>
              </th>
              <th className="py-2.5 px-3 text-center w-28">Total Pax</th>
              <th className="py-2.5 px-3 text-right w-28">Precio Unit.</th>
              <th className="py-2.5 px-4 text-right w-36">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            
            {/* Adultos */}
            <tr className="hover:bg-amber-50/30 transition-colors">
              <td className="py-3 px-4 font-semibold text-stone-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                  <span>Adultos</span>
                </div>
              </td>
              <td className="py-2.5 px-3 text-center">
                <input
                  id="ticket-adultos-del"
                  type="number"
                  min="0"
                  value={liquidation.tickets.adultos.del}
                  onChange={(e) =>
                    handleTicketChange('adultos', 'del', parseInt(e.target.value, 10) || 0)
                  }
                  className="w-28 px-2 py-1 text-center font-mono font-semibold text-stone-700 bg-stone-50 border border-stone-300 rounded-md focus:bg-white focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                />
              </td>
              <td className="py-2.5 px-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <input
                    id="ticket-adultos-al"
                    type="number"
                    min={liquidation.tickets.adultos.del}
                    value={liquidation.tickets.adultos.al}
                    onChange={(e) =>
                      handleTicketChange('adultos', 'al', parseInt(e.target.value, 10) || 0)
                    }
                    className="w-28 px-2 py-1 text-center font-mono font-bold text-stone-900 bg-white border border-amber-300 rounded-md shadow-2xs focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                  />
                </div>
              </td>
              <td className="py-2.5 px-3 text-center">
                <span className="inline-block px-2.5 py-1 font-mono font-bold text-stone-800 bg-stone-100 rounded-md">
                  {totals.paxAdultos}
                </span>
              </td>
              <td className="py-2.5 px-3 text-right">
                {showPriceSettings ? (
                  <input
                    type="number"
                    step="0.5"
                    value={liquidation.tickets.adultos.precio}
                    onChange={(e) =>
                      handleTicketChange('adultos', 'precio', parseFloat(e.target.value) || 0)
                    }
                    className="w-20 px-1 py-0.5 text-right text-xs font-semibold border rounded-sm"
                  />
                ) : (
                  <span className="text-stone-600 font-medium">
                    {formatEuro(liquidation.tickets.adultos.precio)}
                  </span>
                )}
              </td>
              <td className="py-2.5 px-4 text-right font-mono font-bold text-stone-900">
                {formatEuro(totals.subtotalAdultos)}
              </td>
            </tr>

            {/* Niños */}
            <tr className="hover:bg-blue-50/30 transition-colors">
              <td className="py-3 px-4 font-semibold text-stone-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span>Niños</span>
                </div>
              </td>
              <td className="py-2.5 px-3 text-center">
                <input
                  id="ticket-ninos-del"
                  type="number"
                  min="0"
                  value={liquidation.tickets.ninos.del}
                  onChange={(e) =>
                    handleTicketChange('ninos', 'del', parseInt(e.target.value, 10) || 0)
                  }
                  className="w-28 px-2 py-1 text-center font-mono font-semibold text-stone-700 bg-stone-50 border border-stone-300 rounded-md focus:bg-white focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                />
              </td>
              <td className="py-2.5 px-3 text-center">
                <input
                  id="ticket-ninos-al"
                  type="number"
                  min={liquidation.tickets.ninos.del}
                  value={liquidation.tickets.ninos.al}
                  onChange={(e) =>
                    handleTicketChange('ninos', 'al', parseInt(e.target.value, 10) || 0)
                  }
                  className="w-28 px-2 py-1 text-center font-mono font-bold text-stone-900 bg-white border border-blue-300 rounded-md shadow-2xs focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                />
              </td>
              <td className="py-2.5 px-3 text-center">
                <span className="inline-block px-2.5 py-1 font-mono font-bold text-stone-800 bg-stone-100 rounded-md">
                  {totals.paxNinos}
                </span>
              </td>
              <td className="py-2.5 px-3 text-right">
                {showPriceSettings ? (
                  <input
                    type="number"
                    step="0.5"
                    value={liquidation.tickets.ninos.precio}
                    onChange={(e) =>
                      handleTicketChange('ninos', 'precio', parseFloat(e.target.value) || 0)
                    }
                    className="w-20 px-1 py-0.5 text-right text-xs font-semibold border rounded-sm"
                  />
                ) : (
                  <span className="text-stone-600 font-medium">
                    {formatEuro(liquidation.tickets.ninos.precio)}
                  </span>
                )}
              </td>
              <td className="py-2.5 px-4 text-right font-mono font-bold text-stone-900">
                {formatEuro(totals.subtotalNinos)}
              </td>
            </tr>

            {/* Imserso */}
            <tr className="hover:bg-emerald-50/30 transition-colors">
              <td className="py-3 px-4 font-semibold text-stone-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Imserso</span>
                </div>
              </td>
              <td className="py-2.5 px-3 text-center">
                <input
                  id="ticket-imserso-del"
                  type="number"
                  min="0"
                  value={liquidation.tickets.imserso.del}
                  onChange={(e) =>
                    handleTicketChange('imserso', 'del', parseInt(e.target.value, 10) || 0)
                  }
                  className="w-28 px-2 py-1 text-center font-mono font-semibold text-stone-700 bg-stone-50 border border-stone-300 rounded-md focus:bg-white focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                />
              </td>
              <td className="py-2.5 px-3 text-center">
                <input
                  id="ticket-imserso-al"
                  type="number"
                  min={liquidation.tickets.imserso.del}
                  value={liquidation.tickets.imserso.al}
                  onChange={(e) =>
                    handleTicketChange('imserso', 'al', parseInt(e.target.value, 10) || 0)
                  }
                  className="w-28 px-2 py-1 text-center font-mono font-bold text-stone-900 bg-white border border-emerald-300 rounded-md shadow-2xs focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                />
              </td>
              <td className="py-2.5 px-3 text-center">
                <span className="inline-block px-2.5 py-1 font-mono font-bold text-stone-800 bg-stone-100 rounded-md">
                  {totals.paxImserso}
                </span>
              </td>
              <td className="py-2.5 px-3 text-right">
                {showPriceSettings ? (
                  <input
                    type="number"
                    step="0.5"
                    value={liquidation.tickets.imserso.precio}
                    onChange={(e) =>
                      handleTicketChange('imserso', 'precio', parseFloat(e.target.value) || 0)
                    }
                    className="w-20 px-1 py-0.5 text-right text-xs font-semibold border rounded-sm"
                  />
                ) : (
                  <span className="text-stone-600 font-medium">
                    {formatEuro(liquidation.tickets.imserso.precio)}
                  </span>
                )}
              </td>
              <td className="py-2.5 px-4 text-right font-mono font-bold text-stone-900">
                {formatEuro(totals.subtotalImserso)}
              </td>
            </tr>

            {/* Grupos */}
            <tr className="hover:bg-purple-50/30 transition-colors">
              <td className="py-3 px-4 font-semibold text-stone-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  <span>Grupos</span>
                  <span className="text-[11px] text-stone-400 font-normal">
                    ({liquidation.tickets.grupos.tipo || 'niños'})
                  </span>
                </div>
              </td>
              <td className="py-2.5 px-3 text-center text-xs text-stone-400 italic" colSpan={2}>
                Tarifa especial de grupo
              </td>
              <td className="py-2.5 px-3 text-center">
                <input
                  id="ticket-grupos-pax"
                  type="number"
                  min="0"
                  value={liquidation.tickets.grupos.pax}
                  onChange={(e) => handleGruposChange('pax', e.target.value)}
                  placeholder="0"
                  className="w-24 px-2 py-1 text-center font-mono font-bold text-stone-900 bg-white border border-purple-300 rounded-md shadow-2xs focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                />
              </td>
              <td className="py-2.5 px-3 text-right">
                {showPriceSettings ? (
                  <input
                    type="number"
                    step="0.5"
                    value={liquidation.tickets.grupos.precio}
                    onChange={(e) => handleGruposChange('precio', e.target.value)}
                    className="w-20 px-1 py-0.5 text-right text-xs font-semibold border rounded-sm"
                  />
                ) : (
                  <span className="text-stone-600 font-medium">
                    {formatEuro(liquidation.tickets.grupos.precio)}
                  </span>
                )}
              </td>
              <td className="py-2.5 px-4 text-right font-mono font-bold text-stone-900">
                {formatEuro(totals.subtotalGrupos)}
              </td>
            </tr>

          </tbody>
          
          {/* Table Footer Totals */}
          <tfoot>
            <tr className="bg-stone-100 border-t-2 border-stone-300 font-bold text-stone-900 text-sm">
              <td className="py-3 px-4">
                Total Entradas Taquilla
              </td>
              <td colSpan={2} className="py-3 px-3 text-center text-xs text-stone-500 font-medium">
                Suma acumulada del día
              </td>
              <td className="py-3 px-3 text-center font-mono text-base text-amber-900">
                {totals.totalPaxTickets} pax
              </td>
              <td className="py-3 px-3 text-right text-xs text-stone-500">
                Total €:
              </td>
              <td className="py-3 px-4 text-right font-mono text-base text-amber-950">
                {formatEuro(totals.totalTicketsEuros)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Quick notice bar */}
      <div className="px-5 py-2.5 bg-stone-50/70 border-t border-stone-200 text-xs text-stone-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-stone-400" />
          <span>Al crear un nuevo día, los números «al» de hoy se transferirán automáticamente como los «del» de mañana.</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px] text-stone-600">
          <span>Adultos: {liquidation.tickets.adultos.del} ➔ {liquidation.tickets.adultos.al}</span>
        </div>
      </div>

    </div>
  );
};
