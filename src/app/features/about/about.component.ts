import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { FeatureDocComponent, FeatureDocEntry } from '../../shared/ui/feature-doc.component';

const DEFAULTS_DOC: FeatureDocEntry[] = [
  {
    feature: 'OnPush como estrategia de detección por defecto',
    status: 'estable',
    since: 'v22',
    description: 'En Angular 22 OnPush es la estrategia por defecto en componentes nuevos. Encaja con Signals y Zoneless: los Signals notifican con precisión, y OnPush limita la detección a los componentes afectados. Si necesitas el comportamiento anterior, declara la nueva opción ChangeDetectionStrategy.Eager (reemplaza al antiguo "Default", ya deprecado). Durante ng update, Angular añade Eager automáticamente donde no estuviera OnPush para no romper apps existentes.',
    code: `import { ChangeDetectionStrategy, Component } from '@angular/core';

// Componente heredado de nuestra app: forzamos el comportamiento antiguo
@Component({
  selector: 'app-legacy-scoreboard',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: \`<h2>{{ match.homeTeam }} vs {{ match.awayTeam }}</h2>\`,
})
export class LegacyScoreboardComponent {
  @Input() match!: Match;
}`,
  },
  {
    feature: 'Incremental Hydration activada por defecto',
    status: 'estable',
    since: 'v22',
    description: 'provideClientHydration() ahora activa Incremental Hydration automáticamente. Si no la necesitas, la deshabilitas explícitamente con withNoIncrementalHydration(). La actualización incluye un schematic que ayuda con la migración.',
    code: `// app.config.ts (si activamos SSR para la demo)
providers: [
  provideClientHydration(),                          // Incremental Hydration ON
  // provideClientHydration(withNoIncrementalHydration()), // opt-out
],`,
  },
  {
    feature: 'HttpClient: FetchBackend por defecto',
    status: 'estable',
    since: 'v22',
    description: 'HttpClient ahora usa Fetch API por defecto. withFetch() queda deprecado. Fetch está disponible en navegadores y SSR modernos, ofrece API basada en Promise y streaming. Como Fetch no soporta upload progress, la opción reportProgress (deprecada) se sustituye por reportDownloadProgress y reportUploadProgress. Si usas reportUploadProgress con Fetch, Angular lanza un error: necesitas volver a XHR con withXhr(). ng update añade withXhr() automáticamente para no cambiar comportamiento.',
    file: 'app.config.ts',
    code: `// app.config.ts: ya funciona sin withFetch (deprecated)
provideHttpClient();

// Descarga de un sticker album del Mundial (sí funciona con Fetch)
this.http.get('/api/album/stickers.zip', {
  reportDownloadProgress: true,
  observe: 'events',
});

// Subir foto de perfil para la quiniela: requiere XHR
this.http.post('/api/predictions/avatar', file, {
  reportUploadProgress: true,
  observe: 'events',
});

// Para que reportUploadProgress no lance, volvemos a XHR explícito:
provideHttpClient(withXhr());`,
  },
];

