import { HearingType, OrganisationUnit, RotaBusinessType } from '@cpp/reference-data';
import { Hearing, CourtApplication } from '../../core/model';
import {
  CourtCalendarState,
  CourtRoomCalendarVM,
  MagsWidgetCourtroomCalendarVm,
  HearingAllocationPayload,
  RemoveHearingVM
} from '../../court-calendar/model';

import { caseNotesMock } from '../../../mock-data/test-fixtures';
import { listedCase1 } from '../../unscheduled-listings/mock-data/mock-data';

export const mockSearchFormValues = {
  startDate: '2024-01-01',
  endDate: '2024-01-07',
  courtCentre: {
    id: 'courtCentreId',
    oucodeL3Code: '',
    oucodeL3Name: 'Lavender hill court',
    courtrooms: [
      {
        id: '9e4932f7-97b2-3010-b942-ddd2624e4dd8',
        courtroomId: 1,
        venueName: 'Lavender hill court',
        courtroomName: 'Courtroom 01'
      }
    ]
  },
  businessType: 'businessType',
  courtRoomId: '9e4932f7-97b2-3010-b942-ddd2624e4dd8',
  pageNumber: 1,
  pageSize: 40
};

export const mockOrganisationUnits: OrganisationUnit[] = [
  {
    courtrooms: [
      {
        id: 'mockCourtRoomId',
        courtroomName: 'mockCourtRoomName'
      }
    ],
    oucodeL3Code: 'WESTMINSTER',
    oucodeL3Name: `Westminster Magistrates' Court`
  } as OrganisationUnit
];

export const mockRotaBusinessTypes = [
  { typeCode: 'APP', typeDescription: 'Type A', id: '1', seqNum: 1, slot: true, duration: 60 },
  { typeCode: 'BAIL', typeDescription: 'Type B', id: '2', seqNum: 2, slot: true, duration: 90 }
] as unknown as RotaBusinessType[];

export const mockCaseId = 'e024469d-ca7f-49da-b677-0ea58633a0ec';
export const mockRoomId = '9e4932f7-97b2-3010-b942-ddd2624e4dd8';
const mockRoomId2 = '1e49234f7-8jH6-5078-c7yhh-eff2624ekl689a';

