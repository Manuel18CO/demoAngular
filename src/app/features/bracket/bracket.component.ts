import { Component, injectAsync, resource } from '@angular/core';
import { LoaderComponent } from '../../shared/ui/loader.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { FeatureDocComponent, FeatureDocEntry } from '../../shared/ui/feature-doc.component';
import { BracketNode } from './bracket-renderer.service';

const DOC: FeatureDocEntry[] = [
  {
    feature: 'injectAsync()',
    status: 'estable',
    file: 'bracket.component.ts',
    description: 'Carga perezosa de un service. El módulo del renderer (bracket-renderer-service.chunk.js) solo se descarga cuando se solicita la instancia. Compatible con prefetch + onIdle.',
    code: `private readonly loadRenderer = injectAsync(() =>
  import('./bracket-renderer.service').then((m) => m.BracketRendererService),
);

protected readonly bracket = resource<BracketNode[], void>({
  loader: async () => {
    const renderer = await this.loadRenderer();
    return renderer.getDemoBracket();
  },
});`,
  },
  {
    feature: '@defer (on viewport; prefetch on idle)',
    status: 'estable',
    description: 'El cuadro no se renderiza hasta entrar en el viewport, pero el chunk se prefetch cuando el navegador queda inactivo. UX rápida sin descargar de más.',
    code: `@defer (on viewport; prefetch on idle) {
  <!-- cuadro -->
} @placeholder {
  El renderer se carga al entrar en el viewport.
} @loading (minimum 200ms) {
  <app-loader />
} @error {
  Error al cargar.
}`,
  },
  {
    feature: 'resource({ loader })',
    status: 'estable',
    description: 'Recurso asíncrono genérico (no HTTP) con loader Promise. Devuelve value(), isLoading(), error(), reload().',
    code: `protected readonly bracket = resource<BracketNode[], void>({
  loader: async () => {
    const renderer = await this.loadRenderer();
    await renderer.loadHeavyDeps();
    return renderer.getDemoBracket();
  },
});`,
  },
];

@Component({
  selector: 'app-bracket',
  imports: [LoaderComponent, PageHeaderComponent, FeatureDocComponent],
  template: `
    <app-page-header
      kicker="Fase eliminatoria"
      title="Eliminatorias"
      subtitle="injectAsync para cargar el renderer bajo demanda + &#64;defer para diferir la visualización."
    />

    <app-feature-doc [entries]="docEntries" />

    @defer (on viewport; prefetch on idle) {
      @if (bracket.isLoading()) {
        <app-loader>Cargando renderer del cuadro (injectAsync)…</app-loader>
      } @else if (bracket.value(); as nodes) {
        <div class="space-y-6">
          @for (final of nodes; track final.label) {
            <div class="rounded-2xl border border-white/5 bg-white/[0.04] p-6">
              <h3 class="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-emerald-300">
                {{ final.label }}
              </h3>
              <div class="grid gap-4 md:grid-cols-2">
                @for (semi of final.children ?? []; track semi.label) {
                  <div class="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                    <h4 class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {{ semi.label }}
                    </h4>
                    <ul class="space-y-2">
                      @for (qf of semi.children ?? []; track qf.label) {
                        <li class="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                          <span class="text-slate-200">{{ qf.label }}</span>
                          @if (qf.team) {
                            <span class="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                              {{ qf.team }} →
                            </span>
                          }
                        </li>
                      }
                    </ul>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    } @placeholder {
      <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center text-sm text-slate-500">
        El renderer del cuadro se carga al entrar en el viewport.
      </div>
    } @loading (minimum 200ms) {
      <app-loader>Cargando módulo del cuadro…</app-loader>
    } @error {
      <div class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
        Error al cargar las eliminatorias.
      </div>
    }
  `,
})
export class BracketComponent {
  protected readonly docEntries = DOC;

  private readonly loadRenderer = injectAsync(() =>
    import('./bracket-renderer.service').then((m) => m.BracketRendererService),
  );

  protected readonly bracket = resource<BracketNode[], void>({
    loader: async () => {
      const renderer = await this.loadRenderer();
      await renderer.loadHeavyDeps();
      return renderer.getDemoBracket();
    },
  });
}
