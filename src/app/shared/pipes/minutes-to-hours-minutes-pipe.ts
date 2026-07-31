import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'hoursMinutes' })
export class HoursMinutesPipe implements PipeTransform {
  transform(minutes: number): string {
    if (!minutes) {
      return '';
    }
    const durationHours = Math.floor(minutes / 60);
    const durationMinutes = minutes % 60;
    const hoursStr = durationHours < 10 ? `0${durationHours}` : `${durationHours}`;
    const minutesStr = durationMinutes < 10 ? `0${durationMinutes}` : `${durationMinutes}`;
    return `${hoursStr}:${minutesStr}`;
  }
}
