import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  input,
  output
} from '@angular/core';
import { BaseHearingRowDataVM } from '../../../model/hearing-table-renderer.interfaces';
import { Hearing } from '../../../../core';
import { dateIsCurrentOrGreaterThan } from '../../../utils/court-calendar-hearings-helper';
import { PdkButton } from '@cpp/pdk';

@Component({
  selector: 'allocated-crown-widget-actions-cell, [allocated-crown-widget-actions-cell]',
  template: `
    <div data-test-id="allocated-crown-widget-actions">
      @if (!sectionInAllocateState() && canUnallocate()) {
        <button
          pdk-button="secondary"
          type="button"
          data-test-id="unallocate-button"
          (click)="unallocate.emit(hearing()?.details)"
        >
          Unallocate
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PdkButton],
  styles: [
    `
      button {
        min-width: 132px;
        max-width: 160px;
      }
    `
  ]
})
export class AllocatedCrownWidgetActionsCellComponent {
  readonly hearing = input<BaseHearingRowDataVM>();
  readonly sectionInAllocateState = input(false);
  readonly unallocate = output<Hearing>();

  readonly canUnallocate = computed(() => {
    const details = this.hearing()?.details;
    if (!details) {
      return false;
    }
    return !(details.hearingDayCount > 1 && !dateIsCurrentOrGreaterThan(details.startDate));
  });

  @HostListener('click', ['$event'])
  preventDefault(event: MouseEvent) {
    event.stopPropagation();
  }
}
