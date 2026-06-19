import { Component, inject } from '@angular/core';
import { StatsService } from '../../core/services/stats.service';
import { LoaderComponent } from '../../shared/ui/loader.component';
import { TeamNamePipe } from '../../shared/pipes/team-name.pipe';

@Component({
  selector: 'app-top-scorers',
  imports: [LoaderComponent, TeamNamePipe],
  template: `
    <div class="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-300">Goleadores</h3>
        <span class="text-[10px] text-slate-500">&#64;defer on idle(2000)</span>
      </div>
      @if (scorers.isLoading()) {
        <app-loader>Cargando estadísticas…</app-loader>
      } @else {
        <ol class="space-y-2">
          @for (s of scorers.value(); track s.name; let i = $index) {
            <li class="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm">
              <span class="grid h-7 w-7 place-items-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                {{ i + 1 }}
              </span>
              <span class="text-lg">{{ s.teamId | teamName: 'flag' }}</span>
              <span class="flex-1 text-white">{{ s.name }}</span>
              <span class="tabular-nums text-emerald-300">{{ s.goals }} ⚽</span>
            </li>
          }
        </ol>
      }
    </div>
  `,
})
export class TopScorersComponent {
  private readonly stats = inject(StatsService);
  protected readonly scorers = this.stats.topScorers();
}
