import React, { useState } from 'react';
import { Settings, RefreshCcw, Undo2, Plus, ArrowRight, CornerUpLeft, CornerUpRight, MoveUp } from 'lucide-react';
import { AppSettings, FenceSegment, PoleLength, SegmentType } from './types';
import { DEFAULT_SETTINGS, POLE_OPTIONS, GATE_WIDTH } from './constants';
import { SettingsPanel } from './components/SettingsPanel';
import { FenceCanvas } from './components/FenceCanvas';
import { TotalsPanel } from './components/TotalsPanel';

function App() {
  const [segments, setSegments] = useState<FenceSegment[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [nextTurn, setNextTurn] = useState<number>(0);

  // Core Logic: Adding a segment
  const addSegment = (length: PoleLength | 'GATE') => {
    const newSegment: FenceSegment = {
      id: Math.random().toString(36).substr(2, 9),
      type: length === 'GATE' ? SegmentType.GATE : SegmentType.STANDARD,
      rawLength: length === 'GATE' ? GATE_WIDTH : length,
      // For standard poles, effective length is raw - overlap. For gate, it's fixed width.
      effectiveLength: length === 'GATE' ? GATE_WIDTH : (length - settings.overlap),
      turnAngle: nextTurn,
    };

    setSegments([...segments, newSegment]);
    // Optional: Reset turn to straight after adding? 
    // setNextTurn(0); 
    // Keeping it sticky might be better for drawing regular shapes (e.g. octagon)
  };

  const removeLastSegment = () => {
    setSegments(prev => prev.slice(0, -1));
  };

  const resetForge = () => {
    if (window.confirm("Are you sure you want to clear your design?")) {
      setSegments([]);
      setNextTurn(0);
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-sand-200 flex flex-col gap-6">
          
          {/* Top Row: Orientation Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-sand-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-olive-600 uppercase tracking-wider">Next Angle:</span>
              <div className="flex bg-sand-100 p-1 rounded-lg">
                {[
                  { label: '-90°', val: -90, icon: <CornerUpLeft className="w-4 h-4" /> },
                  { label: '-45°', val: -45, icon: <CornerUpLeft className="w-4 h-4 rotate-45" /> },
                  { label: '0°', val: 0, icon: <MoveUp className="w-4 h-4" /> },
                  { label: '+45°', val: 45, icon: <CornerUpRight className="w-4 h-4 -rotate-45" /> },
                  { label: '+90°', val: 90, icon: <CornerUpRight className="w-4 h-4" /> },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => setNextTurn(opt.val)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-all ${
                      nextTurn === opt.val 
                        ? 'bg-rust-600 text-white shadow-sm' 
                        : 'text-sand-600 hover:bg-sand-200 hover:text-sand-900'
                    }`}
                    title={`Turn ${opt.val}°`}
                  >
                    {opt.icon}
                    <span className="hidden sm:inline">{Math.abs(opt.val)}°</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
               <button
                onClick={removeLastSegment}
                disabled={segments.length === 0}
                className="p-2 text-sand-600 hover:text-rust-600 hover:bg-sand-100 rounded disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-sand-300"
                title="Undo Last"
              >
                <Undo2 className="w-5 h-5" />
              </button>
              <button
                onClick={resetForge}
                disabled={segments.length === 0}
                className="p-2 text-sand-600 hover:text-red-600 hover:bg-sand-100 rounded disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-sand-300"
                title="Reset All"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Add Poles */}
          <div className="flex flex-wrap gap-3 items-center">
             <span className="text-xs font-bold text-olive-600 uppercase tracking-wider mr-2">Add Section:</span>
             {POLE_OPTIONS.map((len) => (
              <button
                key={len}
                onClick={() => addSegment(len as PoleLength)}
                className="flex items-center gap-2 px-5 py-3 bg-olive-600 hover:bg-olive-500 text-white rounded-lg shadow-sm active:transform active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="font-bold">{len}m</span>
              </button>
            ))}
            
            <button
              onClick={() => addSegment('GATE')}
              className="flex items-center gap-2 px-5 py-3 bg-rust-600 hover:bg-rust-500 text-white rounded-lg shadow-sm active:transform active:scale-95 transition-all ml-2"
            >
              <div className="w-4 h-4 border-2 border-white/80 rounded-sm"></div>
              <span className="font-bold">Gate (1m)</span>
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
                <h4 className="font-bold text-olive-600 mb-2">1. Orientation</h4>
                <p>Select your turn angle (Straight, 45°, 90°) <strong>before</strong> adding a pole to shape your kraal. Negative angles turn left, positive turn right.</p>
            </div>
            <div className="bg-sand-100 p-4 rounded-lg border border-sand-200">
                <h4 className="font-bold text-olive-600 mb-2">2. Structure</h4>
                <p>Add poles and gates. The design is now 2D. If the loop doesn't close perfectly, the "Gap" will be shown in red.</p>
            </div>
            <div className="bg-sand-100 p-4 rounded-lg border border-sand-200">
                <h4 className="font-bold text-olive-600 mb-2">3. Vertical Layout</h4>
                <p>The elevation view (below the map) shows the vertical construction details, which remain constant regardless of the 2D shape.</p>
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