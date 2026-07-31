import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
  input,
  output
} from '@angular/core';
import moment from 'moment';

import {
  ValidationError,
  PdkFormComponent,
  PdkTypographyDirective,
  PdkMarginDirective,
  PdkFormFieldComponent,
  PdkAutosuggestLiteComponent,
  PdkRadioGroupComponent,
  PdkRadioButtonComponent,
  PdkCheckboxConditionalComponent,
  PdkTimeInputComponent,
  PdkDetailsComponent,
  PdkDetailsDirective,
  PdkDetailsSummaryComponent,
  PdkLinkDirective,
  PdkDetailsTextDirective,
  PdkPaddingDirective,
  PdkFormGroupComponent,
  PdkFormGroupDirective,
  PdkButtonComponent,
  PdkButtonDirective
} from '@cpp/pdk';
import {
  AllocatingHearingDetails,
  CourtCentre,
  ExtendedJudicialRole,
  FilterOption,
  Hearing,
  HearingDay,
  HearingType,
  HearingWithSelectedCourtCentre,
  JudicialRoleType,
  JurisdictionType,
  NonDefaultDay
} from '../../../core/model';
import { DateRange } from '../date-range/date-range';
import { CPPDate, findDataFromSelectionValues, getCPPDate } from '../../../core/util';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import {
  AppState,
  getReferenceDataHearingTypeById,
  setHearingToEditAllocation,
  transformMinutes
} from '../../../core';
import { FormsModule } from '@angular/forms';
import { JudiciaryInputComponent } from '../judiciary-input/judiciary-input.component';

import { DateRangeComponent } from '../date-range/date-range.component';
import { NonSittingDaysComponent } from '../non-sitting-days/non-sitting-days.component';
import { NonDefaultDaysComponent } from '../non-default-days/non-default-days.component';
import { VideoHearingComponent } from '../video-hearing/video-hearing.component';

// Form values represents the shape of data for a hearing when collected by the
// form, and must be created from any hearing input when the form is being used
// in edit mode, and transformed from when data is exiting the form
interface FormValues {
  weekCommencingStartDate?: string;
  weekCommencingEndDate?: string;
  weekCommencingDurationInWeeks?: number;
  courtCentreId?: string;
  courtRoomId?: string;
  dateRange: DateRange;
  startTime?: string;
  duration?: string;
  multiDay?: boolean;
  hearingLanguage: 'ENGLISH' | 'WELSH';
  hearingDays: HearingDay[];
  judiciary: ExtendedJudicialRole[];
  judicialRoleType: JudicialRoleType | null;
  type: { id: string; description: string };
  nonDefaultDays?: NonDefaultDay[];
  nonSittingDays?: string[];
  jurisdictionType: JurisdictionType;
  publicListNote?: string;
  hasVideoLink?: boolean;
  sendNotificationToParties?: boolean;
}

export enum SpecialHearingTypes {
  WARRANT_OF_FURTHER_DETENTION = 'Warrant of Further Detention',
  PRE_CHARGE_BAIL = 'Pre-Charge Bail'
}

interface HearingTypeOption {
  label: string;
  value: string;
}

@Component({
  selector: 'hearing-details-form',
  templateUrl: './hearing-details-form.html',
  styleUrls: ['./hearing-details-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    PdkFormComponent,
    PdkTypographyDirective,
    PdkMarginDirective,
    JudiciaryInputComponent,
    PdkFormFieldComponent,
    PdkAutosuggestLiteComponent,
    PdkRadioGroupComponent,
    PdkRadioButtonComponent,
    PdkCheckboxConditionalComponent,
    DateRangeComponent,
    PdkTimeInputComponent,
    NonSittingDaysComponent,
    PdkDetailsComponent,
    PdkDetailsDirective,
    PdkDetailsSummaryComponent,
    PdkLinkDirective,
    PdkDetailsTextDirective,
    NonDefaultDaysComponent,
    PdkPaddingDirective,
    VideoHearingComponent,
    PdkFormGroupComponent,
    PdkFormGroupDirective,
    PdkButtonComponent,
    PdkButtonDirective
  ]
})
export class HearingDetailsFormComponent implements OnChanges, OnDestroy {
  constructor(private store: Store<AppState>) {}

