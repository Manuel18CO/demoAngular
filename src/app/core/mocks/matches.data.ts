import { Match, MatchStage, MatchStatus } from '../models/match';
import { TEAMS } from './teams.data';

type Fixture = {
  id: string;
  group: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoff: string;
  venue: string;
  city: string;
  score: [number, number];
  live?: [number, number];
};

const f = (
  id: string,
  group: string,
  homeTeamId: string,
  awayTeamId: string,
  kickoff: string,
  venue: string,
  city: string,
  score: [number, number],
  live?: [number, number],
): Fixture => ({ id, group, homeTeamId, awayTeamId, kickoff, venue, city, score, live });

const FIXTURES: Fixture[] = [
  f('wc-A-1', 'A', 'mex', 'rsa', '2026-06-11T18:00:00Z', 'Estadio Azteca',           'Ciudad de México',          [2, 0]),
  f('wc-A-2', 'A', 'kor', 'cze', '2026-06-11T21:00:00Z', 'Estadio BBVA',             'Monterrey',                 [2, 1]),
  f('wc-A-3', 'A', 'mex', 'kor', '2026-06-17T19:00:00Z', 'Estadio Akron',            'Guadalajara',               [1, 1], [0, 1]),
  f('wc-A-4', 'A', 'rsa', 'cze', '2026-06-17T22:00:00Z', 'Estadio Azteca',           'Ciudad de México',          [0, 2]),
  f('wc-A-5', 'A', 'mex', 'cze', '2026-06-23T20:00:00Z', 'Estadio Azteca',           'Ciudad de México',          [2, 1]),
  f('wc-A-6', 'A', 'rsa', 'kor', '2026-06-23T20:00:00Z', 'Estadio BBVA',             'Monterrey',                 [1, 2]),

  f('wc-B-1', 'B', 'can', 'bih', '2026-06-12T19:00:00Z', 'BMO Field',                'Toronto',                   [1, 1]),
  f('wc-B-2', 'B', 'sui', 'qat', '2026-06-13T16:00:00Z', 'BC Place',                 'Vancouver',                 [1, 1]),
  f('wc-B-3', 'B', 'can', 'qat', '2026-06-18T19:00:00Z', 'BMO Field',                'Toronto',                   [2, 0]),
  f('wc-B-4', 'B', 'bih', 'sui', '2026-06-18T22:00:00Z', 'BC Place',                 'Vancouver',                 [0, 1]),
  f('wc-B-5', 'B', 'can', 'sui', '2026-06-24T20:00:00Z', 'BMO Field',                'Toronto',                   [1, 1]),
  f('wc-B-6', 'B', 'bih', 'qat', '2026-06-24T20:00:00Z', 'BC Place',                 'Vancouver',                 [2, 1]),

  f('wc-C-1', 'C', 'bra', 'mar', '2026-06-13T19:00:00Z', 'Mercedes-Benz Stadium',    'Atlanta',                   [1, 1]),
  f('wc-C-2', 'C', 'sco', 'hai', '2026-06-13T22:00:00Z', 'Hard Rock Stadium',        'Miami',                     [1, 0]),
  f('wc-C-3', 'C', 'bra', 'hai', '2026-06-19T19:00:00Z', 'Mercedes-Benz Stadium',    'Atlanta',                   [3, 0]),
  f('wc-C-4', 'C', 'mar', 'sco', '2026-06-19T22:00:00Z', 'Hard Rock Stadium',        'Miami',                     [1, 1]),
  f('wc-C-5', 'C', 'bra', 'sco', '2026-06-25T20:00:00Z', 'Mercedes-Benz Stadium',    'Atlanta',                   [2, 0]),
  f('wc-C-6', 'C', 'mar', 'hai', '2026-06-25T20:00:00Z', 'Hard Rock Stadium',        'Miami',                     [3, 1]),

  f('wc-D-1', 'D', 'usa', 'par', '2026-06-12T22:00:00Z', 'SoFi Stadium',             'Los Ángeles',               [4, 1]),
  f('wc-D-2', 'D', 'aus', 'tur', '2026-06-13T01:00:00Z', 'NRG Stadium',              'Houston',                   [1, 2]),
  f('wc-D-3', 'D', 'usa', 'aus', '2026-06-18T22:00:00Z', 'Lumen Field',              'Seattle',                   [2, 1]),
  f('wc-D-4', 'D', 'par', 'tur', '2026-06-19T01:00:00Z', 'NRG Stadium',              'Houston',                   [1, 2]),
  f('wc-D-5', 'D', 'usa', 'tur', '2026-06-24T20:00:00Z', 'SoFi Stadium',             'Los Ángeles',               [1, 1]),
  f('wc-D-6', 'D', 'par', 'aus', '2026-06-24T20:00:00Z', 'Lumen Field',              'Seattle',                   [0, 1]),

  f('wc-E-1', 'E', 'ger', 'cuw', '2026-06-13T19:00:00Z', 'Lincoln Financial Field',  'Filadelfia',                [5, 0]),
  f('wc-E-2', 'E', 'civ', 'ecu', '2026-06-13T22:00:00Z', 'AT&T Stadium',             'Dallas',                    [1, 1]),
  f('wc-E-3', 'E', 'ger', 'civ', '2026-06-19T19:00:00Z', 'Lincoln Financial Field',  'Filadelfia',                [2, 1]),
  f('wc-E-4', 'E', 'cuw', 'ecu', '2026-06-19T22:00:00Z', 'AT&T Stadium',             'Dallas',                    [0, 3]),
  f('wc-E-5', 'E', 'ger', 'ecu', '2026-06-25T20:00:00Z', 'Lincoln Financial Field',  'Filadelfia',                [2, 1]),
  f('wc-E-6', 'E', 'cuw', 'civ', '2026-06-25T20:00:00Z', 'AT&T Stadium',             'Dallas',                    [0, 2]),

  f('wc-F-1', 'F', 'ned', 'jpn', '2026-06-14T19:00:00Z', 'MetLife Stadium',          'Nueva York / Nueva Jersey', [2, 1]),
  f('wc-F-2', 'F', 'swe', 'tun', '2026-06-14T22:00:00Z', 'Arrowhead Stadium',        'Kansas City',               [2, 0]),
  f('wc-F-3', 'F', 'ned', 'swe', '2026-06-20T19:00:00Z', 'MetLife Stadium',          'Nueva York / Nueva Jersey', [1, 1]),
  f('wc-F-4', 'F', 'jpn', 'tun', '2026-06-20T22:00:00Z', 'Arrowhead Stadium',        'Kansas City',               [2, 1]),
  f('wc-F-5', 'F', 'ned', 'tun', '2026-06-26T20:00:00Z', 'MetLife Stadium',          'Nueva York / Nueva Jersey', [3, 0]),
  f('wc-F-6', 'F', 'jpn', 'swe', '2026-06-26T20:00:00Z', 'Arrowhead Stadium',        'Kansas City',               [1, 2]),

  f('wc-G-1', 'G', 'bel', 'egy', '2026-06-15T19:00:00Z', 'Gillette Stadium',         'Boston',                    [2, 1]),
  f('wc-G-2', 'G', 'irn', 'nzl', '2026-06-15T22:00:00Z', 'Levi’s Stadium',           'San Francisco Bay Area',    [2, 0]),
  f('wc-G-3', 'G', 'bel', 'irn', '2026-06-21T19:00:00Z', 'Gillette Stadium',         'Boston',                    [1, 1]),
  f('wc-G-4', 'G', 'egy', 'nzl', '2026-06-21T22:00:00Z', 'Levi’s Stadium',           'San Francisco Bay Area',    [3, 0]),
  f('wc-G-5', 'G', 'bel', 'nzl', '2026-06-27T20:00:00Z', 'Gillette Stadium',         'Boston',                    [3, 0]),
  f('wc-G-6', 'G', 'egy', 'irn', '2026-06-27T20:00:00Z', 'Levi’s Stadium',           'San Francisco Bay Area',    [1, 2]),

  f('wc-H-1', 'H', 'esp', 'cpv', '2026-06-15T19:00:00Z', 'Estadio Akron',            'Guadalajara',               [3, 0]),
  f('wc-H-2', 'H', 'ksa', 'uru', '2026-06-15T22:00:00Z', 'Hard Rock Stadium',        'Miami',                     [0, 2]),
  f('wc-H-3', 'H', 'esp', 'ksa', '2026-06-21T19:00:00Z', 'Estadio Akron',            'Guadalajara',               [2, 0]),
  f('wc-H-4', 'H', 'cpv', 'uru', '2026-06-21T22:00:00Z', 'Hard Rock Stadium',        'Miami',                     [0, 2]),
  f('wc-H-5', 'H', 'esp', 'uru', '2026-06-27T20:00:00Z', 'Estadio Akron',            'Guadalajara',               [1, 1]),
  f('wc-H-6', 'H', 'cpv', 'ksa', '2026-06-27T20:00:00Z', 'Hard Rock Stadium',        'Miami',                     [1, 2]),

  f('wc-I-1', 'I', 'fra', 'sen', '2026-06-16T19:00:00Z', 'AT&T Stadium',             'Dallas',                    [3, 1]),
  f('wc-I-2', 'I', 'irq', 'nor', '2026-06-16T22:00:00Z', 'Lumen Field',              'Seattle',                   [1, 2]),
  f('wc-I-3', 'I', 'fra', 'irq', '2026-06-22T19:00:00Z', 'AT&T Stadium',             'Dallas',                    [2, 0]),
  f('wc-I-4', 'I', 'sen', 'nor', '2026-06-22T22:00:00Z', 'Lumen Field',              'Seattle',                   [2, 2]),
  f('wc-I-5', 'I', 'fra', 'nor', '2026-06-27T20:00:00Z', 'AT&T Stadium',             'Dallas',                    [1, 1]),
  f('wc-I-6', 'I', 'sen', 'irq', '2026-06-27T20:00:00Z', 'Lumen Field',              'Seattle',                   [2, 0]),

  f('wc-J-1', 'J', 'arg', 'alg', '2026-06-16T19:00:00Z', 'Arrowhead Stadium',        'Kansas City',               [3, 1]),
  f('wc-J-2', 'J', 'aut', 'jor', '2026-06-16T22:00:00Z', 'BC Place',                 'Vancouver',                 [2, 0]),
  f('wc-J-3', 'J', 'arg', 'aut', '2026-06-22T19:00:00Z', 'Arrowhead Stadium',        'Kansas City',               [2, 1]),
  f('wc-J-4', 'J', 'alg', 'jor', '2026-06-22T22:00:00Z', 'BC Place',                 'Vancouver',                 [1, 1]),
  f('wc-J-5', 'J', 'arg', 'jor', '2026-06-28T20:00:00Z', 'Arrowhead Stadium',        'Kansas City',               [3, 0]),
  f('wc-J-6', 'J', 'alg', 'aut', '2026-06-28T20:00:00Z', 'BC Place',                 'Vancouver',                 [1, 1]),

  f('wc-K-1', 'K', 'por', 'cod', '2026-06-17T19:00:00Z', 'MetLife Stadium',          'Nueva York / Nueva Jersey', [2, 0], [1, 0]),
  f('wc-K-2', 'K', 'uzb', 'col', '2026-06-17T22:00:00Z', 'Estadio BBVA',             'Monterrey',                 [0, 1]),
  f('wc-K-3', 'K', 'por', 'uzb', '2026-06-23T19:00:00Z', 'MetLife Stadium',          'Nueva York / Nueva Jersey', [2, 1]),
  f('wc-K-4', 'K', 'cod', 'col', '2026-06-23T22:00:00Z', 'Estadio BBVA',             'Monterrey',                 [0, 2]),
  f('wc-K-5', 'K', 'por', 'col', '2026-06-28T20:00:00Z', 'MetLife Stadium',          'Nueva York / Nueva Jersey', [1, 1]),
  f('wc-K-6', 'K', 'cod', 'uzb', '2026-06-28T20:00:00Z', 'Estadio BBVA',             'Monterrey',                 [1, 2]),

  f('wc-L-1', 'L', 'eng', 'cro', '2026-06-17T19:00:00Z', 'SoFi Stadium',             'Los Ángeles',               [2, 1], [1, 1]),
  f('wc-L-2', 'L', 'gha', 'pan', '2026-06-17T22:00:00Z', 'NRG Stadium',              'Houston',                   [1, 1]),
  f('wc-L-3', 'L', 'eng', 'gha', '2026-06-23T19:00:00Z', 'SoFi Stadium',             'Los Ángeles',               [2, 0]),
  f('wc-L-4', 'L', 'cro', 'pan', '2026-06-23T22:00:00Z', 'NRG Stadium',              'Houston',                   [2, 1]),
  f('wc-L-5', 'L', 'eng', 'pan', '2026-06-28T20:00:00Z', 'SoFi Stadium',             'Los Ángeles',               [3, 0]),
  f('wc-L-6', 'L', 'cro', 'gha', '2026-06-28T20:00:00Z', 'NRG Stadium',              'Houston',                   [2, 1]),
];

