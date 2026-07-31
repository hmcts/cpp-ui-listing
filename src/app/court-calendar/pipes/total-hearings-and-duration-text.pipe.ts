import { Pipe, PipeTransform } from '@angular/core';
import { CourtRoomHearingTimeCalendar, HearingRowVM } from '../model';
import { TimeDurationPipe } from './time-duration.pipe';

@Pipe({
  name: 'totalHearingAndDurationText'
})
export class TotalHearingAndDurationTextPipe implements PipeTransform {
  private timeDurationPipe = new TimeDurationPipe();
  transform(hearingTimeCalendar: CourtRoomHearingTimeCalendar[]) {
    const totalHearings = hearingTimeCalendar.reduce((accHearings, { hearings }) => {
      return [...accHearings, ...hearings.filter((hearing) => hearing.isMaster)];
    }, [] as HearingRowVM[]);
    const { totalHearingCount, duration } = this.getHearingCountAndDuration(totalHearings);
    return `(${totalHearingCount} ${totalHearingCount === 1 ? 'hearing' : 'hearings'}, ${
      !duration ? '0 minutes' : duration
    } listed)`;
  }

  private getHearingCountAndDuration(totalHearings: HearingRowVM[]) {
    const totalDurationInMinutes = totalHearings.reduce(
      (accDuration, { duration }) => accDuration + duration,
      0
    );

    return {
      totalHearingCount: totalHearings.length,
      duration: this.timeDurationPipe.transform(totalDurationInMinutes)
    };
  }
}
