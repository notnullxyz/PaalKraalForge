import React, { useMemo } from 'react';
import { FenceSegment, AppSettings, SegmentType } from '../types';

interface FenceCanvasProps {
  segments: FenceSegment[];
  settings: AppSettings;
}

export const FenceCanvas: React.FC<FenceCanvasProps> = ({ segments, settings }) => {
  
  // Calculate visual data
  const { totalLength, postHeight, visualSegments, numberOfRails } = useMemo(() => {
    const totalLength = segments.reduce((acc, s) => acc + s.effectiveLength, 0);
    const postHeight = settings.fenceHeight * 1.25;
    
    // Calculate rails based on bottom-up logic (start 10cm from ground)
    // Formula matches TotalsPanel logic
    const numberOfRails = Math.max(0, Math.floor((settings.fenceHeight - 0.1) / settings.railSpacing) + 1);
    
    // Generate simple linear layout for visualization
    let currentX = 0;
    const visualSegments = segments.map((seg) => {
      const start = currentX;
      currentX += seg.effectiveLength;
      return {
        ...seg,
        startX: start,
        endX: currentX
      };
    });

    return { totalLength, postHeight, visualSegments, numberOfRails };
  }, [segments, settings]);

  // SVG Scaling
  const padding = 2; // meters visual padding
  const totalViewWidth = Math.max(10, totalLength + padding * 2);
  const totalViewHeight = Math.max(4, postHeight + 3); // Enough for top down + elevation

  const pixelsPerMeter = 60; // Scaling factor
  const viewBoxWidth = totalViewWidth * pixelsPerMeter;
  const viewBoxHeight = totalViewHeight * pixelsPerMeter;

  // Colors
  const WOOD_COLOR = "#8B4513"; // SaddleBrown
  const WOOD_LIGHT = "#DEB887"; // Burlywood
  const GATE_COLOR = "#2F4F4F"; // DarkSlateGray
  const POST_COLOR = "#463020"; 

  if (segments.length === 0) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center bg-sand-100 rounded-xl border-2 border-dashed border-sand-300 text-sand-500">
        <p className="text-xl font-serif">The kraal is empty.</p>
        <p className="text-sm">Add poles below to start designing.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow-inner border border-sand-200 p-4">
      <svg 
        width="100%" 
        height={500}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto"
      >
        <defs>
          <pattern id="woodGrain" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#a0522d" strokeWidth="1" opacity="0.5"/>
          </pattern>
        </defs>

        {/* --- TOP DOWN VIEW (Schematic Layout) --- */}
        <g transform={`translate(${padding * pixelsPerMeter}, 50)`}>
          <text x={0} y={-20} className="text-sm font-bold fill-sand-700" style={{ fontSize: '14px' }}>TOP VIEW (Unfolded / Schematic)</text>
          
          {/* Ground Line */}
          <line 
            x1={-20} 
            y1={0} 
            x2={totalLength * pixelsPerMeter + 20} 
            y2={0} 
            stroke="#e5d0a6" 
            strokeWidth="40" 
            strokeLinecap="round"
          />

          {visualSegments.map((seg, i) => (
            <g key={`top-${seg.id}`}>
              {/* The Section Line */}
              <rect 
                x={seg.startX * pixelsPerMeter}
                y={-5}
                width={seg.effectiveLength * pixelsPerMeter}
                height={10}
                fill={seg.type === SegmentType.GATE ? GATE_COLOR : WOOD_COLOR}
                rx={2}
              />
              
              {/* Connection Post (Start of section) */}
              <circle 
                cx={seg.startX * pixelsPerMeter} 
                cy={0} 
                r={6} 
                fill={POST_COLOR} 
              />
              
              {/* Length Label */}
              <text 
                x={(seg.startX + seg.effectiveLength / 2) * pixelsPerMeter} 
                y={-15} 
                textAnchor="middle" 
                className="text-xs fill-sand-800"
                style={{ fontSize: '10px' }}
              >
                {seg.type === SegmentType.GATE ? 'GATE' : `${seg.rawLength}m`}
              </text>
            </g>
          ))}
          {/* Final Post */}
           <circle 
            cx={totalLength * pixelsPerMeter} 
            cy={0} 
            r={6} 
            fill={POST_COLOR} 
          />
        </g>

        {/* --- ELEVATION VIEW (Side Profile) --- */}
        <g transform={`translate(${padding * pixelsPerMeter}, ${250})`}>
          <text x={0} y={-settings.fenceHeight * 1.5 * pixelsPerMeter} className="text-sm font-bold fill-sand-700" style={{ fontSize: '14px' }}>ELEVATION VIEW (Side)</text>

          {/* Ground */}
          <rect x={-50} y={0} width={viewBoxWidth} height={20} fill="#e5d0a6" />

          {visualSegments.map((seg, i) => (
            <g key={`side-${seg.id}`}>
               {/* UPRIGHT POST (Left side of segment) */}
               {/* Post needs to go DOWN into ground and UP to height */}
               <rect 
                x={(seg.startX * pixelsPerMeter) - 4}
                y={-(postHeight * pixelsPerMeter) + (postHeight - settings.fenceHeight) * pixelsPerMeter} // Start at top
                width={8}
                height={postHeight * pixelsPerMeter}
                fill={POST_COLOR}
              />

              {/* Rails */}
              {seg.type === SegmentType.STANDARD ? (
                Array.from({ length: numberOfRails }).map((_, rIndex) => {
                  // Bottom-Up Rendering
                  // rIndex 0 is the lowest rail
                  // Start 0.1m (10cm) from ground
                  const heightFromGround = 0.1 + (rIndex * settings.railSpacing);
                  
                  // yPos calculation:
                  // Ground is 0. Up is negative.
                  // We position the rect so its bottom is at heightFromGround
                  // The rect height is 6px.
                  const yPos = -(heightFromGround * pixelsPerMeter) - 6; 
                  
                  return (
                    <rect 
                      key={`rail-${rIndex}`}
                      x={seg.startX * pixelsPerMeter}
                      y={yPos}
                      width={seg.effectiveLength * pixelsPerMeter}
                      height={6} // Thickness of rail
                      fill={WOOD_LIGHT}
                      stroke={WOOD_COLOR}
                      strokeWidth={1}
                    />
                  );
                })
              ) : (
                // Draw Gate Graphic
                <g>
                  <rect 
                     x={(seg.startX * pixelsPerMeter) + 5}
                     y={-(settings.fenceHeight * pixelsPerMeter)}
                     width={(seg.effectiveLength * pixelsPerMeter) - 10}
                     height={settings.fenceHeight * pixelsPerMeter}
                     fill="none"
                     stroke={GATE_COLOR}
                     strokeWidth={3}
                  />
                  {/* Gate Cross brace */}
                  <line 
                     x1={(seg.startX * pixelsPerMeter) + 5}
                     y1={-(settings.fenceHeight * pixelsPerMeter)}
                     x2={(seg.startX + seg.effectiveLength) * pixelsPerMeter - 5}
                     y2={0}
                     stroke={GATE_COLOR}
                     strokeWidth={2}
                  />
                </g>
              )}
            </g>
          ))}

          {/* Final End Post */}
           <rect 
                x={(totalLength * pixelsPerMeter) - 4}
                y={-(postHeight * pixelsPerMeter) + (postHeight - settings.fenceHeight) * pixelsPerMeter}
                width={8}
                height={postHeight * pixelsPerMeter}
                fill={POST_COLOR}
            />

            {/* Depth Marker Line (Bury line) */}
            <line 
              x1={-20}
              y1={0}
              x2={totalLength * pixelsPerMeter + 20}
              y2={0}
              stroke="#844e32"
              strokeDasharray="5,5"
              strokeWidth={2}
            />
            <text x={-40} y={5} className="fill-rust-600 text-xs" style={{fontSize: '10px'}}>Ground Level</text>
        </g>
      </svg>
    </div>
  );
};