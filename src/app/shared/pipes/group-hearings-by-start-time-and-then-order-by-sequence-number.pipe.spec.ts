import { TestBed, inject } from '@angular/core/testing';
import { GroupHearingsByStartTimeAndThenOrderBySequenceNumberPipe } from './group-hearings-by-start-time-and-then-order-by-sequence-number.pipe';
import { Hearing, JurisdictionType } from '../../core';

describe('GroupHearingsByStartTimeAndThenOrderBySequenceNumberPipe', () => {
  const templateHearing: Hearing = {
    id: '1',
    type: {
      id: '5591d709-4397-452c-8533-998165d58d9c',
      description: 'Further Plea & Trial Preparation'
    },
    startDate: '2018-10-01',
    endDate: '2018-10-02',
    hearingDays: [],
    allocated: true,
    judiciary: [],
    courtRoomId: 'e7721a38-546d-4b56-9992-ebdd772a561b',
    listedCases: [
      {
        id: '926fc76b-7ec9-4bee-bb7d-b8e63d61fc33',
        defendants: [],
        caseIdentifier: {
          authorityId: 'cf73207f-3ced-488a-82a0-3fba79c2ce85',
          authorityCode: 'TFL',
          caseReference: 'TFL12345'
        }
      }
    ],
    courtCentreId: '9b583616-049b-30f9-a14f-028a53b7cfe8',
    nonDefaultDays: [],
    nonSittingDays: [],
    hearingLanguage: 'ENGLISH',
    estimatedMinutes: 300,
    jurisdictionType: 'MAGISTRATES' as JurisdictionType
  };

  let pipe;

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [GroupHearingsByStartTimeAndThenOrderBySequenceNumberPipe],
      teardown: { destroyAfterEach: false }
    })
  );

  beforeEach(inject([GroupHearingsByStartTimeAndThenOrderBySequenceNumberPipe], (p) => {
    pipe = p;
  }));

  it('should not return any grouped hearings if none match selected date', () => {
    const hearingOne = {
      ...templateHearing,
      id: '1',
      startDate: '2018-10-01',
      endDate: '2018-10-01',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: ':id',
          endTime: '2018-10-01 12:00:00',
          sequence: 1,
          startTime: '2018-10-01 10:00:00',
          durationMinutes: 120
        }
      ]
    };
    const hearingTwo = {
      ...templateHearing,
      id: '2',
      startDate: '2018-10-01',
      endDate: '2018-10-01',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: ':id2',
          endTime: '2018-10-01 10:00:00',
          sequence: 1,
          startTime: '2018-10-01 09:00:00',
          durationMinutes: 120
        }
      ]
    };

    const selectedDateNotMatchingAnyHearings = '2018-10-20';
    const hearings = [hearingOne, hearingTwo];
    const noResultsExpected = {};

    expect(pipe.transform(hearings, selectedDateNotMatchingAnyHearings)).toEqual(noResultsExpected);
  });

  it('should return only grouped hearings that match selected date and courtRoom', () => {
    const hearingOne = {
      ...templateHearing,
      id: '1',
      startDate: '2018-10-01',
      endDate: '2018-10-01',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          endTime: '2018-10-01 12:00:00',
          sequence: 1,
          courtRoomId: templateHearing.courtRoomId,
          startTime: '2018-10-01 10:00:00',
          durationMinutes: 120
        }
      ]
    };
    const hearingTwo = {
      ...templateHearing,
      id: '2',
      startDate: '2018-10-05',
      endDate: '2018-10-05',
      hearingDays: [
        {
          hearingDate: '2018-10-05',
          endTime: '2018-10-05 10:00:00',
          sequence: 1,
          startTime: '2018-10-05 09:00:00',
          durationMinutes: 120
        }
      ]
    };

    const selectedDate = '2018-10-01';
    const hearings = [hearingOne, hearingTwo];
    const expected = {
      '10:00': [hearingOne]
    };

    expect(pipe.transform(hearings, selectedDate)).toEqual(expected);
  });

  it('should group hearings by start time alone with hearing per timeslot', () => {
    const hearingOne = {
      ...templateHearing,
      id: '1',
      startDate: '2018-10-01',
      endDate: '2018-10-01',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-01 12:00:00',
          sequence: 1,
          startTime: '2018-10-01 10:00:00',
          durationMinutes: 120
        },
        {
          hearingDate: '2018-10-02',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-01 18:00:00',
          sequence: 1,
          startTime: '2018-10-01 16:00:00',
          durationMinutes: 120
        }
      ]
    };
    const hearingTwo = {
      ...templateHearing,
      id: '2',
      startDate: '2018-10-01',
      endDate: '2018-10-01',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-01 10:00:00',
          sequence: 1,
          startTime: '2018-10-01 09:00:00',
          durationMinutes: 120
        }
      ]
    };

    const selectedDate = '2018-10-01';
    const hearings = [hearingOne, hearingTwo];
    const expected = {
      '09:00': [hearingTwo],
      '10:00': [hearingOne]
    };

    expect(pipe.transform(hearings, selectedDate)).toEqual(expected);
  });

  it('should return grouped hearings for hearings that have multiple hearing days', () => {
    const hearingOne = {
      ...templateHearing,
      id: '1',
      startDate: '2018-10-01',
      endDate: '2018-10-03',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-01 12:00:00',
          sequence: 1,
          startTime: '2018-10-01 10:00:00',
          durationMinutes: 120
        },
        {
          hearingDate: '2018-10-02',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-02 12:00:00',
          sequence: 1,
          startTime: '2018-10-02 10:00:00',
          durationMinutes: 120
        },
        {
          hearingDate: '2018-10-03',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-03 12:00:00',
          sequence: 1,
          startTime: '2018-10-03 10:00:00',
          durationMinutes: 120
        }
      ]
    };
    const hearingTwo = {
      ...templateHearing,
      id: '2',
      startDate: '2018-10-01',
      endDate: '2018-10-04',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-01 10:00:00',
          sequence: 1,
          startTime: '2018-10-01 09:00:00',
          durationMinutes: 120
        },
        {
          hearingDate: '2018-10-02',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-02 10:00:00',
          sequence: 1,
          startTime: '2018-10-02 09:00:00',
          durationMinutes: 120
        },
        {
          hearingDate: '2018-10-03',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-03 10:00:00',
          sequence: 1,
          startTime: '2018-10-03 09:00:00',
          durationMinutes: 120
        },
        {
          hearingDate: '2018-10-04',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-04 10:00:00',
          sequence: 1,
          startTime: '2018-10-04 09:00:00',
          durationMinutes: 120
        }
      ]
    };

    const selectedDate = '2018-10-02';
    const hearings = [hearingOne, hearingTwo];
    const expected = {
      '09:00': [hearingTwo],
      '10:00': [hearingOne]
    };

    expect(pipe.transform(hearings, selectedDate)).toEqual(expected);
  });

  it('should return grouped hearings ordered by sequence number within a group when more than one hearing in a timeslot', () => {
    const hearingOne = {
      ...templateHearing,
      id: '1',
      startDate: '2018-10-01',
      endDate: '2018-10-01',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-01 12:00:00',
          sequence: 2,
          startTime: '2018-10-01 10:00:00',
          durationMinutes: 120
        }
      ]
    };
    const hearingTwo = {
      ...templateHearing,
      id: '2',
      startDate: '2018-10-01',
      endDate: '2018-10-01',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-01 12:00:00',
          sequence: 3,
          startTime: '2018-10-01 10:00:00',
          durationMinutes: 120
        }
      ]
    };
    const hearingThree = {
      ...templateHearing,
      id: '3',
      startDate: '2018-10-01',
      endDate: '2018-10-01',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-01 12:00:00',
          sequence: 1,
          startTime: '2018-10-01 10:00:00',
          durationMinutes: 120
        }
      ]
    };

    const selectedDate = '2018-10-01';
    const hearings = [hearingOne, hearingTwo, hearingThree];
    const expected = {
      '10:00': [hearingThree, hearingOne, hearingTwo]
    };

    expect(pipe.transform(hearings, selectedDate)).toEqual(expected);
  });

  it('should return grouped hearings ordered by start time and then sequence number for a full day', () => {
    const hearingOne = {
      ...templateHearing,
      id: '1',
      startDate: '2018-10-01',
      endDate: '2018-10-01',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-01 16:00:00',
          sequence: 2,
          startTime: '2018-10-01 15:00:00',
          durationMinutes: 120
        }
      ]
    };
    const hearingTwo = {
      ...templateHearing,
      id: '2',
      startDate: '2018-10-01',
      endDate: '2018-10-01',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-01 16:00:00',
          sequence: 1,
          startTime: '2018-10-01 15:00:00',
          durationMinutes: 120
        }
      ]
    };
    const hearingThree = {
      ...templateHearing,
      id: '3',
      startDate: '2018-10-01',
      endDate: '2018-10-01',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-01 12:00:00',
          sequence: 2,
          startTime: '2018-10-01 10:00:00',
          durationMinutes: 120
        }
      ]
    };
    const hearingFour = {
      ...templateHearing,
      id: '4',
      startDate: '2018-10-01',
      endDate: '2018-10-01',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-01 10:00:00',
          sequence: 2,
          startTime: '2018-10-01 09:00:00',
          durationMinutes: 120
        }
      ]
    };
    const hearingFive = {
      ...templateHearing,
      id: '5',
      startDate: '2018-10-01',
      endDate: '2018-10-01',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-01 13:00:00',
          sequence: 1,
          startTime: '2018-10-01 12:00:00',
          durationMinutes: 120
        }
      ]
    };
    const hearingSix = {
      ...templateHearing,
      id: '6',
      startDate: '2018-10-01',
      endDate: '2018-10-01',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-01 10:00:00',
          sequence: 1,
          startTime: '2018-10-01 09:00:00',
          durationMinutes: 120
        }
      ]
    };
    const hearingSeven = {
      ...templateHearing,
      id: '7',
      startDate: '2018-10-01',
      endDate: '2018-10-01',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-01 12:00:00',
          sequence: 3,
          startTime: '2018-10-01 10:00:00',
          durationMinutes: 120
        }
      ]
    };
    const hearingEight = {
      ...templateHearing,
      id: '8',
      startDate: '2018-10-01',
      endDate: '2018-10-01',
      hearingDays: [
        {
          hearingDate: '2018-10-01',
          courtRoomId: templateHearing.courtRoomId,
          endTime: '2018-10-01 12:00:00',
          sequence: 1,
          startTime: '2018-10-01 10:00:00',
          durationMinutes: 120
        }
      ]
    };

    const selectedDate = '2018-10-01';
    const hearings = [
      hearingOne,
      hearingTwo,
      hearingThree,
      hearingFour,
      hearingFive,
      hearingSix,
      hearingSeven,
      hearingEight
    ];
    const expected = {
      '09:00': [hearingSix, hearingFour],
      '10:00': [hearingEight, hearingThree, hearingSeven],
      '12:00': [hearingFive],
      '15:00': [hearingTwo, hearingOne]
    };

    expect(pipe.transform(hearings, selectedDate)).toEqual(expected);
  });
});
