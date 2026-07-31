import { JudicialRoleType, Hearing, Offence, Defendant, JurisdictionType } from '../model';

export const prosecutionCaseIds = [
  {
    caseId: '926fc76b-7ec9-4bee-bb7d-b8e63d61fc33',
    defendants: [
      {
        defendantId: 'test-defendant-id',
        offences: [{ offenceId: 'test-offence-id' }]
      }
    ]
  }
];

export const judicialRoleType: JudicialRoleType = { judiciaryType: 'RECORDER' };

export const testHearing: Hearing = {
  id: 'b1bfe644-15d3-46aa-bdeb-fe8d18c16a42',
  type: {
    id: '5591d709-4397-452c-8533-998165d58d9c',
    description: 'Further Plea & Trial Preparation'
  },
  endDate: '2018-10-05',
  allocated: true,
  judiciary: [
    {
      isDeputy: true,
      judicialId: '19ffac44-3533-410d-868e-81cf825844b6',
      isBenchChairman: false,
      judicialRoleType,
      judicialMember: {
        id: '1',
        seqId: 1,
        surname: 'Jones',
        forenames: 'John',
        judiciaryType: 'Recorder',
        emailAddress: 'address1'
      }
    },
    {
      isDeputy: false,
      judicialId: '328bfc4e-e661-470e-ac7d-35809a4bb298',
      isBenchChairman: true,
      judicialRoleType,
      judicialMember: {
        id: '2',
        seqId: 2,
        surname: 'Davies',
        forenames: 'Dav',
        judiciaryType: 'Circuit Judge',
        emailAddress: 'address2'
      }
    }
  ],
  startDate: '2018-10-05',
  courtRoomId: 'e7721a38-546d-4b56-9992-ebdd772a561b',
  listedCases: [
    {
      id: '926fc76b-7ec9-4bee-bb7d-b8e63d61fc33',
      defendants: [
        {
          id: 'test-defendant-id',
          offences: [
            {
              id: 'test-offence-id'
            } as Offence
          ]
        } as Defendant
      ],
      caseIdentifier: {
        authorityId: 'cf73207f-3ced-488a-82a0-3fba79c2ce85',
        authorityCode: 'TFL',
        caseReference: 'TFL12345'
      }
    }
  ],
  hearingDays: [
    {
      hearingDate: '2018-10-05',
      endTime: '2018-10-05T12:00:00.000Z',
      sequence: 1,
      startTime: '2018-10-05T09:00:00.000Z',
      durationMinutes: 120
    }
  ],
  courtCentreId: '9b583616-049b-30f9-a14f-028a53b7cfe8',
  hearingLanguage: 'WELSH',
  nonDefaultDays: [
    {
      startTime: '2018-10-05T09:00:00.000Z'
    }
  ],
  nonSittingDays: [],
  estimatedMinutes: 300,
  jurisdictionType: 'MAGISTRATES' as JurisdictionType,
  vacatedTrialReasonId: 'mock-trial-reason-id',
  hasVideoLink: false,
  publicListNote: ''
};