  readonly selectedCourt = input<{
    id: string;
  }>(undefined);
  @Input()
  get courtCentres(): CourtCentre[] {
    return this._courtCentres;
  }

  set courtCentres(courtCentres: CourtCentre[]) {
    // Construct the court centre options for use in the form autosuggest
    this.courtCentreOptions = courtCentres.map(item => ({
      label: item?.name,
      value: item?.id
    }));
    this._courtCentres = courtCentres;
    this.setCourtCentreAndRoomOptions(this.data.courtCentreId);
  }

  // on the edit allocated hearing page, this component needs to extract
  // the court centre and room ids from hearingDays in the hearing,
  // as the first level ids might not be correct for multi day hearings
  // the boolean flag below controls this behaviour, so that the logic
  // in the other page which uses this component would retain existing behaviour (CWR-9)
  readonly hearingHasBeenAllocated = input<boolean>(undefined);
  readonly minDate = input<string>(undefined);

  // When a hearing is passed to the form, we reconstruct the form values
  @Input()
  get hearing(): Hearing {
    return this._hearing;
  }

  set hearing(hearing: Hearing) {
    this._hearing = hearing;
    this.hearingDays = hearing.hearingDays;
    this.store
      .select(getReferenceDataHearingTypeById(hearing.type.id))
      .pipe(take(1))
      .subscribe(hearingType => {
        this.hearingTypeDefaultDuration = hearingType ? hearingType.defaultDurationMin : undefined;

        this.updateSendNotificationFlag(hearingType?.hearingDescription);
      });
  }

  @Input()
  set hearingTypes(hearingTypes: HearingType[]) {
    // Construct the hearing type options for use in the form typeaheads
    this.hearingTypeOptions = hearingTypes.map(hearingType => ({
      value: hearingType?.id,
      label: hearingType?.name
    }));
  }

  private readonly dateUtil = inject(CPPDate);

  get currentCourtCentreOption() {
    if (this.data && this.data.courtCentreId) {
      return findDataFromSelectionValues(
        this.courtCentreOptions,
        'value',
        this.data,
        'courtCentreId'
      );
    }
    return null;
  }

  get currentCourtRoomOption() {
    if (this.data && this.data.courtRoomId) {
      return findDataFromSelectionValues(this.courtRoomOptions, 'value', this.data, 'courtRoomId');
    }
    return null;
  }

  get currentHearingTypeOption() {
    if (this.data && this.data.type && this.data.type.id) {
      return findDataFromSelectionValues(this.hearingTypeOptions, 'value', this.data, 'type', 'id');
    }
    return null;
  }

  get minStartDate(): string {
    if (this._hearing?.allocated) return this.minDate() ?? '';
    return this.minDate() || this.dateUtil.format(this.dateUtil.getCurrentDate());
  }

  private getDefaultStartEndDates(hearing: Hearing): { startDate: string; endDate: string } {
    const today = this.dateUtil.format(this.dateUtil.getCurrentDate());
    const hearingDate = hearing.startDate || hearing.hearingDays?.[0]?.hearingDate;
    const startDate =
      hearingDate && this.dateUtil.format(hearingDate) >= today ? hearingDate : today;
    const endDate =
      hearing.endDate && this.dateUtil.format(hearing.endDate) >= startDate
        ? hearing.endDate
        : startDate;
    return { startDate, endDate };
  }

  readonly onSubmit = output<AllocatingHearingDetails>();
  readonly onCancel = output<void>();
  readonly onValidationError = output<ValidationError[]>();

