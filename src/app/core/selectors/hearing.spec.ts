import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngrx/store';

import * as fromRoot from '../reducers/index';
import { AppState } from '../reducers/index';
import * as fromActions from '../actions/hearing';
import { AllocateHearingMagsAction, ScheduledAllocateHearingAction } from '../actions/hearing';
import * as fromSelectors from '../selectors/hearing';
import {
  getCaseNotesForHearing,
  getHearingToEditAllocation,
  getPinnedCaseNotesForHearing,
  getTodaysHearing,
  getTodaysHearingUrns,
  getUnAllocatedCaseIds,
  getUnAllocatedCasesPerHearing
} from '../selectors/hearing';
import { Hearing } from '../model/';
import {
  HearingSchedule,
  PaginatedHearings,
  PublishCourtListType,
  UnallocatedHearings
} from '../model/hearing';
import { editAllocationError, hearingByDefendants } from '../../../mock-data/test-fixtures';
import { TypeOfListSummary } from '../../unscheduled-listings/unscheduled-listings.interfaces';
import { CaseNote } from '../../allocate-hearing/allocate-hearing.interfaces';

let store: Store<fromRoot.AppState>;

const hearingOne = <Hearing>{
  id: 'H001',
  type: { id: '001', description: 'PTP' },
  startDate: '2017-10-01',
  endDate: '2017-10-01',
  nonSittingDays: [],
  estimatedMinutes: 60,
  listedCases: [
    {
      id: 'test-case-id-001',
      defendants: [
        {
          id: 'test-defendant-id-001',
          masterDefendantId: 'test-defendant-id-001',
          courtProceedingsInitiated: 'courtProceedingsInitiated1',
          offences: [{ id: 'test-offence-id-001' }, { id: 'test-offence-id-002' }]
        },
        {
          id: 'test-defendant-id-002',
          masterDefendantId: 'test-defendant-id-002',
          courtProceedingsInitiated: 'courtProceedingsInitiated2',
          offences: [{ id: 'test-offence-id-003' }, { id: 'test-offence-id-004' }]
        }
      ],
      caseIdentifier: {
        authorityId: 'cf73207f-3ced-488a-82a0-3fba79c2ce85',
        authorityCode: 'TFL',
        caseReference: 'TFL12345'
      }
    }
  ]
};

const typeOfList: TypeOfListSummary = {
  value: 'c98cb51f-8639-49c1-91f0-a7e820c34355',
  label: 'Warrant for arrest without bail'
};

