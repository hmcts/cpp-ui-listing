import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PdkModule } from '@cpp/pdk';
import { sortBy } from 'lodash-es';
import { HearingDay } from '../../../../core';
import { TimeDurationPipe } from '../../pipes/time-duration.pipe';

@Component({
  selector: 'duration-cell',
  template: `
    <div data-test-id="duartion" class="offences">
      <span>{{ duration | timeDuration }}</span>
      <pdk-tag condensed pdk-margin-top="2" [color]="'turquoise'" *ngIf="hearingDays?.length > 1">
        Day {{ dayOfHearing }} of {{ hearingDays.length }}
      </pdk-tag>
    </div>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['duration', 'hearingDays', 'hearingDate'],
  imports: [CommonModule, PdkModule, TimeDurationPipe]
})
export class DurationCellComponent implements OnInit {
  duration: number;
  hearingDays: HearingDay[];
  hearingDate: string;
  dayOfHearing: number;

  ngOnInit(): void {
    const sortedHearingDays = sortBy(this.hearingDays, (hd) => new Date(hd.hearingDate).getTime());
    this.dayOfHearing =
      sortedHearingDays.findIndex((hd) => hd.hearingDate === this.hearingDate) + 1;
  }
}
