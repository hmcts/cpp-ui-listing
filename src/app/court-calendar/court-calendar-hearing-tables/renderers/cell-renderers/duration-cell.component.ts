import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TimeDurationPipe } from '../../../pipes/time-duration.pipe';
import { PdkCore, PdkTagComponent } from '@cpp/pdk';

@Component({
  selector: 'duration-cell',
  template: `
    <div data-test-id="duartion" class="offences">
      <div>{{ duration | timeDuration }}</div>
      @if (totalDays > 1) {
        <pdk-tag condensed pdk-margin-top="2" [color]="'turquoise'">
          @if (displayMultiHearingDay) {
            <span> Day {{ dayOfHearing }} of {{ totalDays }}</span>
          }
          @if (!displayMultiHearingDay) {
            <span> Multi-day</span>
          }
        </pdk-tag>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['duration', 'displayMultiHearingDay', 'dayOfHearing', 'totalDays'],
  imports: [PdkTagComponent, PdkCore, TimeDurationPipe]
})
export class DurationCellComponent {
  duration: number;
  dayOfHearing: number;
  totalDays: number;
  displayMultiHearingDay = true;
}