  courtCentreSuggestions: FilterOption[] = [];
  courtRoomSuggestions: FilterOption[] = [];
  hearingTypeSuggestions: FilterOption[] = [];
  selectedJudiary: ExtendedJudicialRole[];
  data: FormValues = {
    dateRange: new DateRange('', ''),
    sendNotificationToParties: false
  } as FormValues;
  courtCentreOptions: FilterOption[] = [];
  courtRoomOptions: FilterOption[] = [];
  hearingTypeOptions: HearingTypeOption[] = [];
  selectedCourtCentre: CourtCentre;

  isInitialLoad = true;
  dateValues = { value: null };
  isFixedDate = false;
  isWeekCommencing = false;
  isMultiDay = false;
  nonDefaultDaysOpen = false;
  nonSittingDaysOpen = false;
  hearingDays: HearingDay[];
  constructedDefaultDay: NonDefaultDay;
  hearingTypeDefaultDuration: number;
  private _courtCentres: CourtCentre[] = [];
  private _hearing: Hearing;
  isSendNotificationDisabled = false;

  ngOnChanges(changes: SimpleChanges) {
    if (this.hearing) {
      const courtCentreId = this.selectedCourt()?.id || undefined;
      const sendNotificationToParties = this._hearing?.sendNotificationToParties ? true : false;

      this._hearing = { ...this._hearing, courtCentreId, sendNotificationToParties };

      this.data = this.toFormValues(this._hearing);
    }
    if (!this.hearing.allocated) {
      if (!!changes.hearing.currentValue.startDate) {
        this.dateValues.value = 'fixedDate';
        this.enableFixedDate();
      } else if (!!changes.hearing.currentValue.weekCommencingStartDate) {
        this.isWeekCommencing = true;
        this.dateValues.value = 'weekCommencing';
        this.enableWeekCommencing();
        this.calculatePeriodCommencing();
      }
    }
  }

  enableFixedDate() {
    this.isFixedDate = true;
    this.data.dateRange = new DateRange('', '');
    if (this.isInitialLoad) {
      const { startDate, endDate } = this.getDefaultStartEndDates(this.hearing);
      this.data.dateRange.startDate = startDate;
      this.data.dateRange.endDate = endDate;
    } else {
      this.data.duration = '';
      this.data.startTime = '';
    }
    this.data.weekCommencingDurationInWeeks = null;
    this.data.weekCommencingStartDate = null;
    this.data.weekCommencingEndDate = null;

    this.isWeekCommencing = false;
    this.isInitialLoad = false;
  }

  enableWeekCommencing() {
    this.isWeekCommencing = true;
    this.data.dateRange = new DateRange('', '');
    if (this.isInitialLoad) {
      this.data.dateRange = new DateRange(
        this.hearing.weekCommencingStartDate,
        this.hearing.weekCommencingEndDate
      );
      this.data.weekCommencingDurationInWeeks = parseInt(
        '' + this.hearing.weekCommencingDurationInWeeks,
        10
      );
    } else {
      this.data.duration = '';
      this.data.startTime = '';
    }
    this.isFixedDate = false;
    this.isInitialLoad = false;

    if (this.data.hearingDays.length > 0) {
      const hours = Math.floor(this.data.hearingDays[0].durationMinutes / 60);
      const minutes = this.data.hearingDays[0].durationMinutes % 60;
      this.data.duration = `${this.pad(hours, 2)}:${minutes}`;
    }
  }

  pad(num, size) {
    let s = num + '';
    while (s.length < size) {
      s = '0' + s;
    }
    return s;
  }

  calculatePeriodCommencing(): void {
    if (this.isWeekCommencing && this.data.dateRange && this.data.dateRange.startDate) {
      const weekCommencingStartDate = new Date(this.data.dateRange.startDate);
      const weekCommencingDays =
        weekCommencingStartDate.getDate() + this.data.weekCommencingDurationInWeeks * 7;
      weekCommencingStartDate.setDate(weekCommencingDays - 1);
      const weekCommencingEndDate =
        weekCommencingStartDate.getFullYear() +
        '-' +
        ('0' + (weekCommencingStartDate.getMonth() + 1)).slice(-2) +
        '-' +
        ('0' + weekCommencingStartDate.getDate()).slice(-2);
      this.data.weekCommencingStartDate = this.data.dateRange.startDate;
      this.data.weekCommencingEndDate = weekCommencingEndDate;
    }
  }

