import { http, HttpResponse, delay } from 'msw';
import { TEAMS } from './teams.data';
import { PLAYERS } from './players.data';
import { MATCHES } from './matches.data';
import { Prediction } from '../models/prediction';

const API = '/api';
const predictions: Prediction[] = [];

const latency = () => delay(200 + Math.random() * 300);

export const handlers = [
  http.get(`${API}/teams`, async ({ request }) => {
    await latency();
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.toLowerCase().trim() ?? '';
    const group = url.searchParams.get('group') ?? '';
    const confederation = url.searchParams.get('confederation') ?? '';

    let result = TEAMS;
    if (q) result = result.filter((t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q));
    if (group) result = result.filter((t) => t.group === group);
    if (confederation) result = result.filter((t) => t.confederation === confederation);
    return HttpResponse.json(result);
  }),

  http.get(`${API}/teams/:id`, async ({ params }) => {
    await latency();
    const team = TEAMS.find((t) => t.id === params['id']);
    if (!team) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(team);
  }),

  http.get(`${API}/teams/:id/players`, async ({ params }) => {
    await latency();
    const players = PLAYERS.filter((p) => p.teamId === params['id']);
    return HttpResponse.json(players);
  }),

  http.get(`${API}/matches`, async ({ request }) => {
    await latency();
    const url = new URL(request.url);
    const stage = url.searchParams.get('stage');
    const group = url.searchParams.get('group');
    const status = url.searchParams.get('status');
    const teamId = url.searchParams.get('teamId');

    let result = MATCHES;
    if (stage) result = result.filter((m) => m.stage === stage);
    if (group) result = result.filter((m) => m.group === group);
    if (status) result = result.filter((m) => m.status === status);
    if (teamId) result = result.filter((m) => m.homeTeamId === teamId || m.awayTeamId === teamId);
    return HttpResponse.json(result);
  }),

  http.get(`${API}/matches/:id`, async ({ params }) => {
    await latency();
    const match = MATCHES.find((m) => m.id === params['id']);
    if (!match) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(match);
  }),

  http.post(`${API}/predictions`, async ({ request }) => {
    await latency();
    const body = (await request.json()) as Prediction;
    predictions.push(body);
    return HttpResponse.json({ ok: true, total: predictions.length }, { status: 201 });
  }),

  http.get(`${API}/predictions`, async () => {
    await latency();
    return HttpResponse.json(predictions);
  }),

  http.get(`${API}/stats/top-scorers`, async () => {
    await delay(900);
    return HttpResponse.json([
      { name: 'Kylian Mbappé', teamId: 'fra', goals: 7 },
      { name: 'Lionel Messi', teamId: 'arg', goals: 6 },
      { name: 'Harry Kane', teamId: 'eng', goals: 5 },
      { name: 'Vinícius Jr.', teamId: 'bra', goals: 5 },
      { name: 'Lamine Yamal', teamId: 'esp', goals: 4 },
      { name: 'Cristiano Ronaldo', teamId: 'por', goals: 4 },
      { name: 'Jude Bellingham', teamId: 'eng', goals: 3 },
      { name: 'Julián Álvarez', teamId: 'arg', goals: 3 },
    ]);
  }),
];
