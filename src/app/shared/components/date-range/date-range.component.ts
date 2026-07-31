import {
  Component,
  forwardRef,
  ViewEncapsulation,
  ChangeDetectorRef,
  Type,
  input,
  Input,
  output
} from '@angular/core';
import {
  NG_VALIDATORS,
  Validator,
  ValidationErrors,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  AbstractControl,
  NgControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {
  endDateAfterStartDateValidator,
  dateRangeWithinLimitsValidator,
  DateRange
} from './date-range';
import { Hearing, Defendant } from '../../../core/model';
import { map } from 'rxjs/operators';
import { CPPDate, getCPPDate, getMomentValue } from '../../../core/util';
import {
  ErrorMessageConfig,
  FormFieldControl,
  PdkFormFieldComponent,
  PdkInsetTextComponent,
  PdkTypographyDirective,
  PdkCheckboxComponent,
  PdkCheckboxConditionalComponent,
  PdkMarginDirective,
  PdkDateInputComponent,
  PdkMinDateValidatorDirective
} from '@cpp/pdk';
import { Injector } from '@angular/core';

import { DatePickerComponent } from '../datepicker/datepicker.component';
import { CPPDatePipe } from '../../pipes/cpp-date.pipe';

let i = 0;

const ERROR_MESSAGES: ErrorMessageConfig[] = [
  { rule: 'required', message: 'Enter an end date' },
  {
    rule: 'dateFormat',
    message: 'Enter a valid end date'
  },
  {
    rule: 'endDateBeforeStartDate',
    message: `End date can’t be before start date - enter valid date`
  },
  {
    rule: 'dateRangeExceeded',
    message: `End date can’t be more than 2 years after start date`
  },
  {
    rule: 'noSession',
    message: 'No sessions available for updated criteria'
  }
];

interface FormInterface {
  startDate: FormControl<string>;
  endDate: FormControl<string>;
}

@Component({
  selector: 'listing-date-range',
  templateUrl: 'date-range.component.html',
  styleUrls: ['./date-range.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => DateRangeComponent)
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DateRangeComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    PdkFormFieldComponent,
    DatePickerComponent,
    PdkInsetTextComponent,
    PdkTypographyDirective,
    PdkCheckboxComponent,
    PdkCheckboxConditionalComponent,
    PdkMarginDirective,
    PdkDateInputComponent,
    PdkMinDateValidatorDirective,
    CPPDatePipe
  ]
})
export class DateRangeComponent implements ControlValueAccessor, FormFieldControl, Validator {
  readonly isWeekCommencing = input<boolean>(undefined);
  readonly hearing = input<Hearing>(undefined);
  readonly minStartDate = input<string>(undefined);
  @Input() id: string;
  @Input('aria-describedby') ariaDescribedBy: string;
  readonly showStartDate = input<boolean>(true);
  readonly noSessionError = input<ValidationErrors | null>(undefined);
  readonly onIsMultiDay = output<boolean>();

  dateInputs: FormGroup<FormInterface>;
  errorMessages = ERROR_MESSAGES;
  controlType = 'date-range';
  multi = false;
  private startDateStr: string;
  private endDateStr: string;
  private _isMultiday = false;
  private readonly dateUtil: CPPDate;

  get isMultiday(): boolean {
    return this._isMultiday;
  }

  set isMultiday(isMultiday) {
    this._isMultiday = isMultiday;
    this.onIsMultiDay.emit(this._isMultiday);

    this.updateEndDateIfSameAsStartAndMultiday();
  }

  private propagateChange = (_: any) => {};

  constructor(
    private cd: ChangeDetectorRef,
    readonly injector: Injector
  ) {
    this.dateUtil = getCPPDate();
    i += 1;

    this.id = `listing-date-range-${i}`;

    const startDateControl = new FormControl<string>('');
    const endDateControl = new FormControl<string>('', [
      endDateAfterStartDateValidator(startDateControl),
      dateRangeWithinLimitsValidator(startDateControl)
    ]);

    this.dateInputs = new FormGroup({
      startDate: startDateControl,
      endDate: endDateControl
    });

    this.dateInputs.valueChanges
      .pipe(
        map(({ startDate, endDate }) => {
          if (startDate) {
            if (!this.isMultiday && (!endDate || this.dateUtil.isBefore(endDate, startDate))) {
              endDate = startDate;
              this.getEndDate().setValue(startDate, { emitEvent: false });
            }
            if (endDate !== this.endDateStr) {
              this.startDateStr = startDate;
              this.endDateStr = endDate;
              return new DateRange(startDate, endDate);
            }
            if (startDate !== this.startDateStr) {
              const shiftedEndDate = this.getShiftedEndDate(startDate, endDate);
              setTimeout(() => {
                this.getEndDate().setValue(shiftedEndDate);
              }, 0);

              return new DateRange(startDate, shiftedEndDate);
            }
            return new DateRange(startDate, endDate);
          }
          return null;
        })
      )
      .subscribe(val => {
        if (val) {
          this.startDateStr = val.startDate;
          this.endDateStr = val.endDate;
        }
        this.propagateChange(val);
        this.cd.detectChanges();
      });
  }

  get ngControl(): NgControl {
    return this.injector.get(NgControl as Type<NgControl>);
  }

  validate(c: FormControl): ValidationErrors | null {
    ['startDate', 'endDate'].forEach(controlName => {
      this.dateInputs.controls[controlName].updateValueAndValidity({ onlySelf: true });
    });

    return ['startDate', 'endDate'].reduce(
      (errors: { [k: string]: ValidationErrors | null }, controlName) => {
        if (!this.dateInputs.controls[controlName].valid) {
          return {
            ...(errors || {}),
            [controlName]: this.dateInputs.controls[controlName].errors
          };
        }
        return errors;
      },
      null
    );
  }

  writeValue(dateRange: DateRange): void {
    if (dateRange && dateRange.startDate) {
      const startDate = dateRange.startDate;
      this.startDateStr = startDate;
      const endDate =
        dateRange.endDate && this.dateUtil.isBefore(dateRange.endDate, dateRange.startDate)
          ? dateRange.startDate
          : dateRange.endDate;
      this.endDateStr = endDate;
      this.dateInputs.patchValue({ startDate, endDate });
      this.resetIsMultiDay(startDate, endDate);
      this.updateEndDateIfSameAsStartAndMultiday();
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn.bind(this);
  }

  registerOnTouched(fn: any): void {}

  invertMultiDay(): void {
    this.isMultiday = !this.isMultiday;
    if (!this.isMultiday) {
      this.getEndDate().setValue(this.getStartDate().value);
    } else if (this.endDateStr && this.isMultiday) {
      this.getEndDate().setValue(this.endDateStr);
    }
  }

  getShiftedEndDate(startDate: string, endDate: string): string {
    const newStartDateMoment = getMomentValue(startDate);
    const previousStartDateMoment = getMomentValue(this.startDateStr);
    if (!this.isMultiday) {
      return startDate;
    }
    if (!this.isWeekCommencing() && previousStartDateMoment && startDate !== this.startDateStr) {
      const previousEndDateMoment = getMomentValue(this.endDateStr);
      const plusMinusDays = newStartDateMoment.diff(previousStartDateMoment, 'days');
      const shiftedEndDate = previousEndDateMoment
        ? previousEndDateMoment.clone().add(plusMinusDays, 'days')
        : previousStartDateMoment;
      return shiftedEndDate ? this.dateUtil.format(shiftedEndDate.toDate()) : '';
    }
    return endDate;
  }

  get custodyTimeLimit() {
    const allDefendants = [];
    const hearing = this.hearing();
    if (hearing.listedCases) {
      hearing.listedCases.forEach(lCase => {
        allDefendants.push(...lCase.defendants);
      });
    }
    const defendantsInCustody: Defendant[] = allDefendants.filter((defendant: Defendant) => {
      return !!(defendant.bailStatus && defendant.custodyTimeLimit);
    });

    if (defendantsInCustody.length === 1) {
      return defendantsInCustody[0].custodyTimeLimit;
    } else if (defendantsInCustody.length === 0) {
      return '';
    } else {
      return this.defendantEarliestCustodyTimeLimit(defendantsInCustody);
    }
  }

  defendantEarliestCustodyTimeLimit(defendants: Defendant[]): string {
    const custodyTimeLimits = [];
    defendants.forEach(defendant =>
      defendant.custodyTimeLimit ? custodyTimeLimits.push(new Date(defendant.custodyTimeLimit)) : ''
    );

    return custodyTimeLimits.length !== 0
      ? new Date(Math.min.apply(null, custodyTimeLimits)).toString()
      : '';
  }

  private resetIsMultiDay(startDate: string, endDate: string): void {
    this.isMultiday = startDate !== endDate;
    this.cd.detectChanges();
  }

  private getStartDate(): AbstractControl {
    return this.dateInputs.get('startDate');
  }

  private getEndDate(): AbstractControl {
    return this.dateInputs.get('endDate');
  }

  private updateEndDateIfSameAsStartAndMultiday(): void {
    const startDate = this.getStartDate().value;
    const endDate = this.getEndDate().value;

    if (startDate === endDate && this.isMultiday) {
      const nextDay = this.getNextDay(startDate);
      this.getEndDate().setValue(nextDay, { emitEvent: false });
      this.endDateStr = nextDay;
    }
  }

  private getNextDay(date: string): string {
    if (!date) return '';
    return this.dateUtil.format(this.dateUtil.add(new Date(date), 1, this.dateUtil.DAY));
  }

  get minEndDate(): string {
    return this.getNextDay(this.dateInputs.get('startDate')?.value);
  }
}
