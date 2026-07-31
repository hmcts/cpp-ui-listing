import { Component, input, output } from '@angular/core';
import { ControlContainer, FormsModule, NgForm } from '@angular/forms';
import { TransformDurationMinutesPipe } from '../../../shared/pipes/transform-duration.pipe';
import { PdkForm, PdkTimeInputComponent } from '@cpp/pdk';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'change-hearing-start-time-controls',
  template: `
    <div class="timeDuration">
      <pdk-form-field
        label="Start time"
        labelType="small"
        [errorMessages]="[
          {
            rule: 'required',
            message: 'Enter a start time'
          },
          {
            rule: 'timeExists',
            message: 'Enter a valid start time'
          }
        ]"
      >
        <pdk-time-input
          name="startTime"
          labelHidden="false"
          autoShift="false"
          required
          [ngModel]="startTime() | date: 'HH:mm'"
          (ngModelChange)="startTimeChange.emit($event)"
        >
        </pdk-time-input>
      </pdk-form-field>

      <pdk-form-field
        label="Duration"
        labelType="small"
        [errorMessages]="[
          {
            rule: 'required',
            message: 'Enter a duration'
          },
          {
            rule: 'timeExists',
            message: 'Enter a valid duration'
          }
        ]"
      >
        <pdk-time-input
          name="duration"
          labelHidden="false"
          autoShift="false"
          required
          [ngModel]="duration() | transformDurationMinutes"
        >
        </pdk-time-input>
      </pdk-form-field>
    </div>
  `,
  imports: [DatePipe, TransformDurationMinutesPipe, PdkTimeInputComponent, FormsModule, PdkForm],
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
export class ChangeHearingStartTimeControlsComponent {
  readonly startTime = input<string>(undefined);
  readonly duration = input<number>(undefined);
  readonly startTimeChange = output<string>();
}
