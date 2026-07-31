import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'transformDurationMinutes' })
export class TransformDurationMinutesPipe implements PipeTransform {
  datePipe = new DatePipe('en-UK');

  transform(durationMinutes: number) {
    const milliseconds = durationMinutes * 60 * 1000;
    // we use utc to ensure that the durationis displayed without any utc offsets
    return this.datePipe.transform(milliseconds, 'HH:mm', 'UTC');
  }
}
