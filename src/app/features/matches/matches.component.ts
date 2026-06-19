import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatchesService } from '../../core/services/matches.service';
import { Match, MatchStage, MatchStatus } from '../../core/models/match';
import { LoaderComponent } from '../../shared/ui/loader.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { FeatureDocComponent, FeatureDocEntry } from '../../shared/ui/feature-doc.component';
import { TeamNamePipe } from '../../shared/pipes/team-name.pipe';

const DOC: FeatureDocEntry[] = [
  {
    feature: 'Spread (...) en class bindings',
    status: 'estable',
    file: 'matches.component.ts',
    description: 'Nueva sintaxis de plantilla v22: spread de objetos en [class] o [style]. Permite componer mapas de clases reutilizables.',
    code: `protected readonly baseCardClasses = {
  'rounded-xl border border-white/5 bg-white/[0.04] p-3': true,
  'hover:bg-white/[0.07]': true,
};

<li [class]="{ ...baseCardClasses, 'ring-1 ring-emerald-400/40': m.status === 'live' }">`,
  },
  {
    feature: '@switch exhaustivo + @let',
    status: 'estable',
    description: 'El @default usa @let para crear una variable local con valor never, lo que permite a TypeScript verificar que todos los casos están cubiertos.',
    code: `@switch (m.status) {
  @case ('live')     { … }
  @case ('finished') { … }
  @case ('scheduled'){ … }
  @default {
    @let never = neverStatus(m.status);
    <span>{{ never }}</span>
  }
}`,
  },
  {
    feature: 'httpResource() con filtros reactivos',
    status: 'estable',
    description: 'Cambiar cualquiera de los signals (status, group) dispara una nueva petición — sin manejo manual de subscribe/unsubscribe.',
    code: `private readonly httpQuery = computed(() => ({
  stage: 'group' as MatchStage,
  status: this.status(),
  group: this.group(),
}));

protected readonly matches = this.matchesService.matches(this.httpQuery);`,
  },
];

const STATUS_OPTIONS: ReadonlyArray<{ value: MatchStatus | ''; label: string }> = [
  { value: '', label: 'Todos los estados' },
  { value: 'scheduled', label: 'Programados' },
  { value: 'live', label: 'En directo' },
  { value: 'finished', label: 'Finalizados' },
];
const GROUPS = 'ABCDEFGHIJKL'.split('');

@Component({
  selector: 'app-matches',
  imports: [DatePipe, LoaderComponent, PageHeaderComponent, TeamNamePipe, FeatureDocComponent],
  template: `
    <app-page-header
      kicker="Calendario"
      title="Partidos"
      subtitle="HttpResource reactivo + nueva sintaxis de plantilla (spread, arrow fns, &#64;switch exhaustivo)."
    />

    <app-feature-doc [entries]="docEntries" />

    <div class="mb-6 flex flex-wrap gap-3">
      <select
        [value]="status()"
        (change)="status.set($any($event.target).value)"
        class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
      >
        @for (s of statusOptions; track s.value) {
          <option [value]="s.value">{{ s.label }}</option>
        }
      </select>

      <select
        [value]="group()"
        (change)="group.set($any($event.target).value)"
        class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
      >
        <option value="">Todos los grupos</option>
        @for (g of groups; track g) {
          <option [value]="g">Grupo {{ g }}</option>
        }
      </select>

      <span class="ml-auto self-center text-xs text-slate-500">
        {{ matches.value().length }} partidos · agrupados por fecha
      </span>
    </div>

    @if (matches.isLoading() && matches.value().length === 0) {
      <app-loader>Cargando partidos…</app-loader>
    } @else {
      <div class="space-y-8">
        @for (day of grouped(); track day.date) {
          <section>
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {{ day.date | date: 'EEEE, d \\'de\\' MMMM \\'de\\' y' }}
            </h3>
            <ul class="space-y-2">
              @for (m of day.matches; track m.id) {
                <li
                  [class]="{
                    ...baseCardClasses,
                    'ring-1 ring-emerald-400/40': m.status === 'live',
                  }"
                >
                  <div class="flex items-center gap-3">
                    <span class="w-16 text-right text-xs text-slate-500">{{ m.kickoff | date: 'HH:mm' }}</span>

                    @switch (m.status) {
                      @case ('live') {
                        <span class="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-300">
                          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400"></span>
                          En vivo
                        </span>
                      }
                      @case ('finished') {
                        <span class="rounded-full bg-slate-700/50 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-300">Final</span>
                      }
                      @case ('scheduled') {
                        <span class="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-300">Pronto</span>
                      }
                      @default {
                        @let never = neverStatus(m.status);
                        <span>{{ never }}</span>
                      }
                    }

                    <div class="ml-2 flex flex-1 items-center justify-end gap-2 text-sm font-medium text-white">
                      <span>{{ m.homeTeamId | teamName }}</span>
                      <span class="text-lg">{{ m.homeTeamId | teamName: 'flag' }}</span>
                    </div>
                    <div class="grid min-w-[56px] place-items-center rounded-lg bg-white/5 px-3 py-1 text-sm font-bold tabular-nums text-white">
                      {{ formatScore(m) }}
                    </div>
                    <div class="flex flex-1 items-center gap-2 text-sm font-medium text-white">
                      <span class="text-lg">{{ m.awayTeamId | teamName: 'flag' }}</span>
                      <span>{{ m.awayTeamId | teamName }}</span>
                    </div>
                  </div>
                  <div class="mt-1 pl-[88px] text-[11px] text-slate-500">
                    @if (m.group) { Grupo {{ m.group }} · }
                    {{ m.venue }}, {{ m.city }}
                  </div>
                </li>
              }
            </ul>
          </section>
        } @empty {
          <p class="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-400">
            No hay partidos para estos filtros.
          </p>
        }
      </div>
    }
  `,
})
export class MatchesComponent {
  private readonly matchesService = inject(MatchesService);

  protected readonly docEntries = DOC;
  protected readonly status = signal<MatchStatus | ''>('');
  protected readonly group = signal('');
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly groups = GROUPS;

  protected readonly baseCardClasses = {
    'rounded-xl border border-white/5 bg-white/[0.04] p-3 transition': true,
    'hover:bg-white/[0.07]': true,
  };

  private readonly httpQuery = computed(() => ({
    stage: 'group' as MatchStage,
    status: this.status(),
    group: this.group(),
  }));

  protected readonly matches = this.matchesService.matches(this.httpQuery);

  protected readonly grouped = computed(() => {
    const sorted = [...this.matches.value()].sort(
      (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime(),
    );
    const buckets = new Map<string, Match[]>();
    for (const m of sorted) {
      const date = m.kickoff.slice(0, 10);
      const list = buckets.get(date);
      if (list) list.push(m);
      else buckets.set(date, [m]);
    }
    return [...buckets.entries()].map(([date, matches]) => ({ date, matches }));
  });

  protected formatScore(m: Match): string {
    if (m.homeScore === null || m.awayScore === null) return '— : —';
    return `${m.homeScore} : ${m.awayScore}`;
  }

  protected neverStatus(s: never): string {
    return String(s);
  }
}
