import { TestBed, inject } from '@angular/core/testing';

import { FullNamePipe } from './full-name.pipe';

describe('Pipe: CapitalisePipe', () => {
  let pipe;
  const defendant1 = {
    id: '1234',
    firstName: 'Lloyd',
    lastName: 'Lane',
    offences: [
      {
        id: '456',
        offenceCode: 'CJS24234',
        startDate: '20180-10-01',
        statementOfOffence: {
          title: 'Whatever',
          legislation: 'Whatever'
        }
      }
    ],
    bailStatus: 'conditional'
  };

  const organisation1 = {
    id: '12345',
    organisationId: '542',
    organisationName: 'Zara',
    offences: [
      {
        id: '456',
        offenceCode: 'CJS24234',
        startDate: '20180-10-01',
        statementOfOffence: {
          title: 'Whatever',
          legislation: 'Whatever'
        }
      }
    ],
    bailStatus: 'conditional'
  };

  const defendant2 = {
    id: '12345',
    offences: [
      {
        id: '456',
        offenceCode: 'CJS24234',
        startDate: '20180-10-01',
        statementOfOffence: {
          title: 'Whatever',
          legislation: 'Whatever'
        }
      }
    ],
    bailStatus: 'conditional'
  };

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [FullNamePipe],
      teardown: { destroyAfterEach: false }
    })
  );

  beforeEach(inject([FullNamePipe], (p) => {
    pipe = p;
  }));

  it('should return the fullname with capitalised name and uppercase surname', () => {
    expect(pipe.transform(defendant1)).toEqual('Lloyd LANE');
  });

  it('should return the capitalised name', () => {
    expect(pipe.transform(defendant1, 'firstName')).toEqual('Lloyd');
  });

  it('should return the uppercase surname', () => {
    expect(pipe.transform(defendant1, 'lastName')).toEqual('LANE');
  });

  it('should return the uppercase organisation name', () => {
    expect(pipe.transform(organisation1, 'organisationName')).toEqual('ZARA');
  });

  it('should return empty string when no organisation or defendant', () => {
    expect(pipe.transform(defendant2, null)).toEqual('');
  });
});
