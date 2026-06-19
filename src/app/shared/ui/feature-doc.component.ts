import { Component, input, signal } from '@angular/core';

export interface FeatureDocEntry {
  feature: string;
  description: string;
  code: string;
  file?: string;
  status?: 'estable' | 'experimental' | 'preview' | 'deprecated';
  since?: string;
}

@Component({
  selector: 'app-feature-doc',
  template: `
    <section class="mb-6 overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/[0.06] to-cyan-500/[0.03]">
      <button
        type="button"
        (click)="toggle()"
        class="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-white/[0.03]"
      >
        <span class="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
          Angular 22
        </span>
        <span class="text-sm font-semibold text-white">Qué APIs ves en esta página</span>
        <span class="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400">
          {{ entries().length }} {{ entries().length === 1 ? 'feature' : 'features' }}
        </span>
        <span class="ml-auto inline-block text-slate-400 transition-transform" [class.rotate-180]="open()">▾</span>
      </button>

      @if (open()) {
        <div class="grid gap-4 border-t border-white/5 px-5 py-5 lg:grid-cols-2">
          @for (e of entries(); track e.feature) {
            <article class="flex flex-col rounded-xl border border-white/5 bg-slate-950/60 p-4">
              <header class="mb-2 flex flex-wrap items-center gap-2">
                <h4 class="font-mono text-sm font-bold text-emerald-300">{{ e.feature }}</h4>
                @if (e.status) {
                  <span [class]="statusClass(e.status)" class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {{ e.status }}
                  </span>
                }
                @if (e.since) {
                  <span class="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                    {{ e.since }}
                  </span>
                }
                @if (e.file) {
                  <span class="ml-auto font-mono text-[10px] text-slate-500">{{ e.file }}</span>
                }
              </header>
              <p class="mb-3 text-xs leading-relaxed text-slate-300">{{ e.description }}</p>
              <div class="relative mt-auto">
                <pre class="overflow-x-auto rounded-lg bg-black/40 p-3 pr-12 font-mono text-[11px] leading-relaxed text-slate-200"><code>{{ e.code }}</code></pre>
                <button
                  type="button"
                  (click)="copy(e.code)"
                  class="absolute right-2 top-2 rounded-md border border-white/10 bg-slate-900/80 px-2 py-1 text-[10px] font-medium text-slate-300 transition hover:border-emerald-400/40 hover:text-emerald-300"
                  [attr.aria-label]="'Copiar código de ' + e.feature"
                >
                  @if (justCopied() === e.feature) { ✓ Copiado } @else { Copiar }
                </button>
              </div>
            </article>
          }
        </div>
      }
    </section>
  `,
})
export class FeatureDocComponent {
  readonly entries = input.required<FeatureDocEntry[]>();
  readonly defaultOpen = input<boolean>(false);

  protected readonly open = signal(true);
  protected readonly justCopied = signal<string | null>(null);

  constructor() {
    queueMicrotask(() => this.open.set(this.defaultOpen()));
  }

  protected toggle(): void {
    this.open.update((v) => !v);
  }

  protected async copy(code: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      const entry = this.entries().find((e) => e.code === code);
      if (entry) {
        this.justCopied.set(entry.feature);
        setTimeout(() => this.justCopied.set(null), 1500);
      }
    } catch {

    }
  }

  protected statusClass(status: NonNullable<FeatureDocEntry['status']>): string {
    switch (status) {
      case 'estable': return 'bg-emerald-500/20 text-emerald-300';
      case 'experimental': return 'bg-amber-500/20 text-amber-300';
      case 'preview': return 'bg-sky-500/20 text-sky-300';
      case 'deprecated': return 'bg-rose-500/20 text-rose-300';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  }
}
