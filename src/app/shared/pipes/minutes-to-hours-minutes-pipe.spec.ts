import { TestBed, inject } from '@angular/core/testing';
import { HoursMinutesPipe } from './minutes-to-hours-minutes-pipe';

describe('Pipe: HoursMinutes', () => {
  let pipe;

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [HoursMinutesPipe],
      teardown: { destroyAfterEach: false }
    })
  );

  beforeEach(inject([HoursMinutesPipe], (p) => {
    pipe = p;
  }));

  it('should convert minutes into the correct format', () => {
    expect(pipe.transform(90)).toEqual('01:30');
    expect(pipe.transform(30)).toEqual('00:30');
  });
});