const RESOURCE_DOC: FeatureDocEntry[] = [
  {
    feature: 'Resource API estable: resource / rxResource / httpResource',
    status: 'estable',
    since: 'v22',
    description: 'El "eslabón perdido" de Signals: derivación reactiva y asíncrona de datos. La entrada más cómoda es httpResource, que recibe una lambda devolviendo la request HTTP. Si un Signal usado dentro cambia, la petición se reinicia automáticamente. Tipa la respuesta con el parámetro genérico, defaultValue evita undefined al inicio, y devolver undefined desde la lambda pausa la petición. Expone value(), error(), isLoading() y un status() detallado con valores idle | loading | reloading | error | resolved | local. Las race conditions se gestionan solas (equivalente a switchMap).',
    file: 'core/services/teams.service.ts',
    code: `// core/services/teams.service.ts
@Service()
export class TeamsService {
  teams(query: Signal<TeamsQuery>) {
    return httpResource<Team[]>(
      () => ({
        url: '/api/teams',
        params: { q: query().q, confederation: query().confederation },
      }),
      { defaultValue: [] },
    );
  }
}

// Detalle de selección: pausar si todavía no hay :id
team(id: Signal<string | null>) {
  return httpResource<Team | undefined>(() => {
    const value = id();
    return value ? \`/api/teams/\${value}\` : undefined;
  });
}

// En el componente
search(): void { this.teams.reload(); }`,
  },
  {
    feature: 'Composición de Resources con snapshots',
    status: 'estable',
    since: 'v21.2',
    description: 'Antes solo podías derivar Signals individuales (value, error, isLoading) de un Resource. Ahora con la señal snapshot() obtienes el estado completo (status + value) y puedes mapearlo a un nuevo snapshot con linkedSignal. De ese snapshot derivado, resourceFromSnapshots construye un nuevo Resource. Patrón genérico para transformaciones arbitrarias. Un caso de uso destacado: mantener el último valor cargado durante reloads en lugar de mostrar undefined.',
    file: 'features/standings/standings.component.ts',
    code: `// features/standings/standings.component.ts
// Derivar la clasificación del Mundial a partir del recurso de partidos
private readonly matchesResource = this.matchesService.matches(
  signal({ stage: 'group' as const }),
);

private readonly standingsSnapshot = linkedSignal({
  source: () => this.matchesResource.snapshot(),
  computation: (snap) => {
    if (snap.status === 'error') {
      return { status: 'error', error: snap.error };
    }
    const value = computeStandings(snap.value ?? []);
    return { status: snap.status, value };
  },
});

// El resultado es un nuevo Resource<StandingRow[]>
protected readonly standings = resourceFromSnapshots(this.standingsSnapshot);

// Patrón "mantener valor anterior": evita parpadeos al recargar el calendario
function withPreviousMatches(input: Resource<Match[]>): Resource<Match[]> {
  const derived = linkedSignal({
    source: input.snapshot,
    computation: (snap, previous) => {
      if (snap.status === 'loading' && previous?.value?.status === 'resolved') {
        return { ...snap, value: previous.value.value };
      }
      return snap;
    },
  });
  return resourceFromSnapshots(derived);
}`,
  },
  {
    feature: 'debounced(signal, ms)',
    status: 'estable',
    since: 'v22',
    description: 'Los Signals no conocen el tiempo (a diferencia de los Observables). debounced crea un Resource cuyo valor se actualiza con el retraso indicado. Su status indica si todavía está en la ventana pendiente. Para formularios, Signal Forms tiene debouncing propio integrado; para todo lo demás (búsquedas, filtros, derivados), debounced es el helper.',
    file: 'features/teams/teams-list.component.ts',
    code: `// features/teams/teams-list.component.ts
import { computed, debounced, signal } from '@angular/core';

protected readonly query = signal('');                         // input "Argen..."
private readonly debouncedQuery = debounced(this.query, 300);  // espera 300 ms

// Lo que viaja al httpResource ya viene debouncado
private readonly httpQuery = computed(() => ({
  q: this.debouncedQuery.value() ?? '',
  confederation: this.confederation(),
}));

protected readonly teams = this.teamsService.teams(this.httpQuery);

effect(() => console.log('query debounced:', this.debouncedQuery.value()));`,
  },
  {
    feature: 'httpResource + HTTP Transfer State',
    status: 'estable',
    since: 'v22',
    description: 'Los Resources que se precargan en el servidor (SSR) ahora aprovechan automáticamente el HTTP Transfer State. En el navegador no se reemite la petición: el cliente reutiliza los datos cargados en el servidor durante la primera renderización.',
    code: `// El comportamiento es automático, sin código extra.
// Si activásemos SSR en la demo:
//   1. provideClientHydration() en app.config
//   2. provideHttpClient() (Fetch por defecto)
//   3. Cada httpResource (TeamsService, MatchesService) precarga en el server
//      → llega al navegador con los datos sin segunda petición.`,
  },
];

