import React from 'react';
import { type Tournament, type Team } from '../../lib/supabase';

// Interfețele BracketMatch, ViewerBracketMatchCardProps nu mai sunt necesare aici,
// dar le păstrăm în cazul în care se dorește revenirea la implementarea internă.
interface BracketMatch {
  id: string;
  team1_id?: string;
  team2_id?: string;
  round: string;
  match_number: number;
  next_match_id?: string;
}

interface BracketViewProps {
  tournament: Tournament;
  userPicks: { [matchId: string]: string }; // Păstrăm prop-urile, chiar dacă nu sunt folosite direct de iframe
  onPicksChange: (newPicks: { [matchId: string]: string }) => void; // Păstrăm prop-urile
}

export default function BracketView({ tournament, userPicks, onPicksChange }: BracketViewProps) {
  // Logica anterioară de randare a bracket-ului intern a fost eliminată.
  // Acum vom afișa direct iframe-ul.

  return (
    <div className="flex justify-center p-4">
      <iframe
        src="https://loolish.challonge.com/LOLE2Z2/module"
        width="100%"
        height="500"
        frameBorder="0"
        scrolling="auto"
        allowTransparency={true}
        title="Challonge Bracket"
        className="rounded-lg shadow-xl border border-slate-700" // Adăugăm niște stiluri pentru a arăta mai bine
      ></iframe>
    </div>
  );
}