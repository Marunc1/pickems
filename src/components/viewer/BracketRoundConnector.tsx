import React from 'react';

interface BracketRoundConnectorProps {
  roundIndex: number; // 0 for R16->QF, 1 for QF->SF, 2 for SF->Finals
  isLeftBranch: boolean; // True for left side, false for right side
  slotHeight: number; // Height of one match slot (card + spacing)
  numMatchesInPreviousRound: number; // e.g., 8 for R16, 4 for QF, 2 for SF
}

export default function BracketRoundConnector({
  roundIndex,
  isLeftBranch,
  slotHeight,
  numMatchesInPreviousRound,
}: BracketRoundConnectorProps) {
  const lineColor = "bg-slate-600";
  const lineWidth = "w-[2px]";
  const horizontalLineLength = "w-8"; // Length of the horizontal segment (32px)

  const numConnections = numMatchesInPreviousRound / 2; // Number of pairs being connected

  let connectorColumnMarginTop = 0;
  if (roundIndex === 0) { // R16 -> QF
    connectorColumnMarginTop = slotHeight / 2; // Aligns with the first QF match
  } else if (roundIndex === 1) { // QF -> SF
    connectorColumnMarginTop = slotHeight * 1.5; // Aligns with the first SF match
  } else if (roundIndex === 2) { // SF -> Finals
    connectorColumnMarginTop = slotHeight * 2.5; // Aligns with the Finals match
  }

  const connectors = [];
  for (let i = 0; i < numConnections; i++) {
    connectors.push(
      <div
        key={i}
        className={`relative flex-shrink-0 ${horizontalLineLength}`}
        style={{ height: `${slotHeight * 2}px` }} // Each connector segment takes up 2 match slots
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

  return (
    <div className={`flex flex-col items-center`} style={{ marginTop: `${connectorColumnMarginTop}px` }}>
      {connectors}
    </div>
  );
}