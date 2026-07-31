import { TimeDurationPipe } from '../time-duration.pipe';

describe('TimeDurationPipe', () => {
  let pipe: TimeDurationPipe;

  beforeEach(() => {
    pipe = new TimeDurationPipe();
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform 0 minutes correctly', () => {
    expect(pipe.transform(0)).toBe('');
  });

  it('should transform less than 60 minutes correctly', () => {
    expect(pipe.transform(30)).toBe('30 minutes');
  });

  it('should transform exactly 60 minutes correctly', () => {
    expect(pipe.transform(60)).toBe('1 hour');
  });

  it('should transform more than 60 minutes correctly', () => {
    expect(pipe.transform(75)).toBe('1 hour 15 minutes');
  });
});