const FORMS_DOC: FeatureDocEntry[] = [
  {
    feature: 'Signal Forms estable · form() + schema',
    status: 'estable',
    since: 'v22',
    description: 'Camino récord de experimental a estable, validado en casos reales internos de Google. La función form recibe un Signal con el modelo y un schema opcional con reglas. Resultado: un FieldTree tipado donde cada nodo expone value(), dirty(), invalid(), errors() como signals. En plantilla, la directiva FormField vincula campos a inputs nativos.',
    file: 'features/predictions/predictions.component.ts',
    code: `// features/predictions/predictions.component.ts
import { email, form, min, max, minLength, required } from '@angular/forms/signals';

protected readonly predictionModel = signal<Prediction>({
  participant: '', email: '',
  championTeamId: '', runnerUpTeamId: '',
  topScorerName: '', totalGoals: 150, notes: '',
});

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

// Template
// <input type="email" [formField]="predictionForm.email" />
// <div>{{ predictionForm.email().errors() | json }}</div>`,
  },
  {
    feature: 'FormRoot + submission API',
    status: 'estable',
    since: 'v21.2',
    description: 'Toda la lógica de envío puede declararse junto al form. submission.action ejecuta el guardado async y puede devolver errores de validación del servidor que se mergean al estado. ignoreValidators controla si los validadores fallidos/pending bloquean el envío (none | pending | all). onInvalid se invoca cuando la validación impide enviar. En plantilla, la directiva FormRoot vincula el FieldTree a la etiqueta <form>: suprime el comportamiento nativo de validación del navegador, conecta action al submit, e impide mensajes duplicados. Un <button> sin type explícito dentro del form actúa como submit por defecto. Para acciones extra (p. ej. "solicitar aprobación") se usa el helper submit() que solo ejecuta si el form es válido.',
    code: `// features/predictions/predictions.component.ts — variante con submission API
protected readonly predictionForm = form(this.predictionModel, predictionSchema, {
  submission: {
    action: async (form) =>
      this.predictionsService.submit(form().value()),
    ignoreValidators: 'none',
    onInvalid: (form) => this.reportValidationError(form),
  },
});

// Template
// <form [formRoot]="predictionForm">
//   <input [formField]="predictionForm.email" />
//   <!-- el <button> sin type actúa como submit -->
//   <button>Enviar quiniela</button>
// </form>

// Acción extra: solicitar validación a otro participante de la oficina
async requestPeerReview(): Promise<void> {
  await submit(this.predictionForm, {
    action: async (form) =>
      this.predictionsService.requestReview(form().value()),
    ignoreValidators: 'none',
    onInvalid: (form) => this.reportValidationError(form),
  });
}

private reportValidationError(form: FieldTree<Prediction>): void {
  this.toast.show('Revisa los campos marcados', 'OK');
  const errors = form().errorSummary();
  if (errors.length > 0) errors[0].fieldTree().focusBoundControl();
}`,
  },
  {
    feature: 'Clases CSS condicionales para Signal Forms',
    status: 'estable',
    since: 'v21.2',
    description: 'Mediante provideSignalFormsConfig defines un mapeo de nombre de clase a predicado de estado. Signal Forms aplica las clases automáticamente al input vinculado. Si quieres las mismas clases que con Reactive/Template-driven Forms, usa NG_STATUS_CLASSES del namespace /compat.',
    code: `// app.config.ts — pintar el formulario de la Quiniela
provideSignalFormsConfig({
  classes: {
    'wc-invalid':  f => f.state().invalid(),
    'wc-valid':    f => f.state().valid(),
    'wc-dirty':    f => f.state().dirty(),
    'wc-pending':  f => f.state().pending(),
  },
});

// O reutilizar las clases de toda la vida (ng-valid, ng-invalid, …)
import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';
provideSignalFormsConfig({ classes: NG_STATUS_CLASSES });

// styles.css
// input.wc-valid    { border-left: 3px solid #34d399; } /* emerald */
// input.wc-invalid.wc-dirty { border-left: 3px solid #fb7185; } /* rose */
// input.wc-pending  { border-left: 3px solid #f59e0b; }`,
  },
  {
    feature: 'Interoperabilidad con Reactive Forms (compatForm + SignalFormControl)',
    status: 'estable',
    since: 'v22',
    description: 'Signal Forms se integra con Reactive Forms existentes vía @angular/forms/signals/compat. SignalFormControl se comporta como un AbstractControl y puede embeberse en estructuras Reactive. compatForm conecta un modelo Signal Forms con controles reactivos. Signal Forms también entiende CVAs y validadores clásicos. El puente a CVA se puede deshabilitar por campo con ngNoCva.',
    code: `// Escenario: la Quiniela vive en Signal Forms, pero queremos
// embeber un control "Datos de envío" legacy en Reactive Forms.
import { compatForm, SignalFormControl } from '@angular/forms/signals/compat';

protected readonly shipping = new SignalFormControl(
  this.shippingModel(),
  (path) => {
    required(path.address);
    required(path.zip);
    required(path.country);
  },
);

protected readonly predictionForm = compatForm(this.predictionModel, (path) => {
  required(path.championTeamId);
});

// Deshabilitar el adaptador CVA para un campo legacy concreto
// <legacy-team-picker ngNoCva [field]="predictionForm.championTeamId" />`,
  },
  {
    feature: 'validateStandardSchema con reglas dinámicas',
    status: 'estable',
    since: 'v21.2',
    description: 'Standard Schema es la interfaz que implementan Zod, Valibot, etc. Signal Forms incluye validateStandardSchema que la entiende directamente, sin adaptador. Desde v21.2 también acepta una lambda en vez de un schema fijo: internamente se convierte en un computed, así que cuando cambia un signal usado dentro, se reevalúa y se aplican las nuevas reglas al instante.',
    code: `// Schemas Zod para la Quiniela
const PredictionZod = z.object({
  participant: z.string().min(3),
  email: z.string().email(),
  championTeamId: z.string().min(1),
  runnerUpTeamId: z.string().min(1),
  totalGoals: z.number().int().min(50).max(300),
});

// Modo "torneo en juego": ya no se admiten cambios drásticos
const PredictionLockedZod = z.object({
  participant: z.string().min(3),
  email: z.string().email(),
  championTeamId: z.string().min(1),
  runnerUpTeamId: z.string().min(1),
  totalGoals: z.number().int().min(120).max(220),
});

export function validateWithSchema(
  path: SchemaPathTree<Prediction>,
  knockoutStarted: Signal<boolean>,
) {
  validateStandardSchema(
    path,
    () => knockoutStarted() ? PredictionLockedZod : PredictionZod,
  );
}`,
  },
  {
    feature: 'disabled / readonly / hidden con propiedad when',
    status: 'estable',
    since: 'v22',
    description: 'Los helpers disabled, readonly y hidden reciben ahora la condición vía propiedad when del objeto de opciones (API más consistente). En el caso de disabled, when puede devolver true | false | string — la cadena se usa como motivo explicativo. El ctx da acceso reactivo a otros campos del formulario para expresar relaciones cruzadas.',
    code: `import { disabled, hidden, readonly } from '@angular/forms/signals';

// Bloquear "subcampeón" hasta que se elija "campeón"
disabled(path.runnerUpTeamId, {
  when: (ctx) =>
    ctx.valueOf(path.championTeamId) ? false : 'Elige campeón primero',
});

// Tras enviar la quiniela, el goleador queda en read-only
readonly(path.topScorerName, {
  when: (ctx) => ctx.valueOf(path.submitted),
});

// Ocultar el campo "notas" durante la fase eliminatoria
hidden(path.notes, {
  when: (ctx) => ctx.valueOf(path.knockoutStarted),
});`,
  },
];

