import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then(({ Home }) => Home),
  },
  {
    path: 'node/:sectionId/:nodeId',
    loadComponent: () => import('./node-host/node-host').then(({ NodeHost }) => NodeHost),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./page-not-found/page-not-found').then(({ PageNotFound }) => PageNotFound),
  },
];
