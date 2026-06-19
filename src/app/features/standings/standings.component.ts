import { Component, computed, inject, linkedSignal, resourceFromSnapshots, signal } from '@angular/core';
import { MatchesService } from '../../core/services/matches.service';
import { Match, StandingRow } from '../../core/models/match';
import { TEAMS } from '../../core/mocks/teams.data';
import { LoaderComponent } from '../../shared/ui/loader.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { FeatureDocComponent, FeatureDocEntry } from '../../shared/ui/feature-doc.component';
import { TeamNamePipe } from '../../shared/pipes/team-name.pipe';

const GROUPS = 'ABCDEFGHIJKL'.split('');

const DOC: FeatureDocEntry[] = [
  {
    feature: 'linkedSignal({ source, computation })',
    status: 'estable',
    file: 'standings.component.ts',
    description: 'Crea un signal que combina la fuente (snapshot del recurso de partidos) con una transformación (cálculo de la clasificación). Mantiene escritura local cuando no hay nueva fuente.',
    code: `private readonly standingsSnapshot = linkedSignal({
  source: () => this.matchesResource.snapshot(),
  computation: (snap) => {
    if (snap.status === 'error') return { status: 'error', error: snap.error };
    return { status: snap.status, value: computeStandings(snap.value ?? []) };
  },
});`,
  },
  {
    feature: 'resourceFromSnapshots()',
    status: 'experimental',
    description: 'Envuelve un linkedSignal de ResourceSnapshot como un Resource normal. Permite encadenar y derivar recursos manteniendo isLoading / error / value.',
    code: `protected readonly standings = resourceFromSnapshots(
  this.standingsSnapshot,
);

// En template, igual que cualquier resource
@if (standings.isLoading()) { … }
{{ standings.value()?.length }}`,
  },
];

const emptyRow = (teamId: string, group: string): StandingRow => ({
  teamId,
  group,
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDiff: 0,
  points: 0,
});

const computeStandings = (matches: Match[]): StandingRow[] => {
  const rows = new Map<string, StandingRow>();
  for (const team of TEAMS) rows.set(team.id, emptyRow(team.id, team.group));

  for (const m of matches) {
    if (m.status === 'scheduled' || m.homeScore === null || m.awayScore === null) continue;
    const home = rows.get(m.homeTeamId);
    const away = rows.get(m.awayTeamId);
    if (!home || !away) continue;
    home.played++;
    away.played++;
    home.goalsFor += m.homeScore;
    home.goalsAgainst += m.awayScore;
    away.goalsFor += m.awayScore;
    away.goalsAgainst += m.homeScore;
    if (m.homeScore > m.awayScore) {
      home.won++;
      away.lost++;
      home.points += 3;
    } else if (m.homeScore < m.awayScore) {
      away.won++;
      home.lost++;
      away.points += 3;
    } else {
      home.drawn++;
      away.drawn++;
      home.points++;
      away.points++;
    }
  }

  for (const row of rows.values()) row.goalDiff = row.goalsFor - row.goalsAgainst;

  return [...rows.values()].sort(
    (a, b) =>
      a.group.localeCompare(b.group) ||
      b.points - a.points ||
      b.goalDiff - a.goalDiff ||
      b.goalsFor - a.goalsFor,
  );
};

@Component({
  selector: 'app-standings',
  imports: [LoaderComponent, PageHeaderComponent, TeamNamePipe, FeatureDocComponent],
  template: `
    <app-page-header
      kicker="Fase de grupos"
      title="Clasificación"
      subtitle="Derivada en directo del recurso de partidos con linkedSignal + resourceFromSnapshots."
    />

    <app-feature-doc [entries]="docEntries" />

    @if (standings.isLoading() && (standings.value()?.length ?? 0) === 0) {
      <app-loader>Calculando clasificación…</app-loader>
    } @else {
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        @for (g of grouped(); track g.group) {
          <section class="rounded-2xl border border-white/5 bg-white/[0.04] p-4">
            <h3 class="mb-3 flex items-center justify-between text-sm font-semibold text-white">
              <span>Grupo {{ g.group }}</span>
              <span class="text-[10px] font-normal text-slate-500">Pasan 2 + mejores 3os</span>
            </h3>
            <table class="w-full text-sm">
              <thead>
                <tr class="text-[10px] uppercase tracking-wider text-slate-500">
                  <th class="pb-2 text-left font-medium">#</th>
                  <th class="pb-2 text-left font-medium">Selección</th>
                  <th class="pb-2 text-center font-medium">PJ</th>
                  <th class="pb-2 text-center font-medium">DG</th>
                  <th class="pb-2 text-center font-medium">Pts</th>
                </tr>
              </thead>
              <tbody>
                @for (row of g.rows; track row.teamId; let i = $index) {
                  <tr
                    [class]="{
                      'border-t border-white/5': i > 0,
                      'text-emerald-300': i < 2,
                      'text-amber-300': i === 2,
                      'text-slate-400': i === 3,
                    }"
                  >
                    <td class="py-1.5 text-xs font-bold tabular-nums">{{ i + 1 }}</td>
                    <td class="py-1.5">
                      <span class="mr-1">{{ row.teamId | teamName: 'flag' }}</span>
                      <span class="text-xs">{{ row.teamId | teamName: 'code' }}</span>
                    </td>
                    <td class="py-1.5 text-center tabular-nums text-xs">{{ row.played }}</td>
                    <td class="py-1.5 text-center tabular-nums text-xs">
                      {{ row.goalDiff > 0 ? '+' + row.goalDiff : row.goalDiff }}
                    </td>
                    <td class="py-1.5 text-center font-bold tabular-nums">{{ row.points }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </section>
        }
      </div>
    }
  `,
})
export class StandingsComponent {
  private readonly matchesService = inject(MatchesService);

  protected readonly docEntries = DOC;
  protected readonly groups = GROUPS;

  private readonly matchesQuery = signal({ stage: 'group' as const });
  private readonly matchesResource = this.matchesService.matches(this.matchesQuery);

  private readonly standingsSnapshot = linkedSignal({
    source: () => this.matchesResource.snapshot(),
    computation: (snap) => {
      if (snap.status === 'error') {
        return { status: 'error' as const, error: snap.error };
      }
      const value = computeStandings(snap.value ?? []);
      return { status: snap.status, value } as const;
    },
  });

  protected readonly standings = resourceFromSnapshots(this.standingsSnapshot);

  protected readonly grouped = computed(() => {
    const rows = this.standings.value() ?? [];
    return this.groups.map((group) => ({
      group,
      rows: rows.filter((r) => r.group === group),
    }));
  });
}