const NOW = new Date('2026-06-17T20:00:00Z').getTime();

const MATCH_DURATION_MS = 2 * 60 * 60 * 1000;

function deriveStatus(kickoffISO: string): MatchStatus {
  const k = new Date(kickoffISO).getTime();
  if (NOW < k) return 'scheduled';
  if (NOW < k + MATCH_DURATION_MS) return 'live';
  return 'finished';
}

function liveScore(fx: Fixture): [number, number] {
  if (fx.live) return fx.live;
  const k = new Date(fx.kickoff).getTime();
  const elapsed = Math.max(0, Math.min(NOW - k, MATCH_DURATION_MS));
  const ratio = elapsed / MATCH_DURATION_MS;
  return [Math.floor(fx.score[0] * ratio), Math.floor(fx.score[1] * ratio)];
}

const groupMatches: Match[] = FIXTURES.map((fx) => {
  const status = deriveStatus(fx.kickoff);
  let homeScore: number | null = null;
  let awayScore: number | null = null;
  if (status === 'finished') {
    [homeScore, awayScore] = fx.score;
  } else if (status === 'live') {
    [homeScore, awayScore] = liveScore(fx);
  }
  return {
    id: fx.id,
    stage: 'group',
    group: fx.group,
    homeTeamId: fx.homeTeamId,
    awayTeamId: fx.awayTeamId,
    homeScore,
    awayScore,
    kickoff: fx.kickoff,
    venue: fx.venue,
    city: fx.city,
    status,
  };
});

