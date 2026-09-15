import React, { useState, useEffect } from 'react';
import { DailyLiquidation } from './types';
import { 
  loadStoredLiquidations, 
  saveLiquidationsToStorage, 
  loadSelectedId, 
  saveSelectedId,
  createNewDayFromPrevious
} from './utils/initialData';
import { calculateTotals, exportToCSV, formatDateToES } from './utils/calculator';
import { Header } from './components/Header';
import { CompactLiquidationSheet } from './components/CompactLiquidationSheet';
import { NewDayModal } from './components/NewDayModal';
import { HistoryModal } from './components/HistoryModal';
import { PrintableReport } from './components/PrintableReport';
import { InstallModal } from './components/InstallModal';
import { Sparkles, Smartphone } from 'lucide-react';

export default function App() {
  const [liquidations, setLiquidations] = useState<DailyLiquidation[]>(() => loadStoredLiquidations());
  const [currentId, setCurrentId] = useState<string>(() => loadSelectedId());

  // Modals state
  const [isNewDayOpen, setIsNewDayOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  // Success toast for ticket handover
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    saveLiquidationsToStorage(liquidations);
  }, [liquidations]);

  useEffect(() => {
    saveSelectedId(currentId);
  }, [currentId]);

  // Current liquidation object
  const currentLiquidation = 
    liquidations.find((l) => l.id === currentId) || liquidations[0];

  // Calculated financial totals
  const totals = calculateTotals(currentLiquidation);

  // Update current liquidation
  const handleUpdateCurrent = (updated: DailyLiquidation) => {
    setLiquidations((prev) =>
      prev.map((l) => (l.id === updated.id ? { ...updated, actualizadoEn: new Date().toISOString() } : l))
    );
  };

  /**
   * Traspaso automático de numeración de tickets al crear nuevo día
   */
  const handleCreateNewDay = (newDate: string, sourceDayId: string) => {
    const sourceDay = liquidations.find((l) => l.id === sourceDayId) || currentLiquidation;
    const newDay = createNewDayFromPrevious(sourceDay, newDate);

    setLiquidations((prev) => {
      const existingIdx = prev.findIndex((l) => l.id === newDay.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newDay;
        return copy;
      }
      return [...prev, newDay];
    });

    setCurrentId(newDay.id);

    setToastMessage(
      `¡Día ${formatDateToES(newDate)} creado! Número final traspasado: Adultos (${newDay.tickets.adultos.del}), Niños (${newDay.tickets.ninos.del}), Imserso (${newDay.tickets.imserso.del}).`
    );

    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  const handleSelectDay = (id: string) => {
    setCurrentId(id);
  };

  const handleDeleteDay = (id: string) => {
    if (liquidations.length <= 1) {
      setToastMessage('No se puede eliminar el único día registrado en el sistema.');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    const dayToDelete = liquidations.find((l) => l.id === id);
    const remaining = liquidations.filter((l) => l.id !== id);
    setLiquidations(remaining);
    if (currentId === id) {
      setCurrentId(remaining[0].id);
    }
    if (dayToDelete) {
      setToastMessage(`Liquidación del ${formatDateToES(dayToDelete.fecha)} eliminada.`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleExportCSV = () => {
    const csvContent = exportToCSV(currentLiquidation, totals);
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `liquidaciones_cueva_${currentLiquidation.fecha}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-amber-200">
      
      {/* App Header */}
      <Header
        currentLiquidation={currentLiquidation}
        allLiquidations={liquidations}
        totals={totals}
        onOpenNewDayModal={() => setIsNewDayOpen(true)}
        onOpenHistoryModal={() => setIsHistoryOpen(true)}
        onPrint={() => setIsPrintOpen(true)}
        onExportCSV={handleExportCSV}
        onSelectDate={handleSelectDay}
        onOpenInstallModal={() => setIsInstallOpen(true)}
      />

      {/* Dynamic Toast Feedback for ticket transfer */}
      {toastMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 w-full animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 bg-amber-900 text-amber-50 rounded-lg shadow-md border border-amber-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="px-2 py-0.5 rounded hover:bg-amber-800 text-amber-200 text-xs font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
        
        {/* Status Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-stone-800">
              {formatDateToES(currentLiquidation.fecha)}
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500">
              Continuidad de numeración taquilla activa
            </span>
          </div>
          <div className="text-xs font-mono text-stone-500">
            Total Pax: <span className="font-bold text-stone-900">{totals.totalPaxTickets}</span>
          </div>
        </div>

        {/* RESPONSIVE & FLEXIBLE CALCULATOR */}
        <CompactLiquidationSheet
          liquidation={currentLiquidation}
          allLiquidations={liquidations}
          totals={totals}
          onChange={handleUpdateCurrent}
          onOpenNewDayModal={() => setIsNewDayOpen(true)}
          onOpenHistoryModal={() => setIsHistoryOpen(true)}
          onPrint={() => setIsPrintOpen(true)}
          onExportCSV={handleExportCSV}
          onSelectDate={handleSelectDay}
        />

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-3 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span>Liquidación Cueva de Can Marçà • Formato compacto de taquilla</span>
            <span className="text-stone-300 hidden sm:inline">•</span>
            <button
              id="btn-footer-install"
              type="button"
              onClick={() => setIsInstallOpen(true)}
              className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 underline underline-offset-2 transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-700" />
              <span>Instalar en móvil / Descargar icono PNG</span>
            </button>
          </div>
          <div className="font-mono text-stone-400 text-[11px]">
            Actualizado: {new Date(currentLiquidation.actualizadoEn).toLocaleTimeString('es-ES')}
          </div>
        </div>
      </footer>

      {/* New Day Modal with ticket handover preview */}
      <NewDayModal
        isOpen={isNewDayOpen}
        onClose={() => setIsNewDayOpen(false)}
        previousLiquidation={currentLiquidation}
        allLiquidations={liquidations}
        onCreateNewDay={handleCreateNewDay}
      />

      {/* History Drawer/Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        allLiquidations={liquidations}
        currentId={currentId}
        onSelectDay={handleSelectDay}
        onDeleteDay={handleDeleteDay}
        onImportBackup={(imported) => {
          setLiquidations(imported);
          setCurrentId(imported[0].id);
        }}
      />

      {/* Printable Report View */}
      <PrintableReport
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        liquidation={currentLiquidation}
        totals={totals}
      />

      {/* PWA Mobile Install & Icon Download Modal */}
      <InstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />

    </div>
  );
}
