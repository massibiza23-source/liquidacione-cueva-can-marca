import React from 'react';
import { Printer, X, Mountain } from 'lucide-react';
import { DailyLiquidation, TotalesCalculados } from '../types';
import { formatEuro, formatDateToES } from '../utils/calculator';

interface PrintableReportProps {
  isOpen: boolean;
  onClose: () => void;
  liquidation: DailyLiquidation;
  totals: TotalesCalculados;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  isOpen,
  onClose,
  liquidation,
  totals,
}) => {
  if (!isOpen) return null;

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      
      {/* Container */}
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        
        {/* Modal Controls (Hidden in print) */}
        <div className="bg-stone-900 px-6 py-3 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold">Vista de Impresión Oficial</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-trigger-print"
              type="button"
              onClick={handleBrowserPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir ahora</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Content */}
        <div className="p-8 overflow-y-auto space-y-6 text-stone-900 font-sans text-xs print:p-4 print:space-y-4">
          
          {/* Header */}
          <div className="border-b-2 border-stone-800 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-stone-900 text-white flex items-center justify-center print:border print:border-stone-900">
                <Mountain className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight uppercase">
                  Liquidación Cueva de Can Marçà
                </h1>
                <p className="text-xs text-stone-600 font-medium">
                  Control diario de taquilla, recaudación y arqueo
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Fecha de Liquidación
              </div>
              <div className="text-base font-bold font-mono text-stone-900">
                {formatDateToES(liquidation.fecha)}
              </div>
            </div>
          </div>

          {/* 1. Entradas y Tickets */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800 bg-stone-100 px-2.5 py-1 rounded-sm">
              1. Entradas y Tickets Numerados
            </h2>

            <table className="w-full text-left border-collapse border border-stone-300 text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-300 font-bold text-stone-700">
                  <th className="p-2 border-r border-stone-300">Categoría</th>
                  <th className="p-2 border-r border-stone-300 text-center w-24">del</th>
                  <th className="p-2 border-r border-stone-300 text-center w-24">al</th>
                  <th className="p-2 border-r border-stone-300 text-center w-20">Total Pax</th>
                  <th className="p-2 border-r border-stone-300 text-right w-24">Precio</th>
                  <th className="p-2 text-right w-28">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr>
                  <td className="p-2 border-r border-stone-300 font-medium">Adultos</td>
                  <td className="p-2 border-r border-stone-300 text-center font-mono">{liquidation.tickets.adultos.del}</td>
                  <td className="p-2 border-r border-stone-300 text-center font-mono font-bold">{liquidation.tickets.adultos.al}</td>
                  <td className="p-2 border-r border-stone-300 text-center font-mono">{totals.paxAdultos}</td>
                  <td className="p-2 border-r border-stone-300 text-right">{formatEuro(liquidation.tickets.adultos.precio)}</td>
                  <td className="p-2 text-right font-mono font-bold">{formatEuro(totals.subtotalAdultos)}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-stone-300 font-medium">Niños</td>
                  <td className="p-2 border-r border-stone-300 text-center font-mono">{liquidation.tickets.ninos.del}</td>
                  <td className="p-2 border-r border-stone-300 text-center font-mono font-bold">{liquidation.tickets.ninos.al}</td>
                  <td className="p-2 border-r border-stone-300 text-center font-mono">{totals.paxNinos}</td>
                  <td className="p-2 border-r border-stone-300 text-right">{formatEuro(liquidation.tickets.ninos.precio)}</td>
                  <td className="p-2 text-right font-mono font-bold">{formatEuro(totals.subtotalNinos)}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-stone-300 font-medium">Imserso</td>
                  <td className="p-2 border-r border-stone-300 text-center font-mono">{liquidation.tickets.imserso.del}</td>
                  <td className="p-2 border-r border-stone-300 text-center font-mono font-bold">{liquidation.tickets.imserso.al}</td>
                  <td className="p-2 border-r border-stone-300 text-center font-mono">{totals.paxImserso}</td>
                  <td className="p-2 border-r border-stone-300 text-right">{formatEuro(liquidation.tickets.imserso.precio)}</td>
                  <td className="p-2 text-right font-mono font-bold">{formatEuro(totals.subtotalImserso)}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-stone-300 font-medium">Grupos ({liquidation.tickets.grupos.tipo || 'niños'})</td>
                  <td className="p-2 border-r border-stone-300 text-center text-stone-400">-</td>
                  <td className="p-2 border-r border-stone-300 text-center text-stone-400">-</td>
                  <td className="p-2 border-r border-stone-300 text-center font-mono">{totals.paxGrupos}</td>
                  <td className="p-2 border-r border-stone-300 text-right">{formatEuro(liquidation.tickets.grupos.precio)}</td>
                  <td className="p-2 text-right font-mono font-bold">{formatEuro(totals.subtotalGrupos)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-stone-100 font-bold border-t border-stone-300">
                  <td colSpan={3} className="p-2 border-r border-stone-300">Total Taquilla</td>
                  <td className="p-2 border-r border-stone-300 text-center font-mono">{totals.totalPaxTickets} pax</td>
                  <td className="p-2 border-r border-stone-300 text-right">Total €:</td>
                  <td className="p-2 text-right font-mono">{formatEuro(totals.totalTicketsEuros)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 2. Z Bar, Tienda, Mirador y Otros */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800 bg-stone-100 px-2.5 py-1 rounded-sm">
              2. Departamentos y Cierres Z
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-2.5 border border-stone-300 rounded-sm">
                <div className="text-stone-500 font-medium">Bar Z Nº {liquidation.bar.zNumero}</div>
                <div className="text-sm font-bold font-mono">{formatEuro(totals.totalBar)}</div>
              </div>
              <div className="p-2.5 border border-stone-300 rounded-sm">
                <div className="text-stone-500 font-medium">Tienda Z Nº {liquidation.tienda.zNumero}</div>
                <div className="text-sm font-bold font-mono">{formatEuro(totals.totalTienda)}</div>
              </div>
              <div className="p-2.5 border border-stone-300 rounded-sm">
                <div className="text-stone-500 font-medium">{liquidation.miradorYoga.concepto || 'Mirador / Yoga'}</div>
                <div className="text-sm font-bold font-mono">{formatEuro(totals.totalMiradorYoga)}</div>
              </div>
            </div>
          </div>

          {/* 3. Cobros Tarjeta (Visa) & Guías */}
          <div className="grid grid-cols-2 gap-4">
            
            <div className="border border-stone-300 p-3 rounded-sm space-y-1">
              <h3 className="font-bold uppercase text-[11px] text-stone-700 border-b border-stone-200 pb-1">
                Cobros con Tarjeta / Visa
              </h3>
              <div className="flex justify-between py-0.5">
                <span>Visa Bar:</span>
                <span className="font-mono">{formatEuro(liquidation.cobroVisa.bar)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Visa Tienda:</span>
                <span className="font-mono">{formatEuro(liquidation.cobroVisa.tienda)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Visa Tickets:</span>
                <span className="font-mono">{formatEuro(liquidation.cobroVisa.tickets)}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-stone-200">
                <span>Total Tarjetas:</span>
                <span className="font-mono">{formatEuro(totals.totalVisa)}</span>
              </div>
            </div>

            <div className="border border-stone-300 p-3 rounded-sm space-y-1">
              <h3 className="font-bold uppercase text-[11px] text-stone-700 border-b border-stone-200 pb-1">
                Guías y Comisiones
              </h3>
              <div className="flex justify-between py-0.5">
                <span>{liquidation.guias.guia1.nombre || 'Guía 1'}:</span>
                <span className="font-mono">{formatEuro(liquidation.guias.guia1.importe)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>{liquidation.guias.guia2.nombre || 'Guía 2'}:</span>
                <span className="font-mono">{formatEuro(liquidation.guias.guia2.importe)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Comisiones (Bar/Tienda/Tickets):</span>
                <span className="font-mono">{formatEuro(totals.totalComisiones)}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-stone-200">
                <span>Total Comisiones:</span>
                <span className="font-mono">{formatEuro(totals.totalGastosYComisiones)}</span>
              </div>
            </div>

          </div>

          {/* 4. Arqueo y Conciliación Económica */}
          <div className="border-2 border-stone-800 p-4 rounded-sm space-y-2 bg-stone-50">
            <div className="flex justify-between text-sm font-black border-b border-stone-300 pb-1">
              <span>TOTAL BRUTO RECAUDADO:</span>
              <span className="font-mono">{formatEuro(totals.totalBruto)}</span>
            </div>

            <div className="flex justify-between text-sm font-black border-b border-stone-300 pb-1 text-amber-950">
              <span>TOTAL NETO (BRUTO − VISA):</span>
              <span className="font-mono text-base">{formatEuro(totals.totalNeto)}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
              <div>
                <span className="text-stone-500 block">Total Neto / Efectivo a Rendir:</span>
                <span className="font-bold font-mono text-sm">{formatEuro(totals.totalNeto)}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Efectivo Real Contado:</span>
                <span className="font-bold font-mono text-sm">{formatEuro(totals.totalEfectivoContado)}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Descuadre de Caja:</span>
                <span className={`font-bold font-mono text-sm ${Math.abs(totals.descuadreCaja) < 0.01 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatEuro(totals.descuadreCaja)}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Desglose de Pax */}
          <div className="text-[11px] text-stone-600 border border-stone-200 p-2.5 rounded-sm">
            <span className="font-bold text-stone-800">Desglose de Visitantes: </span>
            <span>Total Pax: {totals.totalPaxTickets} | </span>
            <span>Particulares: {liquidation.paxBreakdown.particulares} | </span>
            <span>On-line: {liquidation.paxBreakdown.onLine} | </span>
            <span>Buses: {totals.totalPaxBuses}</span>
          </div>

          {/* Signatures Area */}
          <div className="pt-8 grid grid-cols-2 gap-12 text-center text-xs">
            <div className="border-t border-stone-400 pt-2">
              <span className="font-bold">Firma del Taquillero / Responsable</span>
            </div>
            <div className="border-t border-stone-400 pt-2">
              <span className="font-bold">Firma de Recepción / Gerencia</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