export const hearingsMock = {
  hearings: [
    {
      id: 'f972dbb9-beb3-479c-8f5f-e6bd49d05d68',
      type: {
        id: '52edf232-3c09-4c74-a6ad-737985c2e662',
        description: 'PTP'
      },
      endDate: '2020-11-05',
      allocated: true,
      judiciary: [],
      startDate: '2020-11-05',
      hearingDays: [
        {
          endTime: '2020-11-05T13:01:18.895Z',
          sequence: 0,
          startTime: '2020-11-05T22:00:18.895Z',
          hearingDate: '2020-11-05',
          courtScheduleId: '8e837de0-743a-4a2c-9db3-b2e678c48729',
          durationMinutes: 1,
          courtCentreId: '7e967376-eacf-4fca-9b30-21b0c5aad427',
          courtRoomId: '9e4932f7-97b2-3010-b942-ddd2624e4dd8'
        },
        {
          endTime: '2020-11-07T14:01:18.895Z',
          sequence: 1,
          startTime: '2020-11-07T20:00:18.895Z',
          hearingDate: '2020-11-07',
          courtScheduleId: '8e837de0-743a-4a2c-9db3-b2e678c48739',
          durationMinutes: 5,
          courtCentreId: 'f8254db1-1683-483e-afb3-b87fde5a0a26',
          courtRoomId: '9e4932f7-97b2-3010-b942-ddd2624e4dd8'
        }
      ],
      listedCases: [
        {
          id: 'e024469d-ca7f-49da-b677-0ea58633a0ec',
          markers: [
            {
              id: '49f6bf83-2272-49f8-9ebc-38a16238c7e1',
              markerTypeid: 'caee647f-2bbc-4302-8080-01b950e5fd9f',
              markerTypeCode: 'C',
              markerTypeDescription: 'Description'
            }
          ],
          defendants: [
            {
              id: '4c79e3a7-2a09-4795-a1c3-6c65cc2c2485',
              address: {
                address1: '3Q7TFls6CW',
                address2: 'v0kfBNgWoM',
                address3: 'qxzbedjkCO',
                address4: 'jhXy49Akbi',
                address5: '2xSpLuGBeR',
                postcode: 'CR1 4BX'
              },
              isYouth: true,
              lastName: 'PQMUkXYqss',
              offences: [
                {
                  id: '0c6b73fd-2cfe-473c-a8ac-be1ba7c9866e',
                  startDate: '2020-11-05',
                  offenceCode: 'Dv72lLrL83',
                  shadowListed: false,
                  offenceWording: 'WuBJoqh2c7',
                  laaApplnReference: {
                    statusId: 'd36c1751-e34a-465f-b44b-4c5e75fb1466',
                    statusCode: 'qQ6BxBpy1u',
                    statusDate: '2020-11-05',
                    statusDescription: 'Vefn4GHDA3',
                    applicationReference: '8o7apKjbaT'
                  },
                  statementOfOffence: {
                    title: 'WGzw7H0CVx',
                    welshTitle: 'WGzw7H0CVx'
                  },
                  restrictFromCourtList: false
                },
                {
                  id: '5605ee1b-81ea-470c-b50a-2ebe08626257',
                  startDate: '2020-11-05',
                  offenceCode: 'TEgW2ayPJT',
                  shadowListed: false,
                  offenceWording: 'eo97DcJBgU',
                  laaApplnReference: {
                    statusId: '35f45a12-30d1-48d1-bb04-c6d36fe6ee6f',
                    statusCode: 'f6CJhrG8uX',
                    statusDate: '2020-11-05',
                    statusDescription: 'xRl2OiB1sx',
                    applicationReference: '1uAdBkVuqk'
                  },
                  statementOfOffence: {
                    title: 'zOs6rLsPDS',
                    welshTitle: 'zOs6rLsPDS'
                  },
                  restrictFromCourtList: false
                },
                {
                  id: 'f98357c1-1eef-47a9-85c8-0c5cce536432',
                  startDate: '2020-11-05',
                  offenceCode: 'BTxHT2QHxl',
                  shadowListed: false,
                  offenceWording: 'QLAVJPXYsw',
                  laaApplnReference: {
                    statusId: '8f3add3e-a98e-4f67-9191-d2d9137dfddf',
                    statusCode: 'w6XLe88Tun',
                    statusDate: '2020-11-05',
                    statusDescription: '1yc1YKw0qD',
                    applicationReference: 'grwe3sIfCM'
                  },
                  statementOfOffence: {
                    title: 'wUyFzExaCN',
                    welshTitle: 'wUyFzExaCN'
                  },
                  restrictFromCourtList: false
                }
              ],
              firstName: 'BD8En5gr0K',
              bailStatus: {
                id: '34443c87-fa6f-34c0-897f-0cce45773df5',
                code: 'P',
                description: 'Custody or remanded into custody'
              },
              dateOfBirth: '1999-09-07',
              masterDefendantId: '7ae63b8c-e298-44a8-bee6-b9ca53d031d3',
              restrictFromCourtList: false,
              nationalityDescription: 'British',
              courtProceedingsInitiated: '2020-11-05T13:57:32.782Z'
            },
            {
              id: 'e58b209c-c54a-4335-a54e-1d5f92c89374',
              address: {
                address1: 'Up3C3oT0wW',
                address2: '0DVz5aeSwK',
                address3: '4cqLFsYxRE',
                address4: '3ykOiddDdy',
                address5: 'EUERrZrfgC',
                postcode: 'CR1 4BX'
              },
              isYouth: true,
              lastName: 'NXOS4Dxocq',
              offences: [
                {
                  id: '873fa6d4-e17f-4cf1-bbe7-a898d5409714',
                  startDate: '2020-11-05',
                  offenceCode: 'lnXSRKcoEt',
                  shadowListed: false,
                  offenceWording: 'HB0kqTfysX',
                  laaApplnReference: {
                    statusId: '9285b299-9962-4f27-8010-b057ba66b237',
                    statusCode: 'btZt8Q9hr5',
                    statusDate: '2020-11-05',
                    statusDescription: 'ubJhe6tIXl',
                    applicationReference: 'AYF7NRXNbb'
                  },
                  statementOfOffence: {
                    title: 'eOHnaDt08T',
                    welshTitle: 'eOHnaDt08T'
                  },
                  restrictFromCourtList: false
                },
                {
                  id: 'a717e744-04d9-46ec-92ff-3b95b2f71339',
                  startDate: '2020-11-05',
                  offenceCode: 'xPuXwdKZO1',
                  shadowListed: false,
                  offenceWording: 'nPdIcXheeC',
                  laaApplnReference: {
                    statusId: 'ec830b65-4c39-42d5-8912-e3565dc12913',
                    statusCode: 'dz3F6CUK5F',
                    statusDate: '2020-11-05',
                    statusDescription: 'trL6L4Wfed',
                    applicationReference: 'ixhSVs5qdU'
                  },
                  statementOfOffence: {
                    title: 'S20cRNUxlr',
                    welshTitle: 'S20cRNUxlr'
                  },
                  restrictFromCourtList: false
                },
                {
                  id: '92eb84de-6c6b-430b-a6fd-f4a3fa71ff70',
                  startDate: '2020-11-05',
                  offenceCode: 'RRiXhws3Ma',
                  shadowListed: false,
                  offenceWording: 'Omk2L7teiU',
                  laaApplnReference: {
                    statusId: '103e51e9-e343-4677-8e00-d2405dfaca47',
                    statusCode: 'L2IpO4nbWA',
                    statusDate: '2020-11-05',
                    statusDescription: 'OorNjRumiV',
                    applicationReference: 'XgSkDKV18v'
                  },
                  statementOfOffence: {
                    title: 'vvLIjZVm2F',
                    welshTitle: 'vvLIjZVm2F'
                  },
                  restrictFromCourtList: false
                }
              ],
              firstName: 'goW5AHWhjy',
              bailStatus: {
                id: '34443c87-fa6f-34c0-897f-0cce45773df5',
                code: 'P',
                description: 'Custody or remanded into custody'
              },
              dateOfBirth: '1999-09-07',
              masterDefendantId: '95f4f44a-de0b-44e6-8703-bc3f381910e3',
              restrictFromCourtList: false,
              nationalityDescription: 'British',
              courtProceedingsInitiated: '2020-11-05T13:57:32.792Z'
            }
          ],
          shadowListed: false,
          caseIdentifier: {
            authorityId: '2509b750-c7cd-4c79-a94c-9391b9f32626',
            authorityCode: 'VX7IaOlFtI',
            caseReference: '225b8163998'
          },
          restrictFromCourtList: false
        },
        {
          id: 'e2b2d67e-ec08-4dbf-b559-6cd48ec86aaf',
          markers: [
            {
              id: '9afa77e5-cc07-4041-a1bf-cbf0b7ec4c75',
              markerTypeid: '44ccfb9f-7e3d-476f-b5e4-fb96b1c0185e',
              markerTypeCode: 'C',
              markerTypeDescription: 'Description'
            }
          ],
          defendants: [
            {
              id: '879bf169-aa2e-425f-b642-80a2eb5d2405',
              address: {
                address1: 'Lwq7gORknF',
                address2: 'uk1iVfH6Ty',
                address3: 'ob9Go33n4U',
                address4: '1O2odDtXAt',
                address5: 'KjGPTCJy4r',
                postcode: 'CR1 4BX'
              },
              isYouth: true,
              lastName: 'WOGjzIZ66W',
              offences: [
                {
                  id: '1c2ffb88-a944-4783-b0ea-12fe6f03cf93',
                  startDate: '2020-11-05',
                  offenceCode: 'Ycldtt2ix4',
                  shadowListed: false,
                  offenceWording: '8tf3DioF0I',
                  laaApplnReference: {
                    statusId: '3abc90ef-7f27-43de-a0e7-8ad0dbb27e20',
                    statusCode: 'YU881FYxMl',
                    statusDate: '2020-11-05',
                    statusDescription: '6oflPKm15v',
                    applicationReference: 'C6kOxHPYoF'
                  },
                  statementOfOffence: {
                    title: 'OXVCykD9IG',
                    welshTitle: 'OXVCykD9IG'
                  },
                  restrictFromCourtList: false
                },
                {
                  id: 'd3d5916f-8c32-4f86-955b-7fa72fdb76fd',
                  startDate: '2020-11-05',
                  offenceCode: 'sYvHqwsT1E',
                  shadowListed: false,
                  offenceWording: '1sNChHaohM',
                  laaApplnReference: {
                    statusId: '248b3366-7f2e-43dc-8a94-8d71f9744911',
                    statusCode: 'E6VJQlelzZ',
                    statusDate: '2020-11-05',
                    statusDescription: '063MtahgHN',
                    applicationReference: 'qz1wkqrPBg'
                  },
                  statementOfOffence: {
                    title: 'IqdbcoJFCk',
                    welshTitle: 'IqdbcoJFCk'
                  },
                  restrictFromCourtList: false
                },
                {
                  id: '1db19b90-b96c-4713-9b30-87a900bfea05',
                  startDate: '2020-11-05',
                  offenceCode: 'GmAIvIAfB9',
                  shadowListed: false,
                  offenceWording: 'x6HKrvWPhL',
                  laaApplnReference: {
                    statusId: '5768f43c-92cd-452a-b442-e87330687c9e',
                    statusCode: 'axwo3ILTmo',
                    statusDate: '2020-11-05',
                    statusDescription: 'rfIWZivGza',
                    applicationReference: 'UMIdjJOvME'
                  },
                  statementOfOffence: {
                    title: 'F7baJdRxCN',
                    welshTitle: 'F7baJdRxCN'
                  },
                  restrictFromCourtList: false
                }
              ],
              firstName: 'pVREwI4rcS',
              bailStatus: {
                id: '34443c87-fa6f-34c0-897f-0cce45773df5',
                code: 'P',
                description: 'Custody or remanded into custody'
              },
              dateOfBirth: '1999-09-07',
              masterDefendantId: '8cc7788f-e633-428d-8e45-e5bd20196611',
              restrictFromCourtList: false,
              nationalityDescription: 'British',
              courtProceedingsInitiated: '2020-11-05T13:57:32.793Z'
            },
            {
              id: 'e7681cef-788a-4bef-b0ec-38a3a6b3dbd3',
              address: {
                address1: 'EOVUbYoqc1',
                address2: '8CEYOgaN7M',
                address3: 'tI5K6r5nkQ',
                address4: 'JUJEd9R9ND',
                address5: 'nc2c7ovVF2',
                postcode: 'CR1 4BX'
              },
              isYouth: true,
              lastName: '7QBEvcgjnz',
              offences: [
                {
                  id: '617ef675-30eb-4861-88a0-1c8bd9dd4796',
                  startDate: '2020-11-05',
                  offenceCode: 'mWwFJUQPms',
                  shadowListed: false,
                  offenceWording: '5L4qiuPvRs',
                  laaApplnReference: {
                    statusId: '74763bfa-7524-4cb2-be7f-0f3b25c01e52',
                    statusCode: 'ThajWWguLU',
                    statusDate: '2020-11-05',
                    statusDescription: 'I7eVrt0ULH',
                    applicationReference: 'RlsYiug7CG'
                  },
                  statementOfOffence: {
                    title: 'st3OZuHtnu',
                    welshTitle: 'st3OZuHtnu'
                  },
                  restrictFromCourtList: false
                },
                {
                  id: 'f9b7809c-9c1e-4f42-a0f7-dde0c0e431de',
                  startDate: '2020-11-05',
                  offenceCode: 'w31M6njGrC',
                  shadowListed: false,
                  offenceWording: 'F229sQufNZ',
                  laaApplnReference: {
                    statusId: 'ea68924d-f933-4932-ab44-aed29bf06b70',
                    statusCode: 'K5ZLxwxDWj',
                    statusDate: '2020-11-05',
                    statusDescription: '9tawk1CMRM',
                    applicationReference: 'tFuz4x011e'
                  },
                  statementOfOffence: {
                    title: 'oIbFAUfw7D',
                    welshTitle: 'oIbFAUfw7D'
                  },
                  restrictFromCourtList: false
                },
                {
                  id: '5a592996-e895-44ae-b750-02d35681370a',
                  startDate: '2020-11-05',
                  offenceCode: 'aA2k3ddXVF',
                  shadowListed: false,
                  offenceWording: 'mC1pxWX3zl',
                  laaApplnReference: {
                    statusId: '5a698a50-4102-43c3-822e-b71974901d5b',
                    statusCode: 'PXoOFSaNHX',
                    statusDate: '2020-11-05',
                    statusDescription: 'BMZbyCyXcg',
                    applicationReference: 'YdEta72WB5'
                  },
                  statementOfOffence: {
                    title: 'nSbG5rvt87',
                    welshTitle: 'nSbG5rvt87'
                  },
                  restrictFromCourtList: false
                }
              ],
              firstName: 'YiedSeovZv',
              bailStatus: {
                id: '34443c87-fa6f-34c0-897f-0cce45773df5',
                code: 'P',
                description: 'Custody or remanded into custody'
              },
              dateOfBirth: '1999-09-07',
              masterDefendantId: 'fb20a9fd-e338-4abc-94f8-dd2a6e2835a4',
              restrictFromCourtList: false,
              nationalityDescription: 'British',
              courtProceedingsInitiated: '2020-11-05T13:57:32.793Z'
            }
          ],
          shadowListed: false,
          caseIdentifier: {
            authorityId: '1d137130-71c2-454a-afbb-2ef1f4bb8e45',
            authorityCode: 'dwbIgpvo0V',
            caseReference: 'OWmW4670287'
          },
          restrictFromCourtList: false
        }
      ],
      courtCentreId: '7e967376-eacf-4fca-9b30-21b0c5aad427',
      nonDefaultDays: [
        {
          oucode: 'B01EF00',
          session: 'AD',
          duration: 1,
          startTime: '2020-11-05T13:00:18.895Z',
          courtRoomId: 793,
          courtScheduleId: '8e837de0-743a-4a2c-9db3-b2e678c48729'
        }
      ],
      nonSittingDays: [],
      hearingLanguage: 'ENGLISH',
      estimatedMinutes: 30,
      jurisdictionType: 'CROWN',
      courtApplications: [
        {
          id: '943628ff-1234-474c-933a-3d47e2231586',
          applicant: {
            id: 'b4175d36-c6d7-4766-8b90-1960f8969eaf',
            address: {
              address1: '0WRu8qdQ7Z',
              address2: 'Fo1YicagGx',
              address3: 'IZQkciOHNY',
              address4: 'xaeVf3cuUZ',
              address5: 'gchg1JZIGK',
              postcode: 'SW13 0AA'
            },
            lastName: 'eWdeU5E1kv',
            firstName: '8FUqOXyeg7',
            isRespondent: false,
            restrictFromCourtList: false,
            courtApplicationPartyType: 'PERSON'
          },
          respondents: [
            {
              id: '53238cb9-1c88-4cda-82c5-9f6125c3306e',
              address: {
                address1: '9YNUaIDwh6',
                address2: 'n3WcPfbGOg',
                address3: 'LVuboA3jB8',
                address4: '2izBrzDNto',
                address5: '5JUhQ6sII4',
                postcode: 'SW13 0AA'
              },
              lastName: 'FeSK5Gjl2X',
              firstName: 'Z4hfVxW6nA',
              isRespondent: true,
              restrictFromCourtList: false,
              courtApplicationPartyType: 'PERSON'
            }
          ],
          linkedCaseIds: ['e024469d-ca7f-49da-b677-0ea58633a0ec'],
          type: 'OIjulwS7Gj',
          parentApplicationId: '905c05c1-8b27-414f-8ced-b3344d2d0948',
          applicationReference: '6uSQ6ewe1s',
          applicationParticulars: '6MjLcNi4Ao'
        } as unknown as CourtApplication
      ] as CourtApplication[],
      reportingRestrictionReason: 'j70dEqKr7Y'
    }
  ] as unknown as Hearing[]
};

