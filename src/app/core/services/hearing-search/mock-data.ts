import { JudicialMember } from '@cpp/reference-data';
import { Hearing, CourtCentre, Type, ExtendedJudicialRole } from '../../model';

export const courtCentreId1 = '72650f14-08a5-4ab3-9888-09fbe869359a';

export const courtCentreId2 = '69f77edb-e8e1-48f5-9c73-7a2ae32afd12';

export const courtCentreId3 = 'd9bff7d8-6168-4163-ad77-3b98d61de174';

export const courtRoomId1 = '4f901e1c-bcee-40c1-b400-60f14d92d2f0';

export const courtRoomId2 = '11b7179f-a11d-413f-9868-6dd17c954020';

export const courtRoomId3 = '1414ea28-8b0e-3ba7-8f97-f2bb6d5dd38c';

export const searchDate = '2018-05-23';

export const startDate = '2018-05-23';

export const endDate = '2018-05-24';

export const startTime = '10:30';

export const endTime = '12:30';

export const hearingId = '955016e0-5e62-11e8-8160-230c768837f4';

export const hearingId2 = 'a09d3fca-a8ca-4fd7-b7b2-736338ebf008';

export const hearingId3 = '2ad2a997-cc16-490b-b7b5-5ac0bc62184b';

export const authorityId = '955016e0-5e62-11e8-8160-230c768837f5';

export const hearingTypeId1 = '955016e0-5e62-11e8-8160-230c768837f6';

export const jurisdictionType = '955016e0-5e62-11e8-8160-230c768837f7';

export const hearingTypeId2 = '627c4ec6-79c1-4374-8ead-2954c96c80bf';

export const judicialId1 = '91e49eac-f99c-43dc-9f33-b912ef8ee8e0';

export const judicialId2 = '2d700917-0b75-49df-abbc-c55045a9aaa4';

export const judicialId3 = '6153f7d0-070b-424a-a009-a292f6aa8d40';

export const judicialId4 = '6153f7d0-070b-424a-a009-a292f6aa8d41';

export const warrantHearingTypeId = '638ced9d-3f95-4e99-b27b-47fa5a2c6add';

export const warrantHearingType: Type = {
  id: warrantHearingTypeId,
  description: 'Warrant of Further Detention'
};

export const judicialmember1: JudicialMember = {
  forenames: 'forname1 forename2',
  id: judicialId1,
  judiciaryType: 'District Judge (MC)',
  seqId: 1,
  surname: 'surname1',
  emailAddress: 'address1'
};

export const judicialmember2: JudicialMember = {
  forenames: 'forname3 forename4',
  id: judicialId2,
  judiciaryType: 'Circuit Judge',
  seqId: 1,
  surname: 'surname2',
  emailAddress: 'address2'
};

export const judicialmember3: JudicialMember = {
  forenames: 'forname5 forename6',
  id: judicialId3,
  judiciaryType: 'Recorder',
  seqId: 1,
  surname: 'surname3',
  emailAddress: 'address3'
};

export const judicialmember4: JudicialMember = {
  forenames: 'forname7 forename8',
  id: judicialId4,
  judiciaryType: 'Deputy District Judge (MC)- Fee paid',
  seqId: 1,
  surname: 'surname4',
  emailAddress: 'address4'
};

export const judicialMemberMagistrate1: JudicialMember = {
  forenames: 'magsForname1 magsForname2',
  id: judicialId1,
  judiciaryType: 'Magistrate',
  seqId: 1,
  surname: 'MagsSurname1',
  emailAddress: 'address1'
};

export const judicialMemberMagistrate2: JudicialMember = {
  forenames: 'magsForname3 magsForname4',
  id: judicialId2,
  judiciaryType: 'Magistrate',
  seqId: 1,
  surname: 'MagsSurname2',
  emailAddress: 'address2'
};

export const judicialmembers = [
  judicialmember1,
  judicialmember2,
  judicialMemberMagistrate1,
  judicialMemberMagistrate2
];

export const hearingType1: Type = {
  id: hearingTypeId1,
  description: 'Sentence'
};

export const hearingType2: Type = {
  id: hearingTypeId2,
  description: 'PTP'
};

export const hearingTypes: Type[] = [hearingType1, hearingType2];

