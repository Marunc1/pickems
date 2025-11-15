import { Team, Tournament } from '../lib/supabase';
import { MAX_QUALIFIERS_PER_GROUP } from '../lib/constants';

interface Match {
  id: string;
  team1_id: string;
  team2_id: string;
  team1_score: number;
  team2_score: number;
  winner_id?: string;
  status: 'upcoming' | 'live' | 'completed';
  group: string;
  round: number;
}

export function getQualifiedTeams(teams: Team[], matches: Match[]): Team[] {
  const groupStandings: {
    [groupName: string]: {
      [teamId: string]: {
        team: Team;
        wins: number;
        losses: number;
        draws: number;
        scoreFor: number;
        scoreAgainst: number;
        scoreDiff: number;
        points: number;
      };
    };
  } = {};

  // Initialize standings for all teams in their respective groups
  teams.forEach(team => {
    if (team.group) {
      if (!groupStandings[team.group]) {
        groupStandings[team.group] = {};
      }
      groupStandings[team.group][team.id] = {
        team,
        wins: 0,
        losses: 0,
        draws: 0,
        scoreFor: 0,
        scoreAgainst: 0,
        scoreDiff: 0,
        points: 0,
      };
    }
  });

  // Process completed matches
  matches.filter(m => m.status === 'completed').forEach(match => {
    const team1Standing = groupStandings[match.group]?.[match.team1_id];
    const team2Standing = groupStandings[match.group]?.[match.team2_id];

    if (!team1Standing || !team2Standing) return; // Skip if teams not found in standings

    team1Standing.scoreFor += match.team1_score;
    team1Standing.scoreAgainst += match.team2_score;
    team1Standing.scoreDiff = team1Standing.scoreFor - team1Standing.scoreAgainst;

    team2Standing.scoreFor += match.team2_score;
    team2Standing.scoreAgainst += match.team1_score;
    team2Standing.scoreDiff = team2Standing.scoreFor - team2Standing.scoreAgainst;

    if (match.team1_score > match.team2_score) {
      team1Standing.wins++;
      team2Standing.losses++;
      team1Standing.points += 3; // 3 points for a win
    } else if (match.team2_score > match.team1_score) {
      team2Standing.wins++;
      team1Standing.losses++;
      team2Standing.points += 3;
    } else {
      team1Standing.draws++;
      team2Standing.draws++;
      team1Standing.points += 1; // 1 point for a draw
      team2Standing.points += 1;
    }
  });

  const qualifiedTeams: Team[] = [];

  // Determine qualifiers for each group
  for (const groupName in groupStandings) {
    const teamsInGroup = Object.values(groupStandings[groupName]);

    // Sort teams by points, then wins, then score difference
    teamsInGroup.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.scoreDiff - a.scoreDiff;
    });

    // Take the top MAX_QUALIFIERS_PER_GROUP teams
    for (let i = 0; i < Math.min(teamsInGroup.length, MAX_QUALIFIERS_PER_GROUP); i++) {
      qualifiedTeams.push(teamsInGroup[i].team);
    }
  }

  return qualifiedTeams;
}