import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, max, min, minLength, required, submit } from '@angular/forms/signals';
import { PredictionsService } from '../../core/services/predictions.service';
import { Prediction } from '../../core/models/prediction';
import { TEAMS } from '../../core/mocks/teams.data';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { FeatureDocComponent, FeatureDocEntry } from '../../shared/ui/feature-doc.component';

const DOC: FeatureDocEntry[] = [
  {
    feature: 'form() + schema con validadores',
    status: 'estable',
    file: 'predictions.component.ts',
    description: 'Signal Forms construye un FieldTree desde un signal del modelo. El callback declara reglas (required, email, min, minLength…). Validación tipada y reactiva sin FormBuilder.',
    code: `protected readonly predictionForm = form(this.predictionModel, (path) => {
  required(path.participant);
  minLength(path.participant, 3);
  required(path.email);
  email(path.email);
  min(path.totalGoals, 50);
  max(path.totalGoals, 300);
});`,
  },
  {
    feature: '[formField] directive',
    status: 'estable',
    description: 'Enlaza un control HTML nativo a un campo del FieldTree. Two-way binding, errores y estado touched/dirty disponibles vía field().errors() / field().touched().',
    code: `<input type="email" [formField]="predictionForm.email" />

@if (predictionForm.email().touched() && predictionForm.email().errors().length) {
  <span>Correo no válido</span>
}`,
  },
  {
    feature: 'submit(form, action)',
    status: 'estable',
    description: 'Valida, marca todo como touched y solo ejecuta la acción si el formulario es válido. Devuelve un Promise<boolean>.',
    code: `const ok = await submit(this.predictionForm, async (field) => {
  await this.predictionsService.submit(field().value());
});
if (ok) this.status.set('success');`,
  },
];

const initial: Prediction = {
  participant: '',
  email: '',
  championTeamId: '',
  runnerUpTeamId: '',
  topScorerName: '',
  totalGoals: 150,
  notes: '',
};

@Component({
  selector: 'app-predictions',
  imports: [FormField, PageHeaderComponent, FeatureDocComponent],
  template: `
    <app-page-header
      kicker="Apuesta de oficina"
      title="Quiniela"
      subtitle="Signal Forms estable — validación con required, email, minLength, min/max."
    />

    <app-feature-doc [entries]="docEntries" />

    @if (status() === 'success') {
      <div class="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
        ✅ Predicción registrada. ¡Suerte!
      </div>
    }

    <form
      class="grid max-w-3xl gap-5"
      (submit)="onSubmit($event)"
    >
      <div class="grid gap-4 md:grid-cols-2">
        <label class="flex flex-col gap-1.5 text-sm">
          <span class="text-slate-300">Tu nombre</span>
          <input
            type="text"
            [formField]="predictionForm.participant"
            class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
          />
          @if (predictionForm.participant().touched() && predictionForm.participant().errors().length) {
            <span class="text-xs text-rose-400">El nombre debe tener al menos 3 caracteres.</span>
          }
        </label>

        <label class="flex flex-col gap-1.5 text-sm">
          <span class="text-slate-300">Correo electrónico</span>
          <input
            type="email"
            [formField]="predictionForm.email"
            class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
          />
          @if (predictionForm.email().touched() && predictionForm.email().errors().length) {
            <span class="text-xs text-rose-400">Introduce un correo válido.</span>
          }
        </label>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <label class="flex flex-col gap-1.5 text-sm">
          <span class="text-slate-300">Campeón</span>
          <select
            [formField]="predictionForm.championTeamId"
            class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
          >
            <option value="">Elige al campeón</option>
            @for (t of teams; track t.id) {
              <option [value]="t.id">{{ t.flag }} {{ t.name }}</option>
            }
          </select>
          @if (predictionForm.championTeamId().touched() && predictionForm.championTeamId().errors().length) {
            <span class="text-xs text-rose-400">Obligatorio.</span>
          }
        </label>

        <label class="flex flex-col gap-1.5 text-sm">
          <span class="text-slate-300">Subcampeón</span>
          <select
            [formField]="predictionForm.runnerUpTeamId"
            class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
          >
            <option value="">Elige al subcampeón</option>
            @for (t of teams; track t.id) {
              <option [value]="t.id">{{ t.flag }} {{ t.name }}</option>
            }
          </select>
        </label>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <label class="flex flex-col gap-1.5 text-sm">
          <span class="text-slate-300">Máximo goleador</span>
          <input
            type="text"
            [formField]="predictionForm.topScorerName"
            placeholder="Ej. Lamine Yamal"
            class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
          />
        </label>

        <label class="flex flex-col gap-1.5 text-sm">
          <span class="text-slate-300">Goles totales del torneo (50–300)</span>
          <input
            type="number"
            [formField]="predictionForm.totalGoals"
            class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white tabular-nums focus:border-emerald-400 focus:outline-none"
          />
          @if (predictionForm.totalGoals().touched() && predictionForm.totalGoals().errors().length) {
            <span class="text-xs text-rose-400">Debe estar entre 50 y 300.</span>
          }
        </label>
      </div>

      <label class="flex flex-col gap-1.5 text-sm">
        <span class="text-slate-300">Comentarios (opcional)</span>
        <textarea
          rows="3"
          [formField]="predictionForm.notes"
          class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
        ></textarea>
      </label>

      <div class="flex items-center gap-4">
        <button
          type="submit"
          [disabled]="status() === 'submitting' || predictionForm().invalid()"
          class="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          @if (status() === 'submitting') { Enviando… } @else { Enviar quiniela }
        </button>
        <span class="text-xs text-slate-500">
          @if (predictionForm().dirty()) { cambios sin guardar } @else { · }
        </span>
      </div>
    </form>
  `,
})
export class PredictionsComponent {
  private readonly predictionsService = inject(PredictionsService);

  protected readonly docEntries = DOC;
  protected readonly teams = TEAMS;
  protected readonly status = signal<'idle' | 'submitting' | 'success'>('idle');

  protected readonly predictionModel = signal<Prediction>({ ...initial });

  protected readonly predictionForm = form(this.predictionModel, (path) => {
    required(path.participant);
    minLength(path.participant, 3);
    required(path.email);
    email(path.email);
    required(path.championTeamId);
    required(path.runnerUpTeamId);
    min(path.totalGoals, 50);
    max(path.totalGoals, 300);
  });

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.status.set('submitting');
    const ok = await submit(this.predictionForm, async (field) => {
      await this.predictionsService.submit(field().value());
    });
    if (ok) {
      this.status.set('success');
      this.predictionModel.set({ ...initial });
    } else {
      this.status.set('idle');
    }
  }
}
