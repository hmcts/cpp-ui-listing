import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  input,
  output
} from '@angular/core';
import {
  ErrorMessageConfig,
  PdkCore,
  PdkDateInput,
  PdkForm,
  PdkGrid,
  PdkTimeInputComponent,
  ValidationError
} from '@cpp/pdk';
import { HearingDay, NonDefaultDay } from '../../../core/model/hearing';
import { CPPDate, getCPPDate, getMomentValue } from '../../../core/util';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DateRange } from '../date-range/date-range';
import { DatePipe, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'non-default-days',
  templateUrl: './non-default-days.html',
  styleUrls: ['./non-default-days.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PdkCore,
    PdkForm,
    PdkDateInput,
    PdkTimeInputComponent,
    PdkGrid,
    DatePipe,
    NgTemplateOutlet
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NonDefaultDaysComponent)
    },
    DatePipe
  ]
})
export class NonDefaultDaysComponent implements ControlValueAccessor, OnInit, OnChanges {
  readonly courtCentreId = input<string>(undefined);
  readonly parentCourtRoomId = input<string>(undefined);
  readonly hearingDays = input<HearingDay[]>(undefined);
  readonly defaultStartTime = input<string>(undefined);
  readonly dateRange = input<DateRange>(undefined);
  readonly onValidationError = output<ValidationError[]>();
  @ViewChild(FormGroupDirective, { static: true }) formGroupDirective: FormGroupDirective;
  propagateChange: (nonDefaultDays: NonDefaultDay[]) => void = () => {};
  formGroup = new FormGroup<{ date: FormControl<string>; startTime: FormControl<string> }>({
    date: new FormControl('', [Validators.required, this.endDateValidator()]),
    startTime: new FormControl('', Validators.required)
  });
  errorMessages: ErrorMessageConfig[];
  private readonly dateUtil: CPPDate;

  public copyNonDefaultDays: NonDefaultDay[] = [];

  constructor(private datePipe: DatePipe) {
    this.dateUtil = getCPPDate();
  }

  ngOnInit(): void {
    this.formGroup.patchValue({ startTime: this.defaultStartTime() });
  }

  ngOnChanges(change: SimpleChanges): void {
    if (change.dateRange?.currentValue) {
      const dateRange = this.dateRange();
      if (getMomentValue(dateRange.startDate) && getMomentValue(dateRange.endDate)) {
        this.errorMessages = [
          {
            rule: 'required',
            message: 'Enter a date for a non default day'
          },
          {
            rule: 'invalidEndDateFormat',
            message: 'Enter a valid end date before adding non-default days'
          },
          {
            rule: 'missingEndDate',
            message: 'Enter the end date first before adding non-default days'
          },
          {
            rule: 'dateFormat',
            message: 'Enter a valid Non default date'
          },
          {
            rule: 'maxDate',
            message: `Enter a date between ${this.datePipe.transform(
              dateRange.startDate,
              'd MMMM yyyy'
            )} and ${this.datePipe.transform(dateRange.endDate, 'd MMMM yyyy')}`
          },
          {
            rule: 'minDate',
            message: `End date can’t be before the start date ${this.datePipe.transform(
              dateRange.startDate,
              'd MMMM yyyy'
            )} - enter valid date`
          }
        ];
      }
    }
  }

  writeValue(value: NonDefaultDay[]): void {
    this.copyNonDefaultDays = this.sortNonDefaultDays(value ?? []);
  }
  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }
  registerOnTouched(fn: any): void {}

  submitDefaultDays() {
    const nonDefaultDay: NonDefaultDay = this.createNonDefaultDay(this.formGroup.value);
    const nonDefaultFormattedDate = this.dateUtil.startOf(nonDefaultDay.startTime, 'day');
    const filteredNonDefaultDays = this.copyNonDefaultDays.filter((ndd) => {
      const nddFormattedDate = this.dateUtil.startOf(ndd.startTime, 'day');
      return !this.dateUtil.isSame(nddFormattedDate, nonDefaultFormattedDate);
    });

    filteredNonDefaultDays.push(nonDefaultDay);

    this.propagateChange(filteredNonDefaultDays);
    this.writeValue(filteredNonDefaultDays);
    this.formGroup?.reset();
  }

  cancelNonNonDefaultDay(i: number) {
    this.copyNonDefaultDays.splice(i, 1);
    this.propagateChange(this.copyNonDefaultDays);
  }

  private sortNonDefaultDays(nonDefaultDays: NonDefaultDay[]): NonDefaultDay[] {
    return [...nonDefaultDays].sort((a, b) => this.dateUtil.diff(a.startTime, b.startTime));
  }

  private createNonDefaultDay(data: Partial<{ date: string; startTime: string }>): NonDefaultDay {
    const { courtRoomId } = this.hearingDays()?.find(
      ({ hearingDate }) => this.dateUtil.format(hearingDate) === this.dateUtil.format(data.date)
    ) ?? { courtRoomId: this.parentCourtRoomId() };
    const startTime = this.dateUtil.localDate(`${data.date} ${data.startTime}`);
    return {
      startTime: this.dateUtil.toUtcISO(startTime),
      courtCentreId: this.courtCentreId(),
      roomId: courtRoomId,
      duration: 360
    };
  }

  private endDateValidator() {
    return (control: FormControl): { [key: string]: boolean } | null => {
      const endDate = this.dateRange()?.endDate;
      if (!endDate) {
        return { missingEndDate: !endDate };
      }
      if (!getMomentValue(endDate)) {
        return { invalidEndDateFormat: !getMomentValue(endDate) };
      }
      return null;
    };
  }
}
