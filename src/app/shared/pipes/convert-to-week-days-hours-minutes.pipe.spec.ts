import { TestBed, inject } from '@angular/core/testing';

import { ConvertToWeekDaysHoursMinutesPipe } from './convert-to-week-days-hours-minutes.pipe';

describe('Pipe: ConvertToWeekDaysHoursMinutes', () => {
  let pipe;

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [ConvertToWeekDaysHoursMinutesPipe],
      teardown: { destroyAfterEach: false }
    })
  );

  beforeEach(inject([ConvertToWeekDaysHoursMinutesPipe], (p) => {
    pipe = p;
  }));

  it('should convert minutos into the right weeks, days, hours and minutes', () => {
    expect(pipe.transform(59)).toEqual({ weeks: 0, days: 0, hours: 0, minutes: 59 });
    expect(pipe.transform(61)).toEqual({ weeks: 0, days: 0, hours: 1, minutes: 1 });
    expect(pipe.transform(359)).toEqual({ weeks: 0, days: 0, hours: 5, minutes: 59 });
    expect(pipe.transform(360)).toEqual({ weeks: 0, days: 1, hours: 0, minutes: 0 });
    expect(pipe.transform(5 * 360)).toEqual({ weeks: 1, days: 0, hours: 0, minutes: 0 });
  });
});