const DI_DOC: FeatureDocEntry[] = [
  {
    feature: '@Service() decorador',
    status: 'estable',
    since: 'v22',
    description: 'Reemplaza @Injectable() / @Injectable({ providedIn: "root" }) en los casos comunes. Por defecto el servicio queda auto-provisto en root. Si no lo quieres, pasa { autoProvided: false } y provéelo manualmente (en app.config, a nivel de componente o de ruta).',
    file: 'core/services/teams.service.ts',
    code: `import { Service } from '@angular/core';

// Caso común: servicio compartido, alcance root
@Service()
export class TeamsService {
  teams(query: Signal<TeamsQuery>) { /* httpResource */ }
}

@Service()
export class MatchesService { /* … */ }

// Provisión manual (p. ej. servicio scope-ruta para /bracket)
@Service({ autoProvided: false })
export class BracketRendererService { /* … */ }`,
  },
  {
    feature: 'injectAsync()',
    status: 'estable',
    since: 'v22',
    description: 'Inyección perezosa: el módulo del servicio solo se descarga cuando realmente se necesita. injectAsync recibe una lambda que devuelve una Promise (import dinámico). El resultado es una función cuya primera llamada dispara la carga. Útil para servicios que arrastran librerías pesadas. El servicio inyectado debe ser auto-provisto: @Injectable({ providedIn: "root" }) o @Service().',
    file: 'features/bracket/bracket.component.ts',
    code: `// features/bracket/bracket.component.ts
import { injectAsync, resource } from '@angular/core';

@Component({ /* … */ })
export class BracketComponent {
  // El renderer del cuadro de eliminatorias arrastra una librería de chart pesada.
  // injectAsync hace que su chunk solo se descargue al entrar en /bracket.
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
}`,
  },
  {
    feature: 'Prefetch perezoso con onIdle',
    status: 'estable',
    since: 'v22',
    description: 'injectAsync acepta una opción prefetch: una función que devuelve una Promise. Cuando esa Promise resuelve, Angular comienza a cargar el servicio en segundo plano. El helper onIdle devuelve una Promise que resuelve cuando el navegador está ocioso (usa requestIdleCallback con fallback a setTimeout). Acepta un timeout opcional. También puede configurarse globalmente con provideIdleServiceWith() para inyectar tu propio IdleService.',
    code: `import { injectAsync, onIdle } from '@angular/core';

// Mientras el usuario está en /dashboard, precargamos el renderer
// del cuadro: cuando navegue a /bracket ya estará listo.
private readonly loadRenderer = injectAsync(
  () => import('./bracket-renderer.service').then((m) => m.BracketRendererService),
  { prefetch: onIdle },
);

// Con timeout: si el navegador nunca está ocioso, fuerza la carga
injectAsync(
  () => import('./bracket-renderer.service').then((m) => m.BracketRendererService),
  { prefetch: () => onIdle({ timeout: 100 }) },
);

// Configuración global (sustituye el IdleService por uno propio)
// app.config.ts
provideIdleServiceWith(customIdleService)`,
  },
];

const ROUTER_DOC: FeatureDocEntry[] = [
  {
    feature: 'withExperimentalAutoCleanupInjectors()',
    status: 'experimental',
    since: 'v21.1',
    description: 'Hasta ahora, los servicios registrados en providers de una Route no se destruían al salir de la ruta (herencia del comportamiento de los antiguos NgModule providers). Con esta feature, los Environment Injectors de la ruta y sus instancias se destruyen automáticamente al abandonar la ruta. Adiós a leaks por servicios scope-ruta.',
    file: 'app.config.ts',
    code: `// app.config.ts
import {
  provideRouter,
  withComponentInputBinding,
  withExperimentalAutoCleanupInjectors,
} from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(
      routes,
      withComponentInputBinding(),         // :id de ruta → input.required<string>()
      withExperimentalAutoCleanupInjectors(), // p.ej. al salir de /bracket,
    ),                                         // destruye servicios scope-ruta
  ],
};`,
  },
  {
    feature: 'isActive() · Signal<boolean>',
    status: 'estable',
    since: 'v22',
    description: 'Determina programáticamente si una ruta está activa, devolviendo un Signal que se reevalúa al cambiar la URL. Tercer parámetro opcional IsActiveMatchOptions: paths ("exact" | "subset"), matrixParams ("exact" | "subset" | "ignored"), queryParams ("exact" | "subset" | "ignored"), fragment ("exact" | "ignored"). Por defecto paths usa coincidencia subset: la ruta es activa si la URL actual la contiene.',
    file: 'app.ts',
    code: `// app.ts (shell del Mundial)
import { isActive, Router } from '@angular/router';

@Component({ /* … */ })
export class App {
  private readonly router = inject(Router);

  protected readonly teamsActive    = isActive('/teams',    this.router);
  protected readonly matchesActive  = isActive('/matches',  this.router);
  protected readonly standingsActive = isActive('/standings', this.router);

  // Solo coincidencia exacta para /bracket (no encaja /bracket/anything)
  protected readonly bracketActive  = isActive('/bracket', this.router, {
    paths: 'exact',
  });
}

// Template del sidebar
// <a [routerLink]="['/teams']"
//    [class.active]="teamsActive()">Selecciones</a>`,
  },
  {
    feature: 'Wildcard routes con segmentos finales',
    status: 'estable',
    since: 'v21.1',
    description: 'El comodín ** ahora puede llevar segmentos antes y después: por ejemplo "foo/**/bar". Antes solo era posible con un matcher custom. Útil sobre todo para apps shell que tienen que cargar el micro frontend correcto en función de un patrón en la ruta.',
    code: `// Patrón típico de "shell" del Mundial: cualquier path bajo /federation/.../team
// debe cargar el detalle de selección, sea cual sea la federación intermedia.
export const routes: Routes = [
  {
    path: 'federation/**/team/:id',
    loadComponent: () =>
      import('./features/teams/team-detail.component')
        .then((m) => m.TeamDetailComponent),
  },
];`,
  },
  {
    feature: 'Location strategies con trailing-slash',
    status: 'estable',
    since: 'v21.2',
    description: 'Dos nuevas subclases controlan si las URLs en la barra de direcciones terminan o no en "/": TrailingSlashPathLocationStrategy y NoTrailingSlashPathLocationStrategy.',
    code: `// Si el CDN del Mundial sirve /standings/ con / final, lo declaramos:
import { TrailingSlashPathLocationStrategy } from '@angular/common';

providers: [
  { provide: LocationStrategy, useClass: TrailingSlashPathLocationStrategy },
],
// /standings   →  /standings/
// /teams/usa   →  /teams/usa/`,
  },
];