export const extendedJudiciaryMemberMagistrate1: ExtendedJudicialRole = {
  isBenchChairman: true,
  isDeputy: false,
  judicialId: judicialId1,
  judicialRoleType: { judiciaryType: 'MAGISTRATE' },
  judicialMember: judicialMemberMagistrate1
};

export const extendedJudiciaryMemberMagistrate2: ExtendedJudicialRole = {
  isBenchChairman: false,
  isDeputy: false,
  judicialId: judicialId1,
  judicialRoleType: { judiciaryType: 'MAGISTRATE' },
  judicialMember: judicialMemberMagistrate2
};

export const extendedJudiciaryMember1: ExtendedJudicialRole = {
  judicialId: judicialId1,
  judicialRoleType: { judiciaryType: 'CIRCUIT_JUDGE' },
  judicialMember: judicialmember1
};

export const extendedJudiciaryMember2: ExtendedJudicialRole = {
  judicialId: judicialId2,
  judicialRoleType: { judiciaryType: 'DISTRICT_JUDGE' },
  judicialMember: judicialmember2
};

export const extendedJudiciaryMember3: ExtendedJudicialRole = {
  judicialId: judicialId3,
  judicialRoleType: { judiciaryType: 'RECORDER' },
  judicialMember: judicialmember3
};

export const extendedJudiciaryMember4: ExtendedJudicialRole = {
  judicialId: judicialId4,
  judicialRoleType: { judiciaryType: 'DEPUTY_DISTRICT_JUDGE' },
  judicialMember: judicialmember4
};

export const judiciaries1: ExtendedJudicialRole[] = [
  extendedJudiciaryMember1,
  extendedJudiciaryMember2
];

export const singleDayHearing1: Hearing = {
  id: hearingId,
  type: hearingType1,
  allocated: false,
  startDate: startDate,
  endDate: startDate,
  nonSittingDays: [],
  estimatedMinutes: 30,
  courtCentreId: courtCentreId1,
  courtRoomId: courtRoomId1,
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  judiciary: judiciaries1,
  weekCommencingDurationInWeeks: 1,
  listedCases: [],
  nonDefaultDays: [],
  hearingDays: [
    {
      durationMinutes: 10,
      courtCentreId: courtCentreId1,
      courtRoomId: courtRoomId1,
      matchedWithQuery: true,
      startTime: '2018-05-23T10:00',
      endTime: '2018-05-23T11:00',
      hearingDate: '2018-05-23',
      sequence: 0
    }
  ]
};

export const singleDayHearing2: Hearing = {
  id: hearingId2,
  type: hearingType1,
  allocated: false,
  startDate: startDate,
  endDate: startDate,
  nonSittingDays: [],
  estimatedMinutes: 30,
  courtCentreId: courtCentreId1,
  courtRoomId: courtRoomId2,
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  judiciary: judiciaries1,
  weekCommencingDurationInWeeks: 1,
  listedCases: [],
  nonDefaultDays: [],
  hearingDays: [
    {
      durationMinutes: 10,
      courtCentreId: courtCentreId1,
      courtRoomId: courtRoomId2,
      matchedWithQuery: true,
      startTime: '2018-05-23T10:00',
      endTime: '2018-05-23T11:00',
      hearingDate: '2018-05-23',
      sequence: 0
    }
  ]
};

export const sequencedHearingWithCourtCentreId1AndCourtRoomId1: Hearing = {
  id: hearingId,
  type: hearingType1,
  allocated: false,
  startDate: startDate,
  endDate: startDate,
  nonSittingDays: [],
  estimatedMinutes: 30,
  courtCentreId: courtCentreId1,
  courtRoomId: courtRoomId1,
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  judiciary: judiciaries1,
  weekCommencingDurationInWeeks: 1,
  listedCases: [],
  nonDefaultDays: [],
  hearingDays: [
    {
      durationMinutes: 10,
      courtCentreId: courtCentreId1,
      courtRoomId: courtRoomId1,
      matchedWithQuery: true,
      startTime: '2018-05-23T10:00',
      endTime: '2018-05-23T11:00',
      hearingDate: '2018-05-23',
      sequence: 1
    }
  ]
};

