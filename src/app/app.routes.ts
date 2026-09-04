import { Routes } from '@angular/router';
import { Home } from './home/home';
import { NodeHost } from './node/node-host';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'node/:sectionId/:nodeId', component: NodeHost },
];