export const courtRoomCalendarMock = [
  {
    date: hearingsMock.hearings[0].startDate,
    courtRoomName: 'mockCourtRoomName',
    courtRoomId: mockRoomId,
    judiciaryCalendar: [
      {
        judiciary: [
          { judicialId: 'mockJudicialId', judicialRoleType: { judiciaryType: 'MAGISTRATE' } }
        ],
        hearingTimeCalendar: [
          {
            time: '2024-12-20T10:00:00',
            hearings: [
              {
                id: hearingsMock.hearings[0].id,
                isMaster: true,
                details: {
                  hearingDays: [
                    {
                      hearingDate: '2025-11-28'
                    },
                    {
                      hearingDate: '2025-12-28'
                    }
                  ]
                },
                dateTime: '2024-12-20T10:00:00',
                duration: 20,
                judiciary: [
                  {
                    judicialId: 'mockJudicialId',
                    judicialRoleType: {
                      judiciaryType: 'MAGISTRATE'
                    }
                  }
                ],
                defendants: {
                  defendants: hearingsMock.hearings[0].listedCases[0].defendants,
                  caseUrn: 'mockUrn',
                  caseId: hearingsMock.hearings[0].listedCases[0].caseId
                },
                offences: [{}],
                publicListNote: 'mockPublicListNote',
                sequence: 0,
                hearingDate: '2024-12-20',
                hearingType: {
                  description: 'hearingTypeDescription',
                  id: 'hearingTypeId',
                  hasReportingRestriction: false,
                  markers: []
                }
              }
            ]
          }
        ]
      }
    ]
  }
] as unknown as CourtRoomCalendarVM[];

