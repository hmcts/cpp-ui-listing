import { TestBed, inject } from '@angular/core/testing';
import { BailStatusPipe } from './';

describe('Pipe: BailStatusPipe', () => {
  let pipe;

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [BailStatusPipe],
      teardown: { destroyAfterEach: false }
    })
  );

  beforeEach(inject([BailStatusPipe], (p) => {
    pipe = p;
  }));

  it('should return the right readabla value', () => {
    expect(pipe.transform('CONDITIONAL')).toEqual('Conditional');
    expect(pipe.transform('UNCONDITIONAL')).toEqual('Unconditional');
    expect(pipe.transform('IN_CUSTODY')).toEqual('In custody');
    expect(pipe.transform('WHATEVER')).toEqual('');
  });
});
