import React, { useMemo } from 'react';
import { FenceSegment, AppSettings, SegmentType } from '../types';

interface FenceCanvasProps {
  segments: FenceSegment[];
  settings: AppSettings;
}

interface Point {
  x: number;
  y: number;
}

interface VisualSegment extends FenceSegment {
  start: Point;
  end: Point;
  angle: number; // Absolute angle in degrees
}

export const FenceCanvas: React.FC<FenceCanvasProps> = ({ segments, settings }) => {
  
  // CALCULATE 2D GEOMETRY
  const { 
    visualSegments, 
    minX, maxX, minY, maxY, 
    totalLength, 
    postHeight, 
    numberOfRails,
    isClosed
  } = useMemo(() => {
    let currentX = 0;
    let currentY = 0;
    let currentHeading = 0; // Degrees, 0 is East
    
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    
    const calculatedSegments: VisualSegment[] = segments.map((seg) => {
      // Apply turn of THIS segment (relative to previous heading)
      currentHeading += seg.turnAngle;
      
      const start = { x: currentX, y: currentY };
      
      // Calculate new position
      // Math.cos takes radians
      const rad = (currentHeading * Math.PI) / 180;
      const dx = seg.effectiveLength * Math.cos(rad);
      const dy = seg.effectiveLength * Math.sin(rad);
      
      currentX += dx;
      currentY += dy;
      const end = { x: currentX, y: currentY };

      // Update bounds
      minX = Math.min(minX, currentX);
      maxX = Math.max(maxX, currentX);
      minY = Math.min(minY, currentY);
      maxY = Math.max(maxY, currentY);

      return {
        ...seg,
        start,
        end,
        angle: currentHeading
      };
    });

    // Auto-detect closed loop (Threshold 0.25m)
    let isClosed = false;
    if (segments.length > 2) {
        const lastEnd = calculatedSegments[calculatedSegments.length - 1].end;
        const dist = Math.sqrt(Math.pow(lastEnd.x, 2) + Math.pow(lastEnd.y, 2));
        if (dist < 0.25) isClosed = true;
    }

    const totalLength = segments.reduce((acc, s) => acc + s.effectiveLength, 0);
    const postHeight = settings.fenceHeight * 1.25;
    const numberOfRails = Math.max(0, Math.floor((settings.fenceHeight - 0.1) / settings.railSpacing) + 1);

    return { 
      visualSegments: calculatedSegments, 
      minX, maxX, minY, maxY, 
      totalLength, 
      postHeight, 
      numberOfRails,
      isClosed
    };
  }, [segments, settings]);

  // SCALING & VIEWBOX
  // Add padding around the bounds
  const paddingMeters = 2;
  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  
  // Ensure a minimum view size
  const viewWidthMeters = Math.max(15, contentWidth + paddingMeters * 2);
  const viewHeightMeters = Math.max(10, contentHeight + paddingMeters * 2);

  // Center the content
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  const viewBoxX = centerX - (viewWidthMeters / 2);
  const viewBoxY = centerY - (viewHeightMeters / 2);

  const pixelsPerMeter = 40; // Base scaling for rendering

  // Colors
  const WOOD_COLOR = "#8B4513"; 
  const WOOD_LIGHT = "#DEB887"; 
  const GATE_COLOR = "#2F4F4F"; 
  const POST_COLOR = "#463020"; 
  const CLOSED_COLOR = "#65a30d"; // Lime-600

  if (segments.length === 0) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center bg-sand-100 rounded-xl border-2 border-dashed border-sand-300 text-sand-500">
        <p className="text-xl font-serif">The kraal is empty.</p>
        <p className="text-sm">Select a direction and add poles to start drawing.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-inner border border-sand-200 overflow-hidden">
      <div className="relative">
          
        {/* --- TOP VIEW CONTAINER --- */}
        <div className="h-[400px] w-full bg-sand-50/50 border-b border-sand-200 relative overflow-hidden cursor-move">
           <div className="absolute top-2 left-4 text-xs font-bold text-sand-500 bg-white/80 px-2 py-1 rounded shadow-sm">TOP VIEW (2D MAP)</div>
           
           <svg 
             width="100%" 
             height="100%"
             viewBox={`${viewBoxX} ${viewBoxY} ${viewWidthMeters} ${viewHeightMeters}`}
             preserveAspectRatio="xMidYMid meet"
           >
              {/* Grid Lines */}
              <defs>
                 <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
                   <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#e5d0a6" strokeWidth="0.05"/>
                 </pattern>
              </defs>
              <rect x={viewBoxX} y={viewBoxY} width={viewWidthMeters} height={viewHeightMeters} fill="url(#grid)" />
              
              {/* Origin Marker */}
              <circle cx={0} cy={0} r={0.3} fill={isClosed ? CLOSED_COLOR : "#e5d0a6"} opacity={isClosed ? 0.5 : 0.5} />

              {/* The Fence Lines */}
              {visualSegments.map((seg) => (
                <g key={`top-${seg.id}`}>
                    <line 
                      x1={seg.start.x} 
                      y1={seg.start.y} 
                      x2={seg.end.x} 
                      y2={seg.end.y}
                      stroke={seg.type === SegmentType.GATE ? GATE_COLOR : WOOD_COLOR}
                      strokeWidth={0.15}
                      strokeLinecap="round"
                    />
                    
                    {/* The Post (Start of segment) */}
                    <circle 
                        cx={seg.start.x} 
                        cy={seg.start.y} 
                        r={0.12} 
                        fill={POST_COLOR} 
                    />

                    {/* Label */}
                    <text 
                        x={(seg.start.x + seg.end.x) / 2} 
                        y={(seg.start.y + seg.end.y) / 2} 
                        textAnchor="middle" 
                        alignmentBaseline="middle"
                        fill="#6b412d"
                        fontSize={0.25}
                        fontWeight="bold"
                        dy={-0.3}
                    >
                        {seg.type === SegmentType.GATE ? 'G' : `${seg.rawLength}`}
                    </text>
                </g>
              ))}

              {/* Final Post */}
               <circle 
                  cx={visualSegments[visualSegments.length-1].end.x} 
                  cy={visualSegments[visualSegments.length-1].end.y} 
                  r={isClosed ? 0.2 : 0.12} 
                  fill={isClosed ? CLOSED_COLOR : POST_COLOR} 
              />

           </svg>
        </div>

        {/* --- ELEVATION VIEW (Unrolled) --- */}
        <div className="h-[200px] w-full bg-white relative overflow-x-auto">
             <div className="absolute top-2 left-4 text-xs font-bold text-sand-500 z-10">ELEVATION VIEW (UNROLLED)</div>
             <svg 
               width={Math.max(800, totalLength * pixelsPerMeter + 100)} 
               height="100%"
               viewBox={`0 0 ${Math.max(20, totalLength + 4)} 5`} 
               preserveAspectRatio="none" 
               className="min-w-full"
            >
                {/* Ground */}
                <rect x={0} y={4} width={Math.max(20, totalLength + 4)} height={1} fill="#e5d0a6" />
                <line x1={0} y1={4} x2={Math.max(20, totalLength + 4)} y2={4} stroke="#bf7d42" strokeWidth={0.05} />

                {/* Render linear segments */}
                {(() => {
                    let currentX = 1; // Start with 1m padding
                    return visualSegments.map((seg) => {
                        const startX = currentX;
                        currentX += seg.effectiveLength;
                        
                        return (
                            <g key={`elev-${seg.id}`}>
                                {/* Post */}
                                <rect 
                                    x={startX - 0.075} // Half width of 150mm post
                                    y={4 - settings.fenceHeight} // Top of fence
                                    width={0.15}
                                    height={postHeight} 
                                    fill={POST_COLOR}
                                />
                                {/* Rails */}
                                {seg.type === SegmentType.STANDARD ? (
                                    Array.from({ length: numberOfRails }).map((_, rIndex) => {
                                        const h = 0.1 + (rIndex * settings.railSpacing);
                                        return (
                                            <rect 
                                                key={`r-${rIndex}`}
                                                x={startX}
                                                y={4 - h - 0.1} 
                                                width={seg.effectiveLength}
                                                height={0.1} 
                                                fill={WOOD_LIGHT}
                                                stroke={WOOD_COLOR}
                                                strokeWidth={0.01}
                                            />
                                        )
                                    })
                                ) : (
                                    <g>
                                        <rect 
                                            x={startX + 0.05}
                                            y={4 - settings.fenceHeight}
                                            width={seg.effectiveLength - 0.1}
                                            height={settings.fenceHeight}
                                            fill="none"
                                            stroke={GATE_COLOR}
                                            strokeWidth={0.05}
                                        />
                                        <line 
                                            x1={startX + 0.05}
                                            y1={4 - settings.fenceHeight}
                                            x2={startX + seg.effectiveLength - 0.05}
                                            y2={4}
                                            stroke={GATE_COLOR}
                                            strokeWidth={0.03}
                                        />
                                    </g>
                                )}
                            </g>
                        );
                    });
                })()}

                {/* Final Post */}
                <rect 
                    x={totalLength + 1 - 0.075}
                    y={4 - settings.fenceHeight}
                    width={0.15}
                    height={postHeight}
                    fill={isClosed ? CLOSED_COLOR : POST_COLOR} // Green post if closed
                />
            </svg>
        </div>
      </div>
    </div>
  );
};