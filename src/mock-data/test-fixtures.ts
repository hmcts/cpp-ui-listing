import {
  Hearing,
  HearingDay,
  BailStatus,
  JurisdictionType,
  CourtCentre,
  SequenceHearing,
  SequenceDay,
  CreateListFilterOptions,
  CourtApplication,
  AggregatedCaseNotes
} from '../app/core';
import { CaseNote } from '../app/allocate-hearing/allocate-hearing.interfaces';
import { JudicialMember } from '@cpp/reference-data';
import { ValidationError } from '@cpp/pdk';
export const mock_defendant1 = {
  id: 'e1d32d9d-29ec-4934-a932-22a50f223966',
  masterDefendantId: 'e1d32d9d-29ec-4934-a932-22a50f223967',
  courtProceedingsInitiated: 'xyz',
  lastName: 'Kane Junior',
  offences: [
    {
      id: 'fdb77319-7305-42f7-8037-3662906a266b',
      endDate: '2018-08-01',
      startDate: '2018-08-01',
      offenceCode: 'OF61131',
      isYouth: true,
      count: 1,
      orderIndex: 1,
      statementOfOffence: {
        title: 'Wound / inflict grievous bodily harm without intent',
        welshTitle: 'a title in Welsh',
        legislation: 'Contrary to section 20 of the Offences Against the Person Act 1861.',
        welshLegislation: 'legislation in Welsh'
      },
      reportingRestrictions: [
        {
          id: ':id',
          judicialResultId: ':judicialResultId',
          label: ':label',
          orderedDate: ':orderedDate'
        }
      ]
    },
    {
      id: 'b229afeb-273d-40a7-bb6d-8092477e5194',
      endDate: '2018-08-01',
      startDate: '2018-08-01',
      offenceCode: 'OF61131',
      count: 2,
      orderIndex: 2,
      statementOfOffence: {
        title: 'Wound / inflict grievous bodily harm without intent',
        welshTitle: 'a title in Welsh',
        legislation: 'Contrary to section 20 of the Offences Against the Person Act 1861.',
        welshLegislation: 'legislation in Welsh'
      }
    }
  ],
  firstName: 'Harry',
  bailStatus: {
    code: 'U',
    description: 'Unconditional Bail',
    id: 'eaf18bf8-9569-3656-a4ab-64299f9bd513'
  } as BailStatus,
  dateOfBirth: '2010-01-01',
  organisationId: 'c54eafee-698b-4262-8883-2beca5f8e940',
  custodyTimeLimit: '2018-10-31',
  organisationName: 'Bodge It & Injure People Ltd',
  specificRequirements: 'Screen'
};
export const mock_defendant2 = {
  id: 'e1d32d9d-29ec-4934-a932-22a50f223967',
  masterDefendantId: 'e1d32d9d-29ec-4934-a932-22a50f223967',
  courtProceedingsInitiated: 'abc',
  lastName: 'Smith',
  offences: [
    {
      id: 'fdb77319-7305-42f7-8037-3662906a266b',
      endDate: '2018-08-01',
      startDate: '2018-08-01',
      offenceCode: 'OF61131',
      isYouth: true,
      count: 1,
      orderIndex: 1,
      statementOfOffence: {
        title: 'Wound / inflict grievous bodily harm without intent',
        welshTitle: 'a title in Welsh',
        legislation: 'Contrary to section 20 of the Offences Against the Person Act 1861.',
        welshLegislation: 'legislation in Welsh'
      }
    },
    {
      id: 'b229afeb-273d-40a7-bb6d-8092477e5194',
      endDate: '2018-08-01',
      startDate: '2018-08-01',
      offenceCode: 'OF61131',
      count: 2,
      orderIndex: 2,
      statementOfOffence: {
        title: 'Wound / inflict grievous bodily harm without intent',
        welshTitle: 'a title in Welsh',
        legislation: 'Contrary to section 20 of the Offences Against the Person Act 1861.',
        welshLegislation: 'legislation in Welsh'
      }
    }
  ],
  firstName: 'John',
  bailStatus: {
    code: 'U',
    description: 'Unconditional Bail',
    id: 'eaf18bf8-9569-3656-a4ab-64299f9bd513'
  } as BailStatus,
  dateOfBirth: '2010-01-01',
  organisationId: 'c54eafee-698b-4262-8883-2beca5f8e940',
  custodyTimeLimit: '2018-10-31',
  organisationName: 'Bodge It & Injure People Ltd',
  specificRequirements: 'Screen'
};
export const mock_defendant3 = {
  id: 'e1d32d9d-29ec-4934-a932-22a50f223968',
  lastName: 'Albert',
  offences: [],
  firstName: 'Michael',
  bailStatus: {
    code: 'U',
    description: 'Unconditional Bail',
    id: 'eaf18bf8-9569-3656-a4ab-64299f9bd513'
  } as BailStatus,
  isYouth: false,
  dateOfBirth: '2010-01-01',
  organisationId: 'c54eafee-698b-4262-8883-2beca5f8e940',
  custodyTimeLimit: '2018-10-31',
  organisationName: 'Bodge It & Injure People Ltd',
  specificRequirements: 'Screen'
};
const defendants = [mock_defendant2, mock_defendant1];
const markers = [
  {
    id: '6b5a9194-186e-4d96-99d6-8fb62d8efa9d',
    markerTypeid: 'e7eff972-189c-4957-8b1e-cb45213aa64e',
    markerTypeCode: 'HT',
    markerTypeDescription: 'Human Trafficking'
  }
];
const validHearingMock1: Hearing = {
  id: 'b1bfe644-15d3-46aa-bdeb-fe8d18c16a42',
  courtApplications: [],
  weekCommencingDurationInWeeks: 1,
  type: {
    id: '5591d709-4397-452c-8533-998165d58d9c',
    description: 'Further Plea & Trial Preparation'
  },
  endDate: '2018-11-10',
  allocated: true,
  judiciary: [
    {
      isDeputy: true,
      judicialId: '19ffac44-3533-410d-868e-81cf825844b6',
      isBenchChairman: false,
      judicialRoleType: { judiciaryType: 'RECORDER' },
      judicialMember: {
        id: '19ffac44-3533-410d-868e-81cf825844b6',
        forenames: 'Lord Fabio',
        judiciaryType: 'Recorder',
        surname: 'Tisci',
        requestedName: 'RECORDER Lord Fabio TISCI',
        titleJudicialPrefix: 'LF',
        titlePrefix: 'Mr.'
      } as JudicialMember
    },
    {
      isDeputy: false,
      judicialId: '328bfc4e-e661-470e-ac7d-35809a4bb298',
      isBenchChairman: true,
      judicialRoleType: { judiciaryType: 'CIRCUIT_JUDGE' },
      judicialMember: {
        id: '328bfc4e-e661-470e-ac7d-35809a4bb298',
        forenames: 'Corporal Fabiano',
        surname: 'Tiscman',
        judiciaryType: 'Circuit Judge',
        titleJudicialPrefix: 'FX',
        titlePrefix: 'Sgt.',
        titleSuffix: 'Esq'
      } as JudicialMember
    }
  ],
  startDate: '2018-11-05',
  courtRoomId: 'e7721a38-546d-4b56-9992-ebdd772a561b',
  listedCases: [
    {
      id: '926fc76b-7ec9-4bee-bb7d-b8e63d61fc33',
      defendants,
      markers: markers,
      caseIdentifier: {
        authorityId: 'cf73207f-3ced-488a-82a0-3fba79c2ce85',
        authorityCode: 'TFL',
        caseReference: 'TFL12345'
      }
    }
  ],
  hearingDays: [
    {
      hearingDate: '2018-11-05',
      endTime: '2018-11-05T12:00:00.000Z',
      sequence: 1,
      courtRoomId: 'e7721a38-546d-4b56-9992-ebdd772a561b',
      startTime: '2018-11-05T10:00:00.000Z',
      durationMinutes: 120
    },
    {
      hearingDate: '2018-11-06',
      endTime: '2018-11-06T14:00:00.000Z',
      sequence: 2,
      courtRoomId: ':id',
      startTime: '2018-11-06T11:00:00.000Z',
      durationMinutes: 180
    }
  ],
  courtCentreId: '9b583616-049b-30f9-a14f-028a53b7cfe8',
  nonDefaultDays: [
    {
      duration: 180,
      startTime: '2018-11-05T11:00:00.000Z'
    }
  ],
  nonSittingDays: ['2018-11-06', '2018-11-07'],
  hearingLanguage: 'WELSH',
  estimatedMinutes: 300,
  jurisdictionType: 'MAGISTRATES' as JurisdictionType,
  listingDirections: 'Wheelchair & special emergency arrangements required',
  prosecutorDatesToAvoid: ['Monday'],
  reportingRestrictionReason: 'Automatic anonymity under the Sexual Offences (Amendment) Act 1992'
};
const courtApplicationSingleRespondentMock: CourtApplication = {
  id: '8e8465df-779b-444e-80dc-15633b6c5fd8',
  applicationReference: 'applicationRef',
  applicant: {
    lastName: 'ApplicantLastName1',
    firstName: 'ApplicantFirstName1',
    isRespondent: false
  },
  respondents: [
    {
      lastName: 'ApplicationSingleRespondantLastName1',
      firstName: 'ApplicationSingleRespondantFirstName1',
      isRespondent: true
    }
  ],
  subject: {
    lastName: 'ApplicantLastName1',
    firstName: 'ApplicantFirstName1',
    isRespondent: false
  },
  linkedCaseIds: ['d97a91d2-5d2c-4ad7-bb15-c6a653a599b8'],
  applicationType: 'Complaint for Attachment of Earnings Order'
};
const courtApplicationMultipleRespondent1Mock: CourtApplication = {
  id: '9b1465df-779b-444e-80dc-15633b6c5fd8',
  applicant: {
    firstName: 'ApplicantFristName2',
    lastName: 'ApplicantLastName2',
    isRespondent: false
  },
  respondents: [
    {
      lastName: 'ApplicationMultipleRespondantLastName1',
      firstName: 'ApplicationMultipleRespondantFirstName1',
      isRespondent: true
    },
    {
      lastName: 'ApplicationMultipleRespondantLastName2',
      firstName: 'ApplicationMultipleRespondantFirstName2',
      isRespondent: true
    }
  ],
  subject: {
    firstName: 'ApplicantFristName2',
    lastName: 'ApplicantLastName2',
    isRespondent: false
  },
  linkedCaseIds: ['d97a91d2-5d2c-4ad7-bb15-c6a653a599b8'],
  applicationType: 'Complaint for Attachment of Earnings Order'
};
const validHearingSingleLinkedApplicationMock: Hearing = {
  ...validHearingMock1,
  courtApplications: [courtApplicationSingleRespondentMock]
};
const validHearingSingleStandaloneApplicationMock: Hearing = {
  ...validHearingMock1,
  listedCases: [],
  courtApplications: [courtApplicationSingleRespondentMock]
};
const validHearingMultipleStandaloneApplicationsMock: Hearing = {
  ...validHearingMock1,
  listedCases: [],
  courtApplications: [courtApplicationSingleRespondentMock, courtApplicationMultipleRespondent1Mock]
};
const validHearingMock2: Hearing = {
  id: 'b1bfe644-15d3-46aa-bdeb-fe8d18c16a45',
  publicListNote: 'Public list note',
  type: {
    id: '5591d709-4397-452c-8533-998165d58d9c',
    description: 'Further Plea & Trial Preparation'
  },
  weekCommencingDurationInWeeks: 2,
  courtApplications: [],
  endDate: '2018-11-10',
  allocated: true,
  judiciary: [
    {
      isDeputy: true,
      judicialId: '19ffac44-3533-410d-868e-81cf825844b6',
      isBenchChairman: false,
      judicialRoleType: { judiciaryType: 'RECORDER' },
      judicialMember: {
        id: '19ffac44-3533-410d-868e-81cf825844b6',
        forenames: 'Lord Fabio',
        surname: 'Tisci',
        judiciaryType: 'Recorder',
        requestedName: 'RECORDER Lord Fabio TISCI',
        titleJudicialPrefix: 'LF',
        titlePrefix: 'Mr.'
      } as JudicialMember
    }
  ],
  startDate: '2018-11-05',
  courtRoomId: 'e7721a38-546d-4b56-9992-ebdd772a561b',
  listedCases: [
    {
      id: '926fc76b-7ec9-4bee-bb7d-b8e63d61fc34',
      defendants: [mock_defendant1],
      markers: markers,
      caseIdentifier: {
        authorityId: 'cf73207f-3ced-488a-82a0-3fba79c2ce85',
        authorityCode: 'TFL',
        caseReference: 'TFL12345'
      }
    }
  ],
  hearingDays: [
    {
      hearingDate: '2018-11-05',
      endTime: '2018-11-05T12:00:00.000Z',
      courtRoomId: 'e7721a38-546d-4b56-9992-ebdd772a561b',
      sequence: 1,
      startTime: '2018-11-05T12:00:00.000Z',
      durationMinutes: 120
    },
    {
      hearingDate: '2018-11-06',
      endTime: '2018-11-06T14:00:00.000Z',
      sequence: 2,
      courtRoomId: ':id1',
      startTime: '2018-11-06T12:00:00.000Z',
      durationMinutes: 180
    }
  ],
  courtCentreId: '9b583616-049b-30f9-a14f-028a53b7cfe8',
  nonDefaultDays: [
    {
      duration: 180,
      startTime: '2018-11-05T11:00:00.000Z'
    }
  ],
  nonSittingDays: ['2018-11-06', '2018-11-07'],
  hearingLanguage: 'WELSH' as Hearing['hearingLanguage'],
  estimatedMinutes: 300,
  jurisdictionType: 'MAGISTRATES' as JurisdictionType,
  listingDirections: 'Wheelchair & special emergency arrangements required',
  prosecutorDatesToAvoid: ['Monday'],
  reportingRestrictionReason: 'Automatic anonymity under the Sexual Offences (Amendment) Act 1992'
};
const validHearingMock3: Hearing = {
  id: 'b1bfe644-15d3-46aa-bdeb-fe8d18c16a46',
  type: {
    id: '5591d709-4397-452c-8533-998165d58d9c',
    description: 'Further Plea & Trial Preparation'
  },
  weekCommencingDurationInWeeks: 1,
  courtApplications: [],
  endDate: '2018-11-10',
  allocated: true,
  judiciary: [
    {
      isDeputy: false,
      judicialId: '19ffac44-3533-410d-868e-81cf825844b6',
      isBenchChairman: true,
      judicialRoleType: { judiciaryType: 'MAGISTRATE' },
      judicialMember: {
        id: '19ffac44-3533-410d-868e-81cf825844b6',
        forenames: 'Lord Fabio',
        surname: 'Tisci',
        judiciaryType: 'Magistrate',
        titleJudicialPrefix: 'LF',
        titlePrefix: 'Mr.'
      } as JudicialMember
    },
    {
      isDeputy: true,
      judicialId: '19ffac44-3533-410d-868e-81cf825844b5',
      isBenchChairman: false,
      judicialRoleType: { judiciaryType: 'MAGISTRATE' },
      judicialMember: {
        id: '19ffac44-3533-410d-868e-81cf825844b6',
        forenames: 'Lord Fabio',
        surname: 'Tisci',
        judiciaryType: 'Magistrate',
        titleJudicialPrefix: 'LF',
        titlePrefix: 'Mr.'
      } as JudicialMember
    }
  ],
  startDate: '2018-11-05',
  courtRoomId: 'e7721a38-546d-4b56-9992-ebdd772a561b',
  listedCases: [
    {
      id: '926fc76b-7ec9-4bee-bb7d-b8e63d61fc34',
      defendants: [mock_defendant1, mock_defendant2, mock_defendant3],
      markers: markers,
      caseIdentifier: {
        authorityId: 'cf73207f-3ced-488a-82a0-3fba79c2ce85',
        authorityCode: 'TFL',
        caseReference: 'TFL12345'
      }
    }
  ],
  hearingDays: [
    {
      hearingDate: '2018-11-05',
      endTime: '2018-11-05T12:00:00.000Z',
      sequence: 1,
      courtRoomId: 'e7721a38-546d-4b56-9992-ebdd772a561b',
      startTime: '2018-11-05T12:00:00.000Z',
      durationMinutes: 30
    },
    {
      hearingDate: '2018-11-06',
      endTime: '2018-11-06T14:00:00.000Z',
      sequence: 2,
      startTime: '2018-11-06T12:00:00.000Z',
      durationMinutes: 180
    }
  ],
  courtCentreId: '9b583616-049b-30f9-a14f-028a53b7cfe8',
  nonDefaultDays: [
    {
      duration: 180,
      startTime: '2018-11-05T11:00:00.000Z'
    }
  ],
  nonSittingDays: ['2018-11-06', '2018-11-07'],
  hearingLanguage: 'WELSH',
  estimatedMinutes: 300,
  jurisdictionType: 'MAGISTRATES' as JurisdictionType,
  listingDirections: 'Wheelchair & special emergency arrangements required',
  prosecutorDatesToAvoid: ['Monday'],
  reportingRestrictionReason: 'Automatic anonymity under the Sexual Offences (Amendment) Act 1992'
};
const validHearingMock4: Hearing = {
  id: 'b1bfe644-15d3-46aa-bdeb-fe8d18c16a42',
  courtApplications: [],
  weekCommencingDurationInWeeks: 1,
  type: {
    id: '5591d709-4397-452c-8533-998165d58d9c',
    description: 'Further Plea & Trial Preparation'
  },
  endDate: '2018-11-10',
  allocated: true,
  judiciary: [
    {
      isDeputy: true,
      judicialId: '19ffac44-3533-410d-868e-81cf825844b6',
      isBenchChairman: false,
      judicialRoleType: { judiciaryType: 'RECORDER' },
      judicialMember: {
        id: '19ffac44-3533-410d-868e-81cf825844b6',
        forenames: 'Lord Fabio',
        surname: 'Tisci',
        requestedName: 'RECODER Lord Fabio TISCI',
        judiciaryType: 'Recorder',
        titleJudicialPrefix: 'LF',
        titlePrefix: 'Mr.'
      } as JudicialMember
    },
    {
      isDeputy: false,
      judicialId: '328bfc4e-e661-470e-ac7d-35809a4bb298',
      isBenchChairman: true,
      judicialRoleType: { judiciaryType: 'CIRCUIT_JUDGE' },
      judicialMember: {
        id: '328bfc4e-e661-470e-ac7d-35809a4bb298',
        forenames: 'Corporal Fabiano',
        surname: 'Tiscman',
        titleJudicialPrefix: 'FX',
        titlePrefix: 'Sgt.',
        titleSuffix: 'Esq'
      } as JudicialMember
    }
  ],
  startDate: '2018-11-05',
  courtRoomId: 'e7721a38-546d-4b56-9992-ebdd772a561b',
  listedCases: [
    {
      id: '926fc76b-7ec9-4bee-bb7d-b8e63d61fc33',
      defendants,
      markers: markers,
      caseIdentifier: {
        authorityId: 'cf73207f-3ced-488a-82a0-3fba79c2ce85',
        authorityCode: 'TFL',
        caseReference: 'TFL12345'
      }
    }
  ],
  hearingDays: [
    {
      hearingDate: '2018-11-05',
      endTime: '2018-11-05T12:00:00.000Z',
      sequence: 1,
      startTime: '2018-11-01T10:00:00.000Z',
      durationMinutes: 225
    }
  ],
  courtCentreId: '9b583616-049b-30f9-a14f-028a53b7cfe8',
  nonDefaultDays: [
    {
      duration: 180,
      startTime: '2018-11-05T11:00:00.000Z'
    }
  ],
  nonSittingDays: ['2018-11-06', '2018-11-07'],
  hearingLanguage: 'WELSH',
  estimatedMinutes: 300,
  jurisdictionType: 'MAGISTRATES' as JurisdictionType,
  listingDirections: 'Wheelchair & special emergency arrangements required',
  prosecutorDatesToAvoid: ['Monday'],
  reportingRestrictionReason: 'Automatic anonymity under the Sexual Offences (Amendment) Act 1992'
};
const courtCentresMock: CourtCentre[] = [
  {
    id: '9b583616-049b-30f9-a14f-028a53b7cfe8',
    name: 'Liverpool Crown Court',
    defaultStartTime: '10:30',
    defaultDuration: '6',
    courtRooms: [
      {
        id: 'e7721a38-546d-4b56-9992-ebdd772a561b',
        name: 'Courtroom 3-1'
      },
      {
        id: '63c20849-89f7-4140-8bf3-96a13f57c446',
        name: 'Courtroom 3-2'
      }
    ],
    courtCode: undefined
  }
];
const sequenceDays = (days: HearingDay[]): SequenceDay[] => {
  return days.map(day => ({
    sequence: 100,
    hearingDate: day.hearingDate
  }));
};
const sequenceMock: SequenceHearing[] = [
  {
    id: validHearingMock1.id,
    sequenceHearingDays: sequenceDays(validHearingMock1.hearingDays)
  },
  {
    id: validHearingMock2.id,
    sequenceHearingDays: sequenceDays(validHearingMock2.hearingDays)
  }
];
const selectedOptionsMock: CreateListFilterOptions = {
  courtCentreId: 'd9bff7d8-6168-4163-ad77-3b98d61de174',
  courtRoomId: '',
  startDate: '2018-12-18',
  endDate: '2018-12-18',
  isCrownCourt: false,
  courtCentre: null
};
const selectedCourtCentreMock: CourtCentre = {
  id: 'd9bff7d8-6168-4163-ad77-3b98d61de174',
  name: `Wimbledon Magistrates' Court`,
  defaultStartTime: '10:00',
  defaultDuration: '7:00',
  courtRooms: [
    {
      id: '1414ea28-8b0e-3ba7-8f97-f2bb6d5dd38c',
      name: 'Courtroom 05'
    },
    {
      id: '0581eaaf-d815-38f2-b30c-7c3c8dedf604',
      name: 'Courtroom 06'
    },
    {
      id: '397bab91-5abd-3f72-8712-cd29bb6b1bb4',
      name: 'Courtroom 07'
    },
    {
      id: '0b603c18-c490-3344-849c-eed828da3008',
      name: 'Courtroom 08'
    },
    {
      id: 'c63f5fd1-e4f5-3bc3-83f3-dd8475c23170',
      name: 'Courtroom 09'
    },
    {
      id: '19e67e59-41d5-3e58-868d-b7a48f53d0a4',
      name: 'Courtroom 10'
    },
    {
      id: '024eefd0-5239-3c1b-a4ca-188be2caa7f1',
      name: 'Courtroom 11'
    }
  ],
  courtCode: undefined
};
const selectedCrownCourtCentreMock: CourtCentre = {
  courtRooms: [
    { id: '4f901e1c-bcee-40c1-b400-60f14d92d2f0', name: 'Room 1' },
    { id: '11b7179f-a11d-413f-9868-6dd17c954020', name: 'Room 2' }
  ],
  defaultDuration: '00:15',
  defaultStartTime: '10:15',
  id: '72650f14-08a5-4ab3-9888-09fbe869359a',
  name: 'Liverpool Crown Court',
  courtCode: 'B'
};
const hearingByDefendants = {
  hearingId: 'H001',
  defendantByCases: [
    {
      id: 'test-defendant-id-002',
      masterDefendantId: 'test-defendant-id-002',
      checked: false,
      courtProceedingsInitiated: 'courtProceedingsInitiated2',
      prosecutionCases: [
        {
          id: 'test-case-id-001',
          caseIdentifier: {
            authorityId: 'cf73207f-3ced-488a-82a0-3fba79c2ce85',
            authorityCode: 'TFL',
            caseReference: 'TFL12345'
          },
          defendantId: 'test-defendant-id-002',
          offences: [
            {
              id: 'test-offence-id-003',
              visible: false,
              checked: false
            },
            {
              id: 'test-offence-id-004',
              visible: false,
              checked: false
            }
          ]
        }
      ]
    },
    {
      id: 'test-defendant-id-001',
      masterDefendantId: 'test-defendant-id-001',
      checked: false,
      courtProceedingsInitiated: 'courtProceedingsInitiated1',
      prosecutionCases: [
        {
          id: 'test-case-id-001',
          caseIdentifier: {
            authorityId: 'cf73207f-3ced-488a-82a0-3fba79c2ce85',
            authorityCode: 'TFL',
            caseReference: 'TFL12345'
          },
          defendantId: 'test-defendant-id-001',
          offences: [
            {
              id: 'test-offence-id-001',
              visible: false,
              checked: false
            },
            {
              id: 'test-offence-id-002',
              visible: false,
              checked: false
            }
          ]
        }
      ]
    }
  ]
};
export const caseNotesMock: CaseNote[] = [
  {
    note: 'a pinned note',
    createdDateTime: '2020-10-07T12:15:27.851Z',
    isPinned: true,
    id: 'mock-note-id-1',
    author: {
      firstName: 'Emma',
      lastName: 'Cleaner'
    }
  },
  {
    note: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.\n\n',
    createdDateTime: '2020-10-07T11:50:54.604Z',
    isPinned: true,
    id: 'mock-note-id-2',
    author: {
      firstName: 'Emma',
      lastName: 'Cleaner'
    }
  },
  {
    note: 'Case note test',
    createdDateTime: '2020-10-06T10:14:34.520Z',
    isPinned: true,
    id: 'mock-note-id-3',
    author: {
      firstName: 'Emma',
      lastName: 'Cleaner'
    }
  }
];
export const aggregatedCaseNotesMock: AggregatedCaseNotes[] = [
  {
    caseDetails: {
      id: 'mock-case-id-1',
      markers: [
        {
          id: 'mock-marker-id-1',
          markerTypeid: 'mock-marker-type-id',
          markerTypeCode: 'HT',
          markerTypeDescription: 'Human Trafficking'
        }
      ],
      defendants: [mock_defendant1],
      shadowListed: false,
      caseIdentifier: {
        authorityId: '42880989-5d09-332e-a711-8797af06ecea',
        authorityCode: 'CPS-EM',
        caseReference: '59GD9012320'
      },
      restrictFromCourtList: false
    },
    caseNotes: caseNotesMock
  }
];
export const aggregatedCaseNotesMultipleDefendantsMock: AggregatedCaseNotes[] = [
  {
    caseDetails: {
      id: 'mock-case-id-1',
      markers: [
        {
          id: 'mock-marker-id-1',
          markerTypeid: 'mock-marker-type-id',
          markerTypeCode: 'HT',
          markerTypeDescription: 'Human Trafficking'
        }
      ],
      defendants: [mock_defendant1, mock_defendant2],
      shadowListed: false,
      caseIdentifier: {
        authorityId: '42880989-5d09-332e-a711-8797af06ecea',
        authorityCode: 'CPS-EM',
        caseReference: '59GD9012320'
      },
      restrictFromCourtList: false
    },
    caseNotes: caseNotesMock
  }
];

export const editAllocationError: ValidationError = {
  id: 'searchSlotError',
  message: 'No sessions available for updated criteria'
};

export {
  sequenceMock,
  validHearingMock1,
  validHearingMock2,
  validHearingMock3,
  validHearingMock4,
  validHearingSingleStandaloneApplicationMock,
  validHearingSingleLinkedApplicationMock,
  validHearingMultipleStandaloneApplicationsMock,
  courtCentresMock,
  selectedOptionsMock,
  selectedCourtCentreMock,
  selectedCrownCourtCentreMock,
  hearingByDefendants
};