  submit({ value }): void {
    const payload: Hearing = this.fromFormValues();
    const { hasVideoLink = false, publicListNote = '', sendNotificationToParties } = value;

    if (this.isFixedDate) {
      payload.startDate = value.dateRange?.startDate;
      payload.endDate = value.dateRange?.endDate;
    }

    payload.hasVideoLink = hasVideoLink;
    payload.publicListNote = publicListNote;
    payload.sendNotificationToParties = sendNotificationToParties;

    const changedHearingDetails = {
      originHearing: this._hearing,
      updatedHearing: payload
    };
    this.onSubmit.emit(changedHearingDetails);
  }

  cancel(): void {
    this.onValidationError.emit(null);
    this.onCancel.emit();
  }

  hearingTypeChange(e) {
    const hearingType: HearingTypeOption = e;
    if (hearingType) {
      this.data.type = { id: hearingType.value, description: hearingType.label };
      this.data.type = {
        id: hearingType.value,
        description: hearingType.label
      };

      this.updateSendNotificationFlag(hearingType.label);
    }
  }

  updateSendNotificationFlag(hearingDescription: string | undefined): void {
    const normalizedHearingDescription = hearingDescription?.toLowerCase();

    const disableTypes = new Set([
      SpecialHearingTypes.WARRANT_OF_FURTHER_DETENTION.toLowerCase(),
      SpecialHearingTypes.PRE_CHARGE_BAIL.toLowerCase()
    ]);

    this.isSendNotificationDisabled = normalizedHearingDescription
      ? disableTypes.has(normalizedHearingDescription)
      : false;

    if (this.isSendNotificationDisabled) {
      this.data.sendNotificationToParties = false;
    }
  }

  // When the `courtCentreId` changes for any reason, we reset the entered court
  // room, as it must now be reselected from the newly available options. We
  // construct the courtroom options from the courtrooms on the selected court
  // centre. When no court centre is provided, we empty the available court rooms.
  setCourtCentreAndRoomOptions(courtCentreId: string) {
    if (courtCentreId) {
      const courtCentre = this.courtCentres.find(cc => {
        return cc.id === courtCentreId;
      });
      if (courtCentre) {
        this.selectedCourtCentre = courtCentre;
        this.courtRoomOptions = courtCentre.courtRooms.map(({ id, name }) => ({
          value: id,
          label: name
        }));
      }
      if (this.hearing.allocated) {
        if (courtCentre && courtCentre.courtCode === 'C') {
          this.data.jurisdictionType = 'CROWN';
        }
        if (courtCentre && courtCentre.courtCode === 'B') {
          this.data.jurisdictionType = 'MAGISTRATES';
        }
      }
    } else {
      this.courtRoomOptions = [];
    }
  }

  getSuggestions(searchValue: string, options: FilterOption[]) {
    if (searchValue) {
      return options.filter(
        option => option.label.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1
      );
    }
    return [];
  }

  enableDisableMultiDay(isMultiDay) {
    if (this.isMultiDay !== isMultiDay) {
      this.isMultiDay = isMultiDay;
      if (!this.isMultiDay) {
        const { startTime, duration } = this.isWeekCommencing
          ? this.calculateStartTimeAndDuration(
              this.data?.nonDefaultDays,
              this.data.dateRange?.startDate,
              this.data?.courtCentreId,
              this.data?.hearingDays
            )
          : this.calculateStartTimeAndDuration(
              this.data?.nonDefaultDays,
              this.data?.weekCommencingStartDate,
              this.data?.courtCentreId,
              this.data?.hearingDays
            );
        if (this.isFixedDate) {
          this.data.startTime = startTime;
          this.data.duration = duration;
        }
      } else {
        delete this.data.startTime;
        delete this.data.duration;
        this.data.nonDefaultDays = [];
      }

      this.setDisplayStateOfNonDefaultDaysAndNonSittingDays(
        this.data?.nonDefaultDays,
        this.data?.nonSittingDays
      );
    }
  }

