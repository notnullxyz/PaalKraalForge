import React, { useState } from 'react';
import { Settings, RefreshCcw, Undo2, Plus, ArrowRight } from 'lucide-react';
import { AppSettings, FenceSegment, PoleLength, SegmentType } from './types';
import { DEFAULT_SETTINGS, POLE_OPTIONS, GATE_WIDTH } from './constants';
import { SettingsPanel } from './components/SettingsPanel';
import { FenceCanvas } from './components/FenceCanvas';
import { TotalsPanel } from './components/TotalsPanel';

function App() {
  const [segments, setSegments] = useState<FenceSegment[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Core Logic: Adding a segment
  const addSegment = (length: PoleLength | 'GATE') => {
    const newSegment: FenceSegment = {
      id: Math.random().toString(36).substr(2, 9),
      type: length === 'GATE' ? SegmentType.GATE : SegmentType.STANDARD,
      rawLength: length === 'GATE' ? GATE_WIDTH : length,
      // For standard poles, effective length is raw - overlap. For gate, it's fixed width.
      effectiveLength: length === 'GATE' ? GATE_WIDTH : (length - settings.overlap),
    };

    setSegments([...segments, newSegment]);
  };

  const removeLastSegment = () => {
    setSegments(prev => prev.slice(0, -1));
  };

  const resetForge = () => {
    if (window.confirm("Are you sure you want to clear your design?")) {
      setSegments([]);
    }
  };

  // Re-calculate effective lengths if overlap setting changes
  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    // If overlap changed, update existing segments
    if (newSettings.overlap !== settings.overlap) {
       setSegments(prev => prev.map(seg => ({
         ...seg,
         effectiveLength: seg.type === SegmentType.GATE 
           ? GATE_WIDTH 
           : (seg.rawLength - newSettings.overlap)
       })));
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-sand-900 bg-sand-50">
      
      {/* HEADER */}
      <header className="bg-sand-800 text-sand-50 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rust-600 rounded-lg flex items-center justify-center border-2 border-sand-400">
               <span className="font-serif font-bold text-2xl">P</span>
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-wide">PaalKraalForge</h1>
              <p className="text-xs text-sand-300 uppercase tracking-widest">Precision Farm Fencing</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sand-700 hover:bg-sand-600 rounded-lg transition-colors border border-sand-600"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Tuning</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
        
        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-sand-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-bold text-sand-500 uppercase tracking-wider py-2 mr-2 self-center">Add Section:</span>
            
            {POLE_OPTIONS.map((len) => (
              <button
                key={len}
                onClick={() => addSegment(len as PoleLength)}
                className="flex items-center gap-2 px-4 py-2 bg-olive-600 hover:bg-olive-500 text-white rounded shadow-sm active:transform active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                {len}m Pole
              </button>
            ))}
            
            <button
              onClick={() => addSegment('GATE')}
              className="flex items-center gap-2 px-4 py-2 bg-rust-600 hover:bg-rust-500 text-white rounded shadow-sm active:transform active:scale-95 transition-all ml-2"
            >
              <div className="w-4 h-4 border-2 border-white/80 rounded-sm"></div>
              Gate (1m)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={removeLastSegment}
              disabled={segments.length === 0}
              className="p-2 text-sand-600 hover:text-rust-600 hover:bg-sand-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo Last"
            >
              <Undo2 className="w-6 h-6" />
            </button>
            <button
              onClick={resetForge}
              disabled={segments.length === 0}
              className="p-2 text-sand-600 hover:text-red-600 hover:bg-sand-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Reset All"
            >
              <RefreshCcw className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Canvas Visualizer */}
        <FenceCanvas segments={segments} settings={settings} />

        {/* Info Cards / Totals */}
        <TotalsPanel segments={segments} settings={settings} />

        {/* Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-sand-700">
            <div className="bg-sand-100 p-4 rounded-lg border border-sand-200">
                <h4 className="font-bold text-olive-600 mb-2">1. Layout</h4>
                <p>Click the pole buttons to add sections to your fence line. The visualizer shows a simplified schematic view.</p>
            </div>
            <div className="bg-sand-100 p-4 rounded-lg border border-sand-200">
                <h4 className="font-bold text-olive-600 mb-2">2. Tuning</h4>
                <p>Use the settings menu (top right) to adjust fence height, rail spacing, overlap allowance, and material costs.</p>
            </div>
            <div className="bg-sand-100 p-4 rounded-lg border border-sand-200">
                <h4 className="font-bold text-olive-600 mb-2">3. Logic & Shapes</h4>
                <p>The material calculation is based on total perimeter. Corners are treated as standard posts, so a linear design accurately estimates materials for L, U, or square shapes.</p>
            </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-sand-900 text-sand-300 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-serif mb-2">Designed for Arid-Forge Farms</p>
          <a 
            href="https://arid-forge.online" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-rust-500 hover:text-rust-400 transition-colors text-sm"
          >
            Visit arid-forge.online <ArrowRight className="w-3 h-3" />
          </a>
          <p className="text-xs text-sand-600 mt-4">&copy; {new Date().getFullYear()} PaalKraalForge. All rights reserved.</p>
        </div>
      </footer>

      {/* MODALS */}
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onUpdate={updateSettings}
      />

    </div>
  );
}

export default App;