import { CourtApplication, ExtendedJudicialRole, Hearing, ListedCase } from '../../core/model';
import {
  TypeOfListSummary,
  UnscheduledHearingsForAllApplications,
  UnscheduledHearingsForAllDefendants
} from '../unscheduled-listings.interfaces';

export const selectedCourtRoomId = 'courtRoomId1';
export const listedCase1: ListedCase = {
  id: 'mock-listed-case-id',
  caseIdentifier: {
    authorityCode: 'authorityCode',
    authorityId: 'authorityId',
    caseReference: 'caseReference'
  },
  defendants: [
    {
      id: 'defendantId',
      firstName: 'firstName',
      lastName: 'lastName',
      dateOfBirth: 'defendant-dob',
      offences: [
        {
          id: '*',
          offenceCode: 'TH68023A',
          startDate: '2023-01-01',
          statementOfOffence: {
            title: 'Attempt robbery',
            legislation: ''
          },
          count: 1,
          orderIndex: 0
        },
        {
          id: '*',
          offenceCode: 'TH68023A',
          startDate: '2023-01-01',
          statementOfOffence: {
            title: 'Attempt robbery',
            legislation: ''
          },
          count: 1,
          orderIndex: 0
        }
      ],
      bailStatus: {
        id: 'bail-status-id',
        code: 'bail-status-code',
        description: 'bail-status-description',
        custodyTimeLimit: 'bail-status-ctl'
      }
    }
  ]
};

export const listedCase2: ListedCase = {
  id: 'listedCaseId',
  caseIdentifier: {
    authorityCode: 'authorityCode',
    authorityId: 'authorityId',
    caseReference: 'caseReference'
  },
  defendants: [
    {
      id: 'defendantId',
      firstName: 'firstName',
      lastName: 'lastName',
      dateOfBirth: 'defendant-dob',
      offences: [],
      bailStatus: {
        id: 'bail-status-id',
        code: 'bail-status-code',
        description: 'bail-status-description',
        custodyTimeLimit: 'bail-status-ctl'
      }
    }
  ]
};

export const courtApplicationSingleRespondentMock: CourtApplication = {
  id: '8e8465df-779b-444e-80dc-15633b6c5fd8',
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
  linkedCaseIds: ['d97a91d2-5d2c-4ad7-bb15-c6a653a599b8'],
  applicationType: 'Complaint for Attachment of Earnings Order',
  applicationReference: 'Test-application-reference'
};

export const hearing1 = {
  id: 'id1',
  courtApplications: [],
  type: { id: 'someId', description: 'PTP' },
  allocated: true,
  startDate: '2017-10-10',
  estimatedMinutes: 15,
  courtCentreId: selectedCourtRoomId,
  courtRoomId: selectedCourtRoomId,
  judiciary: [
    {
      judicialId: 'judicialId',
      judicialRoleType: { judiciaryType: 'judicialRoleType' }
    } as unknown as ExtendedJudicialRole
  ],
  listedCases: [listedCase1]
} as Hearing;

export const hearing2 = {
  id: 'id2',
  courtApplications: [courtApplicationSingleRespondentMock],
  type: { id: 'someId', description: 'PTP' },
  allocated: true,
  startDate: '2017-10-10',
  estimatedMinutes: 15,
  courtCentreId: selectedCourtRoomId,
  courtRoomId: selectedCourtRoomId,
  judiciary: [
    {
      judicialId: 'judicialId',
      judicialRoleType: { judiciaryType: 'judicialRoleType' }
    } as unknown as ExtendedJudicialRole
  ],
  typeOfList: {
    id: 'mock-type-of-list-id',
    description: 'mock-type-of-list-description'
  },
  listedCases: [listedCase2]
} as Hearing;

export const mockResultOne: UnscheduledHearingsForAllDefendants[] = [
  {
    defendantDetails: {
      id: 'defendantId',
      firstName: 'firstName',
      lastName: 'lastName',
      dateOfBirth: 'defendant-dob'
    },
    caseId: 'mock-listed-case-id',
    urn: 'caseReference',
    hearings: [hearing1]
  }
];

export const mockResultTwo: UnscheduledHearingsForAllApplications[] = [
  {
    applicationDetails: {
      id: '8e8465df-779b-444e-80dc-15633b6c5fd8',
      applicant: {
        lastName: 'ApplicantLastName1',
        firstName: 'ApplicantFirstName1',
        isRespondent: false
      }
    },
    urn: 'Test-application-reference',
    hearings: [hearing2]
  }
];

export const hearings: Hearing[] = [hearing1, hearing2];

export const testTypeOfList: TypeOfListSummary[] = [
  {
    value: 'c98cb51f-8639-49c1-91f0-a7e820c34355',
    label: 'Warrant for arrest without bail'
  },
  {
    value: 'ed34136f-2a13-45a4-8d4f-27075ae3a8a9',
    label: 'Warrant for arrest for community penalty without bail'
  }
];