const TEMPLATE_DOC: FeatureDocEntry[] = [
  {
    feature: 'Spread y rest args en plantillas',
    status: 'estable',
    since: 'v21.1',
    description: 'Object spread, array spread y rest arguments en llamadas de función dentro de plantillas. Antes solo se admitía en clases TS. Permite componer maps de clases reutilizables y construir listas dinámicas inline.',
    file: 'features/matches/matches.component.ts',
    code: `// features/matches/matches.component.ts
protected readonly baseCardClasses = {
  'rounded-xl border border-white/5 bg-white/[0.04] p-3': true,
  'hover:bg-white/[0.07]': true,
};

// Tarjeta de partido — añade un anillo si está en vivo
<li [class]="{
  ...baseCardClasses,
  'ring-1 ring-emerald-400/40': match.status === 'live',
}">…</li>

// Concatenar selecciones favoritas con el resto
<ul>
  @for (t of [...favourites(), ...rest()]; track t.id) {
    <li>{{ t.flag }} {{ t.name }}</li>
  }
</ul>

// Sumar goles totales con rest args
{{ sumGoals(...lastFiveMatches().map(m => m.homeScore + m.awayScore)) }}`,
  },
  {
    feature: '@switch · múltiples @case (fall-through)',
    status: 'estable',
    since: 'v21.1',
    description: 'Varios marcadores @case consecutivos comparten el mismo bloque, análogo al fall-through de otros lenguajes.',
    code: `// Lo terminado y lo en vivo comparten estilo de marcador, lo pendiente otro
@switch (match.status) {
  @case ('finished')
  @case ('live')      { <strong>{{ match.homeScore }} : {{ match.awayScore }}</strong> }
  @case ('scheduled') { <span>— : —</span> }
  @default            { <span>?</span> }
}`,
  },
  {
    feature: 'Arrow functions en plantillas',
    status: 'estable',
    since: 'v21.2',
    description: 'Funciones flecha con retorno implícito dentro de expresiones de plantilla. Útiles en @for y en bindings de eventos. NO se admiten cuerpos de bloque ({…}) ni pipes dentro del cuerpo. Las funciones que solo usan sus parámetros se elevan a nivel de módulo por el compilador; las que dependen del contexto se cachean en la vista para mantener identidad estable.',
    code: `// Marcar como favorita una selección al click
@for (team of teams.value(); track team.id) {
  <button (click)="toggleFavourite((t) => t.id === team.id)">
    {{ team.flag }} {{ team.name }}
  </button>
}

// Filtrar partidos en directo sin método auxiliar en clase
@for (m of allMatches.value().filter((x) => x.status === 'live'); track m.id) {
  <app-live-match [match]="m" />
}`,
  },
  {
    feature: 'instanceof en plantillas',
    status: 'estable',
    since: 'v21.2',
    description: 'Comprobaciones de tipo con instanceof directamente en plantilla, con type-narrowing posterior.',
    code: `// El handler unificado recibe MouseEvent o TouchEvent
@if (matchEvent instanceof MouseEvent) {
  <p>Pulsado en ({{ matchEvent.clientX }}, {{ matchEvent.clientY }})</p>
}
@if (matchEvent instanceof TouchEvent) {
  <p>{{ matchEvent.touches.length }} dedos en la pantalla</p>
}`,
  },
  {
    feature: '@switch exhaustivo con @default never;',
    status: 'estable',
    since: 'v21.2',
    description: 'Añadiendo @default never; al final de un @switch, TypeScript verifica en compile-time que todos los casos de un union están cubiertos. Si más tarde se añade un nuevo valor al union y no se maneja, la compilación falla.',
    code: `// MatchStatus = 'scheduled' | 'live' | 'finished';
// Si mañana añadimos 'postponed' al union, la plantilla falla en compilación.
status: MatchStatus = 'scheduled';

@switch (status) {
  @case ('scheduled') { <span>Próximamente</span> }
  @case ('live')      { <span>En directo</span> }
  @case ('finished')  { <span>Final</span> }
  @default never;
}`,
  },
  {
    feature: 'never(expression) en @switch',
    status: 'estable',
    since: 'v22',
    description: 'Cuando el discriminador es una propiedad de una union discriminada, TypeScript estrecha la propiedad pero no sabe si está cubierta la union completa. Con never(<expr>) especificas explícitamente sobre qué expresión validar la exhaustividad.',
    file: 'features/matches/matches.component.ts',
    code: `// Un evento del cuadro puede ser un partido normal o un descanso.
// Discriminado por 'kind'. Aquí @default never(bracket) verifica
// que también se cubre el bracket completo, no solo bracket.kind.
bracket!:
  | { kind: 'match'; home: string; away: string }
  | { kind: 'rest';  reason: string };

@switch (bracket.kind) {
  @case ('match') { {{ bracket.home }} vs {{ bracket.away }} }
  @case ('rest')  { Descanso: {{ bracket.reason }} }
  @default never(bracket);
}`,
  },
  {
    feature: 'Semántica correcta de ?. y helper $null(...)',
    status: 'estable',
    since: 'v22',
    description: 'El operador ?. en plantillas ahora se comporta como en JavaScript: si la cadena se rompe en null/undefined, el resultado es undefined (antes era distinto). Si necesitas el comportamiento Angular antiguo, envuelve con $null(...). Además, el bloque de type-check ahora permite estrechar correctamente tras un truthy-check: tras @if (user?.isMember) puedes acceder a user.isMember sin ?..',
    code: `<!-- Si team o team.captain son undefined, devuelve undefined (no NaN, no '') -->
{{ team?.captain?.name }}

@if (team?.captain) {
  {{ team.captain }}  <!-- narrowing: ya sabemos que existe -->
}

<!-- Comportamiento antiguo de Angular (si tu plantilla lo necesita) -->
{{ $null(team?.captain?.goals) }}`,
  },
  {
    feature: 'Comentarios // y /* */ en elementos HTML',
    status: 'estable',
    since: 'v22',
    description: 'Dentro de la apertura de un elemento HTML ahora puedes intercalar comentarios estilo JavaScript. Útil para estructurar listas largas de atributos.',
    code: `<button
  // botón principal de la quiniela
  class="rounded-xl bg-emerald-500 text-slate-950 px-5 py-2.5"
  /*
    Solo activo si el formulario es válido y no estamos enviando.
    Antes de v22 estas notas iban en un comentario HTML aparte.
  */
  [disabled]="status() === 'submitting' || predictionForm().invalid()"
>
  Enviar quiniela
</button>`,
  },
];

