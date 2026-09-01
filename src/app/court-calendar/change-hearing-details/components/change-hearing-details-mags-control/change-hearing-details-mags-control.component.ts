import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ControlContainer, FormsModule, NgForm } from '@angular/forms';

import { PdkCore } from '@cpp/pdk';
import { DatePipe } from '@angular/common';
import { ChangeHearingStartTimeControlsComponent } from '../change-hearing-start-time-controls.component';
import { HearingSlot } from '@cpp/scheduling';
import { NonSittingDaysComponent } from '../../../../shared/components/non-sitting-days/non-sitting-days.component';
import { HearingStartTimeWithinSessionTimeComponent } from '../hearing-start-time-withing-session-time.cmponent';

@Component({
  selector: 'change-hearing-mags-control',
  templateUrl: './change-hearing-details-mags-control.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    PdkCore,
    ChangeHearingStartTimeControlsComponent,
    NonSittingDaysComponent,
    DatePipe,
    HearingStartTimeWithinSessionTimeComponent
  ],
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: NgForm
    }
  ]
})
export class ChangeHearingDetailsMagsControlComponent {
  readonly originalStartTime = input<string>(undefined, { alias: 'startTime' });
  readonly startDate = input<string>(undefined);
  readonly endDate = input<string>(undefined);
  readonly duration = input<number>(undefined);
  readonly hearingCourtScheduleId = input<string>(undefined);
  readonly nonSittingDays = input<string[]>(undefined);
  readonly hearingSlots = input<HearingSlot[]>([]);
  get isMultiDay() {
    return this.startDate() !== this.endDate();
  }
  timeToCompare: string;
}
