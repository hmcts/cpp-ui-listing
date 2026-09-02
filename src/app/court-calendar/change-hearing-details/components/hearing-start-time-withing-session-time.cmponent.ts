import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import {
  ControlContainer,
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NgForm,
  ReactiveFormsModule
} from '@angular/forms';
import { PdkForm, PdkSelectComponent, generateId, ErrorMessageConfig } from '@cpp/pdk';
import { DatePipe } from '@angular/common';
import { HearingSlot } from '@cpp/scheduling';
import { SelectOption } from '@kolkov/angular-editor';
import { sortSelectOptionAlphabetical } from '@cpp/reference-data';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StartTimeBetweenSessionDirective } from './start-time-between-session-validator.directive';

const ERROR_MESSAGES: ErrorMessageConfig[] = [
  { rule: 'required', message: 'Select a session' },
  { rule: 'startTimeInvalid', message: 'The start time must be between valid session timings' }
];

@Component({
  selector: 'hearing-start-time-within-session-time',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PdkForm, PdkSelectComponent, StartTimeBetweenSessionDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => HearingStartTimeWithinSessionTimeComponent)
    }
  ],
  template: `
    <pdk-form-field label="Session" labelType="small" [errorMessages]="errorMessages">
      <pdk-select
        justified
        required
        [id]="id"
        [formControl]="control"
        [options]="sessionTimesOptions()"
        [startTimeBetweenSession]="startTime()"
        [hearingSlots]="hearingSlots()"
      >
      </pdk-select>
    </pdk-form-field>
  `,
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: NgForm
    }
  ],
  styles: [
    `
      .timeDuration {
        display: flex;
        justify-content: space-between;
        width: 600px;
      }
    `
  ]
})
export class HearingStartTimeWithinSessionTimeComponent implements ControlValueAccessor {
  readonly hearingSlots = input<HearingSlot[]>([]);
  readonly startTime = input<string>(undefined);
  readonly id = generateId('hearing-start-time-within-session-time');
  readonly control = new FormControl<string>(null);
  readonly errorMessages = ERROR_MESSAGES;

  private readonly datePipe = new DatePipe('en-GB');

  readonly sessionTimesOptions = computed<SelectOption[]>(() =>
    (this.hearingSlots() ?? [])
      .map(({ courtScheduleId, sessionStartTime, sessionEndTime, businessType }) => ({
        value: courtScheduleId,
        label: `${businessType} ${this.datePipe.transform(
          sessionStartTime,
          'hh:mm a'
        )} to ${this.datePipe.transform(sessionEndTime, 'hh:mm a')}`
      }))
      .sort(sortSelectOptionAlphabetical)
  );

  private propagateChange: (courtScheduleId: string) => void = () => {};

  constructor() {
    this.control.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(courtScheduleId => this.propagateChange(courtScheduleId));
  }

  writeValue(courtScheduleId: string): void {
    this.control.setValue(courtScheduleId ?? null, { emitEvent: false });
  }

  registerOnChange(fn: (courtScheduleId: string) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(): void {}
}
