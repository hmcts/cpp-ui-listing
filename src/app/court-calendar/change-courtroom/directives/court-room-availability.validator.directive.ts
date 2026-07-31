import { Directive, effect, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { HearingSlot } from '@cpp/scheduling';

@Directive({
  selector: '[courtRoomAvailability]',
  providers: [{ provide: NG_VALIDATORS, useExisting: CourtRoomAvailabilityDirective, multi: true }]
})
export class CourtRoomAvailabilityDirective implements Validator {
  readonly slots = input<HearingSlot[]>([]);
  readonly hearingDays = input<string[]>([]);

  private onChange: () => void;

  constructor() {
    effect(() => {
      this.slots();
      this.hearingDays();
      this.onChange?.();
    });
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onChange = fn;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const days = this.hearingDays();
    if (!days.length) return null;

    const slots = this.slots();
    const isAvailable = days.every(date =>
      slots.some(slot => slot.courtRoomId === control.value && slot.sessionDate === date)
    );

    return isAvailable ? null : { courtRoomAvailability: true };
  }
}
