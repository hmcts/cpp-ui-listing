import { Pipe, PipeTransform } from '@angular/core';
import { CPPDate, getCPPDate } from '../../core/util';

@Pipe({ name: 'cppDate' })
export class CPPDatePipe implements PipeTransform {
  private readonly cppDateUtil: CPPDate;

  constructor() {
    this.cppDateUtil = getCPPDate();
  }

  transform(utcDate: string, format = 'D MMMM YYYY'): string {
    if (!utcDate || utcDate.trim() === '') {
      return '';
    }

    const localDate = this.cppDateUtil.localDate(utcDate);

    return this.cppDateUtil.format(localDate, format);
  }
}