const DEFER_DOC: FeatureDocEntry[] = [
  {
    feature: '@defer (on idle(2000))',
    status: 'estable',
    since: 'v22',
    description: 'El trigger on idle acepta ahora un timeout en milisegundos, análogo a IdleRequestOptions.timeout. Evita que un bloque deferido espere indefinidamente si la ventana de inactividad nunca llega.',
    file: 'features/dashboard/dashboard.component.ts',
    code: `// features/dashboard/dashboard.component.ts
// La tabla de goleadores no se descarga hasta que el navegador
// está inactivo, con un techo máximo de 2 segundos.
@defer (on idle(2000)) {
  <app-top-scorers />
} @placeholder {
  <div>La tabla de goleadores cargará cuando el navegador esté libre…</div>
} @loading {
  <app-loader>Cargando goleadores…</app-loader>
}`,
  },
];

const BOOTSTRAP_DOC: FeatureDocEntry[] = [
  {
    feature: 'ApplicationRef.bootstrap(component, config)',
    status: 'estable',
    since: 'v22',
    description: 'ApplicationRef.bootstrap() acepta un objeto de configuración análogo al de createComponent (incluye hostElement). Relevante para micro frontends que se cargan y arrancan bajo demanda en zonas concretas del DOM.',
    code: `// Empotrar el widget "Próximo partido" en otra app (legacy, Wordpress, …)
appRef.bootstrap(NextMatchWidgetComponent, {
  hostElement: document.querySelector('#wc-next-match')!,
});

// Para cada selección del Mundial podríamos arrancar un mini-dashboard:
for (const team of TEAMS) {
  const host = document.querySelector(\`[data-team="\${team.id}"]\`);
  if (host) appRef.bootstrap(TeamWidgetComponent, { hostElement: host });
}`,
  },
  {
    feature: 'Bootstrap dentro de Shadow Roots',
    status: 'estable',
    since: 'v22',
    description: 'Angular puede arrancar directamente bajo un Shadow Root. Los estilos se registran correctamente con el shadow root padre en SharedStylesHost. Paso adicional hacia integración limpia con Web Components y micro frontends.',
    code: `// Si el widget de selección se inserta en una página de terceros,
// lo encapsulamos en su propio Shadow DOM para aislar estilos.
const host = document.querySelector('wc-team-card')!;
const shadow = host.attachShadow({ mode: 'open' });
appRef.bootstrap(TeamWidgetComponent, { hostElement: shadow });`,
  },
];

