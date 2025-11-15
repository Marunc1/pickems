import React from 'react';

interface BracketRoundConnectorProps {
  isLeftBranch: boolean; // True for left side, false for right side
  slotHeight: number; // Height of one match slot (card + spacing)
}

export default function BracketRoundConnector({
  isLeftBranch,
  slotHeight,
}: BracketRoundConnectorProps) {
  const lineColor = "bg-slate-600";
  const lineWidth = "w-[2px]";
  const horizontalLineLength = "w-8"; // Length of the horizontal segment (32px)

  // This connector will span exactly one 'slotHeight' vertically.
  // It connects the center of two matches to the center of one.

  return (
    <div
      className={`relative flex-shrink-0 ${horizontalLineLength}`}
      style={{ height: `${slotHeight}px` }} // Height is one slotHeight
    >
      {/* Horizontal line from top match (center) */}
      <div
        className={`absolute ${isLeftBranch ? 'left-0' : 'right-0'} ${horizontalLineLength} h-[2px] ${lineColor}`}
        style={{ top: `-1px` }} // Aligns with the top of its container (which is the center of the first match)
      ></div>
      {/* Horizontal line from bottom match (center) */}
      <div
        className={`absolute ${isLeftBranch ? 'left-0' : 'right-0'} ${horizontalLineLength} h-[2px] ${lineColor}`}
        style={{ top: `${slotHeight - 1}px` }} // Aligns with the bottom of its container (which is the center of the second match)
      ></div>

      {/* Vertical line connecting the two horizontal lines */}
      <div
        className={`absolute ${isLeftBranch ? 'left-0' : 'right-0'} ${lineWidth} ${lineColor}`}
        style={{ top: `0px`, height: `${slotHeight}px` }}
      ></div>

      {/* Horizontal line going to the next round's match (center) */}
      <div
        className={`absolute ${isLeftBranch ? 'left-0' : 'right-0'} ${horizontalLineLength} h-[2px] ${lineColor}`}
        style={{ top: `${slotHeight / 2 - 1}px` }} // Middle of the vertical line
      ></div>
    </div>
  );
}