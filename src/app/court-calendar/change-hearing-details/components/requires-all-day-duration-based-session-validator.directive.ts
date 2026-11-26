import { Directive, effect, forwardRef, inject, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { HearingSlot } from '@cpp/scheduling';
import { CPPDate } from '../../../core/util';
import { findAllDayDurationBasedSession } from '../../utils/court-calendar-hearings-helper';

@Directive({
  selector: '[requiresAllDayDurationBasedSession]',
  providers: [
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: forwardRef(() => RequiresAllDayDurationBasedSessionDirective)
    }
  ]
})
export class RequiresAllDayDurationBasedSessionDirective implements Validator {
  readonly requiresAllDayDurationBasedSession = input.required<string>();
  readonly hearingSlots = input<HearingSlot[]>([]);
  private readonly cppDate = inject(CPPDate);
  private validateOnChange: () => void = () => {};

  constructor() {
    effect(() => {
      this.requiresAllDayDurationBasedSession();
      this.hearingSlots();
      this.validateOnChange();
    });
  }

  validate({ value: isMultiDay }: AbstractControl<boolean>): ValidationErrors | null {
    const startDate = this.requiresAllDayDurationBasedSession();
    if (!isMultiDay || findAllDayDurationBasedSession(this.hearingSlots(), startDate)) {
      return null;
    }
    return {
      noAllDayDurationBasedSession: {
        startDate: this.cppDate.format(startDate, this.cppDate.UK_DATE_FORMAT)
      }
    };
  }

  registerOnValidatorChange(fn: () => void): void {
    this.validateOnChange = fn;
  }
}