export const courtRoomMagCalendarMock = [
  {
    date: hearingsMock.hearings[0].startDate,
    courtRoomName: 'Courtroom 1',
    courtRoomId: mockRoomId,
    sectionIdentifier: `${mockRoomId}-${hearingsMock.hearings[0].startDate}`,
    businessTypeCalendar: [
      {
        businessTypeAndSlot: {
          businessTypeCode: 'Remands',
          session: { startTime: '10:00', endTime: '12:00' }
        },
        hearingTimeCalendar: [
          {
            time: '2024-12-20T10:00:00',
            hearings: [
              {
                id: hearingsMock.hearings[0].id,
                isMaster: true,
                sectionIdentifier: `${hearingsMock.hearings[0].id}-${mockRoomId}`,
                details: {
                  hearingDays: [{ hearingDate: '2025-11-28' }, { hearingDate: '2025-12-28' }]
                },
                dateTime: '2024-12-20T10:00',
                duration: 45,
                judiciary: [],
                businessTypeAndSlot: {
                  businessTypeCode: 'Hearing',
                  session: { startTime: '10:00', endTime: '12:00' }
                },
                defendants: {
                  defendants: hearingsMock.hearings[0].listedCases?.[0]?.defendants || [],
                  caseUrn: 'mockUrn',
                  caseId: hearingsMock.hearings[0].listedCases?.[0]?.caseId || ''
                },
                offences: [{}],
                publicListNote: 'mockPublicListNote',
                sequence: '1',
                hearingDate: '2024-12-20',
                hearingType: {
                  description: 'hearingTypeDescription',
                  id: 'hearingTypeId',
                  hasReportingRestriction: false,
                  markers: []
                }
              }
            ]
          }
        ]
      },
      {
        businessTypeAndSlot: {
          businessTypeCode: 'Remands',
          session: { startTime: '13:00', endTime: '15:00' }
        },
        hearingTimeCalendar: [
          {
            time: '2024-12-20T13:00:00',
            hearings: []
          }
        ]
      }
    ]
  },
  {
    date: hearingsMock.hearings[0].startDate,
    courtRoomName: 'Courtroom 2',
    courtRoomId: mockRoomId2,
    sectionIdentifier: `${mockRoomId2}-${hearingsMock.hearings[0].startDate}`,
    businessTypeCalendar: [
      {
        businessTypeAndSlot: {
          businessTypeCode: 'Bail cases',
          session: { startTime: '09:30', endTime: '11:30' }
        },
        hearingTimeCalendar: [
          {
            time: '2024-12-20T09:30:00',
            hearings: [
              {
                id: `H2-${hearingsMock.hearings[0].id}`,
                isMaster: true,
                sectionIdentifier: `H2-${hearingsMock.hearings[0].id}-${mockRoomId2}`,
                details: {
                  hearingDays: [{ hearingDate: '2025-11-28' }, { hearingDate: '2025-12-28' }]
                },
                dateTime: '2024-12-20T09:30',
                duration: 60,
                judiciary: [],
                businessTypeAndSlot: {
                  businessTypeCode: 'Hearing',
                  session: { startTime: '09:30', endTime: '11:30' }
                },
                defendants: {
                  defendants: hearingsMock.hearings[0].listedCases?.[0]?.defendants || [],
                  caseUrn: 'mockUrn2',
                  caseId: `C2-${hearingsMock.hearings[0].listedCases?.[0]?.caseId || ''}`
                },
                offences: [{ description: 'Offence 2' }],
                publicListNote: 'mockPublicListNote2',
                sequence: '1',
                hearingDate: '2024-12-20',
                hearingType: {
                  description: 'hearingTypeDescription2',
                  id: 'hearingTypeId2',
                  hasReportingRestriction: false,
                  markers: []
                }
              }
            ]
          }
        ]
      },
      {
        businessTypeAndSlot: {
          businessTypeCode: 'Bail cases',
          session: { startTime: '14:00', endTime: '16:00' }
        },
        hearingTimeCalendar: [
          {
            time: '2024-12-20T14:00:00',
            hearings: []
          }
        ]
      }
    ]
  }
] as unknown as MagsWidgetCourtroomCalendarVm[];