const AI_DOC: FeatureDocEntry[] = [
  {
    feature: 'Web MCP Tools',
    status: 'experimental',
    since: 'v22',
    description: 'Aplicaciones Angular pueden registrar herramientas de AI directamente en el inyector. Cuando el inyector se destruye, las tools se eliminan automáticamente — combinación natural con route providers + withExperimentalAutoCleanupInjectors.',
    code: `import {
  provideExperimentalWebMcpTools,
  declareExperimentalWebMcpTool,
} from '@angular/core';

// Exponemos a un asistente AI la capacidad de consultar partidos en directo.
providers: [
  provideExperimentalWebMcpTools(),
  declareExperimentalWebMcpTool({
    name: 'getLiveMatches',
    description: 'Devuelve los partidos actualmente en directo del Mundial 2026.',
    execute: async () => {
      const matches = await inject(MatchesService).fetchLive();
      return matches.map(m => \`\${m.home} \${m.homeScore}-\${m.awayScore} \${m.away}\`);
    },
  }),
],`,
  },
  {
    feature: 'AI runtime debugging · angular:di-graph',
    status: 'estable',
    since: 'v22',
    description: 'En modo dev, Angular registra herramientas de debugging para AI en la página. Entre ellas, angular:di-graph expone el grafo completo de inyección de dependencias (element + environment injectors) a asistentes AI on-page. Habilita análisis asistido por AI del DI graph directamente en el navegador.',
    code: `// En la consola del navegador (modo dev), un asistente AI puede ejecutar:
window.angular['di-graph']();
// devuelve el grafo completo: TeamsService, MatchesService,
// PredictionsService, BracketRendererService y dónde está provisto cada uno.`,
  },
];

const IMAGE_DOC: FeatureDocEntry[] = [
  {
    feature: 'ImageLoaderConfig admite height',
    status: 'estable',
    since: 'v21.2',
    description: 'El image loader ahora acepta la altura además del ancho, para builders que necesitan ambas medidas (p. ej. recortes proporcionales).',
    code: `// Loader propio para los escudos de las 48 selecciones del Mundial
provideImageLoader((cfg) =>
  \`https://cdn.wc26.example/badges/\${cfg.src}\` +
  \`?w=\${cfg.width}&h=\${cfg.height ?? 'auto'}&fit=contain\`
);

// Uso en plantilla
// <img ngSrc="esp.svg" width="64" height="64" alt="Escudo de España" />`,
  },
  {
    feature: 'Transformaciones específicas por provider',
    status: 'estable',
    since: 'v21.1',
    description: 'Los loaders integrados (Cloudflare, Cloudinary, ImageKit, Imgix) aceptan una propiedad transform con opciones nativas del provider.',
    code: `// Fotos de jugadores servidas por Cloudinary, en WebP y con ligero sharpen
provideCloudinaryLoader('https://res.cloudinary.com/wc26-demo/', {
  transform: { format: 'webp', sharpen: 50 },
});

// <img ngSrc="players/yamal.jpg" width="120" height="160" alt="Lamine Yamal" />`,
  },
];

const PLATFORM_DOC: FeatureDocEntry[] = [
  {
    feature: 'TypeScript 6',
    status: 'estable',
    since: 'v21.2',
    description: 'Angular soporta TypeScript 6. TS 5.9 deja de estar soportado.',
    code: `// package.json de la demo
"devDependencies": {
  "@angular/build": "^22.0.1",
  "@angular/cli": "^22.0.1",
  "typescript": "~6.0.2"
}`,
  },
  {
    feature: 'Node.js 26',
    status: 'estable',
    since: 'v22',
    description: 'Angular compila y se ejecuta oficialmente en Node.js 26.',
    code: `// package.json de la demo — engines del runtime que aceptamos
"engines": {
  "node": "^22.22.3 || ^24.15.0 || >=26.0.0"
}`,
  },
];

const TOOLING_DOC: FeatureDocEntry[] = [
  {
    feature: 'MSW (Mock Service Worker)',
    status: 'estable',
    file: 'core/mocks/browser.ts',
    description: 'Intercepta fetch() a nivel de Service Worker. Mocks tipados en TypeScript que conviven con HttpClient + FetchBackend sin tocar tu código de producción. Handlers HTTP idiomáticos.',
    code: `// main.ts
startMocks().then(() => bootstrapApplication(App, appConfig));

// handlers.ts
http.get('/api/teams', async ({ request }) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? '';
  return HttpResponse.json(TEAMS.filter(t => t.name.includes(q)));
});`,
  },
  {
    feature: 'Tailwind CSS v4 · @tailwindcss/postcss',
    status: 'estable',
    file: '.postcssrc.json',
    description: 'Tailwind 4 sin tailwind.config.js: configuración CSS-first. Angular 22 lo procesa vía PostCSS si encuentra .postcssrc.json o postcss.config.json (NO .js).',
    code: `// .postcssrc.json
{
  "plugins": {
    "@tailwindcss/postcss": { "base": "./src" }
  }
}

// styles.css
@import "tailwindcss";`,
  },
  {
    feature: 'i18n: LOCALE_ID + registerLocaleData()',
    status: 'estable',
    file: 'app.config.ts',
    description: 'Locale activo en es-ES. Pipes date, currency, number formatean en español sin más cambios.',
    code: `import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs);

providers: [
  { provide: LOCALE_ID, useValue: 'es-ES' },
]`,
  },
];

