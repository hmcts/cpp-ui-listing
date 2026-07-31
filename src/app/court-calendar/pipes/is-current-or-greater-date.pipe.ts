import { Pipe, PipeTransform } from '@angular/core';
import { dateIsCurrentOrGreaterThan } from '../utils/court-calendar-hearings-helper';

@Pipe({ name: 'IsCurrentOrGreaterThanDate' })
export class IsCurrentOrGreaterThanDatePipe implements PipeTransform {
  transform(hearingDate: string | Date): boolean {
    return dateIsCurrentOrGreaterThan(hearingDate);
  }
}
