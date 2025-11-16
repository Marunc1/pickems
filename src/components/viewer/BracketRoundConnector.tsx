import React from 'react';

interface BracketRoundConnectorProps {
  verticalSpan: number; // The total vertical distance the connector should span (from center of top match to center of bottom match)
  horizontalLength: number; // The length of the horizontal segment to the next round
}

export default function BracketRoundConnector({
  verticalSpan,
  horizontalLength,
}: BracketRoundConnectorProps) {
  const lineColor = "bg-slate-600";
  const lineWidth = "w-[2px]"; // Vertical line thickness
  
  return (
    <div
      className={`relative flex-shrink-0`}
      style={{ width: `${horizontalLength}px`, height: `${verticalSpan}px` }}
    >
      {/* Vertical line connecting the two matches */}
      <div
        className={`absolute left-0 top-0 ${lineWidth} ${lineColor}`}
        style={{ height: `100%` }} // Spans the full height of its container
      ></div>

      {/* Horizontal line going to the next round's match (from the middle of the vertical line) */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] ${lineColor}`}
      ></div>
    </div>
  );
}