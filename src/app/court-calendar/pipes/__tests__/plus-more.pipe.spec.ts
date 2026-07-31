import { PlusMorePipe } from '../plus-more.pipe';

describe('PlusMorePipe', () => {
  let pipe: PlusMorePipe;

  beforeEach(() => {
    pipe = new PlusMorePipe();
  });

  it('should return empty string for null input', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for undefined input', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return "+ 1 more" for an array with one item', () => {
    expect(pipe.transform([1])).toBe('+ 1 more');
  });

  it('should return "+ 5 more" for an array with five items', () => {
    expect(pipe.transform([1, 2, 3, 4, 5])).toBe('+ 5 more');
  });

  it('should return "+ 10 more" for an array with ten items', () => {
    expect(pipe.transform(new Array(10))).toBe('+ 10 more');
  });
});
