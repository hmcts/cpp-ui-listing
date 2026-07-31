import { TestBed, inject } from '@angular/core/testing';

import { StartTimeByMatchedHearingDayPipe } from './start-time-by-matched-hearing-day.pipe';
import { Hearing } from '../../core';

describe('StartTimeByMatchedHearingDayPipe', () => {
  let pipe;

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [StartTimeByMatchedHearingDayPipe],
      teardown: { destroyAfterEach: false }
    })
  );

  beforeEach(inject([StartTimeByMatchedHearingDayPipe], (p) => {
    pipe = p;
  }));

  it('should return start time for hearingDay if it matches the flag', () => {
    const hearing = {
      id: '1',
      startDate: '2018-10-01',
      endDate: '2018-10-01',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: ':id',
          endTime: '2018-10-01 12:00:00',
          sequence: 1,
          startTime: '2018-10-01 10:00:00',
          durationMinutes: 120
        },
        {
          hearingDate: '2018-10-02',
          courtRoomId: ':id',
          endTime: '2018-10-01 12:00:00',
          sequence: 1,
          matchedWithQuery: true,
          startTime: '2018-10-01 16:00:00',
          durationMinutes: 120
        }
      ]
    } as Hearing;

    expect(pipe.transform(hearing)).toBe('10:00');
  });

  it('should return start time for first hearingDay if none of them matches the flag', () => {
    const hearing = {
      id: '1',
      startDate: '2018-10-01',
      endDate: '2018-10-01',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: ':id',
          endTime: '2018-10-01 12:00:00',
          sequence: 1,
          startTime: '2018-10-01 10:00:00',
          durationMinutes: 120
        },
        {
          hearingDate: '2018-10-02',
          courtRoomId: ':id',
          endTime: '2018-10-01 12:00:00',
          sequence: 1,
          startTime: '2018-10-01 16:00:00',
          durationMinutes: 120
        }
      ]
    } as Hearing;

    expect(pipe.transform(hearing)).toBe('10:00');
  });
});
