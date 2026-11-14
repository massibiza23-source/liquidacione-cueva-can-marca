import React, { useState, useEffect } from 'react';
import { 
  DailyLiquidation, 
  TotalesCalculados 
} from '../types';
import { 
  formatEuro, 
  formatDateToES 
} from '../utils/calculator';
import { 
  Plus, 
  Trash2, 
  Settings2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Printer,
  Download,
  History,
  Smartphone,
  Table2,
  RotateCw,
  Eye,
  EyeOff,
  Coffee,
  ShoppingBag,
  Compass,
  CreditCard,
  Users,
  Bus,
  ArrowRight
} from 'lucide-react';

interface CompactLiquidationSheetProps {
  liquidation: DailyLiquidation;
  allLiquidations: DailyLiquidation[];
  totals: TotalesCalculados;
  onChange: (updated: DailyLiquidation) => void;
  onOpenNewDayModal: () => void;
  onOpenHistoryModal: () => void;
  onPrint: () => void;
  onExportCSV: () => void;
  onSelectDate: (id: string) => void;
}

export const CompactLiquidationSheet: React.FC<CompactLiquidationSheetProps> = ({
  liquidation,
  allLiquidations,
  totals,
  onChange,
  onOpenNewDayModal,
  onOpenHistoryModal,
  onPrint,
  onExportCSV,
  onSelectDate,
}) => {
  const [showPriceEdit, setShowPriceEdit] = useState(false);
  const [showGuideCommissions, setShowGuideCommissions] = useState(false);
  const [isActionBarCollapsed, setIsActionBarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cueva_actionbar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleActionBar = () => {
    setIsActionBarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cueva_actionbar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Track tablet/mobile screen orientation (portrait vs landscape)
  const [isLandscape, setIsLandscape] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= window.innerHeight : true
  );
  // View preference: 'auto' follows tablet rotation, or manual 'mobile' / 'sheet'
  const [layoutMode, setLayoutMode] = useState<'auto' | 'mobile' | 'sheet'>(() => {
    try {
      const saved = localStorage.getItem('cueva_layout_mode');
      if (saved === 'auto' || saved === 'mobile' || saved === 'sheet') return saved;
    } catch {
      // ignore
    }
    return 'auto';
  });
  const [rotationNotice, setRotationNotice] = useState<string | null>(null);

  useEffect(() => {
    const updateOrientation = () => {
      const mq = window.matchMedia?.('(orientation: landscape)');
      setIsLandscape(mq ? mq.matches : window.innerWidth >= window.innerHeight);
    };
    updateOrientation();
    window.addEventListener('orientationchange', updateOrientation);
    window.addEventListener('resize', updateOrientation);
    return () => {
      window.removeEventListener('orientationchange', updateOrientation);
      window.removeEventListener('resize', updateOrientation);
    };
  }, []);

  const handleSelectLayoutMode = (mode: 'auto' | 'mobile' | 'sheet') => {
    setLayoutMode(mode);
    try {
      localStorage.setItem('cueva_layout_mode', mode);
    } catch {
      // ignore
    }
  };

  const activeLayout: 'mobile' | 'sheet' =
    layoutMode === 'auto' ? (isLandscape ? 'sheet' : 'mobile') : layoutMode;

  const handleRotateScreen = async () => {
    const targetOrientation = isLandscape ? 'portrait' : 'landscape';
    let lockedNatively = false;

    try {
      const isStandalone =
        window.matchMedia?.('(display-mode: standalone)').matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true;

      if (!isStandalone && !document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }

      const orientationApi = screen.orientation as ScreenOrientation & {
        lock?: (orientation: 'portrait' | 'landscape') => Promise<void>;
      };

      if (orientationApi && typeof orientationApi.lock === 'function') {
        await orientationApi.lock(targetOrientation);
        lockedNatively = true;
        setIsLandscape(targetOrientation === 'landscape');
      }
    } catch {
      lockedNatively = false;
    }

    if (!lockedNatively) {
      const nextLayout = activeLayout === 'sheet' ? 'mobile' : 'sheet';
      handleSelectLayoutMode(nextLayout);
      setRotationNotice(
        `Vista cambiada a ${nextLayout === 'sheet' ? 'Horizontal (Tabla)' : 'Vertical (Móvil / Tablet)'}. También puedes girar físicamente la tablet en cualquier dirección.`
      );
      setTimeout(() => setRotationNotice(null), 4500);
    }
  };

  // Sorting for date prev / next
  const sortedDays = [...allLiquidations].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const currentIndex = sortedDays.findIndex((d) => d.id === liquidation.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < sortedDays.length - 1;

  // Handlers for Tickets (del / al / precio)
  const handleTicketChange = (
    category: 'adultos' | 'ninos' | 'imserso',
    field: 'del' | 'al' | 'precio',
    value: number
  ) => {
    const updated = { ...liquidation };
    updated.tickets[category][field] = value;
    onChange(updated);
  };

  // Grupos
  const handleGruposChange = (field: 'pax' | 'precio' | 'tipo', value: string | number) => {
    const updated = { ...liquidation };
    if (field === 'pax') {
      updated.tickets.grupos.pax = Math.max(0, parseInt(String(value), 10) || 0);
    } else if (field === 'precio') {
      updated.tickets.grupos.precio = parseFloat(String(value)) || 0;
    } else if (field === 'tipo') {
      updated.tickets.grupos.tipo = String(value);
    }
    onChange(updated);
  };

  // Bar, Tienda, Mirador
  const handleBarChange = (field: 'zNumero' | 'totalZ', val: string | number) => {
    const updated = { ...liquidation };
    if (field === 'totalZ') updated.bar.totalZ = parseFloat(String(val)) || 0;
    else updated.bar.zNumero = String(val);
    onChange(updated);
  };

  const handleTiendaChange = (field: 'zNumero' | 'totalZ', val: string | number) => {
    const updated = { ...liquidation };
    if (field === 'totalZ') updated.tienda.totalZ = parseFloat(String(val)) || 0;
    else updated.tienda.zNumero = String(val);
    onChange(updated);
  };

  const handleMiradorChange = (field: 'total' | 'concepto', val: string | number) => {
    const updated = { ...liquidation };
    if (field === 'total') updated.miradorYoga.total = parseFloat(String(val)) || 0;
    else updated.miradorYoga.concepto = String(val);
    onChange(updated);
  };

  // Guías
  const handleGuiaChange = (
    guiaKey: 'guia1' | 'guia2' | 'guia3' | 'guia4',
    field: 'nombre' | 'importe',
    val: string | number
  ) => {
    const updated = { ...liquidation };
    if (field === 'importe') {
      updated.guias[guiaKey].importe = parseFloat(String(val)) || 0;
    } else {
      updated.guias[guiaKey].nombre = String(val);
    }
    onChange(updated);
  };

  const handleComisionChange = (
    field: 'comisionBar' | 'comisionTienda' | 'comisionTickets',
    val: string | number
  ) => {
    const updated = { ...liquidation };
    updated.guias[field] = parseFloat(String(val)) || 0;
    onChange(updated);
  };

  // Visa
  const handleVisaChange = (field: 'bar' | 'tienda' | 'tickets', val: string | number) => {
    const updated = { ...liquidation };
    updated.cobroVisa[field] = parseFloat(String(val)) || 0;
    onChange(updated);
  };

  // Otros ingresos
  const addOtroIngreso = () => {
    const updated = { ...liquidation };
    updated.otrosIngresos = [
      ...(updated.otrosIngresos || []),
      { id: `otro_${Date.now()}`, concepto: '', importe: 0 },
    ];
    onChange(updated);
  };

  const updateOtroIngreso = (id: string, field: 'concepto' | 'importe', val: string | number) => {
    const updated = { ...liquidation };
    updated.otrosIngresos = (updated.otrosIngresos || []).map((o) =>
      o.id === id ? { ...o, [field]: field === 'importe' ? parseFloat(String(val)) || 0 : val } : o
    );
    onChange(updated);
  };

  const handleEmptyOtroIngresoChange = (field: 'concepto' | 'importe', val: string | number) => {
    const updated = { ...liquidation };
    updated.otrosIngresos = [
      {
        id: `otro_${Date.now()}`,
        concepto: field === 'concepto' ? String(val) : '',
        importe: field === 'importe' ? parseFloat(String(val)) || 0 : 0,
      },
    ];
    onChange(updated);
  };

  const removeOtroIngreso = (id: string) => {
    const updated = { ...liquidation };
    updated.otrosIngresos = (updated.otrosIngresos || []).filter((o) => o.id !== id);
    onChange(updated);
  };

  // Otros gastos (debajo de las Visas)
  const addOtroGasto = () => {
    const updated = { ...liquidation };
    updated.otrosGastos = [
      ...(updated.otrosGastos || []),
      { id: `gasto_${Date.now()}`, concepto: '', importe: 0 },
    ];
    onChange(updated);
  };

  const updateOtroGasto = (id: string, field: 'concepto' | 'importe', val: string | number) => {
    const updated = { ...liquidation };
    updated.otrosGastos = (updated.otrosGastos || []).map((g) =>
      g.id === id ? { ...g, [field]: field === 'importe' ? parseFloat(String(val)) || 0 : val } : g
    );
    onChange(updated);
  };

  const handleEmptyOtroGastoChange = (field: 'concepto' | 'importe', val: string | number) => {
    const updated = { ...liquidation };
    updated.otrosGastos = [
      {
        id: `gasto_${Date.now()}`,
        concepto: field === 'concepto' ? String(val) : '',
        importe: field === 'importe' ? parseFloat(String(val)) || 0 : 0,
      },
    ];
    onChange(updated);
  };

  const removeOtroGasto = (id: string) => {
    const updated = { ...liquidation };
    updated.otrosGastos = (updated.otrosGastos || []).filter((g) => g.id !== id);
    onChange(updated);
  };

  // Desglose Pax
  const handlePaxOnline = (val: string) => {
    const updated = { ...liquidation };
    updated.paxBreakdown.onLine = Math.max(0, parseInt(val, 10) || 0);
    onChange(updated);
  };

  const handlePaxParticulares = (val: string) => {
    const updated = { ...liquidation };
    updated.paxBreakdown.particulares = Math.max(0, parseInt(val, 10) || 0);
    onChange(updated);
  };

  const handleBusChange = (id: string, field: 'nombre' | 'pax', val: string | number) => {
    const updated = { ...liquidation };
    updated.paxBreakdown.buses = updated.paxBreakdown.buses.map((b) =>
      b.id === id
        ? { ...b, [field]: field === 'pax' ? Math.max(0, parseInt(String(val), 10) || 0) : String(val) }
        : b
    );
    onChange(updated);
  };

  const addBus = () => {
    const updated = { ...liquidation };
    const num = (updated.paxBreakdown.buses || []).length + 1;
    updated.paxBreakdown.buses = [
      ...(updated.paxBreakdown.buses || []),
      { id: `bus_${Date.now()}`, nombre: `BUS ${num}`, pax: 0 },
    ];
    onChange(updated);
  };

  const removeBus = (id: string) => {
    const updated = { ...liquidation };
    updated.paxBreakdown.buses = updated.paxBreakdown.buses.filter((b) => b.id !== id);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Top compact action bar: Date Navigation & Quick Actions */}
      {isActionBarCollapsed ? (
        <div className="flex justify-end">
          <button
            id="btn-toggle-actionbar"
            type="button"
            onClick={toggleActionBar}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 shadow-2xs transition-all cursor-pointer"
            title="Mostrar barra de herramientas y fecha"
          >
            <Eye className="w-3.5 h-3.5 text-amber-800" />
            <span>Mostrar controles</span>
          </button>
        </div>
      ) : (
      <div className="bg-white border border-stone-300 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        
        {/* Date Selector & Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-100 rounded-lg border border-stone-300 p-0.5">
            <button
              onClick={() => hasPrev && onSelectDate(sortedDays[currentIndex - 1].id)}
              disabled={!hasPrev}
              title="Día anterior"
              className="p-1.5 rounded hover:bg-stone-200 disabled:opacity-30 disabled:hover:bg-transparent text-stone-700 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-2.5 py-1 text-xs font-bold text-stone-800 flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span>{formatDateToES(liquidation.fecha)}</span>
            </div>
            <button
              onClick={() => hasNext && onSelectDate(sortedDays[currentIndex + 1].id)}
              disabled={!hasNext}
              title="Día siguiente"
              className="p-1.5 rounded hover:bg-stone-200 disabled:opacity-30 disabled:hover:bg-transparent text-stone-700 active:scale-95 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <select
            value={liquidation.id}
            onChange={(e) => onSelectDate(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 font-semibold text-stone-700 focus:outline-hidden focus:ring-1 focus:ring-amber-800"
          >
            {sortedDays.map((d) => (
              <option key={d.id} value={d.id}>
                {formatDateToES(d.fecha)} {d.id === liquidation.id ? '(Activo)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Layout Switcher (Mobile/Tablet vs Sheet) & Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          
          {/* Responsive Layout & Tablet Rotation Toggle */}
          <div className="inline-flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-300 text-xs font-semibold">
            <button
              id="btn-layout-auto"
              type="button"
              onClick={() => handleSelectLayoutMode('auto')}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md transition-all ${
                layoutMode === 'auto'
                  ? 'bg-amber-900 text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Cambia automáticamente entre Vertical y Tabla al rotar la tablet"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Auto</span>
            </button>
            <button
              id="btn-layout-mobile"
              type="button"
              onClick={() => handleSelectLayoutMode('mobile')}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md transition-all ${
                layoutMode === 'mobile'
                  ? 'bg-amber-900 text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Vista táctil vertical adaptada a móvil y tablet"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vertical</span>
            </button>
            <button
              id="btn-layout-sheet"
              type="button"
              onClick={() => handleSelectLayoutMode('sheet')}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md transition-all ${
                layoutMode === 'sheet'
                  ? 'bg-amber-900 text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Vista horizontal idéntica a la hoja de liquidación"
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>Hoja / Tabla</span>
            </button>
          </div>

          {/* Tablet Screen Rotation Button */}
          <button
            id="btn-rotate-tablet-screen"
            type="button"
            onClick={handleRotateScreen}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-900 text-amber-300 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95"
            title="Rotar orientación de pantalla para tablet (Horizontal / Vertical)"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Rotar Tablet</span>
          </button>

          {/* Quick Primary Button: Nuevo Día */}
          <button
            type="button"
            onClick={onOpenNewDayModal}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Nuevo Día</span>
          </button>

          {/* Secondary Buttons */}
          <button
            type="button"
            onClick={() => setShowPriceEdit(!showPriceEdit)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showPriceEdit
                ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold'
                : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tarifas</span>
          </button>

          <button
            type="button"
            onClick={onOpenHistoryModal}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50"
            title="Historial de liquidaciones"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Historial</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50"
            title="Imprimir informe oficial"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50"
            title="Descargar Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-toggle-actionbar"
            type="button"
            onClick={toggleActionBar}
            className="inline-flex items-center gap-1 px-2 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
            title="Ocultar esta barra de controles para dar más espacio a la calculadora"
          >
            <EyeOff className="w-3.5 h-3.5 text-stone-600" />
          </button>
        </div>

      </div>
      )}

      {/* Tablet rotation notice banner */}
      {rotationNotice && (
        <div className="bg-stone-900 text-amber-100 border border-stone-700 rounded-xl px-3.5 py-2 text-xs flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <RotateCw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{rotationNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setRotationNotice(null)}
            className="text-amber-300 hover:text-white font-semibold shrink-0"
          >
            OK
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: MOBILE & TABLET FLEXIBLE TOUCH VIEW (No sideways scroll, big inputs) */}
      {/* ========================================================================= */}
      {activeLayout === 'mobile' && (
        <div className="space-y-4">
          
          {/* Quick Summary Pill for Mobile */}
          <div className="bg-stone-900 text-white rounded-xl p-3.5 shadow-md grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-stone-800/80 p-2 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Pax</span>
              <span className="text-lg font-mono font-black text-amber-400">{totals.totalPaxTickets} pax</span>
            </div>
            <div className="bg-stone-800/80 p-2 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Bruto</span>
              <span className="text-lg font-mono font-black text-white">{formatEuro(totals.totalBruto)}</span>
            </div>
            <div className="bg-stone-800/80 p-2 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Tarjetas (Visa)</span>
              <span className="text-lg font-mono font-black text-blue-300">{formatEuro(totals.totalVisa)}</span>
            </div>
            <div className="bg-amber-950/80 border border-amber-500/50 p-2 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">A Rendir (Efectivo)</span>
              <span className="text-lg font-mono font-black text-amber-300">{formatEuro(totals.efectivoTeorico)}</span>
            </div>
          </div>

          {/* 1. Tickets Taquilla Card */}
          <div className="bg-white rounded-xl border border-stone-300 p-3.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-800" />
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                  Tickets de Taquilla
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                Subtotal: {formatEuro(totals.totalTicketsEuros)} ({totals.totalPaxTickets} pax)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Adultos */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm">Adultos</span>
                  <span className="text-xs font-mono font-semibold text-stone-500">
                    {formatEuro(liquidation.tickets.adultos.precio)} / pax
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Del (Inicio)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={liquidation.tickets.adultos.del}
                      onChange={(e) => handleTicketChange('adultos', 'del', parseInt(e.target.value, 10) || 0)}
                      className="w-full text-center font-mono font-bold text-base h-10 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Al (Cierre)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={liquidation.tickets.adultos.al}
                      onChange={(e) => handleTicketChange('adultos', 'al', parseInt(e.target.value, 10) || 0)}
                      className="w-full text-center font-mono font-bold text-base h-10 bg-amber-50 border border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-800 focus:outline-hidden text-amber-950"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 text-xs border-t border-stone-200">
                  <span className="text-stone-600">Total Pax: <strong className="text-stone-900 font-mono">{totals.paxAdultos}</strong></span>
                  <span className="font-mono font-bold text-stone-900">{formatEuro(totals.subtotalAdultos)}</span>
                </div>
              </div>

              {/* Niños */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm">Niños</span>
                  <span className="text-xs font-mono font-semibold text-stone-500">
                    {formatEuro(liquidation.tickets.ninos.precio)} / pax
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Del (Inicio)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={liquidation.tickets.ninos.del}
                      onChange={(e) => handleTicketChange('ninos', 'del', parseInt(e.target.value, 10) || 0)}
                      className="w-full text-center font-mono font-bold text-base h-10 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Al (Cierre)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={liquidation.tickets.ninos.al}
                      onChange={(e) => handleTicketChange('ninos', 'al', parseInt(e.target.value, 10) || 0)}
                      className="w-full text-center font-mono font-bold text-base h-10 bg-blue-50 border border-blue-400 rounded-lg focus:ring-2 focus:ring-amber-800 focus:outline-hidden text-blue-950"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 text-xs border-t border-stone-200">
                  <span className="text-stone-600">Total Pax: <strong className="text-stone-900 font-mono">{totals.paxNinos}</strong></span>
                  <span className="font-mono font-bold text-stone-900">{formatEuro(totals.subtotalNinos)}</span>
                </div>
              </div>

              {/* Imserso */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm">Imserso</span>
                  <span className="text-xs font-mono font-semibold text-stone-500">
                    {formatEuro(liquidation.tickets.imserso.precio)} / pax
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Del (Inicio)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={liquidation.tickets.imserso.del}
                      onChange={(e) => handleTicketChange('imserso', 'del', parseInt(e.target.value, 10) || 0)}
                      className="w-full text-center font-mono font-bold text-base h-10 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Al (Cierre)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={liquidation.tickets.imserso.al}
                      onChange={(e) => handleTicketChange('imserso', 'al', parseInt(e.target.value, 10) || 0)}
                      className="w-full text-center font-mono font-bold text-base h-10 bg-emerald-50 border border-emerald-400 rounded-lg focus:ring-2 focus:ring-amber-800 focus:outline-hidden text-emerald-950"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 text-xs border-t border-stone-200">
                  <span className="text-stone-600">Total Pax: <strong className="text-stone-900 font-mono">{totals.paxImserso}</strong></span>
                  <span className="font-mono font-bold text-stone-900">{formatEuro(totals.subtotalImserso)}</span>
                </div>
              </div>

              {/* Grupos */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm">Grupos Especiales</span>
                  <input
                    type="text"
                    value={liquidation.tickets.grupos.tipo || 'niños'}
                    onChange={(e) => handleGruposChange('tipo', e.target.value)}
                    placeholder="Tipo (niños, etc.)"
                    className="text-xs text-right font-medium text-stone-600 bg-white border border-stone-300 rounded px-1.5 py-0.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Pax Total</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={liquidation.tickets.grupos.pax || ''}
                      onChange={(e) => handleGruposChange('pax', e.target.value)}
                      placeholder="0"
                      className="w-full text-center font-mono font-bold text-base h-10 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Precio Unitario (€)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={liquidation.tickets.grupos.precio}
                      onChange={(e) => handleGruposChange('precio', e.target.value)}
                      className="w-full text-center font-mono font-bold text-base h-10 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 text-xs border-t border-stone-200">
                  <span className="text-stone-600">Total Pax: <strong className="text-stone-900 font-mono">{totals.paxGrupos}</strong></span>
                  <span className="font-mono font-bold text-stone-900">{formatEuro(totals.subtotalGrupos)}</span>
                </div>
              </div>

            </div>
          </div>

          {/* 2. Departamentos Card (Bar, Tienda, Mirador) */}
          <div className="bg-white rounded-xl border border-stone-300 p-3.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-800" />
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                  Bar, Tienda, Mirador y Otro Ingreso
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                Subtotal: {formatEuro(totals.totalBar + totals.totalTienda + totals.totalMiradorYoga + totals.totalOtrosIngresos)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Bar */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm flex items-center gap-1">
                    <Coffee className="w-3.5 h-3.5 text-stone-500" /> Bar Z
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Nº Cierre Z</label>
                    <input
                      type="text"
                      value={liquidation.bar.zNumero ?? ''}
                      onChange={(e) => handleBarChange('zNumero', e.target.value)}
                      placeholder="Z nº..."
                      className="w-full text-center font-mono font-semibold text-sm h-9 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Total Z (€)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={liquidation.bar.totalZ || ''}
                      onChange={(e) => handleBarChange('totalZ', e.target.value)}
                      placeholder="0,00"
                      className="w-full text-right font-mono font-bold text-base h-10 px-2 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-800"
                    />
                  </div>
                </div>
              </div>

              {/* Tienda */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-stone-500" /> Tienda Z
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Nº Cierre Z</label>
                    <input
                      type="text"
                      value={liquidation.tienda.zNumero ?? ''}
                      onChange={(e) => handleTiendaChange('zNumero', e.target.value)}
                      placeholder="Z nº..."
                      className="w-full text-center font-mono font-semibold text-sm h-9 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Total Z (€)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={liquidation.tienda.totalZ || ''}
                      onChange={(e) => handleTiendaChange('totalZ', e.target.value)}
                      placeholder="0,00"
                      className="w-full text-right font-mono font-bold text-base h-10 px-2 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-800"
                    />
                  </div>
                </div>
              </div>

              {/* Mirador / Yoga */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-stone-500" /> Mirador / Actividad
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Concepto</label>
                    <input
                      type="text"
                      value={liquidation.miradorYoga.concepto || 'yoga'}
                      onChange={(e) => handleMiradorChange('concepto', e.target.value)}
                      className="w-full text-center font-medium text-sm h-9 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Total (€)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={liquidation.miradorYoga.total || ''}
                      onChange={(e) => handleMiradorChange('total', e.target.value)}
                      placeholder="0,00"
                      className="w-full text-right font-mono font-bold text-base h-10 px-2 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-800"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Otro ingreso (directamente debajo de Mirador) */}
            <div className="pt-2 border-t border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">Otro ingreso</span>
                <button
                  type="button"
                  onClick={addOtroIngreso}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 hover:text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </button>
              </div>

              {(liquidation.otrosIngresos || []).length > 0 ? (
                <div className="space-y-2">
                  {(liquidation.otrosIngresos || []).map((otro) => (
                    <div key={otro.id} className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200">
                      <input
                        type="text"
                        value={otro.concepto}
                        onChange={(e) => updateOtroIngreso(otro.id, 'concepto', e.target.value)}
                        placeholder="Concepto otro ingreso..."
                        className="flex-1 text-xs bg-white border border-stone-300 rounded px-2 py-1.5"
                      />
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={otro.importe || ''}
                        onChange={(e) => updateOtroIngreso(otro.id, 'importe', e.target.value)}
                        placeholder="0,00"
                        className="w-28 text-right font-mono font-bold text-xs bg-white border border-stone-300 rounded px-2 py-1.5"
                      />
                      <button
                        type="button"
                        onClick={() => removeOtroIngreso(otro.id)}
                        className="p-1 text-stone-400 hover:text-rose-600"
                        title="Eliminar ingreso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200">
                  <input
                    type="text"
                    value=""
                    onChange={(e) => handleEmptyOtroIngresoChange('concepto', e.target.value)}
                    placeholder="Concepto otro ingreso..."
                    className="flex-1 text-xs bg-white border border-stone-300 rounded px-2 py-1.5"
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value=""
                    onChange={(e) => handleEmptyOtroIngresoChange('importe', e.target.value)}
                    placeholder="0,00"
                    className="w-28 text-right font-mono font-bold text-xs bg-white border border-stone-300 rounded px-2 py-1.5"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 3. Cobro Visa (Tarjetas) Card */}
          <div className="bg-white rounded-xl border border-stone-300 p-3.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-800" />
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                  Cobro Visa (Tarjetas Datáfono)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Total Visa: {formatEuro(totals.totalVisa)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-blue-50/40 border border-blue-200 rounded-lg p-2.5 space-y-1">
                <label className="text-[11px] font-bold text-stone-700 block">Visa Bar (€)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={liquidation.cobroVisa.bar || ''}
                  onChange={(e) => handleVisaChange('bar', e.target.value)}
                  placeholder="0,00"
                  className="w-full text-right font-mono font-bold text-base h-10 px-2 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div className="bg-blue-50/40 border border-blue-200 rounded-lg p-2.5 space-y-1">
                <label className="text-[11px] font-bold text-stone-700 block">Visa Tienda (€)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={liquidation.cobroVisa.tienda || ''}
                  onChange={(e) => handleVisaChange('tienda', e.target.value)}
                  placeholder="0,00"
                  className="w-full text-right font-mono font-bold text-base h-10 px-2 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div className="bg-blue-50/40 border border-blue-200 rounded-lg p-2.5 space-y-1">
                <label className="text-[11px] font-bold text-stone-700 block">Visa Tickets (€)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={liquidation.cobroVisa.tickets || ''}
                  onChange={(e) => handleVisaChange('tickets', e.target.value)}
                  placeholder="0,00"
                  className="w-full text-right font-mono font-bold text-base h-10 px-2 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-700"
                />
              </div>
            </div>
          </div>

          {/* 3b. Otro gastos (directamente debajo de las Visas) */}
          <div className="bg-white rounded-xl border border-stone-300 p-3.5 shadow-xs space-y-2">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                  Otro gastos
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-rose-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Total Gastos: {formatEuro(totals.totalOtrosGastos)}
                </span>
                <button
                  type="button"
                  onClick={addOtroGasto}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-900 hover:text-rose-800 bg-rose-50 px-2 py-1 rounded border border-rose-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </button>
              </div>
            </div>

            {(liquidation.otrosGastos || []).length > 0 ? (
              <div className="space-y-2">
                {(liquidation.otrosGastos || []).map((gasto) => (
                  <div key={gasto.id} className="flex items-center gap-2 bg-rose-50/40 p-2 rounded-lg border border-rose-200/70">
                    <input
                      type="text"
                      value={gasto.concepto}
                      onChange={(e) => updateOtroGasto(gasto.id, 'concepto', e.target.value)}
                      placeholder="Concepto del gasto..."
                      className="flex-1 text-xs bg-white border border-stone-300 rounded px-2 py-1.5"
                    />
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={gasto.importe || ''}
                      onChange={(e) => updateOtroGasto(gasto.id, 'importe', e.target.value)}
                      placeholder="0,00"
                      className="w-28 text-right font-mono font-bold text-xs bg-white border border-stone-300 rounded px-2 py-1.5 text-rose-900"
                    />
                    <button
                      type="button"
                      onClick={() => removeOtroGasto(gasto.id)}
                      className="p-1 text-stone-400 hover:text-rose-600"
                      title="Eliminar gasto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-rose-50/40 p-2 rounded-lg border border-rose-200/70">
                <input
                  type="text"
                  value=""
                  onChange={(e) => handleEmptyOtroGastoChange('concepto', e.target.value)}
                  placeholder="Concepto del gasto..."
                  className="flex-1 text-xs bg-white border border-stone-300 rounded px-2 py-1.5"
                />
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value=""
                  onChange={(e) => handleEmptyOtroGastoChange('importe', e.target.value)}
                  placeholder="0,00"
                  className="w-28 text-right font-mono font-bold text-xs bg-white border border-stone-300 rounded px-2 py-1.5 text-rose-900"
                />
              </div>
            )}
          </div>

          {/* 4. TOTAL NETO (Directamente por debajo de Visas y Otro gastos) */}
          <div id="card-total-neto" className="bg-stone-900 text-white rounded-xl p-4 shadow-lg border-2 border-stone-800 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="text-xs uppercase font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                TOTAL NETO
              </span>
              <span className="text-xs text-stone-400 font-mono font-bold">
                {formatDateToES(liquidation.fecha)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                  A Rendir en Efectivo
                </span>
                <span className="text-xs text-stone-400 block mt-0.5 font-mono">
                  {formatEuro(totals.totalBruto)} (Bruto) − {formatEuro(totals.totalVisa)} (Cobro Visa)
                  {totals.totalOtrosGastos > 0 ? ` − ${formatEuro(totals.totalOtrosGastos)} (Otro gastos)` : ''}
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-black text-amber-300 text-right">
                {formatEuro(totals.totalNeto)}
              </div>
            </div>
          </div>

          {/* 7. Desglose de Pax y Buses Card */}
          <div className="bg-white rounded-xl border border-stone-300 p-3.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-amber-800" />
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                  Desglose de Pasajeros (Pax)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                Taquilla: {totals.totalPaxTickets} pax
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5">
                <span className="text-[11px] font-semibold text-stone-600 block mb-1">Pax Taquilla</span>
                <div className="text-base font-mono font-bold text-stone-900">
                  {totals.totalPaxTickets} pax
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5">
                <label className="text-[11px] font-semibold text-stone-600 block mb-1">On-line</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={liquidation.paxBreakdown.onLine || ''}
                  onChange={(e) => handlePaxOnline(e.target.value)}
                  placeholder="0"
                  className="w-full text-center font-mono font-bold text-base h-9 bg-white border border-stone-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-800"
                />
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5">
                <label className="text-[11px] font-semibold text-stone-600 block mb-1">Particulares</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={liquidation.paxBreakdown.particulares || ''}
                  onChange={(e) => handlePaxParticulares(e.target.value)}
                  placeholder="0"
                  className="w-full text-center font-mono font-bold text-base h-9 bg-white border border-stone-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-800"
                />
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5">
                <span className="text-[11px] font-semibold text-stone-600 block mb-1">Buses Total</span>
                <div className="text-base font-mono font-bold text-stone-900">
                  {totals.totalPaxBuses} pax
                </div>
              </div>
            </div>



          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CLASSIC SPREADSHEET TABLE (Paper-replica, responsive on tablet/PC) */}
      {/* ========================================================================= */}
      {activeLayout === 'sheet' && (
        <div className="bg-white rounded-xl border-2 border-stone-900 shadow-sm overflow-hidden">
          
          {/* Scroll container with visual cue for mobile/small tablet */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs min-w-[680px]">
              
              {/* Top Table Header */}
              <thead>
                <tr className="border-b-2 border-stone-900 bg-white">
                  <th 
                    className="py-2.5 px-3 text-sm font-black tracking-wider text-stone-950 border-r-2 border-stone-900 uppercase w-32 sm:w-36"
                  >
                    COBROS
                  </th>
                  <th 
                    colSpan={6} 
                    className="py-2.5 px-3 text-center text-sm font-black tracking-wider text-stone-950 bg-stone-50"
                  >
                    <span className="uppercase text-amber-950 mr-2">Liquidación Cueva de Can Marçà</span>
                    <span className="font-mono text-stone-600 font-bold">({formatDateToES(liquidation.fecha)})</span>
                  </th>
                </tr>

                {/* Subheader Column Labels */}
                <tr className="border-b-2 border-stone-900 bg-stone-100/90 text-stone-800 font-bold text-[11px]">
                  <th className="py-1 px-3 border-r-2 border-stone-900"></th>
                  <th className="py-1 px-2 text-center border-r border-stone-400 w-20 sm:w-24">del</th>
                  <th className="py-1 px-2 text-center border-r border-stone-400 w-20 sm:w-24">al</th>
                  <th className="py-1 px-2 text-center border-r border-stone-400 w-20 sm:w-24">Total Pax</th>
                  <th className="py-1 px-2 text-center border-r border-stone-400 w-24 sm:w-28"></th>
                  <th className="py-1 px-2 text-right border-r border-stone-400 w-24 sm:w-28">
                    {showPriceEdit ? 'Precio (€) [Editable]' : ''}
                  </th>
                  <th className="py-1 px-3 text-right w-28 sm:w-32 font-bold">Total (€)</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-400">
                
                {/* 1. Adultos */}
                <tr className="hover:bg-amber-50/40 transition-colors">
                  <td className="py-2 px-3 font-bold text-stone-900 border-r-2 border-stone-900">
                    Adultos
                  </td>
                  <td className="py-1 px-1.5 border-r border-stone-400">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={liquidation.tickets.adultos.del}
                      onChange={(e) =>
                        handleTicketChange('adultos', 'del', parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full text-center font-mono font-semibold py-1.5 px-1 bg-stone-50 hover:bg-white focus:bg-white border border-stone-300 rounded text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 text-sm sm:text-xs"
                    />
                  </td>
                  <td className="py-1 px-1.5 border-r border-stone-400">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={liquidation.tickets.adultos.al}
                      onChange={(e) =>
                        handleTicketChange('adultos', 'al', parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full text-center font-mono font-bold py-1.5 px-1 bg-amber-50/60 hover:bg-white focus:bg-white border border-amber-300 rounded text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 text-sm sm:text-xs"
                    />
                  </td>
                  <td className="py-1 px-2 text-center font-mono font-bold text-stone-900 border-r border-stone-400 bg-stone-50/50">
                    {totals.paxAdultos}
                  </td>
                  <td className="py-1 px-2 border-r border-stone-400"></td>
                  <td className="py-1 px-2 text-right font-mono text-stone-700 border-r border-stone-400">
                    {showPriceEdit ? (
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={liquidation.tickets.adultos.precio}
                        onChange={(e) =>
                          handleTicketChange('adultos', 'precio', parseFloat(e.target.value) || 0)
                        }
                        className="w-20 text-right font-mono py-0.5 px-1 bg-white border border-stone-300 rounded text-xs"
                      />
                    ) : (
                      formatEuro(liquidation.tickets.adultos.precio)
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-extrabold text-stone-950 bg-stone-50/30">
                    {formatEuro(totals.subtotalAdultos)}
                  </td>
                </tr>

                {/* 2. Niños */}
                <tr className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-2 px-3 font-bold text-stone-900 border-r-2 border-stone-900">
                    Niños
                  </td>
                  <td className="py-1 px-1.5 border-r border-stone-400">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={liquidation.tickets.ninos.del}
                      onChange={(e) =>
                        handleTicketChange('ninos', 'del', parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full text-center font-mono font-semibold py-1.5 px-1 bg-stone-50 hover:bg-white focus:bg-white border border-stone-300 rounded text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 text-sm sm:text-xs"
                    />
                  </td>
                  <td className="py-1 px-1.5 border-r border-stone-400">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={liquidation.tickets.ninos.al}
                      onChange={(e) =>
                        handleTicketChange('ninos', 'al', parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full text-center font-mono font-bold py-1.5 px-1 bg-blue-50/60 hover:bg-white focus:bg-white border border-blue-300 rounded text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 text-sm sm:text-xs"
                    />
                  </td>
                  <td className="py-1 px-2 text-center font-mono font-bold text-stone-900 border-r border-stone-400 bg-stone-50/50">
                    {totals.paxNinos}
                  </td>
                  <td className="py-1 px-2 border-r border-stone-400"></td>
                  <td className="py-1 px-2 text-right font-mono text-stone-700 border-r border-stone-400">
                    {showPriceEdit ? (
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={liquidation.tickets.ninos.precio}
                        onChange={(e) =>
                          handleTicketChange('ninos', 'precio', parseFloat(e.target.value) || 0)
                        }
                        className="w-20 text-right font-mono py-0.5 px-1 bg-white border border-stone-300 rounded text-xs"
                      />
                    ) : (
                      formatEuro(liquidation.tickets.ninos.precio)
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-extrabold text-stone-950 bg-stone-50/30">
                    {formatEuro(totals.subtotalNinos)}
                  </td>
                </tr>

                {/* 3. Imserso */}
                <tr className="hover:bg-emerald-50/40 transition-colors">
                  <td className="py-2 px-3 font-bold text-stone-900 border-r-2 border-stone-900">
                    Imserso
                  </td>
                  <td className="py-1 px-1.5 border-r border-stone-400">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={liquidation.tickets.imserso.del}
                      onChange={(e) =>
                        handleTicketChange('imserso', 'del', parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full text-center font-mono font-semibold py-1.5 px-1 bg-stone-50 hover:bg-white focus:bg-white border border-stone-300 rounded text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 text-sm sm:text-xs"
                    />
                  </td>
                  <td className="py-1 px-1.5 border-r border-stone-400">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={liquidation.tickets.imserso.al}
                      onChange={(e) =>
                        handleTicketChange('imserso', 'al', parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full text-center font-mono font-bold py-1.5 px-1 bg-emerald-50/60 hover:bg-white focus:bg-white border border-emerald-300 rounded text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 text-sm sm:text-xs"
                    />
                  </td>
                  <td className="py-1 px-2 text-center font-mono font-bold text-stone-900 border-r border-stone-400 bg-stone-50/50">
                    {totals.paxImserso}
                  </td>
                  <td className="py-1 px-2 border-r border-stone-400"></td>
                  <td className="py-1 px-2 text-right font-mono text-stone-700 border-r border-stone-400">
                    {showPriceEdit ? (
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={liquidation.tickets.imserso.precio}
                        onChange={(e) =>
                          handleTicketChange('imserso', 'precio', parseFloat(e.target.value) || 0)
                        }
                        className="w-20 text-right font-mono py-0.5 px-1 bg-white border border-stone-300 rounded text-xs"
                      />
                    ) : (
                      formatEuro(liquidation.tickets.imserso.precio)
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-extrabold text-stone-950 bg-stone-50/30">
                    {formatEuro(totals.subtotalImserso)}
                  </td>
                </tr>

                {/* 4. Grupos */}
                <tr className="hover:bg-stone-50 transition-colors">
                  <td className="py-2 px-3 font-bold text-stone-900 border-r-2 border-stone-900">
                    Grupos
                  </td>
                  <td className="py-1 px-2 text-center text-stone-400 border-r border-stone-400">-</td>
                  <td className="py-1 px-2 text-center text-stone-400 border-r border-stone-400">-</td>
                  <td className="py-1 px-1.5 border-r border-stone-400">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={liquidation.tickets.grupos.pax || ''}
                      onChange={(e) => handleGruposChange('pax', e.target.value)}
                      placeholder="0"
                      className="w-full text-center font-mono font-bold py-1.5 px-1 bg-white border border-stone-300 rounded text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 text-sm sm:text-xs"
                    />
                  </td>
                  <td className="py-1 px-2 text-center border-r border-stone-400 font-medium text-stone-700">
                    <input
                      type="text"
                      value={liquidation.tickets.grupos.tipo || 'niños'}
                      onChange={(e) => handleGruposChange('tipo', e.target.value)}
                      className="w-full text-center bg-transparent border-b border-dashed border-stone-300 hover:border-stone-500 py-0.5 text-xs text-stone-800 focus:outline-hidden"
                    />
                  </td>
                  <td className="py-1 px-2 text-right font-mono text-stone-700 border-r border-stone-400">
                    {showPriceEdit ? (
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={liquidation.tickets.grupos.precio}
                        onChange={(e) => handleGruposChange('precio', e.target.value)}
                        className="w-20 text-right font-mono py-0.5 px-1 bg-white border border-stone-300 rounded text-xs"
                      />
                    ) : (
                      formatEuro(liquidation.tickets.grupos.precio)
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-extrabold text-stone-950 bg-stone-50/30">
                    {formatEuro(totals.subtotalGrupos)}
                  </td>
                </tr>

                {/* 5. Bar Z */}
                <tr className="hover:bg-amber-50/20 transition-colors">
                  <td className="py-2 px-3 font-bold text-stone-900 border-r-2 border-stone-900">
                    Bar&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Z
                  </td>
                  <td className="py-1 px-1.5 border-r border-stone-400">
                    <input
                      type="text"
                      value={liquidation.bar.zNumero ?? ''}
                      onChange={(e) => handleBarChange('zNumero', e.target.value)}
                      placeholder="Nº Z"
                      className="w-full text-center font-mono py-1.5 px-1 bg-white border border-stone-300 rounded text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 text-sm sm:text-xs"
                    />
                  </td>
                  <td className="py-1 px-2 text-center text-stone-400 border-r border-stone-400">-</td>
                  <td className="py-1 px-2 text-center text-stone-400 border-r border-stone-400">-</td>
                  <td className="py-1 px-2 text-center border-r border-stone-400 font-medium text-stone-700">
                    Z bar
                  </td>
                  <td className="py-1 px-2 text-right text-stone-400 border-r border-stone-400">-</td>
                  <td className="py-1 px-1.5">
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={liquidation.bar.totalZ || ''}
                        onChange={(e) => handleBarChange('totalZ', e.target.value)}
                        placeholder="0,00"
                        className="w-full text-right font-mono font-extrabold py-1.5 pr-6 pl-1 bg-white border border-stone-300 rounded text-stone-950 focus:outline-hidden focus:ring-1 focus:ring-amber-800 text-sm sm:text-xs"
                      />
                      <span className="absolute right-2 top-2 text-stone-400 pointer-events-none">€</span>
                    </div>
                  </td>
                </tr>

                {/* 6. Tienda Z */}
                <tr className="hover:bg-amber-50/20 transition-colors">
                  <td className="py-2 px-3 font-bold text-stone-900 border-r-2 border-stone-900">
                    Tienda Z
                  </td>
                  <td className="py-1 px-1.5 border-r border-stone-400">
                    <input
                      type="text"
                      value={liquidation.tienda.zNumero ?? ''}
                      onChange={(e) => handleTiendaChange('zNumero', e.target.value)}
                      placeholder="Nº Z"
                      className="w-full text-center font-mono py-1.5 px-1 bg-white border border-stone-300 rounded text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 text-sm sm:text-xs"
                    />
                  </td>
                  <td className="py-1 px-2 text-center text-stone-400 border-r border-stone-400">-</td>
                  <td className="py-1 px-2 text-center text-stone-400 border-r border-stone-400">-</td>
                  <td className="py-1 px-2 text-center border-r border-stone-400 font-medium text-stone-700">
                    Z tienda
                  </td>
                  <td className="py-1 px-2 text-right text-stone-400 border-r border-stone-400">-</td>
                  <td className="py-1 px-1.5">
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={liquidation.tienda.totalZ || ''}
                        onChange={(e) => handleTiendaChange('totalZ', e.target.value)}
                        placeholder="0,00"
                        className="w-full text-right font-mono font-extrabold py-1.5 pr-6 pl-1 bg-white border border-stone-300 rounded text-stone-950 focus:outline-hidden focus:ring-1 focus:ring-amber-800 text-sm sm:text-xs"
                      />
                      <span className="absolute right-2 top-2 text-stone-400 pointer-events-none">€</span>
                    </div>
                  </td>
                </tr>

                {/* 7. Mirador / Yoga */}
                <tr className="hover:bg-amber-50/20 transition-colors">
                  <td className="py-2 px-3 font-bold text-stone-900 border-r-2 border-stone-900">
                    mirador
                  </td>
                  <td className="py-1 px-2 text-center text-stone-400 border-r border-stone-400">-</td>
                  <td className="py-1 px-2 text-center text-stone-400 border-r border-stone-400">-</td>
                  <td className="py-1 px-2 text-center text-stone-400 border-r border-stone-400">-</td>
                  <td className="py-1 px-2 text-center border-r border-stone-400 font-medium text-stone-700">
                    <input
                      type="text"
                      value={liquidation.miradorYoga.concepto || 'yoga'}
                      onChange={(e) => handleMiradorChange('concepto', e.target.value)}
                      className="w-full text-center bg-transparent border-b border-dashed border-stone-300 hover:border-stone-500 py-0.5 text-xs text-stone-800 focus:outline-hidden"
                    />
                  </td>
                  <td className="py-1 px-2 text-right text-stone-400 border-r border-stone-400">-</td>
                  <td className="py-1 px-1.5">
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={liquidation.miradorYoga.total || ''}
                        onChange={(e) => handleMiradorChange('total', e.target.value)}
                        placeholder="0,00"
                        className="w-full text-right font-mono font-extrabold py-1.5 pr-6 pl-1 bg-white border border-stone-300 rounded text-stone-950 focus:outline-hidden focus:ring-1 focus:ring-amber-800 text-sm sm:text-xs"
                      />
                      <span className="absolute right-2 top-2 text-stone-400 pointer-events-none">€</span>
                    </div>
                  </td>
                </tr>

                {/* 8. Otro ingreso (directamente debajo de mirador) */}
                {(liquidation.otrosIngresos || []).length > 0 ? (
                  (liquidation.otrosIngresos || []).map((otro, idx) => (
                    <tr key={otro.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-2 px-3 font-bold text-stone-900 border-r-2 border-stone-900">
                        <div className="flex items-center justify-between gap-1">
                          <span>{idx === 0 ? 'Otro ingreso' : 'Otro ingreso +'}</span>
                          <div className="flex items-center gap-1">
                            {idx === 0 && (
                              <button
                                type="button"
                                onClick={addOtroIngreso}
                                className="p-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900"
                                title="Añadir otro ingreso"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeOtroIngreso(otro.id)}
                              className="p-0.5 text-stone-400 hover:text-rose-600"
                              title="Eliminar fila"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-1 px-2 text-center text-stone-400 border-r border-stone-400">-</td>
                      <td className="py-1 px-2 text-center text-stone-400 border-r border-stone-400">-</td>
                      <td className="py-1 px-2 text-center text-stone-400 border-r border-stone-400">-</td>
                      <td className="py-1 px-2 text-center border-r border-stone-400 font-medium text-stone-700">
                        <input
                          type="text"
                          value={otro.concepto}
                          onChange={(e) => updateOtroIngreso(otro.id, 'concepto', e.target.value)}
                          placeholder="concepto..."
                          className="w-full text-center bg-transparent border-b border-dashed border-stone-300 hover:border-stone-500 py-0.5 text-xs text-stone-800 focus:outline-hidden"
                        />
                      </td>
                      <td className="py-1 px-2 text-right text-stone-400 border-r border-stone-400">-</td>
                      <td className="py-1 px-1.5">
                        <div className="relative">
                          <input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0"
                            value={otro.importe || ''}
                            onChange={(e) => updateOtroIngreso(otro.id, 'importe', e.target.value)}
                            placeholder="0,00"
                            className="w-full text-right font-mono font-extrabold py-1.5 pr-6 pl-1 bg-white border border-stone-300 rounded text-stone-950 focus:outline-hidden focus:ring-1 focus:ring-amber-800 text-sm sm:text-xs"
                          />
                          <span className="absolute right-2 top-2 text-stone-400 pointer-events-none">€</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-2 px-3 font-bold text-stone-900 border-r-2 border-stone-900">
                      <div className="flex items-center justify-between gap-1">
                        <span>Otro ingreso</span>
                        <button
                          type="button"
                          onClick={addOtroIngreso}
                          className="p-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900"
                          title="Añadir otro ingreso"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-1 px-2 text-center text-stone-400 border-r border-stone-400">-</td>
                    <td className="py-1 px-2 text-center text-stone-400 border-r border-stone-400">-</td>
                    <td className="py-1 px-2 text-center text-stone-400 border-r border-stone-400">-</td>
                    <td className="py-1 px-2 text-center border-r border-stone-400 font-medium text-stone-700">
                      <input
                        type="text"
                        value=""
                        onChange={(e) => handleEmptyOtroIngresoChange('concepto', e.target.value)}
                        placeholder="concepto..."
                        className="w-full text-center bg-transparent border-b border-dashed border-stone-300 hover:border-stone-500 py-0.5 text-xs text-stone-800 focus:outline-hidden"
                      />
                    </td>
                    <td className="py-1 px-2 text-right text-stone-400 border-r border-stone-400">-</td>
                    <td className="py-1 px-1.5">
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          value=""
                          onChange={(e) => handleEmptyOtroIngresoChange('importe', e.target.value)}
                          placeholder="0,00"
                          className="w-full text-right font-mono font-extrabold py-1.5 pr-6 pl-1 bg-white border border-stone-300 rounded text-stone-950 focus:outline-hidden focus:ring-1 focus:ring-amber-800 text-sm sm:text-xs"
                        />
                        <span className="absolute right-2 top-2 text-stone-400 pointer-events-none">€</span>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Sub-divider: TOTAL BRUTTO */}
                <tr className="border-t-2 border-b-2 border-stone-900 bg-stone-100 font-bold">
                  <td colSpan={5} className="py-2 px-3 border-r-2 border-stone-900">
                    <div className="flex items-center justify-between text-[11px] text-stone-600">
                      <span>Tickets Taquilla: <strong>{totals.totalPaxTickets} pax</strong> ({formatEuro(totals.totalTicketsEuros)})</span>
                      <span>Bar+Tienda+Mirador+Otros: <strong>{formatEuro(totals.totalBar + totals.totalTienda + totals.totalMiradorYoga + totals.totalOtrosIngresos)}</strong></span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right font-black uppercase tracking-wider text-stone-950 border-r border-stone-400">
                    total brutto
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-base font-black text-stone-950 bg-amber-100/50">
                    {formatEuro(totals.totalBruto)}
                  </td>
                </tr>

                {/* COBRO VISA ROW */}
                <tr id="row-cobro-visa" className="hover:bg-blue-50/20 transition-colors border-b border-stone-400">
                  <td className="py-2 px-3 font-bold text-stone-900 border-r-2 border-stone-900">
                    Cobro Visa
                  </td>
                  <td className="py-1 px-1.5 border-r border-stone-400">
                    <div className="text-[10px] text-center font-semibold text-stone-500">Bar</div>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={liquidation.cobroVisa.bar || ''}
                      onChange={(e) => handleVisaChange('bar', e.target.value)}
                      placeholder="0,00"
                      className="w-full text-center font-mono py-1.5 px-1 bg-white border border-stone-300 rounded text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 text-sm sm:text-xs"
                    />
                  </td>
                  <td className="py-1 px-1.5 border-r border-stone-400">
                    <div className="text-[10px] text-center font-semibold text-stone-500">Tienda</div>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={liquidation.cobroVisa.tienda || ''}
                      onChange={(e) => handleVisaChange('tienda', e.target.value)}
                      placeholder="0,00"
                      className="w-full text-center font-mono py-1.5 px-1 bg-white border border-stone-300 rounded text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 text-sm sm:text-xs"
                    />
                  </td>
                  <td className="py-1 px-1.5 border-r border-stone-400">
                    <div className="text-[10px] text-center font-semibold text-stone-500">Tickets</div>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={liquidation.cobroVisa.tickets || ''}
                      onChange={(e) => handleVisaChange('tickets', e.target.value)}
                      placeholder="0,00"
                      className="w-full text-center font-mono py-1.5 px-1 bg-white border border-stone-300 rounded text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 text-sm sm:text-xs"
                    />
                  </td>
                  <td colSpan={2} className="py-1 px-2 text-right font-semibold text-stone-600 border-r border-stone-400">
                    Total Tarjetas (Visa):
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-extrabold text-blue-950 bg-blue-50/40">
                    {formatEuro(totals.totalVisa)}
                  </td>
                </tr>

                {/* OTRO GASTOS ROWS (directamente debajo de las Visas) */}
                {(liquidation.otrosGastos || []).length > 0 ? (
                  (liquidation.otrosGastos || []).map((gasto, idx) => (
                    <tr key={gasto.id} className="hover:bg-rose-50/25 transition-colors border-b border-stone-400">
                      <td className="py-2 px-3 font-bold text-stone-900 border-r-2 border-stone-900">
                        <div className="flex items-center justify-between gap-1">
                          <span>{idx === 0 ? 'Otro gastos' : 'Otro gastos +'}</span>
                          <div className="flex items-center gap-1">
                            {idx === 0 && (
                              <button
                                type="button"
                                onClick={addOtroGasto}
                                className="p-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-900"
                                title="Añadir otro gasto"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeOtroGasto(gasto.id)}
                              className="p-0.5 text-stone-400 hover:text-rose-600"
                              title="Eliminar gasto"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td colSpan={4} className="py-1 px-2 border-r border-stone-400">
                        <input
                          type="text"
                          value={gasto.concepto}
                          onChange={(e) => updateOtroGasto(gasto.id, 'concepto', e.target.value)}
                          placeholder="Concepto del gasto..."
                          className="w-full text-xs bg-white border border-stone-200 rounded px-2 py-1 text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-rose-700"
                        />
                      </td>
                      <td className="py-1 px-2 text-right font-semibold text-rose-800 border-r border-stone-400 text-[11px]">
                        Gasto (−)
                      </td>
                      <td className="py-1 px-1.5 bg-rose-50/30">
                        <div className="relative">
                          <input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0"
                            value={gasto.importe || ''}
                            onChange={(e) => updateOtroGasto(gasto.id, 'importe', e.target.value)}
                            placeholder="0,00"
                            className="w-full text-right font-mono font-extrabold py-1.5 pr-6 pl-1 bg-white border border-rose-300 rounded text-rose-950 focus:outline-hidden focus:ring-1 focus:ring-rose-700 text-sm sm:text-xs"
                          />
                          <span className="absolute right-2 top-2 text-stone-400 pointer-events-none">€</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="hover:bg-rose-50/25 transition-colors border-b border-stone-400">
                    <td className="py-2 px-3 font-bold text-stone-900 border-r-2 border-stone-900">
                      <div className="flex items-center justify-between gap-1">
                        <span>Otro gastos</span>
                        <button
                          type="button"
                          onClick={addOtroGasto}
                          className="p-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-900"
                          title="Añadir otro gasto"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td colSpan={4} className="py-1 px-2 border-r border-stone-400">
                      <input
                        type="text"
                        value=""
                        onChange={(e) => handleEmptyOtroGastoChange('concepto', e.target.value)}
                        placeholder="Concepto del gasto..."
                        className="w-full text-xs bg-white border border-stone-200 rounded px-2 py-1 text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-rose-700"
                      />
                    </td>
                    <td className="py-1 px-2 text-right font-semibold text-rose-800 border-r border-stone-400 text-[11px]">
                      Gasto (−)
                    </td>
                    <td className="py-1 px-1.5 bg-rose-50/30">
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          value=""
                          onChange={(e) => handleEmptyOtroGastoChange('importe', e.target.value)}
                          placeholder="0,00"
                          className="w-full text-right font-mono font-extrabold py-1.5 pr-6 pl-1 bg-white border border-rose-300 rounded text-rose-950 focus:outline-hidden focus:ring-1 focus:ring-rose-700 text-sm sm:text-xs"
                        />
                        <span className="absolute right-2 top-2 text-stone-400 pointer-events-none">€</span>
                      </div>
                    </td>
                  </tr>
                )}

                {/* ========================================================================= */}
                {/* TOTAL NETO ROW (DIRECTAMENTE POR DEBAJO DE VISAS Y OTRO GASTOS)           */}
                {/* ========================================================================= */}
                <tr id="row-total-neto" className="border-t-2 border-b-2 border-stone-900 bg-stone-900 text-white font-bold">
                  <td colSpan={5} className="py-2.5 px-3 border-r border-stone-700">
                    <div className="flex flex-wrap items-center justify-between text-xs text-stone-300 gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <span>
                          Fórmula: <strong>Total Bruto ({formatEuro(totals.totalBruto)})</strong> − <strong>Cobro Visa ({formatEuro(totals.totalVisa)})</strong>
                          {totals.totalOtrosGastos > 0 && (
                            <> − <strong>Otro gastos ({formatEuro(totals.totalOtrosGastos)})</strong></>
                          )}
                        </span>
                      </div>
                      <span className="text-amber-300 font-mono font-semibold">
                        A Rendir (Efectivo)
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-right font-black uppercase tracking-wider text-amber-400 border-r border-stone-700 text-xs sm:text-sm">
                    TOTAL NETO
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-base sm:text-lg font-black text-amber-300 bg-stone-950">
                    {formatEuro(totals.totalNeto)}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* COMPACT PAX BREAKDOWN STRIP (Directly modeled on bottom lines of Excel) */}
          <div className="bg-stone-50 border-t border-stone-300 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-700">Total Pax Taquilla:</span>
                <span className="font-mono font-extrabold text-stone-900 bg-white border border-stone-200 px-2 py-0.5 rounded">
                  {totals.totalPaxTickets} pax
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <label htmlFor="input-pax-online-sheet" className="text-stone-600 font-medium">On-line:</label>
                <input
                  id="input-pax-online-sheet"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={liquidation.paxBreakdown.onLine || ''}
                  onChange={(e) => handlePaxOnline(e.target.value)}
                  placeholder="0"
                  className="w-16 font-mono font-bold text-center bg-white border border-stone-300 rounded px-1 py-1 text-sm sm:text-xs"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <label htmlFor="input-pax-particulares-sheet" className="text-stone-600 font-medium">Particulares:</label>
                <input
                  id="input-pax-particulares-sheet"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={liquidation.paxBreakdown.particulares || ''}
                  onChange={(e) => handlePaxParticulares(e.target.value)}
                  placeholder="0"
                  className="w-16 font-mono font-bold text-center bg-white border border-stone-300 rounded px-1 py-1 text-sm sm:text-xs"
                />
              </div>


            </div>

            <div className="text-[11px] text-stone-500 font-mono hidden md:block">
              Arrastre activo: Adultos ({liquidation.tickets.adultos.del}➔{liquidation.tickets.adultos.al}), Niños ({liquidation.tickets.ninos.del}➔{liquidation.tickets.ninos.al}), Imserso ({liquidation.tickets.imserso.del}➔{liquidation.tickets.imserso.al})
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
