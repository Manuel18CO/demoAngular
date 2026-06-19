import { Component, inject } from '@angular/core';
import { isActive, Router, RouterOutlet } from '@angular/router';
import { NavLinkComponent } from './shared/ui/nav-link.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavLinkComponent],
  template: `
    <div class="flex min-h-screen">
      <aside class="hidden w-72 shrink-0 border-r border-white/10 bg-slate-950/60 p-6 backdrop-blur md:flex md:flex-col">
        <div class="mb-8">
          <div class="flex items-center gap-3">
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-xl">⚽</div>
            <div>
              <div class="text-sm font-semibold tracking-wide text-white">MUNDIAL</div>
              <div class="text-xs text-slate-400">2026 · EE. UU. · MÉX · CAN</div>
            </div>
          </div>
        </div>

        <nav class="flex flex-col gap-1">
          <app-nav-link path="/dashboard" label="Inicio" icon="🏟️" [active]="dashActive()" />
          <app-nav-link path="/teams" label="Selecciones" icon="🌍" [active]="teamsActive()" />
          <app-nav-link path="/matches" label="Partidos" icon="📅" [active]="matchesActive()" />
          <app-nav-link path="/standings" label="Clasificación" icon="📊" [active]="standingsActive()" />
          <app-nav-link path="/bracket" label="Eliminatorias" icon="🏆" [active]="bracketActive()" />
          <app-nav-link path="/predictions" label="Quiniela" icon="🔮" [active]="predictionsActive()" />
        </nav>

        <div class="mt-6 border-t border-white/5 pt-4">
          <p class="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Documentación</p>
          <app-nav-link path="/about" label="Sobre la demo" icon="📘" [active]="aboutActive()" />
        </div>

        <div class="mt-auto rounded-xl border border-white/5 bg-white/5 p-4 text-xs text-slate-400">
          <div class="mb-1 font-semibold text-slate-200">Demo Angular 22</div>
          Signals · Resource API · Signal Forms · &#64;defer · &#64;Service · injectAsync · isActive
        </div>
      </aside>

      <main class="flex-1 px-6 py-8 md:px-10 md:py-10">
        <router-outlet />
      </main>
    </div>
  `,
})
export class App {
  private readonly router = inject(Router);

  protected readonly dashActive = isActive('/dashboard', this.router, { paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' });
  protected readonly teamsActive = isActive('/teams', this.router, { paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' });
  protected readonly matchesActive = isActive('/matches', this.router, { paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' });
  protected readonly standingsActive = isActive('/standings', this.router, { paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' });
  protected readonly bracketActive = isActive('/bracket', this.router, { paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' });
  protected readonly predictionsActive = isActive('/predictions', this.router, { paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' });
  protected readonly aboutActive = isActive('/about', this.router, { paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' });
}
