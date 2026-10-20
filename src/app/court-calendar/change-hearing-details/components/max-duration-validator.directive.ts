import { Directive, effect, forwardRef, input, untracked } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[maxDuration]',
  providers: [
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: forwardRef(() => MaxDurationDirective)
    }
  ]
})
export class MaxDurationDirective implements Validator {
  readonly maxDuration = input.required<number>();
  private validateOnChange: () => void = () => {};

  constructor() {
    effect(() => {
      this.maxDuration();
      untracked(() => this.validateOnChange());
    });
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const [hours, minutes] = String(control.value).split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0) > this.maxDuration()
      ? { maxDurationExceeded: true }
      : null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.validateOnChange = fn;
  }
}
