import { unitOfTime } from 'moment';
import moment from 'moment';
import { getMomentValue } from './utils-helper';
import { Injectable } from '@angular/core';
import { isWeekend } from '@cpp/pdk';

@Injectable({ providedIn: 'root' })
export class CPPDate {
  public readonly INVALID_DATE_MESSAGE = 'Provide a valid date to parse';
  public readonly US_DATE_FORMAT = 'YYYY-MM-DD';
  public readonly UK_DATE_FORMAT = 'DD-MM-YYYY';
  public readonly SHORT_YEAR = 'YY';

  public readonly YEAR = 'year';
  public readonly DAY = 'day';
  public readonly MONTH = 'month';
  public readonly HOUR = 'hour';
  public readonly MINUTE = 'minute';
  public readonly SECOND = 'second';

  public readonly HOURS_MINUTES_24H = 'HH:mm';
  public readonly ISO_STRING_FORMAT = 'YYYY-MM-DDTHH:mm:ss.sssZ';

  toUtcISO(dateToParse: Date | string, dateTimeformat = ''): string {
    if (!dateToParse || dateToParse === '') {
      throw new Error(this.INVALID_DATE_MESSAGE);
    }

    if (dateTimeformat) {
      return moment.utc(moment(dateToParse).toISOString()).format(dateTimeformat);
    }

    return moment(dateToParse).toISOString();
  }

  localDate(dateToParse: string | Date): Date {
    if (dateToParse) {
      const dateString = moment(new Date(dateToParse)).toISOString(true);
      const date = getMomentValue(dateString);
      if (date) {
        return date.local().toDate();
      } else {
        throw new Error(this.INVALID_DATE_MESSAGE);
      }
    }
    throw new Error(this.INVALID_DATE_MESSAGE);
  }

  getDateTime(
    year: number,
    month: number,
    day: number,
    hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0
  ): Date {
    // Months are zero indexed
    if (month > 0) {
      month--;
    }

    return moment()
      .year(year)
      .month(month)
      .date(day)
      .hour(hours)
      .minute(minutes)
      .second(seconds)
      .millisecond(milliseconds)
      .toDate();
  }

  getCurrentDate(): Date {
    return new Date();
  }

  format(dateToFormat: Date | string, dateFormat = this.US_DATE_FORMAT): string {
    return getMomentValue(dateToFormat).format(dateFormat);
  }

  add(date: Date, unit: number, unitOfTimeValue = this.DAY): Date {
    return getMomentValue(date)
      .add(unit, unitOfTimeValue as unitOfTime.DurationConstructor)
      .toDate();
  }

  subtract(date: Date | string, unit: number, unitOfTimeValue = this.DAY): Date {
    return getMomentValue(date)
      .subtract(unit, unitOfTimeValue as unitOfTime.DurationConstructor)
      .toDate();
  }

  isAfter(
    dateA: Date | string,
    dateB: Date | string,
    unitOfTimeValue = '',
    format?: string
  ): boolean {
    if (unitOfTimeValue) {
      return !!dateA && !!dateB
        ? getMomentValue(dateA, format).isAfter(
            getMomentValue(dateB, format),
            unitOfTimeValue as unitOfTime.DurationConstructor
          )
        : false;
    }

    return !!dateA && !!dateB
      ? getMomentValue(dateA, format).isAfter(getMomentValue(dateB, format))
      : false;
  }

  isBefore(dateA: Date | string, dateB: Date | string, format?: string): boolean {
    const momentA = getMomentValue(dateA, format);
    const momentB = getMomentValue(dateB, format);
    return momentA && momentB ? momentA.isBefore(momentB) : false;
  }

  isSameOrAfter(dateA: Date | string, dateB: Date | string, format?: string) {
    const momentA = getMomentValue(dateA, format);
    const momentB = getMomentValue(dateB, format);
    return momentA && momentB ? momentA.isSameOrAfter(momentB) : false;
  }

  isSameOrBefore(dateA: Date | string, dateB: Date | string, format?: string) {
    const momentA = getMomentValue(dateA, format);
    const momentB = getMomentValue(dateB, format);
    return momentA && momentB ? momentA.isSameOrBefore(momentB) : false;
  }

  diff(dateA: Date | string, dateB: Date | string, unitOfTimeValue = this.DAY): number {
    return getMomentValue(dateA).diff(dateB, unitOfTimeValue as unitOfTime.DurationConstructor);
  }

  countWorkingDays(startDate: Date | string, endDate: Date | string): number {
    let count = 0;
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      if (!isWeekend(current)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  startOf(date: Date | string, unitOfTimeValue = this.DAY): Date {
    return getMomentValue(date)
      .startOf(unitOfTimeValue as unitOfTime.DurationConstructor)
      .toDate();
  }

  isSame(dateA: Date | string, DateB: Date | string, unitOfTimeValue = ''): boolean {
    if (unitOfTimeValue) {
      return getMomentValue(dateA).isSame(DateB, unitOfTimeValue as unitOfTime.DurationConstructor);
    }

    return getMomentValue(dateA).isSame(DateB);
  }

  isValidDate(date: Date | string, format?: string) {
    return moment(date, format || moment.ISO_8601).isValid();
  }

  combine(date: Date, time: Date): Date {
    return moment()
      .year(moment(date).year())
      .month(moment(date).month())
      .date(moment(date).date())
      .hour(moment(time).hour())
      .minute(moment(time).minute())
      .second(moment(time).second())
      .millisecond(moment(time).millisecond())
      .toDate();
  }

  getNextDayOfWeek(dateFrom: Date | string, dayOfWeek: number): Date {
    return moment(dateFrom)
      .startOf('isoWeek')
      .add(dayOfWeek - 1, 'day')
      .toDate();
  }
}

export function getCPPDate(): CPPDate {
  return new CPPDate();
}
