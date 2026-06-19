import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'Inicio · Mundial 2026',
  },
  {
    path: 'teams',
    loadComponent: () =>
      import('./features/teams/teams-list.component').then((m) => m.TeamsListComponent),
    title: 'Selecciones · Mundial 2026',
  },
  {
    path: 'teams/:id',
    loadComponent: () =>
      import('./features/teams/team-detail.component').then((m) => m.TeamDetailComponent),
    title: 'Selección · Mundial 2026',
  },
  {
    path: 'matches',
    loadComponent: () =>
      import('./features/matches/matches.component').then((m) => m.MatchesComponent),
    title: 'Partidos · Mundial 2026',
  },
  {
    path: 'standings',
    loadComponent: () =>
      import('./features/standings/standings.component').then((m) => m.StandingsComponent),
    title: 'Clasificación · Mundial 2026',
  },
  {
    path: 'predictions',
    loadComponent: () =>
      import('./features/predictions/predictions.component').then((m) => m.PredictionsComponent),
    title: 'Quiniela · Mundial 2026',
  },
  {
    path: 'bracket',
    loadComponent: () =>
      import('./features/bracket/bracket.component').then((m) => m.BracketComponent),
    title: 'Eliminatorias · Mundial 2026',
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about.component').then((m) => m.AboutComponent),
    title: 'Sobre la demo · Mundial 2026',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