@Component({
  selector: 'app-about',
  imports: [PageHeaderComponent, FeatureDocComponent],
  template: `
    <app-page-header
      kicker="Resumen de la demo"
      title="Sobre esta demo"
      subtitle="Catálogo exhaustivo de todo lo que aparece en Angular 22 (y las features de 21.1/21.2 que se consolidan con v22). Cada tarjeta enlaza al archivo donde se usa en la demo cuando aplica."
    />

    <h2 class="mb-3 mt-2 text-sm font-semibold uppercase tracking-wider text-emerald-300">① Cambios por defecto</h2>
    <app-feature-doc [entries]="defaultsDoc" />

    <h2 class="mb-3 mt-4 text-sm font-semibold uppercase tracking-wider text-emerald-300">② Resource API &amp; Signals</h2>
    <app-feature-doc [entries]="resourceDoc" />

    <h2 class="mb-3 mt-4 text-sm font-semibold uppercase tracking-wider text-emerald-300">③ Signal Forms</h2>
    <app-feature-doc [entries]="formsDoc" />

    <h2 class="mb-3 mt-4 text-sm font-semibold uppercase tracking-wider text-emerald-300">④ Inyección de dependencias</h2>
    <app-feature-doc [entries]="diDoc" />

    <h2 class="mb-3 mt-4 text-sm font-semibold uppercase tracking-wider text-emerald-300">⑤ Router</h2>
    <app-feature-doc [entries]="routerDoc" />

    <h2 class="mb-3 mt-4 text-sm font-semibold uppercase tracking-wider text-emerald-300">⑥ Sintaxis de plantilla</h2>
    <app-feature-doc [entries]="templateDoc" />

    <h2 class="mb-3 mt-4 text-sm font-semibold uppercase tracking-wider text-emerald-300">⑦ &#64;defer</h2>
    <app-feature-doc [entries]="deferDoc" />

    <h2 class="mb-3 mt-4 text-sm font-semibold uppercase tracking-wider text-emerald-300">⑧ Bootstrap &amp; micro frontends</h2>
    <app-feature-doc [entries]="bootstrapDoc" />

    <h2 class="mb-3 mt-4 text-sm font-semibold uppercase tracking-wider text-emerald-300">⑨ AI / MCP / debugging</h2>
    <app-feature-doc [entries]="aiDoc" />

    <h2 class="mb-3 mt-4 text-sm font-semibold uppercase tracking-wider text-emerald-300">⑩ NgOptimizedImage</h2>
    <app-feature-doc [entries]="imageDoc" />

    <h2 class="mb-3 mt-4 text-sm font-semibold uppercase tracking-wider text-emerald-300">⑪ Plataforma</h2>
    <app-feature-doc [entries]="platformDoc" />

    <h2 class="mb-3 mt-4 text-sm font-semibold uppercase tracking-wider text-emerald-300">⑫ Tooling propio de la demo</h2>
    <app-feature-doc [entries]="toolingDoc" />

    <section class="mt-10 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.04] p-6">
      <h3 class="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-300">Mapa de features → páginas de la demo</h3>
      <ul class="grid gap-2 text-sm md:grid-cols-2">
        <li class="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
          <span class="font-mono text-xs text-emerald-300">httpResource()</span>
          <span class="ml-auto text-xs text-slate-400">Inicio · Selecciones · Partidos · Detalle</span>
        </li>
        <li class="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
          <span class="font-mono text-xs text-emerald-300">debounced()</span>
          <span class="ml-auto text-xs text-slate-400">Selecciones</span>
        </li>
        <li class="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
          <span class="font-mono text-xs text-emerald-300">Signal Forms · form() · submit()</span>
          <span class="ml-auto text-xs text-slate-400">Quiniela</span>
        </li>
        <li class="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
          <span class="font-mono text-xs text-emerald-300">linkedSignal + resourceFromSnapshots</span>
          <span class="ml-auto text-xs text-slate-400">Clasificación</span>
        </li>
        <li class="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
          <span class="font-mono text-xs text-emerald-300">injectAsync()</span>
          <span class="ml-auto text-xs text-slate-400">Eliminatorias</span>
        </li>
        <li class="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
          <span class="font-mono text-xs text-emerald-300">&#64;defer</span>
          <span class="ml-auto text-xs text-slate-400">Inicio · Eliminatorias</span>
        </li>
        <li class="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
          <span class="font-mono text-xs text-emerald-300">Spread + &#64;switch + &#64;let</span>
          <span class="ml-auto text-xs text-slate-400">Partidos</span>
        </li>
        <li class="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
          <span class="font-mono text-xs text-emerald-300">isActive() signal</span>
          <span class="ml-auto text-xs text-slate-400">Menú lateral</span>
        </li>
        <li class="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
          <span class="font-mono text-xs text-emerald-300">withExperimentalAutoCleanupInjectors()</span>
          <span class="ml-auto text-xs text-slate-400">app.config global</span>
        </li>
        <li class="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
          <span class="font-mono text-xs text-emerald-300">withComponentInputBinding()</span>
          <span class="ml-auto text-xs text-slate-400">Detalle de selección</span>
        </li>
      </ul>
    </section>

    <section class="mt-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6 text-xs text-slate-400">
      <p>El badge "v21.1 / v21.2 / v22" en cada tarjeta indica en qué versión llegó esa feature; todas ellas se consolidan o salen estables con la línea v22.</p>
    </section>
  `,
})
export class AboutComponent {
  protected readonly defaultsDoc = DEFAULTS_DOC;
  protected readonly resourceDoc = RESOURCE_DOC;
  protected readonly formsDoc = FORMS_DOC;
  protected readonly diDoc = DI_DOC;
  protected readonly routerDoc = ROUTER_DOC;
  protected readonly templateDoc = TEMPLATE_DOC;
  protected readonly deferDoc = DEFER_DOC;
  protected readonly bootstrapDoc = BOOTSTRAP_DOC;
  protected readonly aiDoc = AI_DOC;
  protected readonly imageDoc = IMAGE_DOC;
  protected readonly platformDoc = PLATFORM_DOC;
  protected readonly toolingDoc = TOOLING_DOC;
}
