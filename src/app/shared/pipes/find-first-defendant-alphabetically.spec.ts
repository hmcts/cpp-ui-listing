import { TestBed, inject } from '@angular/core/testing';

import { FindFirstDefendantAlphabeticallyPipe } from './find-first-defendant-alphabetically.pipe';

describe('Pipe: FindFirstDefendantAlphabeticallyPipe', () => {
  let pipe;
  const defendants = [
    {
      id: '30719bcc-fabe-4898-b5bb-91e91e403227',
      firstName: 'Benjamin',
      lastName: 'POTTER',
      bailStatus: 'unconditional',
      offences: [
        {
          id: '0cd40613-bfbf-11e7-b622-cfe11895a613',
          title: 'Robbery'
        }
      ]
    },
    {
      id: '987668e5-1950-416e-ad80-ef549d609a89',
      firstName: 'Antonio',
      lastName: 'WEBB',
      bailStatus: 'inCustody',
      offences: [
        {
          id: '0cd40616-bfbf-11e7-b622-cfe11895a613',
          title: 'Wounding with intent'
        }
      ]
    },
    {
      id: '987668e5-1950-416e-ad80-ef549d609a89',
      firstName: 'Peter',
      lastName: 'WEBB',
      bailStatus: 'inCustody',
      offences: [
        {
          id: '0cd40616-bfbf-11e7-b622-cfe11895a613',
          title: 'Wounding with intent'
        }
      ]
    }
  ];

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [FindFirstDefendantAlphabeticallyPipe],
      teardown: { destroyAfterEach: false }
    })
  );

  beforeEach(inject([FindFirstDefendantAlphabeticallyPipe], (p) => {
    pipe = p;
  }));

  it('should find the first defendant alphabetically', () => {
    expect(pipe.transform(defendants).firstName).toEqual('Antonio');
  });
});