export const courCalendarVMMock = {
  courtRoomCalendars: courtRoomCalendarMock,
  pagination: {
    currentPage: 1,
    pageCount: 1,
    totalNumber: 1,
    itemsPerPage: 20
  },
  totalHearingsDisplayed: 1
};

export const mockCourtCalendarState = {
  filterOptions: mockSearchFormValues,
  allocated: {
    courtRoomMapByDate: { [hearingsMock.hearings[0].startDate]: [mockRoomId] },
    paginatedHearings: {
      hearings: hearingsMock.hearings.map((hearing) => ({
        ...hearing,
        hearingDayCount: 2,
        hearingDayPosition: 1
      })),
      pagination: {
        currentPage: 1,
        totalNumber: 1,
        pageCount: 1
      }
    }
  },
  caseNotesMap: {
    mockCaseId: caseNotesMock
  }
} as CourtCalendarState;

export const selectedHearing = {
  id: 'e934bf6f-66d1-455d-8dd0-3b8b9c70c86a',
  type: {
    id: '4a0e892d-c0c5-3c51-95b8-704d8c781776',
    description: 'First hearing'
  },
  endDate: '2025-01-28',
  allocated: true,
  judiciary: [],
  startDate: '2025-01-28',
  courtRoomId: '9e4932f7-97b2-3010-b942-ddd2624e4dd8',
  hearingDays: [
    {
      endTime: '2025-01-28T10:20:00.000Z',
      sequence: 1,
      startTime: '2025-01-28T10:00:00.000Z',
      courtRoomId: '9e4932f7-97b2-3010-b942-ddd2624e4dd8',
      hearingDate: '2025-01-28',
      courtCentreId: 'f8254db1-1683-483e-afb3-b87fde5a0a26',
      durationMinutes: 20
    },
    {
      endTime: '2025-01-29T10:20:00.000Z',
      sequence: 0,
      startTime: '2025-01-29T10:00:00.000Z',
      courtRoomId: '9e4932f7-97b2-3010-b942-ddd2624e4dd8',
      hearingDate: '2025-01-29',
      courtCentreId: 'f8254db1-1683-483e-afb3-b87fde5a0a26',
      durationMinutes: 20
    },
    {
      endTime: '2025-01-30T10:20:00.000Z',
      sequence: 0,
      startTime: '2025-01-30T10:00:00.000Z',
      courtRoomId: '9e4932f7-97b2-3010-b942-ddd2624e4dd8',
      hearingDate: '2025-01-30',
      courtCentreId: 'f8254db1-1683-483e-afb3-b87fde5a0a26',
      durationMinutes: 20
    }
  ],
  listedCases: [
    {
      id: '284d4006-a9a2-415c-af50-b4c4cf6e1d9d',
      markers: [],
      defendants: [
        {
          id: '86769665-4532-4d63-9f16-fe8f7b81f767',
          address: {
            address1: 'UyNaXmagRh',
            address2: '56Police House',
            address3: 'StreetDescription',
            address4: 'Locality2O',
            address5: 'TownD',
            postcode: 'TW14 9XD'
          },
          lastName: 'Smith',
          offences: [
            {
              id: 'dfded834-11d3-4d22-ae14-732453e92818',
              count: 0,
              startDate: '2004-12-09',
              orderIndex: 500,
              offenceCode: 'TW01040',
              shadowListed: false,
              offenceWording:
                'Has a violent past and fear that he will commit further offences and\\n interfere with witnesse',
              statementOfOffence: {
                title: 'Fail to carry an animal on a moving escalator on the Tyne and Wear Metro',
                welshTitle:
                  'Fail to carry an animal on a moving escalator on the Tyne and Wear Metro',
                legislation:
                  'Contrary to byelaw 16(6) and 31(1) of the Tyne and Wear Metro Byelaws made under sections 58 and 62 of the Tyneside Metropolitan Railway Act 1973.'
              },
              restrictFromCourtList: false
            },
            {
              id: 'eeca9418-310d-4298-b799-526e5dd0cdf9',
              count: 0,
              startDate: '2014-02-09',
              orderIndex: 502,
              offenceCode: 'TW01046',
              shadowListed: false,
              offenceWording:
                'Has a violent past and fear that he will commit further offences and\\n interfere with witnesse',
              statementOfOffence: {
                title:
                  'Occupy reserved seat / berth without a valid ticket on the Tyne and Wear Metro',
                welshTitle:
                  'Occupy reserved seat / berth without a valid ticket on the Tyne and Wear Metro',
                legislation:
                  'Contrary to byelaw 19 and 31(1) of the Tyne and Wear Metro Byelaws made under sections 58 and 62 of the Tyneside Metropolitan Railway Act 1973.'
              },
              restrictFromCourtList: false
            }
          ],
          firstName: 'John',
          bailStatus: {
            id: '12e69486-4d01-3403-a50a-7419ca040635',
            code: 'C',
            description: 'Custody or remanded into custody'
          },
          dateOfBirth: '1983-03-31',
          masterDefendantId: '86769665-4532-4d63-9f16-fe8f7b81f767',
          hearingLanguageNeeds: 'ENGLISH',
          restrictFromCourtList: false,
          courtProceedingsInitiated: '2025-01-24T15:59:36.686Z'
        },
        {
          id: '6f2f85c5-fe52-452f-8298-cf17676d7612',
          address: {
            address1: 'UyNaXmagRh',
            address2: 'Southern House',
            address3: 'Westmister Street',
            address4: 'Croydon',
            address5: 'London',
            postcode: 'W1 9XD'
          },
          offences: [
            {
              id: 'af491609-165b-4e64-b1fc-dad969063add',
              count: 0,
              startDate: '2004-12-09',
              orderIndex: 551,
              offenceCode: 'TW01040',
              shadowListed: false,
              offenceWording:
                'Has a violent past and fear that he will commit further offences and\\n interfere with witnesse',
              statementOfOffence: {
                title: 'Fail to carry an animal on a moving escalator on the Tyne and Wear Metro',
                welshTitle:
                  'Fail to carry an animal on a moving escalator on the Tyne and Wear Metro',
                legislation:
                  'Contrary to byelaw 16(6) and 31(1) of the Tyne and Wear Metro Byelaws made under sections 58 and 62 of the Tyneside Metropolitan Railway Act 1973.'
              },
              restrictFromCourtList: false
            },
            {
              id: 'c953c4e2-b56f-41e3-bb01-809dba1696bd',
              count: 0,
              startDate: '2014-02-09',
              orderIndex: 502,
              offenceCode: 'TW01046',
              shadowListed: false,
              offenceWording:
                'Has a violent past and fear that he will commit further offences and\\n interfere with witnesse',
              statementOfOffence: {
                title:
                  'Occupy reserved seat / berth without a valid ticket on the Tyne and Wear Metro',
                welshTitle:
                  'Occupy reserved seat / berth without a valid ticket on the Tyne and Wear Metro',
                legislation:
                  'Contrary to byelaw 19 and 31(1) of the Tyne and Wear Metro Byelaws made under sections 58 and 62 of the Tyneside Metropolitan Railway Act 1973.'
              },
              restrictFromCourtList: false
            }
          ],
          organisationName: 'HMCTS',
          masterDefendantId: '6f2f85c5-fe52-452f-8298-cf17676d7612',
          restrictFromCourtList: false,
          courtProceedingsInitiated: '2025-01-24T15:59:36.688Z'
        }
      ],
      shadowListed: false,
      caseIdentifier: {
        authorityId: 'bdc190e7-c939-37ca-be4b-9f615d6ef40e',
        authorityCode: 'DERPF',
        caseReference: '89GD5612225'
      },
      restrictFromCourtList: false
    }
  ],
  hasVideoLink: true,
  courtCentreId: 'f8254db1-1683-483e-afb3-b87fde5a0a26',
  isSlotsBooked: false,
  nonDefaultDays: [],
  nonSittingDays: [],
  publicListNote: '',
  hearingLanguage: 'ENGLISH',
  estimatedMinutes: 20,
  jurisdictionType: 'MAGISTRATES',
  courtApplications: [],
  courtCentreDetails: {
    id: 'f8254db1-1683-483e-afb3-b87fde5a0a26',
    defaultDuration: 420,
    defaultStartTime: '10:00:00'
  },
  isGroupProceedings: false,
  numberOfGroupCases: 1
};

