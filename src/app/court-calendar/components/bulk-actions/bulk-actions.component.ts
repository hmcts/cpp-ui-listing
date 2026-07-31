import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { SelectedHearingState } from '../../court-calendar-hearing-tables/component-store/hearing-table-actions.store';
import { HearingBulkActions } from '../../court-calendar-hearing-tables/shared/hearing-row-actions-dropdown/hearing-row-actions-dropdown.component';
import { PdkButton, PdkCore } from '@cpp/pdk';

@Component({
  selector: 'bulk-actions',
  template: `
    <button
      pdk-button="primary"
      pdk-margin-right="2"
      [disabled]="!(selectedHearings()?.length > 1)"
      (click)="selectedBulkAction.emit('reallocate')"
    >
      Reallocate
    </button>
    @if (courtType() === 'CROWN') {
      <button
        pdk-button="primary"
        [disabled]="!(selectedHearings()?.length > 1)"
        (click)="selectedBulkAction.emit('unallocate')"
      >
        Unallocate
      </button>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PdkButton, PdkCore]
})
export class BulkActionsComponent {
  readonly selectedHearings = input<SelectedHearingState[]>(undefined);
  readonly courtType = input<string>(undefined);
  readonly selectedBulkAction = output<HearingBulkActions>();
}
