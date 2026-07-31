import { TestBed, inject } from '@angular/core/testing';

import { SortHearingsByStartDateThenFirstDefendantNamePipe } from './sort-hearings-by-start-date-then-defendant-name.pipe';
import { Hearing } from '../../core/';
import {
  validHearingMock1,
  validHearingMock2,
  validHearingMock3
} from '../../../mock-data/test-fixtures';

describe('Pipe: SortHearingsByStartDateThenFirstDefendantNamePipe', () => {
  let pipe;

  const hearings: Hearing[] = [validHearingMock1, validHearingMock2, validHearingMock3];

  const expectedHearings: Hearing[] = [validHearingMock2, validHearingMock3, validHearingMock1];

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [SortHearingsByStartDateThenFirstDefendantNamePipe],
      teardown: { destroyAfterEach: false }
    })
  );

  beforeEach(inject([SortHearingsByStartDateThenFirstDefendantNamePipe], (p) => {
    pipe = p;
  }));

  it('should sort hearings by start date', () => {
    expect(pipe.transform(hearings, '2018-11-05')).toEqual(expectedHearings);
  });
});