export const initialHearingFormValues = {
  hasVideoLink: selectedHearing.hasVideoLink,
  sendNotificationToParties: false,
  hearingLanguage: selectedHearing.hearingLanguage,
  publicListNote: '',
  nonSittingDays: [],
  nonDefaultDays: [],
  dateRange: {
    startDate: selectedHearing.startDate,
    endDate: selectedHearing.endDate
  },
  selectedHearingType: {
    id: selectedHearing.type.id,
    hearingDescription: selectedHearing.type.description
  } as HearingType,
  startTime: selectedHearing.hearingDays[0].startTime,
  duration: selectedHearing.hearingDays[0].durationMinutes
};

export const preparedPayload = {
  startDate: selectedHearing.startDate,
  courtRoomId: selectedHearing.courtRoomId,
  courtCentreId: selectedHearing.courtCentreId,
  id: selectedHearing.id,
  type: { id: selectedHearing.type.id, description: selectedHearing.type.description },
  jurisdictionType: selectedHearing.jurisdictionType,
  hasVideoLink: selectedHearing.hasVideoLink,
  judiciary: [],
  nonSittingDays: [],
  nonDefaultDays: [],
  endDate: selectedHearing.endDate,
  listedCases: selectedHearing.listedCases,
  courtApplications: selectedHearing.courtApplications,
  hearingDays: selectedHearing.hearingDays,
  selectedCourtCentre: {
    id: selectedHearing.courtCentreId,
    courtRoomId: selectedHearing.courtRoomId,
    courtCentreName: "Lavender Hill Magistrates' Court"
  },

  sendNotificationToParties: false,
  hearingLanguage: selectedHearing.hearingLanguage,
  publicListNote: ''
};

