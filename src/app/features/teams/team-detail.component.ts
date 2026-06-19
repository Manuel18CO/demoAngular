import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TeamsService } from '../../core/services/teams.service';
import { LoaderComponent } from '../../shared/ui/loader.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { FeatureDocComponent, FeatureDocEntry } from '../../shared/ui/feature-doc.component';

const DOC: FeatureDocEntry[] = [
  {
    feature: 'input.required<string>() + withComponentInputBinding()',
    status: 'estable',
    file: 'team-detail.component.ts · app.config.ts',
    description: 'El parámetro de ruta :id se enlaza automáticamente como signal-input gracias a withComponentInputBinding() en provideRouter.',
    code: `// app.config.ts
provideRouter(routes, withComponentInputBinding());

// team-detail.component.ts
readonly id = input.required<string>();
protected readonly team = this.teamsService.team(this.id);`,
  },
  {
    feature: 'httpResource() con URL condicional',
    status: 'estable',
    file: 'core/services/teams.service.ts',
    description: 'Devolver undefined desde la función de URL pausa el recurso (no dispara petición). Útil cuando el id aún no está disponible.',
    code: `team(id: Signal<string | null>) {
  return httpResource<Team | undefined>(() => {
    const value = id();
    return value ? \`/api/teams/\${value}\` : undefined;
  });
}`,
  },
];

@Component({
  selector: 'app-team-detail',
  imports: [RouterLink, PageHeaderComponent, LoaderComponent, FeatureDocComponent],
  template: `
    <a routerLink="/teams" class="mb-4 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-300">
      ← Volver a selecciones
    </a>

    <app-feature-doc [entries]="docEntries" />

    @if (team.isLoading()) {
      <app-loader>Cargando selección…</app-loader>
    } @else if (team.value(); as t) {
      <app-page-header
        [kicker]="t.confederation + ' · Grupo ' + t.group"
        [title]="t.flag + '  ' + t.name"
        [subtitle]="'Ranking FIFA #' + t.fifaRank + ' · código ' + t.code"
      />

      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Convocatoria</h2>

      @if (players.isLoading()) {
        <app-loader>Cargando jugadores…</app-loader>
      } @else if (players.value().length === 0) {
        <p class="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
          Aún no hay convocatoria pública para {{ t.name }}.
        </p>
      } @else {
        <div class="grid gap-3 md:grid-cols-2">
          @for (p of players.value(); track p.id) {
            <div class="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.04] p-3">
              <span class="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-300">
                {{ p.number }}
              </span>
              <div class="flex-1 min-w-0">
                <p class="truncate text-sm font-semibold text-white">{{ p.name }}</p>
                <p class="text-xs text-slate-400">{{ p.club }} · {{ p.age }} años</p>
              </div>
              <span [class]="positionClass(p.position)" class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                {{ positionLabel(p.position) }}
              </span>
            </div>
          }
        </div>
      }
    }
  `,
})
export class TeamDetailComponent {
  private readonly teamsService = inject(TeamsService);

  protected readonly docEntries = DOC;

  readonly id = input.required<string>();

  protected readonly team = this.teamsService.team(this.id);
  protected readonly players = this.teamsService.players(this.id);

  protected positionClass(pos: string): string {
    switch (pos) {
      case 'GK': return 'bg-amber-500/20 text-amber-300';
      case 'DEF': return 'bg-sky-500/20 text-sky-300';
      case 'MID': return 'bg-emerald-500/20 text-emerald-300';
      case 'FWD': return 'bg-rose-500/20 text-rose-300';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  }

  protected positionLabel(pos: string): string {
    switch (pos) {
      case 'GK': return 'POR';
      case 'DEF': return 'DEF';
      case 'MID': return 'MED';
      case 'FWD': return 'DEL';
      default: return pos;
    }
  }
}
