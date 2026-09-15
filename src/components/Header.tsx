import React from 'react';
import { 
  Calendar, 
  PlusCircle, 
  History, 
  Printer, 
  Download, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Smartphone
} from 'lucide-react';
import { DailyLiquidation, TotalesCalculados } from '../types';
import { formatDateToES, formatEuro } from '../utils/calculator';

interface HeaderProps {
  currentLiquidation: DailyLiquidation;
  allLiquidations: DailyLiquidation[];
  totals: TotalesCalculados;
  onOpenNewDayModal: () => void;
  onOpenHistoryModal: () => void;
  onPrint: () => void;
  onExportCSV: () => void;
  onSelectDate: (id: string) => void;
  onOpenInstallModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLiquidation,
  allLiquidations,
  totals,
  onOpenNewDayModal,
  onOpenHistoryModal,
  onPrint,
  onExportCSV,
  onSelectDate,
  onOpenInstallModal,
}) => {
  // Sort dates
  const sortedDays = [...allLiquidations].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const currentIndex = sortedDays.findIndex(d => d.id === currentLiquidation.id);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < sortedDays.length - 1;

  const handlePrevDay = () => {
    if (hasPrev) {
      onSelectDate(sortedDays[currentIndex - 1].id);
    }
  };

  const handleNextDay = () => {
    if (hasNext) {
      onSelectDate(sortedDays[currentIndex + 1].id);
    }
  };

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Brand & Day Identity */}
          <div className="flex items-center gap-3">
            <button
              id="btn-header-app-icon"
              type="button"
              onClick={onOpenInstallModal}
              className="group relative w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-amber-900/30 flex items-center justify-center bg-stone-900 hover:ring-2 hover:ring-amber-500 transition-all cursor-pointer shrink-0"
              title="Ver icono de la aplicación / Instalar en móvil"
            >
              <img 
                src="/pwa-192x192.png" 
                alt="Icono Can Marçà" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-stone-900">
                  Liquidación Cueva de Can Marçà
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <CheckCircle2 className="w-3 h-3" />
                  Auto-guardado
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Control de tickets numerados, cobros Z, guías y arqueo de caja
              </p>
            </div>
          </div>

          {/* Date Selector & Navigation Controls */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Day Switcher */}
            <div className="inline-flex items-center bg-stone-100 rounded-lg p-1 border border-stone-200">
              <button
                id="btn-prev-day"
                type="button"
                onClick={handlePrevDay}
                disabled={!hasPrev}
                title="Día anterior"
                className="p-1.5 rounded-md text-stone-600 hover:text-stone-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-stone-800">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>{formatDateToES(currentLiquidation.fecha)}</span>
              </div>

              <button
                id="btn-next-day"
                type="button"
                onClick={handleNextDay}
                disabled={!hasNext}
                title="Día siguiente"
                className="p-1.5 rounded-md text-stone-600 hover:text-stone-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics in Header */}
            <div className="hidden sm:flex items-center gap-3 px-3 py-1 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs">
              <div>
                <span className="text-amber-800/70 font-medium">Pax: </span>
                <span className="font-bold text-amber-950">{totals.totalPaxTickets}</span>
              </div>
              <div className="w-px h-3 bg-amber-200" />
              <div>
                <span className="text-amber-800/70 font-medium">Bruto: </span>
                <span className="font-bold text-amber-950">{formatEuro(totals.totalBruto)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
              <button
                id="btn-open-new-day"
                type="button"
                onClick={onOpenNewDayModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-800 hover:bg-amber-900 text-white shadow-xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Nuevo Día</span>
              </button>

              <button
                id="btn-open-history"
                type="button"
                onClick={onOpenHistoryModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors"
                title="Ver historial de días"
              >
                <History className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden md:inline">Historial</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-100 text-stone-600 font-bold">
                  {allLiquidations.length}
                </span>
              </button>

              <button
                id="btn-print"
                type="button"
                onClick={onPrint}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors"
                title="Imprimir liquidación"
              >
                <Printer className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden md:inline">Imprimir</span>
              </button>

              <button
                id="btn-export-csv"
                type="button"
                onClick={onExportCSV}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors"
                title="Descargar archivo CSV compatible con la plantilla"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden md:inline">CSV</span>
              </button>

              {onOpenInstallModal && (
                <button
                  id="btn-header-install"
                  type="button"
                  onClick={onOpenInstallModal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 transition-colors shadow-2xs"
                  title="Instalar en móvil o descargar icono PNG"
                >
                  <Smartphone className="w-3.5 h-3.5 text-amber-800" />
                  <span className="hidden sm:inline">Instalar / Icono</span>
                  <span className="sm:hidden">App</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
