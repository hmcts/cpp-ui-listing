import { TestBed, inject } from '@angular/core/testing';

import { ApplicantRespondentFullNamePipe } from './applicant-respondent-full-name.pipe';

describe('Pipe: ApplicantRespondentFullNamePipe', () => {
  let pipe;
  const applicantDefendant = {
    id: '1234',
    firstName: 'Lloyd',
    lastName: 'Lane'
  };

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [ApplicantRespondentFullNamePipe],
      teardown: { destroyAfterEach: false }
    })
  );

  beforeEach(inject([ApplicantRespondentFullNamePipe], (p) => {
    pipe = p;
  }));

  it('should return the fullname with capitalised name and uppercase surname', () => {
    expect(pipe.transform(applicantDefendant)).toEqual('Lloyd LANE');
  });

  it('should return the capitalised name', () => {
    expect(pipe.transform(applicantDefendant, 'firstName')).toEqual('Lloyd');
  });

  it('should return the uppercase surname', () => {
    expect(pipe.transform(applicantDefendant, 'lastName')).toEqual('LANE');
  });
});
