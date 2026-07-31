import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeDuration'
})
export class TimeDurationPipe implements PipeTransform {
  transform(duration: number) {
    const days = Math.floor(duration / 360);
    const hours = Math.floor((duration % 360) / 60);
    const minutes = (duration % 360) % 60;
    return `${this.getDurationDisplay(days, 'day')} ${this.getDurationDisplay(
      hours,
      'hour'
    )} ${this.getDurationDisplay(minutes, 'minute')}`.trim();
  }

  private getDurationDisplay(duration: number, suffix: string): string {
    if (duration === 0 || isNaN(duration)) {
      return '';
    }
    return `${duration} ${this.isMultiple(duration) ? suffix + 's' : suffix}`;
  }

  private isMultiple(value: number): boolean {
    return value > 1;
  }
}
