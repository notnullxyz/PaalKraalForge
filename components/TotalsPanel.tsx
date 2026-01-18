import React from 'react';
import { FenceSegment, AppSettings, SegmentType } from '../types';

interface TotalsPanelProps {
  segments: FenceSegment[];
  settings: AppSettings;
}

export const TotalsPanel: React.FC<TotalsPanelProps> = ({ segments, settings }) => {
  
  const calculateTotals = () => {
    let totalLength = 0;
    let pole18 = 0;
    let pole24 = 0;
    let pole36 = 0;
    let gates = 0;
    
    // Geometry check for Closed Loop (Auto-detect)
    let currentX = 0;
    let currentY = 0;
    let currentHeading = 0;
    
    segments.forEach(seg => {
      // Length Counts
      totalLength += seg.effectiveLength;
      if (seg.type === SegmentType.GATE) {
        gates++;
      } else {
        if (seg.rawLength === 1.8) pole18++;
        else if (seg.rawLength === 2.4) pole24++;
        else if (seg.rawLength === 3.6) pole36++;
      }

      // Geometry Calc
      currentHeading += seg.turnAngle;
      const rad = (currentHeading * Math.PI) / 180;
      currentX += seg.effectiveLength * Math.cos(rad);
      currentY += seg.effectiveLength * Math.sin(rad);
    });

    // Determine if closed (Start 0,0 vs End X,Y)
    // Distance threshold: 25cm (allows for slight misalignment in large manual loops)
    const distanceToStart = Math.sqrt(currentX * currentX + currentY * currentY);
    const isClosedLoop = segments.length > 2 && distanceToStart < 0.25;

    // Calculate Posts
    // If closed loop, posts = segments. If open line, posts = segments + 1
    const totalPosts = segments.length > 0 
      ? segments.length + (isClosedLoop ? 0 : 1)
      : 0;

    // Calculate Rails (Split Poles)
    const railsPerSection = Math.max(0, Math.floor((settings.fenceHeight - 0.1) / settings.railSpacing) + 1);
    
    const totalPole18 = pole18 * railsPerSection;
    const totalPole24 = pole24 * railsPerSection;
    const totalPole36 = pole36 * railsPerSection;

    // Cost Calculation
    const costPosts = totalPosts * settings.pricePost;
    const costGates = gates * settings.priceGate;
    const costPoles = (totalPole18 * settings.pricePole18) + 
                      (totalPole24 * settings.pricePole24) + 
                      (totalPole36 * settings.pricePole36);
    
    const totalCost = costPosts + costGates + costPoles;

    return {
      totalLength,
      totalPosts,
      railsPerSection,
      totalPole18,
      totalPole24,
      totalPole36,
      gates,
      totalCost,
      postHeight: settings.fenceHeight * 1.25,
      isClosedLoop
    };
  };

  const stats = calculateTotals();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-sand-200 overflow-hidden">
      <div className="bg-sand-200 p-4 border-b border-sand-300 flex justify-between items-center">
        <h3 className="text-lg font-serif font-bold text-sand-900">Material Bill</h3>
        {stats.isClosedLoop && (
          <span className="text-xs font-bold text-white bg-olive-600 px-2 py-1 rounded-full flex items-center gap-1">
             ✓ Loop Closed
          </span>
        )}
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Dimensions Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase text-olive-600 tracking-wider">Dimensions</h4>
          <div className="flex justify-between text-sm">
            <span className="text-sand-600">Total Length:</span>
            <span className="font-bold text-sand-900">{stats.totalLength.toFixed(2)}m</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-sand-600">Fence Height:</span>
            <span className="font-bold text-sand-900">{settings.fenceHeight.toFixed(2)}m</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-sand-600">Post Height (Rec):</span>
            <span className="font-bold text-sand-900">{stats.postHeight.toFixed(2)}m</span>
          </div>
        </div>

        {/* Posts & Structure */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase text-olive-600 tracking-wider">Structure</h4>
           <div className="flex justify-between text-sm">
            <span className="text-sand-600">Upright Posts:</span>
            <span className="font-bold text-sand-900">{stats.totalPosts}</span>
          </div>
           <div className="flex justify-between text-sm">
            <span className="text-sand-600">Gates (1.0m):</span>
            <span className="font-bold text-sand-900">{stats.gates}</span>
          </div>
           <div className="flex justify-between text-sm">
            <span className="text-sand-600">Rails High:</span>
            <span className="font-bold text-sand-900">{stats.railsPerSection}</span>
          </div>
        </div>

        {/* Rails Required */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase text-olive-600 tracking-wider">Poles Required</h4>
          {stats.totalPole18 > 0 && (
             <div className="flex justify-between text-sm">
              <span className="text-sand-600">1.8m Poles:</span>
              <span className="font-bold text-sand-900">{stats.totalPole18}</span>
            </div>
          )}
          {stats.totalPole24 > 0 && (
             <div className="flex justify-between text-sm">
              <span className="text-sand-600">2.4m Poles:</span>
              <span className="font-bold text-sand-900">{stats.totalPole24}</span>
            </div>
          )}
          {stats.totalPole36 > 0 && (
             <div className="flex justify-between text-sm">
              <span className="text-sand-600">3.6m Poles:</span>
              <span className="font-bold text-sand-900">{stats.totalPole36}</span>
            </div>
          )}
          {stats.totalPole18 === 0 && stats.totalPole24 === 0 && stats.totalPole36 === 0 && (
            <span className="text-xs text-sand-400 italic">No rails added yet</span>
          )}
        </div>

        {/* Cost Estimation */}
        <div className="space-y-2 border-t md:border-t-0 md:border-l border-sand-200 md:pl-6 pt-4 md:pt-0">
          <h4 className="text-xs font-bold uppercase text-rust-600 tracking-wider">Estimated Cost</h4>
          <div className="text-3xl font-serif font-bold text-rust-600">
            {settings.currencySymbol}{stats.totalCost.toLocaleString()}
          </div>
           <p className="text-[10px] text-sand-500 leading-tight">
             Includes posts, rails, and gates.
           </p>
        </div>

      </div>
    </div>
  );
};