import { Component, signal } from '@angular/core';
import { AdminLayout } from '../layout/admin-layout/admin-layout';

@Component({
  selector: 'app-root',
  imports: [AdminLayout],
  templateUrl: './root.html',
  styleUrl: './root.scss',
})
export class Root {
  protected readonly title = signal('Admin Mesh');
}
