import { Routes } from '@angular/router';
import { Home } from './home/home';
import { NodeHost } from './node-host/node-host';
import { PageNotFound } from './page-not-found/page-not-found';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'node/:sectionId/:nodeId', component: NodeHost },
  { path: '**', component: PageNotFound },
];
