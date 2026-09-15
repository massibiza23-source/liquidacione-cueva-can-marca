import React, { useRef, useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Trash2, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Users,
  UserCheck,
  HeartHandshake,
  Receipt,
  Wallet,
  TrendingUp,
  Filter
} from 'lucide-react';
import { DailyLiquidation } from '../types';
import { 
  formatDateToES, 
  calculateTotals, 
  formatEuro, 
  formatNumber,
  calculateMonthlyTotals, 
  getMonthLabel,
  exportMonthlySummaryToCSV 
} from '../utils/calculator';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  allLiquidations: DailyLiquidation[];
  currentId: string;
  onSelectDay: (id: string) => void;
  onDeleteDay: (id: string) => void;
  onImportBackup: (data: DailyLiquidation[]) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  allLiquidations,
  currentId,
  onSelectDay,
  onDeleteDay,
  onImportBackup,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available unique months (YYYY-MM)
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    allLiquidations.forEach((liq) => {
      if (liq.fecha && liq.fecha.length >= 7) {
        monthsSet.add(liq.fecha.substring(0, 7));
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [allLiquidations]);

  // Determine initial month from current day or latest available
  const initialMonth = useMemo(() => {
    const currentMonthKey = currentId && currentId.length >= 7 ? currentId.substring(0, 7) : '';
    if (currentMonthKey && availableMonths.includes(currentMonthKey)) {
      return currentMonthKey;
    }
    return availableMonths[0] || '';
  }, [currentId, availableMonths]);

  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);
  const [dayPendingDelete, setDayPendingDelete] = useState<DailyLiquidation | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync selectedMonth if currentId changed or availableMonths changed and selectedMonth is not in list
  React.useEffect(() => {
    if (selectedMonth !== 'ALL' && !availableMonths.includes(selectedMonth) && availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  if (!isOpen) return null;

  // Monthly totals calculation
  const monthlyTotals = calculateMonthlyTotals(
    allLiquidations, 
    selectedMonth === 'ALL' ? undefined : selectedMonth
  );

  // Filter days by chosen month
  const filteredDays = (selectedMonth === 'ALL'
    ? [...allLiquidations]
    : allLiquidations.filter((liq) => liq.fecha && liq.fecha.startsWith(selectedMonth))
  ).sort((a, b) => b.fecha.localeCompare(a.fecha));

  const handleExportMonthCSV = () => {
    const csvContent = exportMonthlySummaryToCSV(monthlyTotals, filteredDays);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liquidacion_${selectedMonth || 'total'}_cueva_can_marca.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(allLiquidations, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liquidaciones_cueva_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImportBackup(parsed);
          setFeedback({
            type: 'success',
            message: `¡Se han importado con éxito ${parsed.length} días de liquidaciones!`
          });
          setTimeout(() => setFeedback(null), 5000);
        } else {
          setFeedback({
            type: 'error',
            message: 'El archivo no tiene el formato esperado de lista de liquidaciones.'
          });
        }
      } catch {
        setFeedback({
          type: 'error',
          message: 'Error al leer el archivo JSON seleccionado.'
        });
      }
    };
    reader.readAsText(file);
    // Reset file input so user can re-upload if needed
    if (e.target) e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      
      <div 
        id="modal-history"
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] relative"
      >
        {/* Header */}
        <div className="bg-stone-900 px-5 sm:px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-stone-100">
                Historial y Resumen Mensual
              </h2>
              <p className="text-xs text-stone-400">
                Cálculo total de pax (adultos, niños, inserso), recaudación neta y bruta
              </p>
            </div>
          </div>
          <button
            id="btn-close-history-modal"
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback notification banner */}
        {feedback && (
          <div className={`mx-4 sm:mx-6 mt-3 p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium animate-in fade-in duration-200 shrink-0 ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setFeedback(null)}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-stone-50/50">
          
          {/* SECTION: Monthly Totals Calculation (Cálculo Total del Mes) */}
          <div 
            id="history-monthly-summary-card"
            className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden"
          >
            {/* Summary Card Header with Month Selector & Export Button */}
            <div className="bg-stone-900 px-4 sm:px-5 py-3 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-200">
                    Cálculo Total de Todo el Mes
                  </h3>
                  <p className="text-xs text-stone-300 font-medium">
                    {monthlyTotals.monthLabel} • <span className="font-mono">{monthlyTotals.daysCount}</span> días liquidados
                  </p>
                </div>
              </div>

              {/* Month selector & CSV export */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1.5 bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-700 text-xs">
                  <Filter className="w-3.5 h-3.5 text-stone-400" />
                  <label htmlFor="select-history-month" className="text-stone-400 text-[11px] font-medium sr-only">
                    Filtrar por mes:
                  </label>
                  <select
                    id="select-history-month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent text-stone-100 font-semibold text-xs cursor-pointer focus:outline-none"
                  >
                    {availableMonths.map((m) => (
                      <option key={m} value={m} className="bg-stone-900 text-white">
                        {getMonthLabel(m)}
                      </option>
                    ))}
                    <option value="ALL" className="bg-stone-900 text-white">
                      Todos los meses (Acumulado)
                    </option>
                  </select>
                </div>

                <button
                  id="btn-export-month-csv"
                  type="button"
                  onClick={handleExportMonthCSV}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-800 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 shadow-2xs"
                  title="Descargar este resumen mensual en formato CSV compatible con Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-200" />
                  <span className="hidden sm:inline">Exportar Mes</span>
                  <span className="sm:hidden">CSV</span>
                </button>
              </div>
            </div>

            {/* 5 Main Requested Metrics Grid: Pax Niños, Adultos, Inserso, Total Neto y Bruto */}
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                
                {/* 1. Pax Adultos */}
                <div 
                  id="card-total-pax-adultos"
                  className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-1 text-stone-600 mb-1">
                    <span className="text-xs font-bold tracking-tight">Pax Adultos</span>
                    <Users className="w-4 h-4 text-stone-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-stone-900 tracking-tight">
                    {formatNumber(monthlyTotals.paxAdultos)}
                  </div>
                  <div className="text-[11px] font-medium text-stone-500 mt-1">
                    Subtotal: {formatEuro(monthlyTotals.subtotalAdultos)}
                  </div>
                </div>

                {/* 2. Pax Niños */}
                <div 
                  id="card-total-pax-ninos"
                  className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-1 text-stone-600 mb-1">
                    <span className="text-xs font-bold tracking-tight">Pax Niños</span>
                    <UserCheck className="w-4 h-4 text-stone-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-stone-900 tracking-tight">
                    {formatNumber(monthlyTotals.paxNinos)}
                  </div>
                  <div className="text-[11px] font-medium text-stone-500 mt-1">
                    Subtotal: {formatEuro(monthlyTotals.subtotalNinos)}
                  </div>
                </div>

                {/* 3. Pax Inserso (Imserso) */}
                <div 
                  id="card-total-pax-imserso"
                  className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-1 text-stone-600 mb-1">
                    <span className="text-xs font-bold tracking-tight">Pax Inserso</span>
                    <HeartHandshake className="w-4 h-4 text-stone-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-stone-900 tracking-tight">
                    {formatNumber(monthlyTotals.paxImserso)}
                  </div>
                  <div className="text-[11px] font-medium text-stone-500 mt-1">
                    Subtotal: {formatEuro(monthlyTotals.subtotalImserso)}
                  </div>
                </div>

                {/* 4. Total Bruto */}
                <div 
                  id="card-total-mes-bruto"
                  className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-1 text-stone-600 mb-1">
                    <span className="text-xs font-bold tracking-tight">Total Bruto</span>
                    <Receipt className="w-4 h-4 text-stone-500" />
                  </div>
                  <div className="text-lg sm:text-xl font-black font-mono text-stone-900 tracking-tight">
                    {formatEuro(monthlyTotals.totalBruto)}
                  </div>
                  <div className="text-[11px] font-medium text-stone-500 mt-1 truncate" title="Entradas + Bar + Tienda">
                    Tickets + Bar + Tienda
                  </div>
                </div>

                {/* 5. Total Neto (Highlight) */}
                <div 
                  id="card-total-mes-neto"
                  className="col-span-2 sm:col-span-1 bg-amber-50/70 border-2 border-amber-800/80 rounded-xl p-3 flex flex-col justify-between shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-1 text-amber-900 mb-1">
                    <span className="text-xs font-black tracking-tight uppercase">Total Neto</span>
                    <Wallet className="w-4 h-4 text-amber-800" />
                  </div>
                  <div className="text-lg sm:text-xl font-black font-mono text-amber-950 tracking-tight">
                    {formatEuro(monthlyTotals.totalNeto)}
                  </div>
                  <div className="text-[11px] font-bold text-amber-900 mt-1">
                    Bruto − Tarjetas Visa
                  </div>
                </div>

              </div>

              {/* Supplementary Monthly Metrics Strip */}
              <div className="mt-3.5 pt-3 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-stone-600">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>
                    <strong className="text-stone-900">Total Pax Entradas:</strong>{' '}
                    <span className="font-mono font-bold text-stone-900">{formatNumber(monthlyTotals.totalPaxTickets)}</span> pax
                    {monthlyTotals.paxGrupos > 0 && (
                      <span className="text-stone-500 font-normal"> (inc. {monthlyTotals.paxGrupos} grupos)</span>
                    )}
                  </span>
                  <span className="text-stone-300 hidden sm:inline">•</span>
                  <span>
                    <strong className="text-stone-900">Total Tarjetas (Visa):</strong>{' '}
                    <span className="font-mono font-bold text-stone-800">{formatEuro(monthlyTotals.totalVisa)}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-stone-500 text-[11px]">
                  <span>Bar: <strong className="font-mono text-stone-700">{formatEuro(monthlyTotals.totalBar)}</strong></span>
                  <span>Tienda: <strong className="font-mono text-stone-700">{formatEuro(monthlyTotals.totalTienda)}</strong></span>
                  {monthlyTotals.totalMiradorYoga > 0 && (
                    <span>Mirador: <strong className="font-mono text-stone-700">{formatEuro(monthlyTotals.totalMiradorYoga)}</strong></span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: Days List in Selected Month */}
          <div>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>Liquidaciones Diarias ({filteredDays.length})</span>
              </h3>
              <span className="text-[11px] text-stone-500 font-medium">
                Pulsa en un día para abrir su hoja
              </span>
            </div>

            {filteredDays.length === 0 ? (
              <div className="p-8 text-center bg-white border border-stone-200 rounded-xl text-stone-500 text-xs">
                No hay liquidaciones registradas para el mes seleccionado.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredDays.map((liq) => {
                  const totals = calculateTotals(liq);
                  const isSelected = liq.id === currentId;
                  const isCuadrada = Math.abs(totals.descuadreCaja) < 0.01;

                  return (
                    <div
                      key={liq.id}
                      id={`history-day-${liq.id}`}
                      onClick={() => {
                        onSelectDay(liq.id);
                        onClose();
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-amber-800 bg-amber-50/70 shadow-xs ring-1 ring-amber-800/30'
                          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900 font-mono">
                            {formatDateToES(liq.fecha)}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-800 text-white">
                              Día actual
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono">
                          <span>Adultos: {totals.paxAdultos} pax ({liq.tickets.adultos.del}➔{liq.tickets.adultos.al})</span>
                          <span>•</span>
                          <span>Niños: {totals.paxNinos} pax</span>
                          <span>•</span>
                          <span>Inserso: {totals.paxImserso} pax</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <div className="text-xs font-bold font-mono text-stone-900">
                            {totals.totalPaxTickets} pax | Bruto: {formatEuro(totals.totalBruto)}
                          </div>
                          <div className="text-[11px] font-mono text-stone-600 mt-0.5 flex items-center justify-end gap-2">
                            <span>Neto: <strong className="text-stone-900">{formatEuro(totals.totalNeto)}</strong></span>
                            <span>•</span>
                            {isCuadrada ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Cuadrada
                              </span>
                            ) : (
                              <span className="text-amber-700 font-semibold flex items-center gap-0.5">
                                <AlertCircle className="w-3 h-3" /> {formatEuro(totals.descuadreCaja)}
                              </span>
                            )}
                          </div>
                        </div>

                        {allLiquidations.length > 1 && (
                          <button
                            id={`btn-delete-day-${liq.id}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDayPendingDelete(liq);
                            }}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1 cursor-pointer"
                            title="Eliminar este día del historial"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer Backup Controls */}
        <div className="px-5 sm:px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              id="btn-export-backup-json"
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-700 font-semibold hover:bg-stone-100 transition-colors"
              title="Descargar copia de seguridad con todos los días en archivo JSON"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Copia Seguridad (JSON)</span>
            </button>

            <button
              id="btn-import-backup-json"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-700 font-semibold hover:bg-stone-100 transition-colors"
              title="Restaurar copia de seguridad previamente descargada"
            >
              <Upload className="w-3.5 h-3.5 text-stone-500" />
              <span>Restaurar Copia</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>

          <button
            id="btn-close-history-bottom"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

        {/* Modal de confirmación para eliminar día (100% compatible con iframe y móviles) */}
        {dayPendingDelete && (
          <div 
            id="dialog-confirm-delete-day"
            className="fixed inset-0 z-70 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={(e) => {
              e.stopPropagation();
              setDayPendingDelete(null);
            }}
          >
            <div 
              className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-stone-900">
                    ¿Eliminar liquidación diaria?
                  </h3>
                  <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                    Estás a punto de eliminar la liquidación del día{' '}
                    <strong className="text-stone-900 font-semibold">
                      {formatDateToES(dayPendingDelete.fecha)}
                    </strong>.
                  </p>
                  <div className="mt-2.5 p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 font-mono space-y-0.5">
                    <div>Pax totales: <strong>{calculateTotals(dayPendingDelete).totalPaxTickets} pax</strong></div>
                    <div>Recaudación bruta: <strong>{formatEuro(calculateTotals(dayPendingDelete).totalBruto)}</strong></div>
                  </div>
                  <p className="text-[11px] text-rose-600 font-medium mt-2">
                    ⚠️ Esta acción borrará el registro de este día del historial.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
                <button
                  id="btn-cancel-delete"
                  type="button"
                  onClick={() => setDayPendingDelete(null)}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-confirm-delete"
                  type="button"
                  onClick={() => {
                    const dateFormatted = formatDateToES(dayPendingDelete.fecha);
                    const idToDelete = dayPendingDelete.id;
                    onDeleteDay(idToDelete);
                    setDayPendingDelete(null);
                    setFeedback({
                      type: 'success',
                      message: `Liquidación del día ${dateFormatted} eliminada correctamente.`
                    });
                    setTimeout(() => setFeedback(null), 4000);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sí, eliminar día</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
