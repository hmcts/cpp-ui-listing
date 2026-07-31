import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ValidationError } from '@cpp/pdk';
import { CppReferenceDataComponents, HearingType } from '@cpp/reference-data';
import {
  AllocatingHearingDetailsWithCourtCentre,
  CourtCentre,
  ExtendedJudicialRole,
  Hearing
} from '../../../core';
import { DateRange } from '../../../shared/components/date-range/date-range';
import { AllocateHearingFactory } from '../../utils/allocate-hearing.factory';
import { CourtSession, HearingSlot } from '@cpp/scheduling';
import { ChangeHearingDetailsCrownControlComponent } from './change-hearing-details-crown-control/change-hearing-details-crown-control.component';
import { ChangeHearingDetailsMagsControlComponent } from './change-hearing-details-mags-control/change-hearing-details-mags-control.component';
import { FormsModule } from '@angular/forms';
import { JudiciaryInputComponent } from '../../../shared/components/judiciary-input/judiciary-input.component';
import { PdkComponents } from '../../../shared/pdk-shared-components';
export interface ChangeHearingDetailsFormValues
  extends Pick<
    Hearing,
    | 'hasVideoLink'
    | 'sendNotificationToParties'
    | 'hearingLanguage'
    | 'publicListNote'
    | 'nonDefaultDays'
    | 'nonSittingDays'
  > {
  dateRange: DateRange;
  selectedHearingType: HearingType;
  startTime: string;
  duration: number;
  courtScheduleId?: string;
  courtSession?: CourtSession;
}
@Component({
  selector: 'change-hearing-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './change-hearing-details.component.html',
  imports: [
    CppReferenceDataComponents,
    PdkComponents,
    FormsModule,
    ChangeHearingDetailsCrownControlComponent,
    ChangeHearingDetailsMagsControlComponent,
    JudiciaryInputComponent
  ],
  providers: [AllocateHearingFactory],
  styles: [
    `
      .action-btn {
        display: flex;
        justify-content: flex-start;
        align-items: baseline;
        gap: 15px;
      }
    `
  ]
})
export class ChangeHearingDetailsComponent {
  readonly selectedCourtCentre = input<CourtCentre>(undefined);
  readonly selectedHearing = input<Hearing>(undefined);
  readonly initialValues = input<ChangeHearingDetailsFormValues>(undefined);
  readonly hearingSlots = input<HearingSlot[]>([]);
  readonly onValidationError = output<ValidationError[]>();
  readonly onSubmit = output<AllocatingHearingDetailsWithCourtCentre>();
  readonly onCancel = output<void>();
  selectedJudiary: ExtendedJudicialRole[];
  datePipe = new DatePipe('en-GB');

  constructor(private allocateHearingFactory: AllocateHearingFactory) {}

  submit({
    value: { duration, ...restValues }
  }: {
    value: Omit<ChangeHearingDetailsFormValues, 'duration'> & { duration: string };
  }): void {
    let durationMinutes: number;
    let courtSession: CourtSession;
    if (duration) {
      const durationSplit = String(duration).split(':').map(Number);
      durationMinutes = (durationSplit[0] || 0) * 60 + (durationSplit[1] || 0);
    }

    if (restValues.courtScheduleId) {
      ({ courtSession } = this.hearingSlots().find(
        ({ courtScheduleId }) => courtScheduleId === restValues.courtScheduleId
      ));
    }

    const selectedHearing = this.selectedHearing();
    if (!restValues.dateRange && selectedHearing.jurisdictionType === 'MAGISTRATES') {
      restValues.dateRange = new DateRange(selectedHearing.startDate, selectedHearing.endDate);
    }

    const updatedHearing = this.allocateHearingFactory.updateAllocatedHearing(
      selectedHearing,
      { duration: durationMinutes, ...restValues, courtSession },
      this.selectedCourtCentre(),
      this.selectedJudiary
    );

    this.onSubmit.emit({
      originHearing: selectedHearing,
      updatedHearing
    });
  }

  cancel(): void {
    this.onValidationError.emit(null);
    // TODO: The 'emit' function requires a mandatory void argument
    this.onCancel.emit();
  }
}
