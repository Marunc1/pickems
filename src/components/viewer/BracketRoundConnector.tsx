import React from 'react';

interface BracketRoundConnectorProps {
  roundIndex: number; // 0 for R16->QF, 1 for QF->SF, 2 for SF->Finals
  isLeftBranch: boolean; // True for left side, false for right side
  numMatchesInCurrentRound: number; // Number of matches in the round *before* this connector
  slotHeight: number; // Height of one match slot (card + spacing)
}

export default function BracketRoundConnector({
  roundIndex,
  isLeftBranch,
  numMatchesInCurrentRound,
  slotHeight,
}: BracketRoundConnectorProps) {
  const lineColor = "bg-slate-600";
  const lineWidth = "w-[2px]";
  const horizontalLineLength = "w-8"; // Length of the horizontal segment

  // Calculate the total height needed for the vertical line segment
  // This connector connects pairs of matches.
  // For R16 -> QF, it connects 2 matches. The vertical line spans 1 slot height.
  // For QF -> SF, it connects 2 matches. The vertical line spans 1 slot height.
  // For SF -> Finals, it connects 2 matches. The vertical line spans 1 slot height.
  const verticalLineHeight = slotHeight;

  // Calculate the top offset for the connector to align with the middle of the matches it connects
  let marginTop = 0;
  if (roundIndex === 0) { // R16 -> QF
    marginTop = slotHeight / 2; // Half a slot height
  } else if (roundIndex === 1) { // QF -> SF
    marginTop = slotHeight * 1.5; // One and a half slot heights
  } else if (roundIndex === 2) { // SF -> Finals
    marginTop = slotHeight * 2.5; // Two and a half slot heights
  }

  return (
    <div
      className={`relative flex-shrink-0 ${horizontalLineLength}`} // Give it some width
      style={{ marginTop: `${marginTop}px` }}
    >
      {/* Vertical line */}
      <div className={`absolute top-0 ${isLeftBranch ? 'left-0' : 'right-0'} ${lineWidth} h-[${verticalLineHeight}px] ${lineColor}`}></div>
      {/* Horizontal line from the middle of the vertical line to the next round */}
      <div className={`absolute top-1/2 ${isLeftBranch ? 'left-0' : 'right-0'} ${horizontalLineLength} h-[2px] ${lineColor} transform -translate-y-1/2`}></div>
    </div>
  );
}