export const sequencedHearingWithCourtCentreId1AndCourtRoomId2: Hearing = {
  id: hearingId2,
  type: hearingType1,
  allocated: false,
  startDate: startDate,
  endDate: startDate,
  nonSittingDays: [],
  estimatedMinutes: 30,
  courtCentreId: courtCentreId1,
  courtRoomId: courtRoomId2,
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  judiciary: judiciaries1,
  weekCommencingDurationInWeeks: 1,
  listedCases: [],
  nonDefaultDays: [],
  hearingDays: [
    {
      durationMinutes: 10,
      courtCentreId: courtCentreId1,
      courtRoomId: courtRoomId2,
      matchedWithQuery: true,
      startTime: '2018-05-23T10:00',
      endTime: '2018-05-23T11:00',
      hearingDate: '2018-05-23',
      sequence: 1
    }
  ]
};

export const multiDayHearing1: Hearing = {
  id: hearingId,
  type: hearingType1,
  allocated: false,
  startDate: startDate,
  endDate: '2018-05-30',
  nonSittingDays: [],
  estimatedMinutes: 30,
  weekCommencingDurationInWeeks: 1,
  courtCentreId: courtCentreId1,
  courtRoomId: courtRoomId1,
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  judiciary: [],
  listedCases: [],
  nonDefaultDays: [
    {
      courtCentreId: courtCentreId1,
      roomId: courtRoomId1,
      startTime: '2018-05-23T10:00'
    },
    {
      courtCentreId: courtCentreId2,
      roomId: courtRoomId2,
      startTime: '2018-05-24T10:00'
    }
  ],
  hearingDays: [
    {
      courtCentreId: courtCentreId1,
      courtRoomId: courtRoomId1,
      matchedWithQuery: true,
      durationMinutes: 10,
      startTime: '2018-05-23T10:00',
      endTime: '2018-05-23T11:00',
      hearingDate: '2018-05-23',
      sequence: 0
    },
    {
      courtCentreId: courtCentreId2,
      courtRoomId: courtRoomId2,
      matchedWithQuery: false,
      durationMinutes: 10,
      startTime: '2018-05-24T10:00',
      endTime: '2018-05-24T11:00',
      hearingDate: '2018-05-24',
      sequence: 0
    }
  ]
};

export const multiDayHearing2: Hearing = {
  id: hearingId2,
  type: hearingType1,
  allocated: false,
  startDate: startDate,
  endDate: '2018-05-30',
  nonSittingDays: [],
  weekCommencingDurationInWeeks: 1,
  estimatedMinutes: 30,
  courtCentreId: courtCentreId1,
  courtRoomId: courtRoomId1,
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  judiciary: [],
  listedCases: [],
  nonDefaultDays: [
    {
      courtCentreId: courtCentreId1,
      roomId: courtRoomId1,
      startTime: '2018-05-23T10:00'
    },
    {
      courtCentreId: courtCentreId2,
      roomId: courtRoomId2,
      startTime: '2018-05-24T11:00'
    }
  ],
  hearingDays: [
    {
      courtCentreId: courtCentreId1,
      courtRoomId: courtRoomId1,
      matchedWithQuery: false,
      durationMinutes: 10,
      startTime: '2018-05-23T10:00',
      endTime: '2018-05-23T11:00',
      hearingDate: '2018-05-23',
      sequence: 0
    },
    {
      courtCentreId: courtCentreId2,
      courtRoomId: courtRoomId2,
      matchedWithQuery: true,
      durationMinutes: 10,
      startTime: '2018-05-24T11:00',
      endTime: '2018-05-24T12:00',
      hearingDate: '2018-05-24',
      sequence: 0
    }
  ]
};

export const singleDayHearingWithNonDefaultDaySameAsStartDate: Hearing = {
  id: hearingId,
  type: hearingType1,
  allocated: false,
  startDate: startDate,
  endDate: startDate,
  weekCommencingDurationInWeeks: 1,
  nonSittingDays: [],
  estimatedMinutes: 30,
  courtCentreId: courtCentreId1,
  courtRoomId: courtRoomId1,
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  judiciary: [],
  listedCases: [],
  nonDefaultDays: [
    {
      startTime: startDate + 'T' + '13:01',
      duration: 31
    }
  ],
  hearingDays: [
    {
      courtCentreId: courtCentreId1,
      courtRoomId: courtRoomId1,
      matchedWithQuery: true,
      durationMinutes: 10,
      startTime: '2018-05-23T10:00',
      endTime: '2018-05-23T11:00',
      hearingDate: '2018-05-23',
      sequence: 0
    }
  ]
};

