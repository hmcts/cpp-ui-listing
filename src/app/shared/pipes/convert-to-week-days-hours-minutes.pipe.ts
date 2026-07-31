import { Pipe, PipeTransform } from '@angular/core';
import { HearingEstimate } from '../../core';

@Pipe({ name: 'convertToWeekDaysHoursMinutes' })
export class ConvertToWeekDaysHoursMinutesPipe implements PipeTransform {
  transform(estimateInMinutes: number) {
    const anHour = 60;
    const aDay = 6 * anHour;
    const aWeek = aDay * 5;

    const result: HearingEstimate = {
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0
    };

    let remainingMinutes = estimateInMinutes;

    result.weeks = Math.floor(remainingMinutes / aWeek);
    remainingMinutes = remainingMinutes % aWeek;
    result.days = Math.floor(remainingMinutes / aDay);
    remainingMinutes = remainingMinutes % aDay;
    result.hours = Math.floor(remainingMinutes / anHour);
    result.minutes = remainingMinutes % anHour;

    return result;
  }
}
