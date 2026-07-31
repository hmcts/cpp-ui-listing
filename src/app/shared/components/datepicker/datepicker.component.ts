import {
  Component,
  forwardRef,
  Injector,
  OnInit,
  OnChanges,
  SimpleChanges,
  Type,
  ViewChild,
  ViewEncapsulation,
  input,
  Input,
  output
} from '@angular/core';

import moment from 'moment';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  ValidationErrors,
  AbstractControl,
  NgControl,
  FormsModule
} from '@angular/forms';
import {
  PdkDateInputComponent,
  FormFieldControl,
  PdkInsetTextComponent,
  PdkMarginDirective
} from '@cpp/pdk';

@Component({
  selector: 'date-picker',
  styleUrls: ['datepicker.scss'],
  templateUrl: 'datepicker.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    },
    {
      provide: FormFieldControl,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.None,
  imports: [PdkDateInputComponent, FormsModule, PdkInsetTextComponent, PdkMarginDirective]
})
export class DatePickerComponent
  implements ControlValueAccessor, FormFieldControl, Validator, OnInit, OnChanges
{
  @Input() id: string;
  @Input('aria-describedby') ariaDescribedBy: string;
  readonly minDate = input<string>(undefined);
  readonly preselectedValue = input<string>(undefined);
  readonly handleDateUpdate = output<string>();
  // Todo rename output events to something different from native event names
  // and enable related lint rule
  readonly blur = output();
  @ViewChild('datePicker', { static: true }) dateInput: PdkDateInputComponent;

  bsValue = moment().format('YYYY-MM-DD');
  dateValue: string;
  controlType = 'date';
  get multi() {
    return this.dateInput.multi;
  }

  private propagateChange(_: any) {}

  get ngControl(): NgControl {
    return this.injector.get(NgControl as Type<NgControl>);
  }

  constructor(private injector: Injector) {}

  ngOnInit() {
    const preselectedValue = this.preselectedValue();
    if (preselectedValue) {
      this.onValueChange(preselectedValue);
    }
  }

  ngOnChanges(changeObj: SimpleChanges) {
    if (changeObj.preselectedValue && changeObj.preselectedValue.currentValue) {
      this.onValueChange(changeObj.preselectedValue.currentValue);
    }
  }

  onValueChange(event) {
    if (!event || (event && this.dateValue === event)) {
      return;
    }
    if (moment(event, moment.ISO_8601).isValid() && event.length === 10) {
      this.dateValue = moment(event).format('YYYY-MM-DD');
      this.propagateChange(this.dateValue);
      this.handleDateUpdate.emit(this.dateValue);
    } else {
      this.dateValue = event;
      this.propagateChange(null);
    }
  }

  registerOnChange(fn: (_: any) => {}) {
    this.propagateChange = fn.bind(this);
  }

  registerOnTouched(fn: (_: unknown) => void): void {}

  writeValue(value: string): void {
    if (moment(value, moment.ISO_8601).isValid() && value.length === 10) {
      this.dateValue = moment(value).format('YYYY-MM-DD');
      this.propagateChange(this.dateValue);
      this.handleDateUpdate.emit(this.dateValue);
    } else {
      this.dateValue = null;
    }
  }

  validate(c: AbstractControl): ValidationErrors | null {
    if (c.value && moment(c.value, moment.ISO_8601).isValid()) {
      c.setErrors(null, { emitEvent: true });
      return null;
    }

    return { invalidEntry: { actual: c.value } };
  }

  getWeekDay(): string {
    return moment(this.dateValue, moment.ISO_8601).isValid()
      ? moment(this.dateValue).format('dddd')
      : null;
  }

  isValidDate(): boolean {
    return (
      this.dateValue &&
      this.dateValue.length === 10 &&
      moment(this.dateValue, moment.ISO_8601).isValid()
    );
  }
}
