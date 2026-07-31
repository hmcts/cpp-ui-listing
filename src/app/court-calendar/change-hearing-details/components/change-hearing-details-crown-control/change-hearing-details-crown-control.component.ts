import {
  Component,
  forwardRef,
  inject,
  ChangeDetectionStrategy,
  input,
  output
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
  ReactiveFormsModule,
  ControlContainer,
  NgForm,
  FormsModule
} from '@angular/forms';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { CPPDate } from '../../../../core/util';
import {
  ErrorMessageConfig,
  PdkCheckBox,
  PdkCore,
  PdkDateInput,
  PdkForm,
  ValidationError
} from '@cpp/pdk';
import {
  dateRangeWithinLimitsValidator,
  DateRange
} from '../../../../shared/components/date-range/date-range';
import { NonSittingDaysComponent } from '../../../../shared/components/non-sitting-days/non-sitting-days.component';
import { NonDefaultDaysComponent } from '../../../../shared/components/non-default-days/non-default-days.component';
import { CourtCentre, HearingDay, JurisdictionType, NonDefaultDay } from '../../../../core';
import { ChangeHearingStartTimeControlsComponent } from '../change-hearing-start-time-controls.component';
import { DatePipe } from '@angular/common';

const ERROR_MESSAGES: ErrorMessageConfig[] = [
  { rule: 'required', message: 'Enter an end date' },
  {
    rule: 'dateFormat',
    message: 'Enter a valid end date'
  },
  {
    rule: 'dateRangeExceeded',
    message: `End date can’t be more than 2 years after start date`
  },
  {
    rule: 'weekDate',
    message: `End date can’t be a weekend — enter a weekday`
  }
];

@Component({
  selector: 'change-hearing-crown-control',
  templateUrl: './change-hearing-details-crown-control.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NonSittingDaysComponent,
    NonDefaultDaysComponent,
    ChangeHearingStartTimeControlsComponent,
    PdkForm,
    PdkCheckBox,
    PdkDateInput,
    PdkCore,
    DatePipe
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => ChangeHearingDetailsCrownControlComponent)
    }
  ],
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: NgForm
    }
  ],
  styles: [
    `
      .multidayHearing {
        display: flex;
        justify-content: space-between;
        gap: 130px;
      }
    `
  ]
})
export class ChangeHearingDetailsCrownControlComponent implements ControlValueAccessor {
  readonly nonSittingDays = input<string[]>(undefined);
  readonly nonDefaultDays = input<NonDefaultDay[]>(undefined);
  readonly selectedCourtCentre = input<CourtCentre>(undefined);
  readonly parentCourtRoomId = input<string>(undefined);
  readonly hearingDays = input<HearingDay[]>(undefined);
  readonly startTime = input<string>(undefined);
  readonly startDate = input<string>(undefined);
  readonly duration = input<number>(undefined);
  readonly jurisdictionType = input<JurisdictionType>(undefined);
  readonly onValidationError = output<ValidationError[]>();
  endDateControl: FormControl<string>;
  errorMessages = ERROR_MESSAGES;
  dateRange: DateRange;
  get isMultiDay() {
    return this.startDateStr !== this.endDateControl.value;
  }
  private startDateStr: string = '';
  private initialEndDate: string = '';
  private readonly dateUtil: CPPDate = inject(CPPDate);

  get minDate(): string {
    const nextDay = new Date(this.startDateStr);
    nextDay.setDate(nextDay.getDate() + 1);
    return this.dateUtil.format(nextDay);
  }

  private propagateChange = (_: any) => {};

  constructor() {
    this.endDateControl = new FormControl<string>('');

    this.endDateControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        map(endDate => {
          return new DateRange(this.startDateStr, endDate);
        })
      )
      .subscribe(val => {
        this.dateRange = val;
        this.propagateChange(val);
      });
  }

  writeValue(dateRange: DateRange): void {
    if (dateRange) {
      this.dateRange = dateRange;
      this.startDateStr = dateRange.startDate;
      const endDate = (this.initialEndDate = dateRange.endDate);
      this.endDateControl.addValidators(dateRangeWithinLimitsValidator(this.startDateStr));
      this.endDateControl.patchValue(endDate);
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn.bind(this);
  }

  registerOnTouched(fn: any): void {}

  invertMultiDay(isChecked: boolean): void {
    if (!isChecked) {
      this.endDateControl.setValue(this.startDateStr);
    } else if (this.startDateStr !== this.initialEndDate) {
      this.endDateControl.patchValue(this.initialEndDate, { emitEvent: false });
    } else {
      this.endDateControl.patchValue(this.minDate, { emitEvent: false });
    }
  }
}
