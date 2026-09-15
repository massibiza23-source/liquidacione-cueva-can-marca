import React from 'react';
import { Coffee, Store, Eye, Plus, Trash2, DollarSign } from 'lucide-react';
import { DailyLiquidation, TotalesCalculados } from '../types';
import { formatEuro } from '../utils/calculator';

interface ComplementaryRevenueSectionProps {
  liquidation: DailyLiquidation;
  totals: TotalesCalculados;
  onChange: (updated: DailyLiquidation) => void;
}

export const ComplementaryRevenueSection: React.FC<ComplementaryRevenueSectionProps> = ({
  liquidation,
  totals,
  onChange,
}) => {
  const handleBarChange = (field: 'zNumero' | 'totalZ', value: any) => {
    const updated = { ...liquidation };
    if (field === 'totalZ') {
      updated.bar.totalZ = parseFloat(value) || 0;
    } else {
      updated.bar.zNumero = value;
    }
    onChange(updated);
  };

  const handleTiendaChange = (field: 'zNumero' | 'totalZ', value: any) => {
    const updated = { ...liquidation };
    if (field === 'totalZ') {
      updated.tienda.totalZ = parseFloat(value) || 0;
    } else {
      updated.tienda.zNumero = value;
    }
    onChange(updated);
  };

  const handleMiradorChange = (field: 'total' | 'concepto', value: any) => {
    const updated = { ...liquidation };
    if (field === 'total') {
      updated.miradorYoga.total = parseFloat(value) || 0;
    } else {
      updated.miradorYoga.concepto = value;
    }
    onChange(updated);
  };

  const addOtroIngreso = () => {
    const updated = { ...liquidation };
    const nextId = `otro_${Date.now()}`;
    updated.otrosIngresos = [
      ...(updated.otrosIngresos || []),
      { id: nextId, concepto: 'Otros / Varios', importe: 0 },
    ];
    onChange(updated);
  };

  const updateOtroIngreso = (id: string, field: 'concepto' | 'importe', val: any) => {
    const updated = { ...liquidation };
    updated.otrosIngresos = updated.otrosIngresos.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [field]: field === 'importe' ? parseFloat(val) || 0 : val,
        };
      }
      return item;
    });
    onChange(updated);
  };

  const removeOtroIngreso = (id: string) => {
    const updated = { ...liquidation };
    updated.otrosIngresos = updated.otrosIngresos.filter((item) => item.id !== id);
    onChange(updated);
  };

  const subtotalComplementario =
    totals.totalBar + totals.totalTienda + totals.totalMiradorYoga + totals.totalOtrosIngresos;

  return (
    <div id="section-complementary" className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
      
      {/* Header */}
      <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-orange-100 text-orange-900">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900">
              Departamentos y Z de Cierre
            </h2>
            <p className="text-xs text-stone-500">
              Control de tickets Z de Bar, Tienda de recuerdos, Mirador / Yoga
            </p>
          </div>
        </div>

        <div className="text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-lg">
          Subtotal: <span className="font-mono text-stone-900">{formatEuro(subtotalComplementario)}</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        
        {/* Main 3 Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          
          {/* Bar Z Card */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-stone-800">
                <Coffee className="w-4 h-4 text-amber-700" />
                <span>Bar (Informe Z)</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-stone-500">
                <span>Z Nº:</span>
                <input
                  type="text"
                  value={liquidation.bar.zNumero}
                  onChange={(e) => handleBarChange('zNumero', e.target.value)}
                  placeholder="128"
                  className="w-14 px-1.5 py-0.5 text-center font-mono font-bold text-stone-900 bg-white border border-stone-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-500 mb-1">
                Total Z Bar (€)
              </label>
              <div className="relative">
                <input
                  id="input-bar-total"
                  type="number"
                  step="0.01"
                  min="0"
                  value={liquidation.bar.totalZ || ''}
                  onChange={(e) => handleBarChange('totalZ', e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-3 pr-8 py-1.5 text-sm font-mono font-bold text-stone-900 bg-white border border-stone-300 rounded-lg shadow-2xs focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                />
                <span className="absolute right-3 top-2 text-xs text-stone-400 font-bold">€</span>
              </div>
            </div>
          </div>

          {/* Tienda Z Card */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-stone-800">
                <Store className="w-4 h-4 text-emerald-700" />
                <span>Tienda (Informe Z)</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-stone-500">
                <span>Z Nº:</span>
                <input
                  type="text"
                  value={liquidation.tienda.zNumero}
                  onChange={(e) => handleTiendaChange('zNumero', e.target.value)}
                  placeholder="511"
                  className="w-14 px-1.5 py-0.5 text-center font-mono font-bold text-stone-900 bg-white border border-stone-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-500 mb-1">
                Total Z Tienda (€)
              </label>
              <div className="relative">
                <input
                  id="input-tienda-total"
                  type="number"
                  step="0.01"
                  min="0"
                  value={liquidation.tienda.totalZ || ''}
                  onChange={(e) => handleTiendaChange('totalZ', e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-3 pr-8 py-1.5 text-sm font-mono font-bold text-stone-900 bg-white border border-stone-300 rounded-lg shadow-2xs focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                />
                <span className="absolute right-3 top-2 text-xs text-stone-400 font-bold">€</span>
              </div>
            </div>
          </div>

          {/* Mirador / Yoga Card */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-stone-800">
                <Eye className="w-4 h-4 text-indigo-700" />
                <span>Mirador / Actividades</span>
              </div>
              <input
                type="text"
                value={liquidation.miradorYoga.concepto}
                onChange={(e) => handleMiradorChange('concepto', e.target.value)}
                placeholder="yoga / mirador"
                className="w-24 px-1.5 py-0.5 text-xs text-stone-600 bg-white border border-stone-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-500 mb-1">
                Total Mirador / Yoga (€)
              </label>
              <div className="relative">
                <input
                  id="input-mirador-total"
                  type="number"
                  step="0.01"
                  min="0"
                  value={liquidation.miradorYoga.total || ''}
                  onChange={(e) => handleMiradorChange('total', e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-3 pr-8 py-1.5 text-sm font-mono font-bold text-stone-900 bg-white border border-stone-300 rounded-lg shadow-2xs focus:ring-2 focus:ring-amber-800 focus:outline-hidden"
                />
                <span className="absolute right-3 top-2 text-xs text-stone-400 font-bold">€</span>
              </div>
            </div>
          </div>

        </div>

        {/* Otros Ingresos List */}
        <div className="pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-700">
              Otros conceptos de ingreso (opcional):
            </span>
            <button
              type="button"
              onClick={addOtroIngreso}
              className="inline-flex items-center gap-1 text-xs text-amber-800 hover:text-amber-900 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir concepto</span>
            </button>
          </div>

          {liquidation.otrosIngresos && liquidation.otrosIngresos.length > 0 ? (
            <div className="space-y-2">
              {liquidation.otrosIngresos.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.concepto}
                    onChange={(e) => updateOtroIngreso(item.id, 'concepto', e.target.value)}
                    placeholder="Descripción del ingreso"
                    className="flex-1 px-2.5 py-1 text-xs border border-stone-300 rounded-md bg-white"
                  />
                  <div className="relative w-32">
                    <input
                      type="number"
                      step="0.01"
                      value={item.importe || ''}
                      onChange={(e) => updateOtroIngreso(item.id, 'importe', e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-2.5 pr-6 py-1 text-xs font-mono font-bold text-right border border-stone-300 rounded-md bg-white"
                    />
                    <span className="absolute right-2 top-1.5 text-[10px] text-stone-400">€</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOtroIngreso(item.id)}
                    className="p-1 text-stone-400 hover:text-red-600 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400 italic">
              No hay conceptos adicionales registrados hoy.
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
