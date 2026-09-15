import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  X, 
  ExternalLink, 
  Sparkles,
  Info
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'download'>('install');
  const [installing, setInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    try {
      setInstalling(true);
      const success = await install();
      if (success) {
        setInstallSuccess(true);
      }
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div 
      id="modal-pwa-install"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-stone-900 px-6 py-5 text-white flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 z-10">
            <img 
              src="/pwa-192x192.png" 
              alt="Icono Can Marçà" 
              className="w-12 h-12 rounded-xl border border-amber-400/30 shadow-md object-cover bg-stone-950"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Cueva de Can Marçà
              </h2>
              <p className="text-xs text-stone-300">
                Instalación móvil y descarga de iconos PNG
              </p>
            </div>
          </div>
          
          <button
            id="btn-close-install-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors z-10"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Decorative background glow */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-600/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-2">
          <button
            id="tab-install-mobile"
            type="button"
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'install'
                ? 'border-amber-700 text-amber-900 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-amber-700" />
            <span>Instalar en Móvil</span>
          </button>
          
          <button
            id="tab-download-icon"
            type="button"
            onClick={() => setActiveTab('download')}
            className={`flex-1 py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'download'
                ? 'border-amber-700 text-amber-900 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Download className="w-4 h-4 text-amber-700" />
            <span>Descargar Icono PNG</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'install' ? (
            <div className="space-y-4">
              {isInstalled || installSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    ¡Aplicación ya instalada!
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    La app está configurada con acceso directo en tu pantalla de inicio con su icono oficial.
                  </p>
                </div>
              ) : isInstallable ? (
                <div className="space-y-4">
                  <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-4 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div className="text-xs text-stone-700 leading-relaxed">
                      Instala la aplicación en tu teléfono como una App nativa. Funcionará en pantalla completa, más rápida y con acceso directo con el icono oficial de la cueva.
                    </div>
                  </div>

                  <button
                    id="btn-confirm-install-pwa"
                    type="button"
                    onClick={handleInstallClick}
                    disabled={installing}
                    className="w-full py-3 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 active:scale-[0.98] text-white text-sm font-bold shadow-md shadow-amber-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{installing ? 'Instalando...' : 'Instalar ahora en mi móvil'}</span>
                  </button>
                </div>
              ) : isIOS ? (
                /* iOS Safari instructions */
                <div className="space-y-4">
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-amber-700" />
                      Instalación en iPhone / iPad (Safari)
                    </h3>
                    
                    <ol className="space-y-3 text-xs text-stone-700">
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[11px]">
                          1
                        </span>
                        <span>
                          Pulsa el botón <strong>Compartir</strong> en la barra inferior de Safari (<Share className="w-3.5 h-3.5 inline text-blue-600 mx-0.5" />).
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[11px]">
                          2
                        </span>
                        <span>
                          Desplaza el menú hacia abajo y toca en <strong className="inline-flex items-center gap-1 text-stone-900"><PlusSquare className="w-3.5 h-3.5 text-stone-700" /> &quot;Añadir a pantalla de inicio&quot;</strong>.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[11px]">
                          3
                        </span>
                        <span>
                          Pulsa <strong>&quot;Añadir&quot;</strong> arriba a la derecha. El icono quedará guardado en tu pantalla de inicio como una aplicación normal.
                        </span>
                      </li>
                    </ol>
                  </div>
                </div>
              ) : (
                /* Standard Android/Chrome manual guide if prompt was dismissed or desktop */
                <div className="space-y-4">
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-amber-700" />
                      Instalar en Android / Chrome
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      1. Abre el menú de opciones del navegador (los <strong>tres puntos ⋮</strong> en la esquina superior derecha).<br />
                      2. Selecciona <strong>&quot;Instalar aplicación&quot;</strong> o <strong>&quot;Añadir a la pantalla de inicio&quot;</strong>.<br />
                      3. Confirma para colocar el icono en tu pantalla de inicio.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-amber-50/60 rounded-lg border border-amber-200/60 text-xs text-amber-900">
                    <Info className="w-4 h-4 shrink-0 text-amber-700" />
                    <span>También puedes descargar el archivo PNG en la pestaña contigua para configurarlo manualmente.</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Download Tab */
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-stone-50 border border-stone-200 rounded-xl p-3.5">
                <img 
                  src="/pwa-512x512.png" 
                  alt="Icono Cueva Can Marçà 512px" 
                  className="w-16 h-16 rounded-xl border border-stone-300 shadow-sm object-cover bg-stone-950"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-stone-900">
                    Icono Oficial Can Marçà (PNG)
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Formato PNG transparente de alta fidelidad para accesos directos, launchers y widgets móviles.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <a
                  id="btn-download-icon-512"
                  href="/pwa-512x512.png"
                  download="cueva-can-marca-icono-512x512.png"
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold flex items-center justify-between transition-colors shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>Descargar Icono PNG (512 × 512 px)</span>
                  </span>
                  <span className="text-[10px] bg-amber-700/60 px-2 py-0.5 rounded-md font-mono">
                    HD
                  </span>
                </a>

                <a
                  id="btn-download-icon-192"
                  href="/pwa-192x192.png"
                  download="cueva-can-marca-icono-192x192.png"
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-stone-500" />
                    <span>Descargar Icono PNG (192 × 192 px)</span>
                  </span>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-mono">
                    Estándar
                  </span>
                </a>

                <a
                  id="btn-download-apple-icon"
                  href="/apple-touch-icon.png"
                  download="apple-touch-icon.png"
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-stone-500" />
                    <span>Descargar Apple Touch Icon (180 × 180 px)</span>
                  </span>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-mono">
                    iOS
                  </span>
                </a>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-[11px] text-stone-600">
                <p>
                  <strong>Consejo:</strong> En Android o iPhone puedes guardar esta imagen en la galería de fotos y asignarla al crear un acceso directo o mediante atajos de la pantalla de inicio.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] text-stone-500 font-medium">
            Liquidación Cueva de Can Marçà
          </span>
          <button
            id="btn-close-modal-bottom"
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-stone-700 hover:bg-stone-200/70 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
