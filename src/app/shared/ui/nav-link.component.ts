import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav-link',
  imports: [RouterLink],
  template: `
    <a
      [routerLink]="path()"
      [class]="{
        'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors': true,
        'bg-white/10 text-white shadow-inner': active(),
        'text-slate-400 hover:bg-white/5 hover:text-slate-100': !active(),
      }"
    >
      <span class="text-lg">{{ icon() }}</span>
      <span>{{ label() }}</span>
      @if (active()) {
        <span class="ml-auto inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
      }
    </a>
  `,
})
export class NavLinkComponent {
  readonly path = input.required<string>();
  readonly label = input.required<string>();
  readonly icon = input<string>('•');
  readonly active = input.required<boolean>();
}
