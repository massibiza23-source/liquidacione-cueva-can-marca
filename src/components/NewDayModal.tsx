import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  Ticket, 
  Store, 
  Coffee, 
  Calendar, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { DailyLiquidation } from '../types';
import { formatDateToES } from '../utils/calculator';

interface NewDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  previousLiquidation: DailyLiquidation;
  allLiquidations: DailyLiquidation[];
  onCreateNewDay: (newDate: string, sourceDayId: string) => void;
}

export const NewDayModal: React.FC<NewDayModalProps> = ({
  isOpen,
  onClose,
  previousLiquidation,
  allLiquidations,
  onCreateNewDay,
}) => {
  if (!isOpen) return null;

  // Compute next day date string (defaults to +1 day from previous)
  const calculateDefaultNextDate = (): string => {
    try {
      const d = new Date(previousLiquidation.fecha);
      if (!isNaN(d.getTime())) {
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
      }
    } catch {
      // fallback
    }
    return new Date().toISOString().split('T')[0];
  };

  const [selectedSourceId, setSelectedSourceId] = useState<string>(previousLiquidation.id);
  const [targetDate, setTargetDate] = useState<string>(calculateDefaultNextDate());

  const sourceDay = allLiquidations.find(d => d.id === selectedSourceId) || previousLiquidation;

  // Check if targetDate already exists in allLiquidations
  const isDateAlreadyExisting = allLiquidations.some(d => d.fecha === targetDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate) return;
    onCreateNewDay(targetDate, sourceDay.id);
    onClose();
  };

  const prevBarZ = parseInt(String(sourceDay.bar.zNumero), 10);
  const nextBarZ = !isNaN(prevBarZ) ? prevBarZ + 1 : sourceDay.bar.zNumero;

  const prevTiendaZ = parseInt(String(sourceDay.tienda.zNumero), 10);
  const nextTiendaZ = !isNaN(prevTiendaZ) ? prevTiendaZ + 1 : sourceDay.tienda.zNumero;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="modal-new-day"
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="bg-stone-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100">
                Nuevo Día de Liquidación
              </h2>
              <p className="text-xs text-stone-400">
                Traspaso automático de numeración de tickets («al» ➔ «del»)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Information Notice */}
          <div className="p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <p className="font-semibold text-amber-950">
                Regla de continuidad de taquilla:
              </p>
              <p>
                El número final (<strong>«al»</strong>) del día seleccionado se asignará automáticamente como número inicial (<strong>«del»</strong>) del nuevo día. Las ventas y el arqueo comenzarán en 0.
              </p>
            </div>
          </div>

          {/* Source Day Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Día base para arrastre de tickets:
            </label>
            <select
              value={selectedSourceId}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-stone-50 font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-800"
            >
              {allLiquidations.map(liq => (
                <option key={liq.id} value={liq.id}>
                  {formatDateToES(liq.fecha)} — Últimos tickets: Adultos ({liq.tickets.adultos.al}), Niños ({liq.tickets.ninos.al}), Imserso ({liq.tickets.imserso.al})
                </option>
              ))}
            </select>
          </div>

          {/* New Date Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Fecha del nuevo día:
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-stone-300 rounded-lg font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-800"
              />
              <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>
            {isDateAlreadyExisting && (
              <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Ya existe una liquidación guardada para esta fecha. Si continúas, se actualizará.
              </p>
            )}
          </div>

          {/* Traspaso Preview Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50/60">
            <div className="px-3 py-2 bg-stone-100 border-b border-stone-200 text-xs font-bold text-stone-700">
              Vista previa del traspaso de numeración:
            </div>
            
            <div className="p-3 space-y-2.5 text-xs">
              
              {/* Adultos */}
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-stone-200 shadow-2xs">
                <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  Adultos
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-mono">
                    Cierre ayer («al»): <strong className="text-stone-800">{sourceDay.tickets.adultos.al}</strong>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
                  <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md font-mono">
                    Inicio hoy («del»): {sourceDay.tickets.adultos.al}
                  </span>
                </div>
              </div>

              {/* Niños */}
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-stone-200 shadow-2xs">
                <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Niños
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-mono">
                    Cierre ayer («al»): <strong className="text-stone-800">{sourceDay.tickets.ninos.al}</strong>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-700" />
                  <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-md font-mono">
                    Inicio hoy («del»): {sourceDay.tickets.ninos.al}
                  </span>
                </div>
              </div>

              {/* Imserso */}
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-stone-200 shadow-2xs">
                <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  Imserso
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-mono">
                    Cierre ayer («al»): <strong className="text-stone-800">{sourceDay.tickets.imserso.al}</strong>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-md font-mono">
                    Inicio hoy («del»): {sourceDay.tickets.imserso.al}
                  </span>
                </div>
              </div>

              {/* Bar & Tienda Z numbers */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-white p-2.5 rounded-lg border border-stone-200 text-[11px] flex items-center justify-between">
                  <span className="text-stone-600 flex items-center gap-1 font-medium">
                    <Coffee className="w-3 h-3 text-stone-400" />
                    Bar Z
                  </span>
                  <span className="font-mono font-bold text-stone-800">
                    Nº {nextBarZ}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-stone-200 text-[11px] flex items-center justify-between">
                  <span className="text-stone-600 flex items-center gap-1 font-medium">
                    <Store className="w-3 h-3 text-stone-400" />
                    Tienda Z
                  </span>
                  <span className="font-mono font-bold text-stone-800">
                    Nº {nextTiendaZ}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-confirm-new-day"
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Abrir Nuevo Día con Traspaso</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