const KNOCKOUT: Array<{ stage: MatchStage; date: string; venue: string; city: string }> = [
  { stage: 'round-of-32', date: '2026-06-30T20:00:00Z', venue: 'Estadio Azteca',         city: 'Ciudad de México' },
  { stage: 'round-of-32', date: '2026-07-01T20:00:00Z', venue: 'SoFi Stadium',           city: 'Los Ángeles' },
  { stage: 'round-of-16', date: '2026-07-05T20:00:00Z', venue: 'AT&T Stadium',           city: 'Dallas' },
  { stage: 'round-of-16', date: '2026-07-06T20:00:00Z', venue: 'BC Place',               city: 'Vancouver' },
  { stage: 'quarter',     date: '2026-07-09T20:00:00Z', venue: 'Lumen Field',            city: 'Seattle' },
  { stage: 'quarter',     date: '2026-07-10T20:00:00Z', venue: 'Arrowhead Stadium',      city: 'Kansas City' },
  { stage: 'semi',        date: '2026-07-14T20:00:00Z', venue: 'AT&T Stadium',           city: 'Dallas' },
  { stage: 'semi',        date: '2026-07-15T20:00:00Z', venue: 'Mercedes-Benz Stadium',  city: 'Atlanta' },
  { stage: 'third-place', date: '2026-07-18T20:00:00Z', venue: 'Hard Rock Stadium',      city: 'Miami' },
  { stage: 'final',       date: '2026-07-19T19:00:00Z', venue: 'MetLife Stadium',        city: 'Nueva York / Nueva Jersey' },
];

const knockoutMatches: Match[] = KNOCKOUT.map((k, idx) => ({
  id: `wc-ko-${k.stage}-${idx}`,
  stage: k.stage,
  homeTeamId: TEAMS[idx % TEAMS.length].id,
  awayTeamId: TEAMS[(idx + 12) % TEAMS.length].id,
  homeScore: null,
  awayScore: null,
  kickoff: k.date,
  venue: k.venue,
  city: k.city,
  status: 'scheduled',
}));

export const MATCHES: Match[] = [...groupMatches, ...knockoutMatches];
