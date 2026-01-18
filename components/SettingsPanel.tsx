import React from 'react';
import { X, Sliders } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdate: (newSettings: AppSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdate,
}) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof AppSettings, value: number | boolean | string) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-md bg-sand-50 h-full shadow-2xl flex flex-col border-l-4 border-rust-600 animate-slide-in-right">
        <div className="flex items-center justify-between p-6 bg-sand-200 border-b border-sand-300">
          <div className="flex items-center gap-2">
            <Sliders className="w-6 h-6 text-rust-600" />
            <h2 className="text-xl font-serif font-bold text-sand-900">Forge Parameters</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-sand-300 rounded-full transition-colors text-sand-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Dimensions Section */}
          <section>
            <h3 className="text-lg font-bold text-olive-600 mb-4 border-b border-olive-500/20 pb-2">Dimensions & Structure</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sand-800 mb-1">
                  Fence Height (meters)
                </label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="0.9" 
                    max="2.4" 
                    step="0.1" 
                    value={settings.fenceHeight}
                    onChange={(e) => handleChange('fenceHeight', parseFloat(e.target.value))}
                    className="w-full accent-rust-600 h-2 bg-sand-300 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="font-mono bg-white px-2 py-1 rounded border border-sand-300 min-w-[60px] text-center">
                    {settings.fenceHeight}m
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sand-800 mb-1">
                  Rail Spacing (meters)
                </label>
                <p className="text-xs text-sand-600 mb-2">Determines how many horizontal poles fit in the height.</p>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="0.1" 
                    max="0.6" 
                    step="0.05" 
                    value={settings.railSpacing}
                    onChange={(e) => handleChange('railSpacing', parseFloat(e.target.value))}
                    className="w-full accent-rust-600 h-2 bg-sand-300 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="font-mono bg-white px-2 py-1 rounded border border-sand-300 min-w-[60px] text-center">
                    {settings.railSpacing}m
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sand-800 mb-1">
                  Join Overlap (meters)
                </label>
                <div className="flex items-center gap-4">
                  <input 
                    type="number" 
                    min="0" 
                    max="0.5" 
                    step="0.01" 
                    value={settings.overlap}
                    onChange={(e) => handleChange('overlap', parseFloat(e.target.value))}
                    className="w-full p-2 border border-sand-300 rounded focus:ring-2 focus:ring-rust-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-sand-200">
                <input 
                  type="checkbox"
                  id="closedLoop"
                  checked={settings.isClosedLoop}
                  onChange={(e) => handleChange('isClosedLoop', e.target.checked)}
                  className="w-5 h-5 accent-rust-600"
                />
                <label htmlFor="closedLoop" className="text-sm font-medium text-sand-900 cursor-pointer">
                  Enclosed Structure (Connect last to first)
                </label>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section>
            <h3 className="text-lg font-bold text-olive-600 mb-4 border-b border-olive-500/20 pb-2">Unit Costs & Currency</h3>
            
            <div className="mb-4">
               <label className="block text-xs font-medium text-sand-600 mb-1">Currency Symbol</label>
               <input 
                 type="text"
                 value={settings.currencySymbol}
                 onChange={(e) => handleChange('currencySymbol', e.target.value)}
                 className="w-20 p-2 text-sm border border-sand-300 rounded bg-white focus:ring-2 focus:ring-rust-500"
                 placeholder="$"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Upright Post', key: 'pricePost' },
                { label: 'Gate', key: 'priceGate' },
                { label: '1.8m Pole', key: 'pricePole18' },
                { label: '2.4m Pole', key: 'pricePole24' },
                { label: '3.6m Pole', key: 'pricePole36' },
              ].map((item) => (
                <div key={item.key}>
                  <label className="block text-xs font-medium text-sand-600 mb-1">{item.label}</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-sand-500 font-sans">{settings.currencySymbol}</span>
                    <input 
                      type="number"
                      value={(settings as any)[item.key]}
                      onChange={(e) => handleChange(item.key as keyof AppSettings, parseFloat(e.target.value))}
                      className="w-full pl-8 p-1.5 text-sm border border-sand-300 rounded bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        
        <div className="p-6 bg-sand-200 border-t border-sand-300 text-center text-xs text-sand-600">
          All measurements are metric. Prices are estimates.
        </div>
      </div>
    </div>
  );
};