  toggleNonSittingDays(): void {
    this.nonSittingDaysOpen = !this.nonSittingDaysOpen;
  }

  toggleNonDefaultDays(): void {
    this.nonDefaultDaysOpen = !this.nonDefaultDaysOpen;
  }

  /**
   * Calculates the start time and duration for a hearing based on a hierarchical fallback system.
   *
   * The logic follows this priority order:
   *
   * 1. **Hearing Days (Highest Priority)**: If hearingDays array has entries, use the first hearing day's
   *    start time and duration. This represents an already scheduled/allocated hearing.
   *
   * 2. **Non-Default Days (Medium Priority)**: If no hearing days exist but there are non-default days
   *    configured for the specific start date, use the matching non-default day's start time and duration.
   *    Non-default days represent custom scheduling that overrides the court centre's default schedule.
   *
   * 3. **Court Centre Defaults (Lowest Priority)**: If neither hearing days nor non-default days exist,
   *    fall back to the court centre's default start time and duration. This may be adjusted for UTC offset
   *    if the hearing day has different timezone requirements.
   */
  private calculateStartTimeAndDuration(
    nonDefaultDays: NonDefaultDay[],
    startDate: string,
    courtCentreId: string,
    hearingDays: HearingDay[]
  ): { startTime: string; duration: string } {
    let startTime: string;
    let duration: string;

    // Priority 1: Use existing hearing day schedule if available
    if (hearingDays.length > 0) {
      startTime = moment(hearingDays[0].startTime).format(this.dateUtil.HOURS_MINUTES_24H);
      duration = transformMinutes(hearingDays[0].durationMinutes);
    } else {
      // Priority 2: Check for non-default day configuration for this specific date
      const matchingNonDefaultDay = findNonDefaultDay(nonDefaultDays, startDate);
      if (nonDefaultDays.length !== 0 && matchingNonDefaultDay) {
        startTime = moment(matchingNonDefaultDay.startTime).format(this.dateUtil.HOURS_MINUTES_24H);
        duration = transformMinutes(matchingNonDefaultDay.duration);
      } else {
        // Priority 3: Fall back to court centre defaults (with potential UTC offset adjustment)
        const courtCentre = this.courtCentres.find(({ id }) => id === courtCentreId);
        const { formedStartTime, formedDuration } = this.bumpDefaultTimeForUtcOffset(
          courtCentre?.defaultStartTime,
          startDate
        );
        startTime = formedStartTime || courtCentre?.defaultStartTime;
        duration =
          (formedDuration && transformMinutes(formedDuration)) || courtCentre?.defaultDuration;
      }
    }

    return { startTime, duration };
  }

  private bumpDefaultTimeForUtcOffset(courtDefautStartTime, startDate) {
    let formedStartTime: string;
    let formedDuration: number;
    const startDateHearingDay =
      (this.hearingDays &&
        this.hearingDays.find(hd =>
          moment(hd.hearingDate, moment.ISO_8601).isSame(moment(startDate, moment.ISO_8601))
        )) ||
      undefined;

    const startDateMoment = moment(`${startDate} ${courtDefautStartTime}`, moment.ISO_8601);
    if (
      startDateHearingDay &&
      startDateMoment.isValid() &&
      startDateMoment.diff(moment(startDateHearingDay.startTime, moment.ISO_8601), 'hours') !== 0
    ) {
      formedStartTime = moment(startDateHearingDay.startTime, moment.ISO_8601).format('HH:mm');
      formedDuration = startDateHearingDay.durationMinutes;
      this.constructedDefaultDay = <NonDefaultDay>{
        startTime: moment(startDateHearingDay.startTime, moment.ISO_8601).format(
          'YYYY-MM-DDTHH:mm:ss.sssZ'
        ),
        duration: formedDuration
      };
    }
    return { formedStartTime, formedDuration };
  }