describe('hearing selectors', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore(fromRoot.reducers, { runtimeChecks: {} })],
      teardown: { destroyAfterEach: false }
    });

    store = TestBed.inject(Store);
  });

  describe('Unallocated hearings', () => {
    beforeEach(() => {
      store.dispatch(
        new fromActions.ListUnallocatedHearingsSuccessAction({
          hearings: [hearingOne],
          pagination: {
            currentPage: 1,
            totalNumber: 100,
            pageCount: 2
          }
        } as UnallocatedHearings)
      );
    });

    it('should return the state of all the unallocated hearings', () => {
      let result;

      store.select(fromSelectors.getUnallocatedHearings).subscribe((value) => (result = value));

      expect(result).toEqual([hearingOne]);
    });

    it('should return the state of all the unallocated hearings with pagination', () => {
      let result;

      store
        .select(fromSelectors.getUnallocatedHearingsByPage)
        .subscribe((value) => (result = value));

      expect(result).toEqual({
        hearings: [hearingOne],
        pagination: {
          currentPage: 1,
          totalNumber: 100,
          pageCount: 2
        }
      });
    });

    it('should return the requested unallocatedHearing', () => {
      let result;

      store
        .select(fromSelectors.getUnallocatedHearingById('H001'))
        .subscribe((value) => (result = value));

      expect(result).toEqual(hearingOne);

      store
        .select(fromSelectors.getUnallocatedHearingById('H002'))
        .subscribe((value) => (result = value));

      expect(result).toEqual(undefined);
    });

    it('should return the requested hearing by defendants group', () => {
      let result;

      store
        .select(fromSelectors.getHearingByDefendantsGroup('H001'))
        .subscribe((value) => (result = value));

      expect(result).toEqual(hearingByDefendants);
    });
  });

  describe('Scheduled allocated hearing', () => {
    beforeEach(() => {
      store.dispatch(new fromActions.ScheduledAllocateHearingAction(hearingOne));
    });

    it('should return the state of all the last allocated hearings', () => {
      let result;

      store
        .select(fromSelectors.getScheduledHearingForAllocation)
        .subscribe((value) => (result = value));

      expect(result).toEqual(hearingOne);
    });
  });

  describe('Unscheduled hearings', () => {
    beforeEach(() => {
      store.dispatch(
        new fromActions.ListUnscheduledHearingsSuccessAction({
          hearings: [hearingOne],
          pagination: {
            currentPage: 1,
            pageCount: 1,
            totalNumber: 50
          }
        })
      );
    });

    it('should return the state of all the unscheduled hearings', () => {
      let result;

      store.select(fromSelectors.getUnscheduledHearings).subscribe((value) => (result = value));

      expect(result).toEqual({
        hearings: [hearingOne],
        pagination: {
          currentPage: 1,
          pageCount: 1,
          totalNumber: 50
        }
      });
    });
  });

  describe('TypeOfList', () => {
    beforeEach(() => {
      store.dispatch(new fromActions.TypeOfListActionSuccess([typeOfList]));
    });

    it('should return the state of all typeOfList', () => {
      let result;

      store.select(fromSelectors.getTypeOfList).subscribe((value) => (result = value));

      expect(result).toEqual([typeOfList]);
    });
  });

  describe('Allocated hearings', () => {
    beforeEach(() => {
      store.dispatch(
        new fromActions.AllocateHearingAction({
          originHearing: hearingOne,
          updatedHearing: hearingOne
        })
      );
    });

    it('should return the state of all the last allocated hearings', () => {
      let result;

      store.select(fromSelectors.getLastAllocatedHearing).subscribe((value) => (result = value));

      expect(result).toEqual({
        hearing: hearingOne,
        availableHearing: false
      });
    });
  });

  describe('Available hearings', () => {
    beforeEach(() => {
      store.dispatch(new fromActions.SearchAvailableHearingsSuccessAction([]));
    });

    it('should return the state of all the available hearings', () => {
      let result;

      store.select(fromSelectors.getAvailableHearings).subscribe((value) => (result = value));

      expect(result).toEqual([]);
    });
  });

  describe('Get Publish Court List Statuses', () => {
    const draftStatus = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListType: PublishCourtListType.Final,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'SUCCESS',
      failureMessage: ''
    };
    const statuses = [draftStatus];
    beforeEach(() => {
      store.dispatch(new fromActions.GetPublishListStatusSuccessAction(statuses));
    });

    it('should return the state of all the published statuses', () => {
      let result;

      store
        .select(fromSelectors.getPublishCourtListStatuses)
        .subscribe((value) => (result = value));

      expect(result).toEqual(statuses);
    });
  });

  describe('getLastAllocatedMagsHearing', () => {
    const hearingMags: Hearing = {
      id: 'H001',
      type: { id: '1', description: 'PTP' },
      courtCentreId: '123',
      startDate: '2017-10-01',
      estimatedMinutes: 60,
      allocated: false,
      jurisdictionType: 'CROWN',
      judiciary: [],
      hearingLanguage: 'ENGLISH',
      listedCases: [],
      hearingDays: [],
      nonDefaultDays: [],
      nonSittingDays: []
    };

    beforeEach(() => {
      store.dispatch(new ScheduledAllocateHearingAction(hearingMags));
    });

    it('should return the state of mags hearing', () => {
      let result;
      store
        .select(fromSelectors.getLastAllocatedMagsHearing)
        .subscribe((value) => (result = value));

      expect(result).toEqual({
        hearing: hearingMags,
        availableHearing: false
      });
    });
  });

  describe('getMagsHearingSchedule', () => {
    const slot = {
      courtScheduleId: 'courtScheduleId',
      sessionDate: '01-01-20',
      courtHouseName: 'Lavander',
      courtRoomName: 'courtroomName',
      rotaBusinessTypeCode: 'code',
      courtSession: 'AM',
      maxSlots: 1,
      maxDuration: 1,
      availableSlots: 2,
      availableDuration: 2,
      businessType: 'businessType',
      oucode: 'oucode'
    };
    const payload = {
      hearingSlotAllocations: [
        {
          hearingSlot: slot,
          duration: 1,
          hearingSlotTime: '2019-10-27'
        }
      ]
    } as unknown as HearingSchedule;

    beforeEach(() => {
      store.dispatch(new AllocateHearingMagsAction(payload));
    });

    it('should return the mags schedule', () => {
      let result;
      store.select(fromSelectors.getMagsHearingSchedule).subscribe((value) => (result = value));

      expect(result).toEqual(payload);
    });
  });

  describe('#isScheduledAllocatedHearingStandaloneApplication', () => {
    describe('should return that the hearing is a standalone application', () => {
      beforeEach(() => {
        store.dispatch(
          new fromActions.ScheduledAllocateHearingAction({
            courtApplications: [{}]
          } as Hearing)
        );
      });

      it('should return true', () => {
        let result;

        store
          .select(fromSelectors.isScheduledAllocatedHearingStandaloneApplication)
          .subscribe((value) => (result = value));

        expect(result).toBeTruthy();
      });
    });

    describe('should return that the hearing is not a standalone application', () => {
      beforeEach(() => {
        store.dispatch(
          new fromActions.ScheduledAllocateHearingAction({
            listedCases: [{}],
            courtApplications: []
          } as Hearing)
        );
      });

      it('should return false', () => {
        let result;

        store
          .select(fromSelectors.isScheduledAllocatedHearingStandaloneApplication)
          .subscribe((value) => (result = value));

        expect(result).toBeFalsy();
      });
    });
  });

  describe('#isScheduledAllocatedHearingOnlyWithLinkedApplication', () => {
    describe('should return that the hearing is only with a linked case', () => {
      beforeEach(() => {
        store.dispatch(
          new fromActions.ScheduledAllocateHearingAction({
            listedCases: [{ id: 'test-listed-case-id-1' }],
            courtApplications: [{ linkedCaseIds: ['test-listed-case-id-1'] }]
          } as Hearing)
        );
      });

      it('should return true', () => {
        let result;

        store
          .select(fromSelectors.isScheduledAllocatedHearingOnlyWithLinkedApplication)
          .subscribe((value) => (result = value));

        expect(result).toBeTruthy();
      });
    });

    describe('should return that the hearing is not only with a linked case', () => {
      beforeEach(() => {
        store.dispatch(
          new fromActions.ScheduledAllocateHearingAction({
            listedCases: [{ id: 'test-listed-case-id-1' }],
            courtApplications: [{ linkedCaseIds: ['test-listed-case-id-2'] }]
          } as Hearing)
        );
      });

      it('should return false', () => {
        let result;

        store
          .select(fromSelectors.isScheduledAllocatedHearingOnlyWithLinkedApplication)
          .subscribe((value) => (result = value));

        expect(result).toBeFalsy();
      });
    });
  });

  describe('getTodaysHearing', () => {
    const nativeDate = Date.now;

    beforeEach(() => {
      global.Date.now = jest.fn(() => new Date('2020-02-07T10:20:30Z').getTime());
    });

    afterAll(() => {
      global.Date.now = nativeDate;
    });

    it('should return the same day hearing ids', () => {
      const hearings = [
        {
          id: 'hearingId',
          hearingDays: [
            {
              hearingDate: '2020-02-07T10:20:30Z'
            },
            {
              hearingDate: '2020-02-08T10:20:30Z'
            }
          ]
        } as Hearing,
        {
          id: 'hearingId1',
          hearingDays: [
            {
              hearingDate: '2020-02-09T10:20:30Z'
            }
          ]
        } as Hearing
      ];
      expect(getTodaysHearing.projector(hearings)).toEqual([hearings[0]]);
    });
  });

  describe('getTodaysHearingUrns', () => {
    const nativeDate = Date.now;

    beforeEach(() => {
      global.Date.now = jest.fn(() => new Date('2020-02-07T10:20:30Z').getTime());
    });

    afterAll(() => {
      global.Date.now = nativeDate;
    });

    it('should return the same day hearing ids', () => {
      const hearings = [
        {
          id: 'hearingId',
          listedCases: [
            {
              caseIdentifier: {
                caseReference: 'urn1'
              }
            }
          ],
          hearingDays: [
            {
              hearingDate: '2020-02-07T10:20:30Z'
            },
            {
              hearingDate: '2020-02-07T10:20:30Z'
            }
          ]
        } as Hearing,
        {
          id: 'hearingId1',
          courtApplications: [
            {
              applicationReference: 'urn2'
            }
          ],
          hearingDays: [
            {
              hearingDate: '2020-02-09T10:20:30Z'
            }
          ]
        } as Hearing
      ];
      expect(getTodaysHearingUrns.projector(hearings)).toEqual(['urn1', 'urn2']);
    });
  });

  describe('getUnAllocatedCaseIds', () => {
    it('should select case ids from hearing', () => {
      const state = [
        {
          id: 'hearingId',
          listedCases: [
            {
              id: 'caseId'
            }
          ]
        }
      ];

      expect(getUnAllocatedCaseIds.projector(state, 'hearingId')).toEqual(['caseId']);
    });
  });

  describe('getUnAllocatedCasesPerHearing', () => {
    it('should select case ids from hearing', () => {
      const state = [
        {
          id: 'hearingId',
          listedCases: [
            {
              id: 'caseId'
            }
          ]
        }
      ];

      expect(getUnAllocatedCasesPerHearing.projector(state, 'hearingId')).toEqual([
        {
          id: 'caseId'
        }
      ]);
    });
  });

  describe('getCaseNotesForHearing', () => {
    it('should select case ids from hearing', () => {
      const state = {
        hearingId: {
          caseId: {
            id: 'caseNoteId'
          }
        }
      };

      expect(getCaseNotesForHearing.projector(state, 'hearingId')).toEqual({
        caseId: {
          id: 'caseNoteId'
        }
      });
    });
  });

  describe('getPinnedCaseNotesForHearing', () => {
    it('should select case ids from hearing', () => {
      const caseNotes = {
        hearingId: {
          caseId1: [
            {
              id: 'caseNoteId1',
              isPinned: false
            }
          ] as CaseNote[],
          caseId2: [
            {
              id: 'caseNoteId2',
              isPinned: true,
              createdDateTime: '2020-11-06'
            }
          ] as CaseNote[],
          caseId3: [
            {
              id: 'caseNoteId3',
              isPinned: true,
              createdDateTime: '2020-11-01'
            },
            {
              id: 'caseNoteId4',
              isPinned: true,
              createdDateTime: '2020-11-02'
            }
          ] as CaseNote[]
        }
      } as Record<string, fromRoot.CaseNotesMap>;

      const listedCases = [
        {
          id: 'caseId1'
        },
        {
          id: 'caseId2'
        },
        {
          id: 'caseId3'
        }
      ];

      expect(
        getPinnedCaseNotesForHearing.projector(caseNotes, listedCases, 'hearingId')
      ).toMatchSnapshot();
    });
  });

  describe('Search for available hearings by date range', () => {
    const availableHearings: PaginatedHearings = {
      hearings: [
        {
          id: 'hearing1'
        },
        {
          id: 'hearing2'
        }
      ] as Hearing[],

      pagination: { totalNumber: 100, pageCount: 2 }
    };
    beforeEach(() => {
      store.dispatch(
        new fromActions.SearchAllocatedHearingsByDateRangeSuccessAction(availableHearings)
      );
    });

    it('should return true if hearings are available', () => {
      let result;

      store
        .select(fromSelectors.hasAllocatedHearingsByDateRange)
        .subscribe((value) => (result = value));

      expect(result).toEqual(true);
    });
  });

  describe('Split hearing from Unallocated journey', () => {
    beforeEach(() => {
      store.dispatch(fromActions.splitHearingUnallocated({ splitHearingUnallocated: true }));
    });
    it('should return true when split hearing clicked from unallocated journey', () => {
      let result;

      store
        .select(fromSelectors.hasSplitHearingFromUnallocated)
        .subscribe((value) => (result = value));

      expect(result).toEqual(true);
    });
  });

  describe('Edit allocation error', () => {
    beforeEach(() => {
      store.dispatch(fromActions.setEditAllocationError({ editAllocationError }));
    });
    it('should return true when split hearing clicked from unallocated journey', () => {
      let error;

      store.select(fromSelectors.getEditAllocationError).subscribe((e) => (error = e));

      expect(error).toEqual(editAllocationError);
    });
  });

  describe('Hearing to edit allocation', () => {
    it('should return the hearingToEditAllocation from state', () => {
      const mockState = {
        hearings: {
          hearingToEditAllocation: hearingOne
        }
      } as AppState;

      const result = getHearingToEditAllocation(mockState);

      expect(result).toEqual(hearingOne);
    });
  });
});
