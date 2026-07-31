import { OrganisationUnit } from '@cpp/reference-data';
import {
  Hearing,
  SequenceHearing,
  UpdateHearing,
  JudiciaryForHearings,
  JudicialRoleType,
  SearchAvailableHearingsFormOptions,
  SearchCriteriaAvailableHearingsType,
  HearingWithSelectedCourtCentre,
  ExtendedJudicialRole,
  BailStatus,
  JurisdictionType
} from '../../model';
import {
  CourtListType,
  DownloadListRequest
} from '../../../create-a-list/models/mags-publish-list.dto';

export const courtCentreId = '72650f14-08a5-4ab3-9888-09fbe869359a';

export const courtRoomId = '4f901e1c-bcee-40c1-b400-60f14d92d2f0';

export const searchDate = '2000-10-10';

export const startDate = '2018-05-23';

export const startTime = '10:30';

export const endTime = '12:30';

export const hearingId = '955016e0-5e62-11e8-8160-230c768837f4';

export const authorityId = '955016e0-5e62-11e8-8160-230c768837f5';

export const hearingTypeId = '955016e0-5e62-11e8-8160-230c768837f6';

export const jurisdictionType: JurisdictionType = 'MAGISTRATES';

export const oucodeL2Code = '01';

export const typeOfList = '8d50b778-9d30-4f26-8b65-a7ec3bf6327f';

export const allocated = false;

export const courtCentre: OrganisationUnit = {
  id: '123',
  courtrooms: [
    {
      id: courtRoomId,
      courtroomId: 20,
      courtroomName: 'Court room 1'
    }
  ]
} as OrganisationUnit;

export const hearing: Hearing = {
  id: hearingId,
  type: {
    id: '123',
    description: 'PTP'
  },
  allocated: false,
  nonSittingDays: [],
  estimatedMinutes: 30,
  courtCentreId: '123',
  weekCommencingDurationInWeeks: 1,
  courtRoomId,
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
      sequence: 1,
      courtRoomId
    }
  ],
  typeOfList: {
    id: typeOfList,
    description: 'Type Of List Description'
  },
  publicListNote: 'test-public-list-note',
  hasVideoLink: true
};

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
        title:
          'Wound / inflict grievous bodily harm without intent/ Failed to remain on a road when riding a bicycle',
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
        title:
          'Wound / inflict grievous bodily harm without intent/ Failed to remain on a road when riding a bicycle',
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
  id: 'e1d32d9d-29ec-4934-a932-22a50f223967',
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
const defendants = [
  mock_defendant2,
  mock_defendant1,
  mock_defendant3,
  mock_defendant1,
  mock_defendant2
];

export const hearingForCourtCalendar: Hearing = {
  id: hearingId,
  type: {
    id: '123',
    description: 'Plea and Trial preparation'
  },
  allocated: false,
  nonSittingDays: [],
  estimatedMinutes: 30,
  courtCentreId: '123',
  weekCommencingDurationInWeeks: 1,
  courtRoomId,
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  reportingRestrictionReason: 'yes',
  judiciary: [
    {
      judicialMember: {
        id: 'judicial-test-id-1',
        titleJudicialPrefix: 'His Honour Judge',
        surname: 'Aaronberg',
        forenames: 'John',
        judiciaryType: 'Circuit Judge',
        emailAddress: 'HHJ.John@test-judiciary.net'
      }
    },
    {
      judicialMember: {
        id: 'judicial-test-id-2',
        seqId: 175000,
        titlePrefix: 'Mr',
        titlePrefixWelsh: 'Mr',
        surname: 'Abad',
        forenames: 'Khos',
        judiciaryType: 'Magistrate',
        emailAddress: 'Khabad@test-judiciary.net',
        ljaShortName: 'Buckingham'
      }
    },
    {
      judicialMember: {
        id: 'judicial-test-id-3',
        seqId: 5170,
        titlePrefix: 'Mrs',
        titlePrefixWelsh: 'Mrs',
        surname: 'Abat',
        forenames: 'Shary',
        judiciaryType: 'Magistrate',
        emailAddress: 'Shary@test-judiciary.net',
        ljaShortName: 'Buckinghamshire'
      }
    }
  ] as ExtendedJudicialRole[],
  listedCases: [
    {
      id: '926fc76b-7ec9-4bee-bb7d-b8e63d61fc33',
      defendants,
      markers: [
        {
          id: '6b5a9194-186e-4d96-99d6-8fb62d8efa9d',
          markerTypeid: 'e7eff972-189c-4957-8b1e-cb45213aa64e',
          markerTypeCode: 'HT',
          markerTypeDescription: 'Human Trafficking'
        }
      ],
      caseIdentifier: {
        authorityId: 'cf73207f-3ced-488a-82a0-3fba79c2ce85',
        authorityCode: 'TFL',
        caseReference: 'TFL12345'
      }
    }
  ],
  nonDefaultDays: [],
  hearingDays: [
    {
      durationMinutes: 70,
      startTime: '2018-05-23T10:00',
      endTime: '2018-05-23T11:00',
      hearingDate: '2018-05-23',
      sequence: 1,
      courtRoomId
    }
  ],
  typeOfList: {
    id: typeOfList,
    description: 'Type Of List Description'
  },
  publicListNote: 'test-public-list-note',
  hasVideoLink: true
};

export const hearings = [hearing];

export const sequencedHearings: SequenceHearing[] = [
  {
    id: hearingId,
    sequenceHearingDays: [
      {
        hearingDate: startDate,
        sequence: 1
      }
    ]
  }
];

