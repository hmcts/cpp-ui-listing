import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CourtSession } from '@cpp/scheduling';
import { CourtRoomSessionCalendar } from '../../../model';
import { SelectedHearingState } from '../../component-store/hearing-table-actions.store';
import { DisplayBusinessTypeAllocatePipe } from '../../../pipes/display-business-type-allocate.pipe';
import { PdkButton, PdkCore } from '@cpp/pdk';
import { DatePipe, LowerCasePipe } from '@angular/common';

@Component({
  selector: 'business-session-header-cell',
  template: `
    @if (slot()) {
      <div
        pdk-margin-vertical="2"
        data-test-id="business-type-session"
        class="flex-display flex-align-baseline"
      >
        <h5 pdk-typography="heading-small" pdk-margin-bottom="0" pdk-margin-right="3">
          {{ startTime | date: 'hh:mm a' | lowercase }} to
          {{ endTime | date: 'hh:mm a' | lowercase }}
          <span pdk-typography="body">{{ hearingsDurationSummary() }}</span>
        </h5>
        @if (
          selectedAllocationHearings() | displayBusinessTypeAllocate: slot() : eligibleScheduleIds()
        ) {
          <button
            pdk-button
            type="button"
            (click)="
              allocate.emit({
                courtScheduleId: slot()?.courtScheduleId,
                session: slot()?.session?.type
              })
            "
            data-test-id="allocate-button"
            pdk-margin-bottom="0"
          >
            Allocate here
          </button>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DisplayBusinessTypeAllocatePipe, PdkCore, PdkButton, DatePipe, LowerCasePipe]
})
export class BusinessSessionHeaderCellComponent {
  readonly slot = input<CourtRoomSessionCalendar['slot']>(undefined);
  readonly selectedAllocationHearings = input<SelectedHearingState[]>([]);
  readonly hearingsDurationSummary = input<string>(undefined);
  readonly eligibleScheduleIds = input<string[] | null>(null);

  readonly allocate = output<{
    courtScheduleId: string;
    session: CourtSession;
  }>();

  get startTime(): string {
    return this.slot()?.session?.startTime || '';
  }

  get endTime(): string {
    return this.slot()?.session?.endTime || '';
  }
}
