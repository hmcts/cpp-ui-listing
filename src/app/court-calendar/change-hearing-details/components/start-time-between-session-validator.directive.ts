import { DatePipe } from '@angular/common';
import { Directive, effect, forwardRef, inject, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { HearingSlot } from '@cpp/scheduling';
import { CPPDate } from '../../../core/util';

@Directive({
  selector: '[startTimeBetweenSession]',
  providers: [
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: forwardRef(() => StartTimeBetweenSessionDirective)
    }
  ]
})
export class StartTimeBetweenSessionDirective implements Validator {
  datePipe = new DatePipe('en-GB');
  ccpDateUtil = inject(CPPDate);
  formattedCurrentDate = this.ccpDateUtil.format(new Date());
  readonly hearingSlots = input<HearingSlot[]>(undefined);
  readonly startTimeBetweenSession = input.required({
    transform: (startTime: string) => {
      const dateTime = `${this.formattedCurrentDate} ${startTime}`;
      if (this.ccpDateUtil.isValidDate(dateTime)) {
        return this.ccpDateUtil.toUtcISO(`${this.formattedCurrentDate} ${startTime}`);
      }
      return undefined;
    }
  });
  private validateOnChange: () => void = () => {};

  constructor() {
    effect(() => {
      if (this.startTimeBetweenSession()) {
        this.validateOnChange();
      }
    });
  }

  validate(control: AbstractControl<any, any>): ValidationErrors {
    if (!control.value) {
      return null;
    }
    const schedule = this.hearingSlots().find(
      ({ courtScheduleId }) => courtScheduleId === control.value
    );
    const sessionStartTime = this.datePipe.transform(schedule?.sessionStartTime, 'hh:mm a');
    const sessionEndTime = this.datePipe.transform(schedule?.sessionEndTime, 'hh:mm a');
    const startTime = this.datePipe.transform(this.startTimeBetweenSession(), 'hh:mm a');
    if (
      this.ccpDateUtil.isSameOrAfter(startTime, sessionStartTime, 'HH:mm A') &&
      this.ccpDateUtil.isBefore(startTime, sessionEndTime, 'HH:mm A')
    ) {
      return null;
    }

    return {
      startTimeInvalid: true
    };
  }
  registerOnValidatorChange(fn: () => void): void {
    this.validateOnChange = fn;
  }
}