export const mockSelectedCourtCentre = {
  id: selectedHearing.courtCentreId,
  courtRoomId: selectedHearing.courtRoomId,
  name: "Lavender Hill Magistrates' Court",
  defaultStartTime: '09:00',
  defaultDuration: '07:00:00',
  courtRooms: [],
  courtCode: 'B'
};

export const mockSequenceHearing = {
  id: 'f972dbb9-beb3-479c-8f5f-e6bd49d05d68',
  sequenceHearingDays: [
    {
      hearingDate: '2025-02-10',
      sequence: 1
    },
    {
      hearingDate: '2025-02-11',
      sequence: 2
    },
    {
      hearingDate: '2025-02-12',
      sequence: 3
    }
  ]
};

export const mockCaseNotes = [
  {
    note: 'This is the first case note. The hearing has been scheduled.',
    author: {
      firstName: 'Elta',
      lastName: 'HAUCK'
    },
    id: 'note-001',
    createdDateTime: '2025-02-01',
    isPinned: true
  },
  {
    note: 'This is the second case note. The hearing has been scheduled.',
    author: {
      firstName: 'Garry',
      lastName: 'FRANECKI'
    },
    id: 'note-002',
    createdDateTime: '2025-02-02',
    isPinned: false
  },
  {
    note: 'This is the third case note. The hearing has been scheduled.',
    author: {
      firstName: 'Jarred',
      lastName: 'KIHN'
    },
    id: 'note-003',
    createdDateTime: '2025-02-03',
    isPinned: false
  },
  {
    note: 'This is the fourth case note. The hearing has been scheduled.',
    author: {
      firstName: 'Robert',
      lastName: 'SMITH'
    },
    id: 'note-004',
    createdDateTime: '2025-02-04',
    isPinned: true
  }
];