export const outOfRangeHearing: Hearing = {
  id: hearingId3,
  type: hearingType1,
  allocated: false,
  weekCommencingDurationInWeeks: 1,
  startDate: startDate,
  endDate: '2018-05-30',
  nonSittingDays: [],
  estimatedMinutes: 30,
  courtCentreId: courtCentreId1,
  courtRoomId: courtRoomId1,
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  judiciary: [],
  listedCases: [],
  nonDefaultDays: [],
  hearingDays: [
    {
      courtCentreId: courtCentreId1,
      courtRoomId: courtRoomId1,
      matchedWithQuery: true,
      durationMinutes: 10,
      startTime: '2018-05-20T10:00',
      endTime: '2018-05-20T11:00',
      hearingDate: '2018-05-20',
      sequence: 0
    }
  ]
};

export const invalidHearing: Hearing = {
  id: hearingId,
  type: undefined,
  allocated: false,
  weekCommencingDurationInWeeks: 1,
  startDate: '',
  endDate: '',
  nonSittingDays: [],
  estimatedMinutes: 30,
  courtCentreId: courtCentreId1,
  courtRoomId: undefined,
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  judiciary: [],
  listedCases: [],
  nonDefaultDays: [],
  hearingDays: [
    {
      durationMinutes: 10,
      startTime: '2018-05-23T10:00',
      endTime: '2018-05-23T11:00',
      hearingDate: '2018-05-23',
      sequence: 0
    },
    {
      durationMinutes: 10,
      startTime: '2018-05-24T10:00',
      endTime: '2018-05-24T11:00',
      hearingDate: '2018-05-24',
      sequence: 0
    }
  ]
};

export const sequencedHearing1: Hearing = {
  id: hearingId,
  type: hearingType1,
  weekCommencingDurationInWeeks: 1,
  allocated: false,
  startDate: startDate,
  endDate: '2018-05-30',
  nonSittingDays: [],
  estimatedMinutes: 30,
  courtCentreId: courtCentreId1,
  courtRoomId: courtRoomId1,
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  judiciary: [],
  listedCases: [],
  nonDefaultDays: [
    {
      courtCentreId: courtCentreId1,
      roomId: courtRoomId1,
      startTime: '2018-05-23T10:00'
    },
    {
      courtCentreId: courtCentreId2,
      roomId: courtRoomId2,
      startTime: '2018-05-24T10:00'
    }
  ],
  hearingDays: [
    {
      courtCentreId: courtCentreId1,
      courtRoomId: courtRoomId1,
      matchedWithQuery: true,
      durationMinutes: 10,
      startTime: '2018-05-23T10:00',
      endTime: '2018-05-23T11:00',
      hearingDate: '2018-05-23',
      sequence: 1
    },
    {
      courtCentreId: courtCentreId2,
      courtRoomId: courtRoomId2,
      matchedWithQuery: false,
      durationMinutes: 10,
      startTime: '2018-05-24T10:00',
      endTime: '2018-05-24T11:00',
      hearingDate: '2018-05-24',
      sequence: 0
    }
  ]
};

export const sequencedHearing2: Hearing = {
  id: hearingId2,
  type: hearingType1,
  allocated: false,
  startDate: startDate,
  endDate: '2018-05-30',
  nonSittingDays: [],
  estimatedMinutes: 30,
  courtCentreId: courtCentreId1,
  weekCommencingDurationInWeeks: 1,
  courtRoomId: courtRoomId1,
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  judiciary: [],
  listedCases: [],
  nonDefaultDays: [
    {
      courtCentreId: courtCentreId1,
      roomId: courtRoomId1,
      startTime: '2018-05-23T10:00'
    },
    {
      courtCentreId: courtCentreId2,
      roomId: courtRoomId2,
      startTime: '2018-05-24T11:00'
    }
  ],
  hearingDays: [
    {
      courtCentreId: courtCentreId1,
      courtRoomId: courtRoomId1,
      matchedWithQuery: false,
      durationMinutes: 10,
      startTime: '2018-05-23T10:00',
      endTime: '2018-05-23T11:00',
      hearingDate: '2018-05-23',
      sequence: 2
    },
    {
      courtCentreId: courtCentreId2,
      courtRoomId: courtRoomId2,
      matchedWithQuery: true,
      durationMinutes: 10,
      startTime: '2018-05-24T11:00',
      endTime: '2018-05-24T12:00',
      hearingDate: '2018-05-24',
      sequence: 0
    }
  ]
};

