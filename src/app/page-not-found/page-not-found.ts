import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NotFoundState } from '../shared/not-found-state/not-found-state';

@Component({
  selector: 'app-page-not-found',
  imports: [NotFoundState],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageNotFound {}