export const mockRemoveHearingPayload = {
  hearingId: 'f972dbb9-beb3-479c-8f5f-e6bd49d05d68',
  reason: 'Test remove hearing Mesage'
};

export const mockHearingToRemoves: RemoveHearingVM = {
  id: '00cae52d-3ed4-4fca-88f9-e32a29c8f939',
  courtName: 'Lavender hill court',
  startDate: '2025-03-15',
  courtRoom: 'Room 5',
  duration: '20 minutes',
  hearingType: 'First Hearing',
  hearingLanguage: 'English',
  videoHearing: 'Yes',
  multiDayHearing: {
    isMultiDay: 'Yes',
    startDate: '2025-03-15',
    endDate: '2025-03-17'
  }
};

export const MockHearing = {
  id: '4934b703-072a-4486-bbb2-455c4ad40221',
  type: {
    id: '4a0e892d-c0c5-3c51-95b8-704d8c781776',
    description: 'First hearing'
  },
  endDate: '2025-04-04',
  allocated: true,
  judiciary: [],
  startDate: '2025-04-04',
  courtRoomId: 'df4f5204-63d7-3111-a93a-a034ce5ad901',
  hasVideoLink: true,
  courtCentreId: '07e45c88-9e5d-3e44-b664-d5345bb13be2',
  isSlotsBooked: false,
  isVacatedTrial: false,
  nonDefaultDays: [],
  nonSittingDays: [],
  publicListNote: 'jgjgjg',
  hearingLanguage: 'ENGLISH',
  estimatedMinutes: 20,
  jurisdictionType: 'CROWN',
  courtApplications: [],
  courtCentreDetails: {
    id: '7e967376-eacf-4fca-9b30-21b0c5aad427',
    defaultDuration: 420,
    defaultStartTime: '10:00:00'
  },
  isGroupProceedings: false,
  numberOfGroupCases: 1,
  vacatedTrialReasonId: '',
  hearingDays: [
    {
      endTime: '2025-04-04T09:20:00.000Z',
      sequence: 3,
      startTime: '2025-04-04T09:00:00.000Z',
      courtRoomId: 'df4f5204-63d7-3111-a93a-a034ce5ad901',
      hearingDate: '2025-04-04',
      isCancelled: false,
      courtCentreId: '07e45c88-9e5d-3e44-b664-d5345bb13be2',
      durationMinutes: 20
    }
  ],
  listedCases: [
    {
      id: '5b7723e0-c563-49f6-bfcf-a19054075405',
      markers: [
        {
          id: '4a216a74-b7de-4db3-810a-2ff54cc09878',
          markerTypeid: 'e7eff972-189c-4957-8b1e-cb45213aa64e',
          markerTypeCode: 'HT',
          markerTypeDescription: 'Human Trafficking'
        }
      ],
      defendants: [],
      shadowListed: false,
      caseIdentifier: {
        authorityId: '6ae4b163-658b-3ae2-a66d-43401cac2f96',
        authorityCode: 'DVLA',
        caseReference: '21GD5158924'
      },
      restrictFromCourtList: false
    }
  ]
};

export const MockunallocatedHearingData = {
  hearingId: '4934b703-072a-4486-bbb2-455c4ad40221',
  courtCentreId: '07e45c88-9e5d-3e44-b664-d5345bb13be2',
  courtRoomId: undefined,
  type: {
    id: '4a0e892d-c0c5-3c51-95b8-704d8c781776',
    description: 'First hearing'
  },
  judiciary: [],
  jurisdictionType: 'CROWN',
  startDate: '2025-04-04',
  endDate: '2025-04-04',
  nonSittingDays: [],
  nonDefaultDays: [
    {
      courtCentreId: '07e45c88-9e5d-3e44-b664-d5345bb13be2',
      duration: 20,
      roomId: undefined,
      startTime: '2025-04-04T09:00:00.000Z'
    }
  ],
  hasVideoLink: true,
  hearingLanguage: 'ENGLISH',
  publicListNote: 'jgjgjg',
  prosecutionCases: [
    {
      caseId: '5b7723e0-c563-49f6-bfcf-a19054075405',
      defendants: []
    }
  ]
} as HearingAllocationPayload;

export const mockBulkAllocatedHearings = [
  {
    id: 'hearing1',
    startDate: '2025-04-05',
    endDate: '2025-04-05',
    allocated: true,
    estimatedMinutes: 60,
    listedCase1
  },
  {
    id: 'hearing2',
    startDate: '2025-04-06',
    endDate: '2025-04-18',
    allocated: true,
    estimatedMinutes: 60
  }
];
