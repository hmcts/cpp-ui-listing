import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RotaBusinessType } from '@cpp/reference-data';
import { CourtSession } from '@cpp/scheduling';
import { CourtRoomBusinessTypeCalendar } from '../../../model';
import { SelectedHearingState } from '../../component-store/hearing-table-actions.store';
import { BusinessTypeDescriptionByCodePipe } from '../../../pipes/business-type-description.pipe';
import { DisplayBusinessTypeAllocatePipe } from '../../../pipes/display-business-type-allocate.pipe';
import { PdkButton, PdkCore } from '@cpp/pdk';
import { DatePipe, LowerCasePipe } from '@angular/common';

@Component({
  selector: 'business-header-cell',
  template: `
    @if (businessTypeAndSlot()) {
      <div class="flex-display flex-display-column">
        <h4 pdk-typography="heading-small" pdk-margin-bottom="2">
          <span data-test-id="businessType">
            {{
              businessTypeAndSlot().businessTypeCode
                | businessTypeDescriptionByCode: rotaBusinessTypes()
            }}
          </span>
        </h4>
        <div
          pdk-margin-vertical="2"
          data-test-id="business-type-session"
          class="flex-display flex-align-baseline"
        >
          <span pdk-typography="body" pdk-margin-bottom="0"
            >{{ startTime | date: 'hh:mm a' | lowercase }} to
            {{ endTime | date: 'hh:mm a' | lowercase }} {{ hearingsDurationSummary() }}</span
          >
          @if (selectedAllocationHearings() | displayBusinessTypeAllocate: businessTypeAndSlot()) {
            <button
              pdk-button
              type="button"
              (click)="
                allocate.emit({
                  courtScheduleId: businessTypeAndSlot()?.courtScheduleId,
                  session: businessTypeAndSlot()?.session?.type
                })
              "
              data-test-id="allocate-button"
              pdk-margin-bottom="0"
              pdk-margin-left="3"
            >
              Allocate here
            </button>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DisplayBusinessTypeAllocatePipe,
    BusinessTypeDescriptionByCodePipe,
    PdkCore,
    PdkButton,
    DatePipe,
    LowerCasePipe
  ]
})
export class BusinessHeaderCellComponent {
  readonly businessTypeAndSlot =
    input<CourtRoomBusinessTypeCalendar['businessTypeAndSlot']>(undefined);
  readonly selectedAllocationHearings = input<SelectedHearingState[]>([]);
  readonly hearingsDurationSummary = input<string>(undefined);
  readonly rotaBusinessTypes = input<RotaBusinessType[]>([]);

  readonly allocate = output<{
    courtScheduleId: string;
    session: CourtSession;
  }>();

  get startTime(): string {
    return this.businessTypeAndSlot()?.session?.startTime || '';
  }

  get endTime(): string {
    return this.businessTypeAndSlot()?.session?.endTime || '';
  }
}
