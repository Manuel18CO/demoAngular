export type MatchStage = 'group' | 'round-of-32' | 'round-of-16' | 'quarter' | 'semi' | 'third-place' | 'final';
export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface Match {
  id: string;
  stage: MatchStage;
  group?: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  kickoff: string;
  venue: string;
  city: string;
  status: MatchStatus;
}

export interface StandingRow {
  teamId: string;
  group: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}
