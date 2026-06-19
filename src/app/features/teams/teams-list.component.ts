import { Component, computed, debounced, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TeamsService } from '../../core/services/teams.service';
import { LoaderComponent } from '../../shared/ui/loader.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { FeatureDocComponent, FeatureDocEntry } from '../../shared/ui/feature-doc.component';
import { Team } from '../../core/models/team';

const CONFEDERATIONS: ReadonlyArray<Team['confederation'] | ''> = [
  '', 'UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC',
];

const DOC: FeatureDocEntry[] = [
  {
    feature: 'debounced()',
    status: 'estable',
    file: 'teams-list.component.ts',
    description: 'Toma un signal y devuelve un Resource cuyo valor se actualiza tras una pausa. Aquí espera 300ms a que el usuario deje de teclear antes de disparar la petición HTTP.',
    code: `protected readonly query = signal('');
private readonly debouncedQuery = debounced(this.query, 300);

private readonly httpQuery = computed(() => ({
  q: this.debouncedQuery.value() ?? '',
  confederation: this.confederation(),
}));`,
  },
  {
    feature: 'httpResource()',
    status: 'estable',
    file: 'core/services/teams.service.ts',
    description: 'El servicio expone un httpResource cuya URL/params dependen de un signal. Al cambiar el signal de búsqueda se relanza la petición automáticamente.',
    code: `@Service()
export class TeamsService {
  teams(query: Signal<TeamsQuery>) {
    return httpResource<Team[]>(
      () => ({ url: '/api/teams', params: { ...query() } }),
      { defaultValue: [] },
    );
  }
}`,
  },
  {
    feature: '@Service()',
    status: 'estable',
    description: 'Alternativa ergonómica a @Injectable({ providedIn: "root" }). Auto-provisto en root, descubrible para todos los componentes.',
    code: `@Service()
export class TeamsService { /* … */ }`,
  },
];

@Component({
  selector: 'app-teams-list',
  imports: [RouterLink, PageHeaderComponent, LoaderComponent, FeatureDocComponent],
  template: `
    <app-page-header
      kicker="Selecciones"
      title="Equipos"
      subtitle="48 selecciones en 12 grupos. Búsqueda con debounced signals + httpResource."
    />

    <app-feature-doc [entries]="docEntries" />

    <div class="mb-6 flex flex-wrap items-center gap-3">
      <input
        type="search"
        placeholder="Buscar selección o código…"
        [value]="query()"
        (input)="query.set($any($event.target).value)"
        class="w-72 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
      />

      <select
        [value]="confederation()"
        (change)="confederation.set($any($event.target).value)"
        class="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-emerald-400 focus:outline-none"
      >
        @for (c of confederations; track c) {
          <option [value]="c">{{ c || 'Todas las confederaciones' }}</option>
        }
      </select>

      <span class="ml-auto text-xs text-slate-500">
        @if (teams.isLoading()) { Buscando… }
        @else { {{ teams.value().length }} resultados }
      </span>
    </div>

    @if (teams.error()) {
      <div class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
        Error al cargar las selecciones.
      </div>
    } @else if (teams.isLoading() && teams.value().length === 0) {
      <app-loader>Obteniendo selecciones…</app-loader>
    } @else {
      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        @for (team of teams.value(); track team.id) {
          <li>
            <a
              [routerLink]="['/teams', team.id]"
              class="group block rounded-2xl border border-white/5 bg-white/[0.04] p-4 transition hover:border-emerald-400/40 hover:bg-white/[0.08]"
            >
              <div class="flex items-center gap-3">
                <span class="text-3xl">{{ team.flag }}</span>
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-white">{{ team.name }}</p>
                  <p class="text-xs text-slate-400">{{ team.confederation }} · Grupo {{ team.group }}</p>
                </div>
                <span class="ml-auto rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
                  #{{ team.fifaRank }}
                </span>
              </div>
            </a>
          </li>
        } @empty {
          <li class="col-span-full rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-400">
            Ninguna selección coincide con tu búsqueda.
          </li>
        }
      </ul>
    }
  `,
})
export class TeamsListComponent {
  private readonly teamsService = inject(TeamsService);

  protected readonly docEntries = DOC;

  protected readonly query = signal('');
  protected readonly confederation = signal<Team['confederation'] | ''>('');
  protected readonly confederations = CONFEDERATIONS;

  private readonly debouncedQuery = debounced(this.query, 300);

  private readonly httpQuery = computed(() => ({
    q: this.debouncedQuery.value() ?? '',
    confederation: this.confederation(),
  }));

  protected readonly teams = this.teamsService.teams(this.httpQuery);
}
