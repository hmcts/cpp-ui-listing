import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';
import { ControlContainer, FormsModule, NgForm } from '@angular/forms';

import { PdkCore, PdkForm, PdkSelectComponent, SelectOption } from '@cpp/pdk';
import { DatePipe } from '@angular/common';
import { ChangeHearingStartTimeControlsComponent } from '../change-hearing-start-time-controls.component';
import { HearingSlot } from '@cpp/scheduling';
import { sortSelectOptionAlphabetical } from '@cpp/reference-data';
import { NonSittingDaysComponent } from '../../../../shared/components/non-sitting-days/non-sitting-days.component';
import { StartTimeBetweenSessionDirective } from './start-time-between-session-validator.directive';

@Component({
  selector: 'change-hearing-mags-control',
  templateUrl: './change-hearing-details-mags-control.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    PdkCore,
    PdkForm,
    PdkSelectComponent,
    ChangeHearingStartTimeControlsComponent,
    NonSittingDaysComponent,
    StartTimeBetweenSessionDirective,
    DatePipe
  ],
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: NgForm
    }
  ]
})
export class ChangeHearingDetailsMagsControlComponent implements OnInit {
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
  sessionTimesOptions: SelectOption[] = [];
  datePipe = new DatePipe('en-GB');
  timeToCompare: string;

  ngOnInit() {
    const hearingSlots = this.hearingSlots();
    if (hearingSlots?.length > 0) {
      this.sessionTimesOptions = hearingSlots
        .map(({ courtScheduleId, sessionStartTime, sessionEndTime, businessType }) => ({
          value: courtScheduleId,
          label: `${businessType} ${this.datePipe.transform(
            sessionStartTime,
            'hh:mm a'
          )} to ${this.datePipe.transform(sessionEndTime, 'hh:mm a')}`
        }))
        .sort(sortSelectOptionAlphabetical);
    }
  }
}