export const sequencedHearing3: Hearing = {
  id: hearingId,
  type: hearingType1,
  allocated: false,
  startDate: startDate,
  endDate: '2018-05-30',
  nonSittingDays: [],
  estimatedMinutes: 30,
  courtCentreId: courtCentreId1,
  weekCommencingDurationInWeeks: 1,
  courtRoomId: courtRoomId1,
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  judiciary: [],
  listedCases: [],
  nonDefaultDays: [
    {
      courtCentreId: courtCentreId1,
      roomId: courtRoomId1,
      startTime: '2018-05-23T10:00'
    },
    {
      courtCentreId: courtCentreId2,
      roomId: courtRoomId2,
      startTime: '2018-05-24T10:00'
    }
  ],
  hearingDays: [
    {
      courtCentreId: courtCentreId1,
      courtRoomId: courtRoomId1,
      matchedWithQuery: true,
      durationMinutes: 10,
      startTime: '2018-05-23T10:00',
      endTime: '2018-05-23T11:00',
      hearingDate: '2018-05-23',
      sequence: 1
    },
    {
      courtCentreId: courtCentreId2,
      courtRoomId: courtRoomId2,
      matchedWithQuery: false,
      durationMinutes: 10,
      startTime: '2018-05-24T10:00',
      endTime: '2018-05-24T11:00',
      hearingDate: '2018-05-24',
      sequence: 1
    }
  ]
};

export const sequencedHearing4: Hearing = {
  id: hearingId2,
  type: hearingType1,
  allocated: false,
  startDate: startDate,
  endDate: '2018-05-30',
  nonSittingDays: [],
  weekCommencingDurationInWeeks: 1,
  estimatedMinutes: 30,
  courtCentreId: courtCentreId1,
  courtRoomId: courtRoomId1,
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  judiciary: [],
  listedCases: [],
  nonDefaultDays: [
    {
      courtCentreId: courtCentreId1,
      roomId: courtRoomId1,
      startTime: '2018-05-23T10:00'
    },
    {
      courtCentreId: courtCentreId2,
      roomId: courtRoomId2,
      startTime: '2018-05-24T11:00'
    }
  ],
  hearingDays: [
    {
      courtCentreId: courtCentreId1,
      courtRoomId: courtRoomId1,
      matchedWithQuery: false,
      durationMinutes: 10,
      startTime: '2018-05-23T10:00',
      endTime: '2018-05-23T11:00',
      hearingDate: '2018-05-23',
      sequence: 2
    },
    {
      courtCentreId: courtCentreId2,
      courtRoomId: courtRoomId2,
      matchedWithQuery: true,
      durationMinutes: 10,
      startTime: '2018-05-24T11:00',
      endTime: '2018-05-24T12:00',
      hearingDate: '2018-05-24',
      sequence: 1
    }
  ]
};

export const nonSequenceHearing: Hearing = {
  id: hearingId3,
  type: hearingType1,
  weekCommencingDurationInWeeks: 1,
  allocated: false,
  startDate: startDate,
  endDate: '2018-05-30',
  nonSittingDays: [],
  estimatedMinutes: 30,
  courtCentreId: courtCentreId1,
  courtRoomId: courtRoomId1,
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  judiciary: [],
  listedCases: [],
  nonDefaultDays: [],
  hearingDays: [
    {
      courtCentreId: courtCentreId1,
      courtRoomId: courtRoomId1,
      matchedWithQuery: true,
      durationMinutes: 10,
      startTime: '2018-05-20T10:00',
      endTime: '2018-05-20T11:00',
      hearingDate: '2018-05-20',
      sequence: 0
    }
  ]
};

export const expectedSequenceHearingForSingleDatePayload = {
  payload: {
    hearings: [
      {
        id: '955016e0-5e62-11e8-8160-230c768837f4',
        sequenceHearingDays: [
          {
            hearingDate: '2018-05-23',
            sequence: 1
          }
        ]
      },
      {
        id: 'a09d3fca-a8ca-4fd7-b7b2-736338ebf008',
        sequenceHearingDays: [
          {
            hearingDate: '2018-05-23',
            sequence: 2
          }
        ]
      }
    ]
  },
  type: 'SEQUENCE_HEARINGS_ACTION'
};

