import { TestBed, inject } from '@angular/core/testing';

import { FindFirstApplicantRespondantAlphabeticallyPipe } from './find-first-respondant-alphabetically.pipe';

describe('Pipe: FindFirstApplicantRespondantAlphabeticallyPipe', () => {
  let pipe;
  const respondants = [
    {
      firstName: 'Benjamin',
      lastName: 'POTTER',
      isRespondent: true
    },
    {
      firstName: 'Antonio',
      lastName: 'Andrews',
      isRespondent: true
    },
    {
      firstName: 'Peter',
      lastName: 'WEBB',
      isRespondent: true
    }
  ];

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [FindFirstApplicantRespondantAlphabeticallyPipe],
      teardown: { destroyAfterEach: false }
    })
  );

  beforeEach(inject([FindFirstApplicantRespondantAlphabeticallyPipe], (p) => {
    pipe = p;
  }));

  it('should find the first respondant alphabetically', () => {
    expect(pipe.transform(respondants).lastName).toEqual('Andrews');
  });
});
