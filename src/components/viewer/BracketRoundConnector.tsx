import React from 'react';

interface BracketRoundConnectorProps {
  isLeftBranch: boolean;
  slotHeight: number; // Height of one match slot (card + spacing)
}

export default function BracketRoundConnector({
  isLeftBranch,
  slotHeight,
}: BracketRoundConnectorProps) {
  const lineColor = "bg-slate-600";
  const lineWidth = "w-[2px]";
  const horizontalLineLength = "w-8"; // Length of the horizontal segment (32px)

  return (
    <div
      className={`relative flex-shrink-0 ${horizontalLineLength}`}
      style={{ height: `${slotHeight * 2}px` }} // Spans two match slots vertically
    >
      {/* Horizontal line from top match */}
      <div
        className={`absolute ${isLeftBranch ? 'left-0' : 'right-0'} ${horizontalLineLength} h-[2px] ${lineColor}`}
        style={{ top: `${slotHeight / 2 - 1}px` }} // -1px to center with 2px line
      ></div>
      {/* Horizontal line from bottom match */}
      <div
        className={`absolute ${isLeftBranch ? 'left-0' : 'right-0'} ${horizontalLineLength} h-[2px] ${lineColor}`}
        style={{ top: `${slotHeight * 1.5 - 1}px` }} // -1px to center with 2px line
      ></div>

      {/* Vertical line connecting the two horizontal lines */}
      <div
        className={`absolute ${isLeftBranch ? 'left-0' : 'right-0'} ${lineWidth} ${lineColor}`}
        style={{ top: `${slotHeight / 2}px`, height: `${slotHeight}px` }}
      ></div>

      {/* Horizontal line going to the next round's match */}
      <div
        className={`absolute ${isLeftBranch ? 'left-0' : 'right-0'} ${horizontalLineLength} h-[2px] ${lineColor}`}
        style={{ top: `${slotHeight - 1}px` }} // -1px to center with 2px line
      ></div>
    </div>
  );
}