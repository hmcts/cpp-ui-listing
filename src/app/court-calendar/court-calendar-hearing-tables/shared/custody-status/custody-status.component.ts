import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { Defendant } from '../../../../core';
import { FullNamePipe } from '../../../../shared/pipes/full-name.pipe';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'custody-status',
  templateUrl: './custody-status.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FullNamePipe, DatePipe]
})
export class CustodyStatusComponent {
  readonly custodyDefendants = input<Defendant[]>(undefined);
}
