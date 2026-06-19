import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">{{ kicker() }}</p>
        <h1 class="mt-1 text-3xl font-bold text-white md:text-4xl">{{ title() }}</h1>
        @if (subtitle(); as sub) {
          <p class="mt-2 max-w-2xl text-sm text-slate-400">{{ sub }}</p>
        }
      </div>
      <ng-content select="[actions]" />
    </header>
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly kicker = input<string>('Mundial 2026');
  readonly subtitle = input<string | null>(null);
}
