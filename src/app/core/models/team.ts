export interface Team {
  id: string;
  name: string;
  code: string;
  flag: string;
  confederation: 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC';
  group: string;
  fifaRank: number;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  number: number;
  age: number;
  club: string;
}
