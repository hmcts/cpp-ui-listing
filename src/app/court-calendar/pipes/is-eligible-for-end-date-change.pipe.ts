import { Pipe, PipeTransform } from '@angular/core';
import { isEligibleForEndDateChange } from '../utils/court-calendar-hearings-helper';
import { HearingRowVM } from '../model';

@Pipe({ name: 'isEligibleForEndDateChange' })
export class IsEligibleForEndDateChangePipe implements PipeTransform {
  transform(hearing: HearingRowVM): boolean {
    return isEligibleForEndDateChange(hearing?.details);
  }
}