export const expectedSequenceHearingForMultipleDatesPayload = {
  payload: {
    hearings: [
      {
        id: '955016e0-5e62-11e8-8160-230c768837f4',
        sequenceHearingDays: [
          {
            hearingDate: '2018-05-23',
            sequence: 1
          },
          {
            hearingDate: '2018-05-24',
            sequence: 1
          }
        ]
      },
      {
        id: 'a09d3fca-a8ca-4fd7-b7b2-736338ebf008',
        sequenceHearingDays: [
          {
            hearingDate: '2018-05-23',
            sequence: 2
          },
          {
            hearingDate: '2018-05-24',
            sequence: 1
          }
        ]
      }
    ]
  },
  type: 'SEQUENCE_HEARINGS_ACTION'
};

export const expectedSequenceHearingForSingleDateSearchSameDateAndCourtCentreButDifferentCourtRoom =
  {
    payload: {
      hearings: [
        {
          id: '955016e0-5e62-11e8-8160-230c768837f4',
          sequenceHearingDays: [
            {
              hearingDate: '2018-05-23',
              sequence: 1
            }
          ]
        },
        {
          id: 'a09d3fca-a8ca-4fd7-b7b2-736338ebf008',
          sequenceHearingDays: [
            {
              hearingDate: '2018-05-23',
              sequence: 1
            }
          ]
        }
      ]
    },
    type: 'SEQUENCE_HEARINGS_ACTION'
  };

export const hearingsForSingleDateSearch = [multiDayHearing1, multiDayHearing2];

export const hearingsForDateRangeSearch = [multiDayHearing1, multiDayHearing2, outOfRangeHearing];

export const sequencedHearingsForSingleSearchDate = [sequencedHearing1, sequencedHearing2];

export const sequencedHearingsForMultipleSearchDates = [
  sequencedHearing3,
  sequencedHearing4,
  nonSequenceHearing
];

export const hearingsForSingleDateSearchSameDateAndCourtCentreButDifferentCourtRoom = [
  singleDayHearing1,
  singleDayHearing2
];

export const sequencedHearingsForSingleDateSearchSameDateAndCourtCentreButDifferentCourtRoom = [
  sequencedHearingWithCourtCentreId1AndCourtRoomId1,
  sequencedHearingWithCourtCentreId1AndCourtRoomId2
];

export const courtCentre1: CourtCentre = {
  courtRooms: [
    { id: courtRoomId1, name: 'Room 1' },
    { id: courtRoomId2, name: 'Room 2' }
  ],
  defaultDuration: '00:15',
  defaultStartTime: '10:15',
  id: courtCentreId1,
  name: 'Liverpool Crown Court',
  courtCode: 'B'
};

export const courtCentre2: CourtCentre = {
  courtRooms: [{ id: courtRoomId2, name: 'Room 1' }],
  defaultDuration: '120',
  defaultStartTime: '9:30',
  id: courtCentreId2,
  name: 'Blackfriars Crown Court',
  courtCode: 'C'
};

export const courtCentre3: CourtCentre = {
  courtRooms: [{ id: courtRoomId3, name: 'Room 5' }],
  defaultDuration: '120',
  defaultStartTime: '9:30',
  id: courtCentreId3,
  name: 'Wimbledon Magistrates Court',
  courtCode: 'D'
};

export const courtCentres: CourtCentre[] = [courtCentre1, courtCentre2, courtCentre3];

export const warrantHearing: Hearing = {
  id: hearingId,
  type: warrantHearingType,
  allocated: false,
  startDate: startDate,
  endDate: startDate,
  nonSittingDays: [],
  estimatedMinutes: 30,
  courtCentreId: courtCentreId1,
  courtRoomId: courtRoomId1,
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  judiciary: judiciaries1,
  weekCommencingDurationInWeeks: 1,
  listedCases: [],
  nonDefaultDays: [],
  hearingDays: [
    {
      durationMinutes: 10,
      courtCentreId: courtCentreId1,
      courtRoomId: courtRoomId1,
      matchedWithQuery: true,
      startTime: '2018-05-23T10:00',
      endTime: '2018-05-23T11:00',
      hearingDate: '2018-05-23',
      sequence: 0
    }
  ]
};