  private setDisplayStateOfNonDefaultDaysAndNonSittingDays(
    nonDefaultDays: NonDefaultDay[],
    nonSittingDays: string[]
  ): void {
    this.nonDefaultDaysOpen = nonDefaultDays.length > 0;
    this.nonSittingDaysOpen = (nonSittingDays ?? []).length > 0;
  }

  private fromFormValues(): Hearing | HearingWithSelectedCourtCentre {
    // Read from `this.data` rather than passing `form.value` as the latter
    // seems to coerce the `judiciary` array to an object
    const {
      dateRange,
      startTime,
      duration,
      weekCommencingStartDate,
      weekCommencingEndDate,
      weekCommencingDurationInWeeks,
      judicialRoleType,
      multiDay,
      publicListNote,
      hasVideoLink,
      judiciary,
      ...values
    } = this.data;
    const startDate = dateRange?.startDate;
    const endDate = dateRange?.endDate;
    const originalStartDate = this.hearing.startDate;
    /*
     * Check whether a new non-default day should be created.
     *
     * The business rules are:
     *  i. if startTime and duration DO NOT match court-centre 'default startTime' and
     *     'default duration' and 'is single day hearing' then DO add new non-default day
     *        - if existing non-default day matching startDate then overwrite
     *
     * ii. if ( startTime and duration DO match court-centre 'default startTime' and
     *     'default duration' ) or 'is multi day hearing', then DON'T add new non-default day
     *        - ensure that there is no existing non-default day matching startDate.
     */
    const { courtCentres } = this;
    const shouldAddNonDefaultDay = shouldAddToNonDefaultDays(this.isMultiDay);
    const matchingNonDefaultDay = findNonDefaultDay(this.hearing.nonDefaultDays, originalStartDate);
    const matchedHearingDay = this.hearingHasBeenAllocated() ? this.hearing.hearingDays[0] : null;
    const matchedHearingDayIsFirst =
      matchedHearingDay && this.hearing.hearingDays.indexOf(matchedHearingDay) === 0;

    let nonDefaultDays: NonDefaultDay[] = this.data.nonDefaultDays
      .map(nonDefaultDay => {
        const ndf = { ...nonDefaultDay };
        if (!ndf.courtCentreId || !ndf.roomId) {
          // injecting court room/house ids into any non default days that have been created programatically
          ndf.courtCentreId = this.data.courtCentreId;
          ndf.roomId = this.data.courtRoomId;
        } else if (
          matchedHearingDay &&
          matchedHearingDay.courtCentreId === ndf.courtCentreId &&
          matchedHearingDay.courtRoomId === ndf.roomId &&
          matchedHearingDay.hearingDate ===
            moment(ndf.startTime, moment.ISO_8601).format('YYYY-MM-DD')
        ) {
          // setting court house/room ids to the user selection on matched non default days
          ndf.courtCentreId = this.data.courtCentreId;
          ndf.roomId = this.data.courtRoomId;
          // if a matched non default day is present and the court house and/or room has changed
          // its oucode, roomId, and courtScheduleId properties are no longer relevant
          if (
            ndf.oucode &&
            ndf.courtRoomId &&
            ndf.courtScheduleId &&
            (nonDefaultDay.courtCentreId !== ndf.courtCentreId ||
              nonDefaultDay.courtRoomId !== ndf.courtRoomId)
          ) {
            delete ndf.courtScheduleId;
            delete ndf.oucode;
            delete ndf.courtRoomId;
          }
        }
        return ndf;
      })
      .filter(ndf => !!ndf);

    if (this.isWeekCommencing) {
      const durationSplit = this.data.duration.split(':');
      // Week Commencing Scenario
      // On the UNALLOCATED user journey we just receive hearingDays (there is no nonDefaultDays since the hearing is not allocated)
      // On the ALLOCATED user journey we receive nonDefaultDays & hearingDays (allocated hearings have HearingDays and nonDefaultDays in sync)
      // On the UNSCHEDULED user journey we just receive nonDefaultDays so we need to add the fallback to the nonDefaultDays array
      nonDefaultDays =
        this.data.hearingDays.length > 0 || this.data.nonDefaultDays.length > 0
          ? [
              {
                courtCentreId: this.data.courtCentreId,
                roomId: this.data.courtRoomId,
                duration: parseInt(durationSplit[0], 10) * 60 + parseInt(durationSplit[1], 10),
                startTime: this.hearingDays[0]?.startTime || this.data.nonDefaultDays[0]?.startTime
              }
            ]
          : [];
    } else if (shouldAddNonDefaultDay) {
      if (matchingNonDefaultDay) {
        nonDefaultDays = removeNonDefaultDayMatchingDate(
          originalStartDate,
          this.dateUtil.US_DATE_FORMAT
        );
      }
      const [hoursStr, minutesStr] = duration.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      const selectedCourtCentre = courtCentres.find(cc => cc.id === values.courtCentreId);
      // Fixed Date Scenario
      // We build the nonDefaultDay object here
      const nonDefaultDay: NonDefaultDay = {
        courtCentreId: this.data.courtCentreId,
        roomId: this.data.courtRoomId,
        startTime: moment(
          startDate + ' ' + (startTime || selectedCourtCentre.defaultStartTime),
          `${this.dateUtil.US_DATE_FORMAT} ${this.dateUtil.HOURS_MINUTES_24H}`
        ).toISOString(),
        duration: hours * 60 + minutes
      };

      if (!this.isMultiDay) {
        nonDefaultDays = [nonDefaultDay];
        values.nonSittingDays = [];
      } else {
        nonDefaultDays = [...nonDefaultDays, nonDefaultDay];
      }
    } else if (!this.isMultiDay) {
      nonDefaultDays = removeNonDefaultDayMatchingDate(startDate, this.dateUtil.US_DATE_FORMAT);
      values.nonSittingDays = [];
    }

    let jurisdictionType = this.hearing.jurisdictionType;

    if (values.courtCentreId) {
      jurisdictionType =
        courtCentres.find(c => c.id === values.courtCentreId).courtCode.toUpperCase() === 'C'
          ? 'CROWN'
          : 'MAGISTRATES';
    }
    const resolvedValue: Hearing | HearingWithSelectedCourtCentre = {
      ...this.hearing,
      ...values,
      // if the user is editing the first hearing in an allocated multi day hearing, pick the court house / room ids from the UI
      // otherwise, use the values from the form (CWR-9)
      courtCentreId:
        matchedHearingDayIsFirst || !this.hearingHasBeenAllocated()
          ? values.courtCentreId
          : this.hearing.courtCentreId,
      courtRoomId:
        matchedHearingDayIsFirst || !this.hearingHasBeenAllocated()
          ? values.courtRoomId
          : this.hearing.courtRoomId,
      weekCommencingStartDate,
      weekCommencingEndDate,
      weekCommencingDurationInWeeks,
      startDate,
      endDate,
      nonDefaultDays,
      jurisdictionType,
      judiciary: this.selectedJudiary || judiciary
    };

    // when editing allocated multi day hearings, the backend needs to know the 'selected' court details
    // (ie which court is associated with the matched day) so that if extra hearing days
    // are added, they would be assigned to the right court (CWR-9)
    (resolvedValue as HearingWithSelectedCourtCentre).selectedCourtCentre = {
      id: values.courtCentreId,
      courtRoomId: values.courtRoomId,
      courtCentreName: this.selectedCourtCentre?.name,
      ouCode: this.selectedCourtCentre?.oucode
    };

    return resolvedValue;

    function convertDurationStringToHoursMinutesFormat(durationTimestamp: string): string {
      const durationParts = durationTimestamp.split(':');
      const [hours, minutes] = durationParts;

      if (durationParts.length === 2) {
        return hours.length === 2 ? durationTimestamp : `0${hours}:${minutes}`;
      }
      return hours.length === 2 ? `${hours}:00` : `0${hours}:00`;
    }

    function removeNonDefaultDayMatchingDate(date: string, format: string): NonDefaultDay[] {
      return nonDefaultDays.filter(ndd => {
        const nddStartDate = moment(ndd.startTime).startOf('day').format(format);
        return nddStartDate !== date;
      });
    }

    /*
     * If:
     *    startTime != selectedCourtCenture.defaultStartTime
     * OR
     *    duration != selectedCourtCenture.defaultDuration
     * AND
     *    is a single day hearing
     * return true, else false.
     */
    function shouldAddToNonDefaultDays(isMultiDay: boolean): boolean {
      if (!isMultiDay) {
        const selectedCourtCentre = courtCentres.find(cc => cc.id === values.courtCentreId);
        const defaultStartTime = selectedCourtCentre?.defaultStartTime;
        const defaultDurationFmt = convertDurationStringToHoursMinutesFormat(
          selectedCourtCentre.defaultDuration
        );
        const durationFmt = convertDurationStringToHoursMinutesFormat(duration);

        return defaultStartTime !== startTime || defaultDurationFmt !== durationFmt;
      }

      return false;
    }
  }

