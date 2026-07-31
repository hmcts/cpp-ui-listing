import { TestBed, inject } from '@angular/core/testing';

import { CapitalizeFirstLetterPipe } from './capitalize-first-letter.pipe';

describe('Pipe: CapitalisePipe', () => {
  let pipe;

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [CapitalizeFirstLetterPipe],
      teardown: { destroyAfterEach: false }
    })
  );

  beforeEach(inject([CapitalizeFirstLetterPipe], (p) => {
    pipe = p;
  }));

  it('should work with empty string', () => {
    expect(pipe.transform('')).toEqual('');
  });

  it('should capitalise only first letter for all lowercase string', () => {
    expect(pipe.transform('sentencing')).toEqual('Sentencing');
  });

  it('should capitalise only first letter for all uppercase string', () => {
    expect(pipe.transform('SENTENCING')).toEqual('Sentencing');
  });

  it('should capitalise only first letter for all mixed case string', () => {
    expect(pipe.transform('sEnTeNcInG')).toEqual('Sentencing');
  });

  it('should throw with invalid values', () => {
    expect(() => pipe.transform(undefined)).toThrow();
    expect(() => pipe.transform()).toThrow();
    expect(() => pipe.transform()).toThrowError('Requires a string as input');
  });
});
