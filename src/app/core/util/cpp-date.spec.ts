import { getCPPDate, CPPDate } from './cpp-date';
import moment from 'moment';

describe('UICoreDateService', () => {
  let dateService: CPPDate;

  beforeEach(() => {
    dateService = getCPPDate();
  });

  it('create an instance', () => {
    expect(dateService).toBeTruthy();
  });

  it('UTC ISO should throw an exception when invalid date is passed in', () => {
    expect(() => dateService.toUtcISO(null)).toThrow(dateService.INVALID_DATE_MESSAGE);
  });

  it('UTC ISO to local date should throw an exception when invalid date is passed in', () => {
    expect(() => dateService.localDate(null)).toThrow(dateService.INVALID_DATE_MESSAGE);
  });

  it('Should convert local date to UTC format', () => {
    const currentYear = new Date().getFullYear();
    const month = 8;
    const day = 20;
    const hour = 14;
    const minutes = 30;
    const daylightSavingDate = dateService.getDateTime(currentYear, month, day, hour, minutes);
    const actualDate = dateService.toUtcISO(daylightSavingDate);
    const utcOffset = moment(daylightSavingDate).utcOffset() / 60;
    const localHours = moment(daylightSavingDate).hour();
    const utcHours = moment.utc(actualDate).hour();

    expect(localHours - utcHours).toEqual(Math.abs(utcOffset));
  });

  it('Should convert UTC format to local date', () => {
    const currentYear = dateService.getCurrentDate().getFullYear();
    const month = 8;
    const day = 20;
    const hour = 14;
    const minutes = 30;

    const daylightSavingDate = dateService.getDateTime(currentYear, month, day, hour, minutes);
    const utcIso = moment(daylightSavingDate).toISOString();
    const expectedDate = new Date();
    expectedDate.setFullYear(currentYear);
    expectedDate.setMonth(month - 1);
    expectedDate.setDate(20);
    expectedDate.setHours(hour);
    expectedDate.setMinutes(minutes);
    expectedDate.setSeconds(0, 0);

    const actualDate = dateService.localDate(utcIso);

    expect(actualDate).toEqual(expectedDate);
  });

  it('It should return the current date', () => {
    const expectedDate = new Date();
    const actualDate = dateService.getCurrentDate();

    const currentYear = expectedDate.getFullYear();
    const currentMonth = expectedDate.getMonth();
    const currentDay = expectedDate.getDate();

    expect(actualDate.getFullYear()).toBe(currentYear);
    expect(actualDate.getMonth()).toBe(currentMonth);
    expect(actualDate.getDate()).toBe(currentDay);
  });

  it('It should return the correct date format', () => {
    const currentYear = new Date().getFullYear();
    const month = 10;
    const day = 20;
    const hour = 14;
    const minutes = 30;

    const dateToFormat = dateService.getDateTime(currentYear, month, day, hour, minutes);

    const actualFormatedDate = dateService.format(dateToFormat);
    const expectedFormatedDate = `${currentYear}-${month}-${day}`;

    expect(actualFormatedDate).toBe(expectedFormatedDate);
  });

  it('It should add years', () => {
    const currentYear = new Date().getFullYear();
    const month = 10;
    const day = 20;
    const hour = 14;
    const minutes = 30;

    const dateToFormat = dateService.getDateTime(currentYear, month, day, hour, minutes);

    const actualDate = dateService.add(dateToFormat, 2, dateService.YEAR);

    const expectedDate = dateService.getDateTime(currentYear + 2, month, day, hour, minutes);

    expect(actualDate).toEqual(expectedDate);
  });

  it('It should add months', () => {
    const currentYear = new Date().getFullYear();
    const month = 10;
    const day = 20;
    const hour = 14;
    const minutes = 30;

    const dateToFormat = dateService.getDateTime(currentYear, month, day, hour, minutes);

    const actualDate = dateService.add(dateToFormat, 2, dateService.MONTH);

    const expectedDate = dateService.getDateTime(currentYear, month + 2, day, hour, minutes);

    expect(actualDate).toEqual(expectedDate);
  });

  it('It should add days', () => {
    const currentYear = new Date().getFullYear();
    const month = 10;
    const day = 20;
    const hour = 14;
    const minutes = 30;

    const dateToFormat = dateService.getDateTime(currentYear, month, day, hour, minutes);

    const actualDate = dateService.add(dateToFormat, 2, dateService.DAY);

    const expectedDate = dateService.getDateTime(currentYear, month, day + 2, hour, minutes);

    expect(actualDate).toEqual(expectedDate);
  });

  it('It should add hours', () => {
    const currentYear = new Date().getFullYear();
    const month = 10;
    const day = 20;
    const hour = 14;
    const minutes = 30;

    const dateToFormat = dateService.getDateTime(currentYear, month, day, hour, minutes);

    const actualDate = dateService.add(dateToFormat, 2, dateService.HOUR);

    const expectedDate = dateService.getDateTime(currentYear, month, day, hour + 2, minutes);

    expect(actualDate).toEqual(expectedDate);
  });

  it('It should add minutes', () => {
    const currentYear = new Date().getFullYear();
    const month = 10;
    const day = 20;
    const hour = 14;
    const minutes = 30;

    const dateToFormat = dateService.getDateTime(currentYear, month, day, hour, minutes);

    const actualDate = dateService.add(dateToFormat, 60, dateService.MINUTE);

    const expectedDate = dateService.getDateTime(currentYear, month, day, hour, minutes + 60);

    expect(actualDate).toEqual(expectedDate);
  });

  it('It should substract days', () => {
    const currentYear = new Date().getFullYear();
    const month = 10;
    const day = 20;
    const hour = 14;
    const minutes = 30;

    const dateToFormat = dateService.getDateTime(currentYear, month, day, hour, minutes);

    const actualDate = dateService.subtract(dateToFormat, 4, dateService.DAY);

    const expectedDate = dateService.getDateTime(currentYear, month, day - 4, hour, minutes);

    expect(actualDate).toEqual(expectedDate);
  });

  it('It should verify date is after another date', () => {
    const currentYear = new Date().getFullYear() - 1;
    const month = 10;
    const day = 20;
    const hour = 14;
    const minutes = 30;

    const passedDate = dateService.getDateTime(currentYear, month, day, hour, minutes);
    const futureDate = dateService.getDateTime(currentYear + 2, month, day, hour, minutes);

    const isAfter = dateService.isAfter(futureDate, passedDate);
    expect(isAfter).toBe(true);
  });

  it('It should verify date is before another date', () => {
    const currentYear = new Date().getFullYear() - 1;
    const month = 10;
    const day = 20;
    const hour = 14;
    const minutes = 30;

    const passedDate = dateService.getDateTime(currentYear, month, day, hour, minutes);
    const futureDate = dateService.getDateTime(currentYear + 2, month, day, hour, minutes);

    const isBefore = dateService.isBefore(passedDate, futureDate);
    expect(isBefore).toBe(true);
  });

  it('It should calculate time difference between 2 days', () => {
    const currentYear = new Date().getFullYear();
    const month = 10;
    const day = 20;
    const hour = 14;
    const minutes = 30;

    const passedDate = dateService.getDateTime(currentYear, month, day, hour, minutes);
    const futureDate = dateService.getDateTime(currentYear, month, day + 2, hour, minutes);

    const daysDiff = dateService.diff(passedDate, futureDate, dateService.DAY);
    expect(daysDiff).toBe(-2);
  });

  it('It should provide the date at the beginning of the day', () => {
    const currentYear = new Date().getFullYear();
    const month = 10;
    const day = 20;
    const hour = 14;
    const minutes = 30;

    const dateToParse = dateService.getDateTime(currentYear, month, day, hour, minutes);
    const actualDate = dateService.startOf(dateToParse, dateService.DAY);

    const expectedDate = dateService.getDateTime(currentYear, month, day);

    expect(actualDate).toEqual(expectedDate);
  });

  it('It should check whether 2 dates are the same', () => {
    const currentYear = new Date().getFullYear();
    const month = 10;
    const day = 20;
    const hour = 14;
    const minutes = 30;

    const date1 = dateService.getDateTime(currentYear, month, day, hour, minutes);
    const date2 = dateService.getDateTime(currentYear, month, day, hour, minutes);

    const actual = dateService.isSame(date1, date2);
    expect(actual).toBe(true);
  });

  it('It should format local date time to the correct UTC date time', () => {
    const currentYear = dateService.getCurrentDate().getFullYear();
    const month = 8;
    const day = 20;
    const hour = 14;
    const minutes = 30;

    const localDate = dateService.getDateTime(currentYear, month, day, hour, minutes);

    const localMinutes = hour * 60 + minutes;
    const offSet = moment(localDate).utcOffset();
    const actualMoment = moment.utc(
      dateService.toUtcISO(localDate, dateService.HOURS_MINUTES_24H),
      dateService.HOURS_MINUTES_24H
    );
    const utcMinutes = actualMoment.hour() * 60 + actualMoment.minutes();

    expect(localMinutes - utcMinutes).toEqual(Math.abs(offSet));
  });

  it('combine date and time', () => {
    const year = 2018;
    const month = 8;
    const day = 20;
    const hour = 14;
    const minutes = 30;
    const seconds = 40;
    const millisecond = 403;

    const localDate: Date = dateService.getDateTime(
      year,
      month,
      day,
      hour,
      minutes,
      seconds,
      millisecond
    );
    const expectedDateTime = moment()
      .year(year)
      .month(month)
      .date(day)
      .hour(hour)
      .minute(minutes)
      .second(seconds)
      .millisecond(millisecond)
      .toDate();
    const actualDateTime = dateService.combine(new Date(year, month, day), localDate);
    expect(actualDateTime.toISOString()).toBe(expectedDateTime.toISOString());
  });
});
