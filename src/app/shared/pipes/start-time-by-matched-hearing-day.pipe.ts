import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

import { Hearing } from '../../core';

@Pipe({ name: 'startTimeByMatchedHearingDay' })
export class StartTimeByMatchedHearingDayPipe implements PipeTransform {
  timeFormat = 'HH:mm';

  transform({ hearingDays }: Hearing): string {
    const matchingDay = hearingDays[0];
    return moment((matchingDay || hearingDays[0]).startTime).format(this.timeFormat);
  }
}
