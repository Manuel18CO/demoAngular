import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: `
    <div class="flex items-center gap-3 text-sm text-slate-400">
      <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent"></span>
      <ng-content>Cargando…</ng-content>
    </div>
  `,
})
export class LoaderComponent {}