export const updatedHearing: UpdateHearing = {
  courtCentreId: '123',
  courtRoomId,
  type: {
    id: '123',
    description: 'PTP'
  },
  nonSittingDays: [],
  nonDefaultDays: [],
  judiciary: [],
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  publicListNote: 'test-public-list-note',
  hasVideoLink: true
};

export const HearingWithCourtCentre: HearingWithSelectedCourtCentre = {
  id: hearingId,
  type: {
    id: '123',
    description: 'PTP'
  },
  selectedCourtCentre: {
    id: 'id',
    courtRoomId: 'idd',
    courtCentreName: 'court centre id'
  },
  allocated: false,
  nonSittingDays: [],
  estimatedMinutes: 30,
  courtCentreId: '123',
  weekCommencingDurationInWeeks: 1,
  courtRoomId,
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  judiciary: [],
  listedCases: [
    {
      id: 'case-id',
      defendants: [],
      caseIdentifier: { caseReference: 'caseref', authorityCode: 'a', authorityId: 'aa' }
    }
  ],
  nonDefaultDays: [],
  hearingDays: [
    {
      durationMinutes: 10,
      startTime: '2018-05-23T10:00',
      endTime: '2018-05-23T11:00',
      hearingDate: '2018-05-23',
      sequence: 1
    }
  ],
  typeOfList: {
    id: typeOfList,
    description: 'Type Of List Description'
  },
  publicListNote: 'test-public-list-note',
  hasVideoLink: true
};

export const sequenceHearingsCommand: { hearings: SequenceHearing[] } = {
  hearings: sequencedHearings
};

export const judiciaryForHearings: JudiciaryForHearings = {
  hearings: ['123', '456', '789'],
  judiciary: [
    {
      judicialId: 'a12',
      judicialRoleType: { judiciaryType: 'CIRCUIT_JUDGE' } as JudicialRoleType
    }
  ]
};

export const mockFilterOptionsUnallocated = {
  courtCentreId,
  authorityId,
  hearingTypeId,
  courtRoomId: '4f901e1c-bcee-40c1-b400-60f14d92d2f0',
  searchDate: '2000-10-10',
  startTime: '10:30',
  endTime: '12:30',
  jurisdictionType
};

export const mockFilterOptionsUnscheduled = {
  oucodeL2Code,
  courtCentreId,
  typeOfList,
  caseUrn: 'test-case-urn'
};

export const mockFilterOptionsForTests = {
  courtCentreId,
  authorityId,
  hearingTypeId,
  jurisdictionType
};

export const mockFilterOptionsForDownloadList: DownloadListRequest = {
  courtCentreId: 'd9bff7d8-6168-4163-ad77-3b98d61de174',
  startDate: '2000-10-10',
  endDate: '2000-10-10',
  courtRoomId: '4f901e1c-bcee-40c1-b400-60f14d92d2f0',
  courtListType: CourtListType.PUBLIC
};

export const mockFilterOptionsForDownloadPrisonList = {
  courtCentreId: 'd9bff7d8-6168-4163-ad77-3b98d61de174',
  jurisdictionType: 'CROWN' as JurisdictionType
};

export const mockearchAvailableHearingsFormOptions: SearchAvailableHearingsFormOptions = {
  hearingId,
  jurisdictionType: 'CROWN',
  searchCriterias: [SearchCriteriaAvailableHearingsType.CASE_IN_HEARING]
};

export const permissions = {
  permissions: [
    {
      action: 'Access',
      active: true,
      description:
        'Permission for DEPUTY_DISTRICT_JUDGE:Aneeta Borwick CaseId:0c0a3977-961f-487b-be31-e7d8a03ee037 for case access',
      object: 'Case',
      permissionId: '6758fbaa-6c0e-4711-ab34-eba777bac419',
      source: 'cp-user-id',
      target: '0c0a3977-961f-487b-be31-e7d8a03ee037'
    },
    {
      action: 'Access',
      active: true,
      description:
        'Permission for DEPUTY_DISTRICT_JUDGE:Aneeta Borwick CaseId:9fec7148-d223-467e-a824-4c82d76b4fad for case access',
      object: 'Case',
      permissionId: '3825700b-08c7-4bcc-b415-dbdb126d602a',
      source: 'cp-user-id',
      target: '9fec7148-d223-467e-a824-4c82d76b4fad'
    },
    {
      action: 'Access',
      active: true,
      description:
        'Permission for RECORDER:Rowena Goode CaseId:9fec7148-d223-467e-a824-4c82d76b4fad for case access',
      object: 'Case',
      permissionId: '1725700b-08c7-4bcc-b415-dbdb126d602a',
      source: 'cp-user-id-2',
      target: '0eec7148-d223-467e-a824-4c82d76b4fad'
    }
  ],
  applicationPermissions: [
    {
      action: 'Access',
      active: true,
      description: `Permission for DEPUTY_DISTRICT_JUDGE:Aneeta Borwick ApplicationId:0c0a3977-961f-487b-be31-e7d8a03ee037 for application access`,
      object: 'Application',
      permissionId: '6758fbaa-6c0e-4711-ab34-eba777bac419',
      source: 'cp-user-id',
      target: '0c0a3977-961f-487b-be31-e7d8a03ee037'
    },
    {
      action: 'Access',
      active: true,
      description: `Permission for DEPUTY_DISTRICT_JUDGE:Aneeta Borwick ApplicationId:9fec7148-d223-467e-a824-4c82d76b4fad for application access`,
      object: 'Application',
      permissionId: '3825700b-08c7-4bcc-b415-dbdb126d602a',
      source: 'cp-user-id',
      target: '9fec7148-d223-467e-a824-4c82d76b4fad'
    }
  ]
};
