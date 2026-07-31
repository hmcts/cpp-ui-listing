import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  OnChanges,
  SimpleChanges,
  ViewChild,
  input,
  output
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ErrorMessageConfig,
  PdkCore,
  PdkDateInput,
  PdkForm,
  PdkGrid,
  ValidationError
} from '@cpp/pdk';
import { DateRange } from '../date-range/date-range';
import { getMomentValue } from '../../../core/util';
import { DatePipe, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'non-sitting-days',
  templateUrl: './non-sitting-days.html',
  styleUrls: ['./non-sitting-days-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PdkGrid,
    PdkCore,
    PdkDateInput,
    PdkForm,
    DatePipe,
    NgTemplateOutlet
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NonSittingDaysComponent)
    },
    DatePipe
  ]
})
export class NonSittingDaysComponent implements ControlValueAccessor, OnChanges {
  readonly dateRange = input<DateRange>(undefined);
  readonly readOnly = input(false);
  readonly onCancel = output<string[]>();
  readonly onValidationError = output<ValidationError[]>();
  @ViewChild(FormGroupDirective, { static: false }) formGroupDirective: FormGroupDirective;
  propagateChange: (nonSittingDays: string[]) => void = () => {};
  formGroup = new FormGroup<{ nonSittingDay: FormControl<string> }>({
    nonSittingDay: new FormControl('', [Validators.required, this.endDateValidator()])
  });

  public copyNonSittingDays: string[] = [];
  errorMessages: ErrorMessageConfig[];

  constructor(private datePipe: DatePipe) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.dateRange?.currentValue) {
      const dateRange = this.dateRange();
      if (getMomentValue(dateRange.startDate) && getMomentValue(dateRange.endDate)) {
        this.errorMessages = [
          {
            rule: 'required',
            message: 'Enter a date for a non sitting day'
          },
          {
            rule: 'invalidEndDateFormat',
            message: 'Enter a valid end date before adding non-sitting days'
          },
          {
            rule: 'missingEndDate',
            message: 'Enter the end date first before adding non-sitting days'
          },

          {
            rule: 'dateFormat',
            message: 'Enter a valid Non sitting date'
          },
          {
            rule: 'minDate',
            message: `End date can’t be before the start date ${this.datePipe.transform(
              dateRange.startDate,
              'd MMMM yyyy'
            )} - enter valid date`
          },
          {
            rule: 'maxDate',
            message: `Enter a date between ${this.datePipe.transform(
              dateRange.startDate,
              'd MMMM yyyy'
            )} and ${this.datePipe.transform(dateRange.endDate, 'd MMMM yyyy')}`
          }
        ];
      }
    }
  }
  writeValue(value: string[]): void {
    this.copyNonSittingDays = !!value ? [...value] : [];
  }
  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }
  registerOnTouched(fn: any): void {}

  onFormSubmit() {
    if (!this.copyNonSittingDays.includes(this.formGroup.value.nonSittingDay)) {
      this.copyNonSittingDays.push(this.formGroup.value.nonSittingDay);
      this.propagateChange(this.copyNonSittingDays);
    }
    this.formGroup?.reset();
  }

  cancelNonSittingDay(i: number) {
    this.copyNonSittingDays.splice(i, 1);
    this.propagateChange(this.copyNonSittingDays);
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
