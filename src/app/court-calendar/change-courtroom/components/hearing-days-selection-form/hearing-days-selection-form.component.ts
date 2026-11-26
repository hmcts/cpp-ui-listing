import { Component, OnInit, computed, input, linkedSignal, output, signal } from '@angular/core';
import {
  PdkButton,
  PdkCheckBox,
  PdkCore,
  PdkForm,
  PdkGrid,
  PdkMinCountValidatorDirective,
  PdkSelectComponent,
  SelectOption,
  ValidationError
} from '@cpp/pdk';
import { DatePipe, NgPlural, NgPluralCase } from '@angular/common';
import {
  HearingDaysTableComponent,
  SelectAllhearingDaysEvent
} from '../hearing-days-table/hearing-days-table.component';
import { uniq } from 'lodash-es';
import { HearingDayVM } from '../../../../court-calendar/model';
import { getCPPDate } from '../../../../core/util';
import { FormsModule } from '@angular/forms';
import { HearingSlot } from '@cpp/scheduling';
import { CourtRoomAvailabilityDirective } from '../../directives/court-room-availability.validator.directive';

export interface SelectionNavigateEvent {
  selectedHearingDays: HearingDayVM[];
  courtRoomId?: string;
}

@Component({
  selector: 'hearing-days-selection-form',
  templateUrl: './hearing-days-selection-form.component.html',
  imports: [
    PdkGrid,
    PdkCore,
    PdkButton,
    PdkForm,
    PdkSelectComponent,
    PdkCheckBox,
    FormsModule,
    HearingDaysTableComponent,
    DatePipe,
    NgPlural,
    NgPluralCase,
    PdkMinCountValidatorDirective,
    CourtRoomAvailabilityDirective
  ],
  styles: [
    `
      .result-summary {
        display: flex;
        justify-content: space-between;
      }

      .summary-text {
        flex: 1;
        margin: 0;
      }
    `
  ]
})
export class HearingDaysSelectionFormComponent implements OnInit {
  readonly allUpcomingHearingDays = input<HearingDayVM[]>([]);
  readonly courtCentreName = input<string>(undefined);
  readonly totalHearingDaysCount = input(0);
  readonly courtRoomOptions = input<SelectOption<string>[]>([]);
  readonly startDate = input<string>(undefined);
  readonly endDate = input<string>(undefined);
  readonly slots = input<HearingSlot[]>([]);
  readonly selectedHearingDays = input<HearingDayVM[]>();

  readonly onValidationError = output<ValidationError[]>();
  readonly onSelectionNavigate = output<SelectionNavigateEvent>();
  readonly onChangeForAllNavigate = output<void>();

  readonly selectedHearingDateValues = linkedSignal(() => {
    const days = this.selectedHearingDays();
    if (days?.length) {
      return days.map(({ hearingDate }) => hearingDate);
    }
    return [];
  });
  readonly selectedCourtRoomId = signal<string | null>(null);
  hasOnlyTodayHearingDay: boolean = false;

  readonly courtRoomAvailabilityError = computed(() => {
    const label =
      this.courtRoomOptions().find(o => o.value === this.selectedCourtRoomId())?.label ?? '';
    return `No sessions are available for ${label}`;
  });

  private readonly dateUtil = getCPPDate();

  ngOnInit(): void {
    const allUpcomingHearingDays = this.allUpcomingHearingDays();
    this.hasOnlyTodayHearingDay =
      allUpcomingHearingDays.length === 1
        ? this.dateUtil.format(new Date()) === allUpcomingHearingDays[0].hearingDate
        : false;
  }

  /**
   * Handles bulk selection/deselection of hearing dates from paginated table.
   */
  selectAllPaginatedHearingDays(
    event: SelectAllhearingDaysEvent,
    previouslySelectedDates: string[]
  ) {
    this.selectedHearingDateValues.set(
      event.allSelected
        ? uniq([...event.paginatedHearingDates, ...previouslySelectedDates])
        : previouslySelectedDates.filter(date => !event.paginatedHearingDates.includes(date))
    );
  }

  /**
   * Emits selected hearing days and court room for reallocation.
   */
  handleReallocationSubmit({
    hearingDaysSelection,
    courtRoomId
  }: {
    hearingDaysSelection: string[];
    courtRoomId: string;
  }): void {
    const selectedHearingDays = this.allUpcomingHearingDays().filter(day =>
      hearingDaysSelection.includes(day.hearingDate)
    );

    this.onSelectionNavigate.emit({
      selectedHearingDays,
      courtRoomId
    });
  }
}
