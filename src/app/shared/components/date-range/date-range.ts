import { AbstractControl, ValidatorFn } from '@angular/forms';
import { getMomentValue } from '../../../core/util/utils-helper';

export function endDateAfterStartDateValidator(startDate: AbstractControl): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const startMoment = getMomentValue(startDate.value);
    const endMoment = getMomentValue(control.value);
    return endMoment && endMoment.isBefore(startMoment)
      ? { endDateBeforeStartDate: { value: control.value } }
      : null;
  };
}

export function dateRangeWithinLimitsValidator(
  startDateCtrlOrString: AbstractControl | string
): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const startDateValue =
      typeof startDateCtrlOrString === 'string'
        ? startDateCtrlOrString
        : startDateCtrlOrString.value;
    const date = getMomentValue(control.value);
    const startDate = getMomentValue(startDateValue);
    if (date && startDate) {
      const diff = date.diff(startDate, 'years', true);
      return diff > 2 ? { dateRangeExceeded: diff } : null;
    }
    return null;
  };
}

export class DateRange {
  constructor(public startDate: string, public endDate: string) {}
}
