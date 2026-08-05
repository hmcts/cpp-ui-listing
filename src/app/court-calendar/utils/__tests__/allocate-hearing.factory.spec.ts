import { TestBed } from '@angular/core/testing';
import { Hearing } from '../../../core';
import { CPPDate } from '../../../core/util';
import { DateRange } from '../../../shared/components/date-range/date-range';
import { AllocateHearingFactory } from '../allocate-hearing.factory';

const multiDayHearing = {
  type: { id: 'type-1', description: 'Trial' },
  hearingLanguage: 'ENGLISH',
  publicListNote: 'a note',
  hasVideoLink: true,
  sendNotificationToParties: true,
  startDate: '2026-01-12',
  endDate: '2026-01-15',
  hearingDayCount: 4,
  hearingDays: [
    {
      startTime: '2026-01-12T09:00:00.000Z',
      durationMinutes: 360,
      courtScheduleId: 'schedule-1'
    }
  ],
  nonDefaultDays: [{ startTime: '2026-01-13T14:00:00.000Z', duration: 240 }],
  nonSittingDays: ['2026-01-14']
} as unknown as Hearing;

describe('AllocateHearingFactory', () => {
  let factory: AllocateHearingFactory;
  let cppDate: CPPDate;

  beforeEach(() => {
    factory = TestBed.inject(AllocateHearingFactory);
    cppDate = TestBed.inject(CPPDate);
  });

  describe('hearingToUpdateValues', () => {
    it('should describe the hearing as it stands when nothing is overridden', () => {
      expect(factory.hearingToUpdateValues(multiDayHearing)).toEqual({
        hasVideoLink: true,
        sendNotificationToParties: true,
        hearingLanguage: 'ENGLISH',
        publicListNote: 'a note',
        nonSittingDays: ['2026-01-14'],
        nonDefaultDays: multiDayHearing.nonDefaultDays,
        selectedHearingType: { id: 'type-1', hearingDescription: 'Trial' },
        dateRange: new DateRange('2026-01-12', '2026-01-15'),
        startTime: '09:00',
        duration: 1440,
        courtScheduleId: 'schedule-1'
      });
    });

    it('should re-derive the duration from an overridden date range', () => {
      const { dateRange, duration } = factory.hearingToUpdateValues(multiDayHearing, {
        dateRange: new DateRange('2026-01-12', '2026-01-20')
      });

      // Seven working days across the range, each sitting a full day.
      expect(dateRange).toEqual(new DateRange('2026-01-12', '2026-01-20'));
      expect(duration).toBe(2520);
    });

    it('should keep the hearing day duration when the range covers a single day', () => {
      expect(
        factory.hearingToUpdateValues(multiDayHearing, {
          dateRange: new DateRange('2026-01-12', '2026-01-12')
        }).duration
      ).toBe(360);
    });

    it('should drop the non default days of a single day hearing', () => {
      const singleDayHearing = {
        ...multiDayHearing,
        endDate: multiDayHearing.startDate,
        hearingDayCount: 1
      } as Hearing;

      expect(factory.hearingToUpdateValues(singleDayHearing).nonDefaultDays).toEqual([]);
    });

    it('should let overrides win over the hearing', () => {
      const values = factory.hearingToUpdateValues(multiDayHearing, {
        publicListNote: 'changed',
        startTime: '14:30',
        courtScheduleId: 'schedule-2'
      });

      expect(values).toEqual(
        expect.objectContaining({
          publicListNote: 'changed',
          startTime: '14:30',
          courtScheduleId: 'schedule-2'
        })
      );
    });
  });

  describe('hearingStartTime', () => {
    it('should format the first hearing day start time as HH:mm', () => {
      expect(factory.hearingStartTime(multiDayHearing)).toBe(
        cppDate.format(multiDayHearing.hearingDays[0].startTime, cppDate.HOURS_MINUTES_24H)
      );
    });
  });

  describe('multiDayDurationMinutes', () => {
    it('should charge a full sitting day for every working day in the range', () => {
      // Weekend days are excluded: 12th-16th and 19th-20th of January 2026.
      expect(factory.multiDayDurationMinutes(new DateRange('2026-01-12', '2026-01-20'))).toBe(2520);
    });
  });
});
