import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatchesService } from '../../core/services/matches.service';
import { TeamsService } from '../../core/services/teams.service';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { LoaderComponent } from '../../shared/ui/loader.component';
import { TeamNamePipe } from '../../shared/pipes/team-name.pipe';
import { FeatureDocComponent, FeatureDocEntry } from '../../shared/ui/feature-doc.component';
import { TopScorersComponent } from './top-scorers.component';

const DOC: FeatureDocEntry[] = [
  {
    feature: 'httpResource()',
    status: 'estable',
    file: 'core/services/matches.service.ts',
    description: 'Recurso HTTP reactivo: cuando cambian los signals de su request, dispara la llamada y expone value(), isLoading(), error(), status().',
    code: `protected readonly allMatches = this.matchesService.matches(
  signal({}) // query reactivo
);

// En template
@if (allMatches.isLoading()) { … }
{{ allMatches.value().length }}`,
  },
  {
    feature: '@defer (on idle(2000))',
    status: 'estable',
    description: 'El bloque de goleadores no se descarga ni renderiza hasta que el navegador esté inactivo. Reduce el TTI inicial.',
    code: `@defer (on idle(2000)) {
  <app-top-scorers />
} @placeholder {
  Se cargará cuando el navegador esté libre…
} @loading {
  <app-loader />
}`,
  },
  {
    feature: 'computed()',
    status: 'estable',
    description: 'Derivados reactivos de los partidos: lista en directo, finalizados y próximos se recalculan automáticamente cuando cambia el recurso.',
    code: `protected readonly liveMatches = computed(() =>
  this.allMatches.value().filter((m) => m.status === 'live'),
);`,
  },
];

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink, PageHeaderComponent, LoaderComponent, TeamNamePipe, FeatureDocComponent, TopScorersComponent],
  template: `
    <app-page-header
      kicker="Bienvenido"
      title="Mundial 2026"
      subtitle="48 selecciones · 12 grupos · 16 sedes · EE. UU., México y Canadá. Construido con todo lo nuevo de Angular 22."
    />

    <app-feature-doc [entries]="docEntries" />

    <section class="mb-8 grid gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 p-5">
        <p class="text-xs uppercase tracking-wider text-emerald-300">Selecciones</p>
        <p class="mt-2 text-3xl font-bold text-white">{{ teamsCount.value().length }}</p>
        <p class="mt-1 text-xs text-slate-400">En 6 confederaciones</p>
      </div>
      <div class="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
        <p class="text-xs uppercase tracking-wider text-slate-400">Partidos en directo</p>
        <p class="mt-2 text-3xl font-bold text-white">{{ liveMatches().length }}</p>
        <p class="mt-1 text-xs text-slate-400">Ahora mismo</p>
      </div>
      <div class="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
        <p class="text-xs uppercase tracking-wider text-slate-400">Disputados</p>
        <p class="mt-2 text-3xl font-bold text-white">{{ finishedMatches().length }}</p>
        <p class="mt-1 text-xs text-slate-400">De {{ allMatches.value().length }} partidos de grupos</p>
      </div>
    </section>

    <section class="mb-8 grid gap-6 lg:grid-cols-3">
      <div class="rounded-2xl border border-white/5 bg-white/[0.04] p-5 lg:col-span-2">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-300">En juego</h3>
          <a routerLink="/matches" class="text-xs text-emerald-300 hover:underline">Ver todos →</a>
        </div>

        @if (allMatches.isLoading() && allMatches.value().length === 0) {
          <app-loader>Cargando calendario…</app-loader>
        } @else if (liveMatches().length === 0) {
          <p class="text-sm text-slate-400">No hay partidos en directo en este momento.</p>
        } @else {
          <ul class="space-y-2">
            @for (m of liveMatches(); track m.id) {
              <li class="flex items-center gap-3 rounded-xl bg-emerald-500/[0.06] px-4 py-3 ring-1 ring-emerald-400/30">
                <span class="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-300">
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400"></span>En vivo
                </span>
                <span class="text-lg">{{ m.homeTeamId | teamName: 'flag' }}</span>
                <span class="text-sm font-medium text-white">{{ m.homeTeamId | teamName: 'code' }}</span>
                <span class="rounded-lg bg-black/40 px-3 py-1 font-bold tabular-nums text-white">
                  {{ m.homeScore }} : {{ m.awayScore }}
                </span>
                <span class="text-sm font-medium text-white">{{ m.awayTeamId | teamName: 'code' }}</span>
                <span class="text-lg">{{ m.awayTeamId | teamName: 'flag' }}</span>
                <span class="ml-auto text-xs text-slate-400">{{ m.venue }}</span>
              </li>
            }
          </ul>
        }
      </div>

      @defer (on idle(2000)) {
        <app-top-scorers />
      } @placeholder {
        <div class="rounded-2xl border border-white/5 bg-white/[0.03] p-5 text-sm text-slate-500">
          La tabla de goleadores se cargará cuando el navegador esté inactivo (2s)…
        </div>
      } @loading {
        <app-loader>Cargando goleadores…</app-loader>
      }
    </section>

    <section class="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-300">Próximos partidos</h3>
        <a routerLink="/matches" class="text-xs text-emerald-300 hover:underline">Ver calendario →</a>
      </div>
      @if (upcomingMatches().length === 0) {
        <p class="text-sm text-slate-400">No hay partidos próximos programados.</p>
      } @else {
        <ul class="space-y-2">
          @for (m of upcomingMatches(); track m.id) {
            <li class="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm">
              <span class="w-32 text-xs text-slate-500">{{ m.kickoff | date: 'd MMM · HH:mm' }}</span>
              <span class="flex-1">
                {{ m.homeTeamId | teamName: 'flag-name' }}
                <span class="mx-1 text-slate-500">vs</span>
                {{ m.awayTeamId | teamName: 'flag-name' }}
              </span>
              <span class="text-xs text-slate-500">{{ m.city }}</span>
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export class DashboardComponent {
  private readonly matchesService = inject(MatchesService);
  private readonly teamsService = inject(TeamsService);

  protected readonly docEntries = DOC;

  private readonly emptyTeamsQuery = signal({});
  private readonly allMatchesQuery = signal({});

  protected readonly teamsCount = this.teamsService.teams(this.emptyTeamsQuery);
  protected readonly allMatches = this.matchesService.matches(this.allMatchesQuery);

  protected readonly liveMatches = computed(() =>
    this.allMatches.value().filter((m) => m.status === 'live'),
  );
  protected readonly finishedMatches = computed(() =>
    this.allMatches.value().filter((m) => m.status === 'finished'),
  );
  protected readonly upcomingMatches = computed(() =>
    this.allMatches
      .value()
      .filter((m) => m.status === 'scheduled')
      .slice(0, 5),
  );
}
