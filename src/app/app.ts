import { Component, signal } from '@angular/core';
import { AdminLayout } from './layout/admin-layout/admin-layout';

@Component({
  selector: 'app-root',
  imports: [AdminLayout],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Admin Mesh');
}
