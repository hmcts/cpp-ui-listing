import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
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
import { CPPDate } from '../../../core/util';
import { CourtSession, HearingSlot } from '@cpp/scheduling';
import { ChangeHearingDetailsCrownControlComponent } from './change-hearing-details-crown-control/change-hearing-details-crown-control.component';
import { ChangeHearingDetailsMagsControlComponent } from './change-hearing-details-mags-control/change-hearing-details-mags-control.component';
import { FormsModule } from '@angular/forms';
import { JudiciaryInputComponent } from '../../../shared/components/judiciary-input/judiciary-input.component';
import { PdkComponents } from '../../../shared/pdk-shared-components';
import {
  findAllDayDurationBasedSession,
  isAllDayDurationBased
} from '../../utils/court-calendar-hearings-helper';

const WORKING_DAY_IN_MINUTES = 360;

export interface ChangeHearingDetailsFormValues extends Pick<
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

  allocateHearingFactory = inject(AllocateHearingFactory);
  cppDate = inject(CPPDate);

  submit({
    value: { duration, ...restValues }
  }: {
    value: Omit<ChangeHearingDetailsFormValues, 'duration'> & { duration: string };
  }): void {
    const selectedHearing = this.selectedHearing();
    const [{ courtScheduleId: existingCourtScheduleId, startTime: existingStartTime }] =
      selectedHearing.hearingDays;
    const isMultiDay = restValues.dateRange?.startDate !== restValues.dateRange?.endDate;
    const courtScheduleId = isMultiDay
      ? this.allDayDurationBasedCourtScheduleIdOn(
          restValues.dateRange.startDate,
          existingCourtScheduleId
        )
      : (restValues.courtScheduleId ?? existingCourtScheduleId);

    if (!restValues.dateRange && selectedHearing.jurisdictionType === 'MAGISTRATES') {
      restValues.dateRange = new DateRange(selectedHearing.startDate, selectedHearing.endDate);
    }

    const updatedHearing = this.allocateHearingFactory.updateAllocatedHearing(
      selectedHearing,
      {
        ...restValues,
        courtScheduleId,
        courtSession: this.findHearingSlot(courtScheduleId)?.courtSession,
        startTime:
          isMultiDay || !restValues.startTime
            ? this.cppDate.format(existingStartTime, this.cppDate.HOURS_MINUTES_24H)
            : restValues.startTime,
        duration: isMultiDay
          ? this.cppDate.countWorkingDays(
              restValues.dateRange.startDate,
              restValues.dateRange.endDate
            ) * WORKING_DAY_IN_MINUTES
          : this.durationInMinutes(duration)
      },
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
    this.onCancel.emit();
  }

  private allDayDurationBasedCourtScheduleIdOn(
    startDate: string,
    existingCourtScheduleId: string
  ): string {
    if (isAllDayDurationBased(this.findHearingSlot(existingCourtScheduleId))) {
      return existingCourtScheduleId;
    }
    return findAllDayDurationBasedSession(this.hearingSlots(), startDate).courtScheduleId;
  }

  private findHearingSlot(courtScheduleId: string): HearingSlot | undefined {
    return this.hearingSlots().find(slot => slot.courtScheduleId === courtScheduleId);
  }

  private durationInMinutes(duration: string): number | undefined {
    if (!duration) {
      return undefined;
    }
    const [hours, minutes] = String(duration).split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }
}