  private toFormValues(hearing: Hearing): FormValues {
    let {
      courtCentreId,
      courtRoomId,
      hearingLanguage,
      judiciary,
      nonDefaultDays,
      hearingDays,
      nonSittingDays,
      type,
      jurisdictionType,
      weekCommencingDurationInWeeks,
      sendNotificationToParties
    } = hearing;

    const { startDate, endDate } = hearing.allocated
      ? { startDate: hearing.startDate ?? '', endDate: hearing.endDate ?? '' }
      : this.getDefaultStartEndDates(hearing);

    const resolvedHearingData = this.hearingHasBeenAllocated()
      ? hearingDays[0]
      : { courtCentreId, courtRoomId };

    let { startTime, duration } = this.calculateStartTimeAndDuration(
      nonDefaultDays,
      startDate,
      resolvedHearingData.courtCentreId,
      hearingDays
    );

    if (this.hearing.allocated === true && duration === 'NaN:NaN') {
      duration = '00:00';
    }
    const dateRange = new DateRange(startDate, endDate);

    this.setDisplayStateOfNonDefaultDaysAndNonSittingDays(nonDefaultDays, nonSittingDays);

    this.setCourtCentreAndRoomOptions(resolvedHearingData.courtCentreId);

    type = Object.assign({}, type);

    judiciary = [...judiciary].filter(judic => !!judic); // this is to move Winger 2 to 1 in local state, when 1 is empty but 2 is present
    nonDefaultDays = this.constructedDefaultDay
      ? [...nonDefaultDays, this.constructedDefaultDay]
      : nonDefaultDays;

    this.isMultiDay = startDate !== endDate;
    return {
      courtCentreId: resolvedHearingData.courtCentreId,
      courtRoomId: resolvedHearingData.courtRoomId,
      dateRange,
      startTime,
      duration,
      hearingLanguage,
      hearingDays,
      judiciary,
      judicialRoleType: judiciary[0] ? judiciary[0].judicialRoleType : null,
      multiDay: this.isMultiDay,
      type,
      nonDefaultDays,
      nonSittingDays,
      jurisdictionType,
      weekCommencingDurationInWeeks,
      sendNotificationToParties
    };
  }

  ngOnDestroy(): void {
    this.store.dispatch(setHearingToEditAllocation({ hearingToEditAllocation: null }));
  }
}

function findNonDefaultDay(nonDefaultDays: NonDefaultDay[], searchDate: string) {
  return nonDefaultDays.find(
    ndd =>
      moment(ndd.startTime).startOf('day').format(`${getCPPDate().US_DATE_FORMAT}`) === searchDate
  );
}
