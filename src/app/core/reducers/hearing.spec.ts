import baseMoment from 'moment';
import { extendMoment } from 'moment-range';
import {
  sequenceMock,
  validHearingMock1,
  validHearingMock2
} from '../../../mock-data/test-fixtures';
import {
  ChangeJudicaryForHearingsSuccessAction,
  ClearLastAllocatedHearingAction,
  ClearUnallocatedHearingsAction,
  ClearUnscheduledHearingsAction,
  CourtRestrictionSuccessAction,
  GetPublishListStatusSuccessAction,
  ListUnallocatedHearingsSuccessAction,
  ListUnscheduledHearingsSuccessAction,
  SearchAllocatedHearingsSuccessAction,
  SequenceHearingSuccessAction,
  SetPublishListStatusSuccessAction,
  WeekCommencingHearingSearchSuccessAction,
  setEditAllocationError,
  setHearingToEditAllocation
} from '../actions';
import { Hearing, JudicialRoleType, LastAllocatedHearing } from '../model';
import { CourtRestriction } from '../model/';
import { hearingLegacyReducer, HearingState } from './';
import { PaginatedHearings, PublishCourtListType, UnallocatedHearings } from '../model/hearing';
import { hearingReducer } from './hearing';
import { JudicialMember } from '@cpp/reference-data';
import { ValidationError } from '@cpp/pdk';
import { testHearing } from '../effects/mocks';

// we cast as any because there is a problem with Es6 moment range
// see https://github.com/rotaready/moment-range/issues/263 for more details
const moment = extendMoment(baseMoment as any);
describe('hearingReducer', () => {
  const mockedHearingState = {
    unscheduled: { hearings: [], pagination: { currentPage: 1, totalNumber: 2 } },
    unallocated: { hearings: [] } as UnallocatedHearings,
    allocated: [],
    lastAllocatedHearing: null,
    restrictedHearing: null,
    restrictListExpanded: null,
    available: null,
    weekcommencingHearing: null,
    publishCourtListStatuses: null,
    scheduledHearingForAllocation: null,
    hearingSchedule: null,
    editAllocationError: null
  } as HearingState;

  it('should not return any unallocated hearings when none have been listed', () => {
    const state = mockedHearingState;
    const zeroUnallocatedHearings = [];
    const actual = hearingLegacyReducer(
      state,
      new ListUnallocatedHearingsSuccessAction({
        hearings: zeroUnallocatedHearings
      } as UnallocatedHearings)
    );
    expect(actual.unallocated.hearings.length).toBe(0);
  });

  it('should not return any unscheduled hearings when none have been listed', () => {
    const state = mockedHearingState;
    const actual = hearingLegacyReducer(
      state,
      new ListUnscheduledHearingsSuccessAction({
        hearings: [],
        pagination: { pageCount: 0, totalNumber: 0 }
      })
    );
    expect(actual.unscheduled.hearings.length).toBe(0);
  });

  it('should return all unallocated that have been listed', () => {
    const state = mockedHearingState;
    const actual = hearingLegacyReducer(
      state,
      new ListUnallocatedHearingsSuccessAction({
        hearings: [validHearingMock1, validHearingMock2]
      } as UnallocatedHearings)
    );
    expect(actual.unallocated.hearings.length).toBe(2);
    expect(actual.unallocated.hearings[0]).toBe(validHearingMock1);
  });

  it('should return all unscheduled that have been listed', () => {
    const state = mockedHearingState;
    const actual = hearingLegacyReducer(
      state,
      new ListUnscheduledHearingsSuccessAction({
        hearings: [validHearingMock1, validHearingMock2],
        pagination: { pageCount: 0, totalNumber: 0 }
      })
    );
    expect(actual.unscheduled.hearings.length).toBe(2);
    expect(actual.unscheduled.hearings[0]).toBe(validHearingMock1);
  });

  it('should clear all unallocated hearings', () => {
    const state = {
      unallocated: {
        hearings: [validHearingMock1, validHearingMock2],
        pagination: { currentPage: 2 }
      },
      allocated: [],
      unscheduled: { hearings: [] },
      lastAllocatedHearing: null,
      restrictedHearing: null,
      restrictListExpanded: null,
      available: null,
      weekcommencingHearing: null,
      publishCourtListStatuses: null,
      scheduledHearingForAllocation: null,
      hearingSchedule: null
    } as HearingState;
    const actual = hearingLegacyReducer(state, new ClearUnallocatedHearingsAction());
    expect(actual.unallocated.hearings.length).toBe(0);
    expect(actual.unallocated.pagination.currentPage).toBe(2);
  });

  it('should clear all unscheduled hearings', () => {
    const state = {
      unscheduled: {
        hearings: [validHearingMock1, validHearingMock2],
        pagination: { currentPage: 5 }
      },
      allocated: [],
      unallocated: { hearings: [] } as UnallocatedHearings,
      lastAllocatedHearing: null,
      restrictedHearing: null,
      restrictListExpanded: null,
      available: null,
      weekcommencingHearing: null,
      publishCourtListStatuses: null,
      scheduledHearingForAllocation: null,
      hearingSchedule: null
    } as HearingState;
    const actual = hearingLegacyReducer(state, new ClearUnscheduledHearingsAction());
    expect(actual.unscheduled.hearings.length).toBe(0);
    expect(actual.unscheduled.pagination.currentPage).toBe(5);
  });

  it('should return all allocated hearings that have been searched for', () => {
    const state = mockedHearingState;
    const actual = hearingLegacyReducer(
      state,
      new SearchAllocatedHearingsSuccessAction([validHearingMock1, validHearingMock2])
    );
    expect(actual.allocated.length).toBe(2);
    expect(actual.allocated[0]).toBe(validHearingMock1);
  });

  it('should clear the last allocated hearing', () => {
    const state = {
      unallocated: { hearings: [] } as UnallocatedHearings,
      allocated: [],
      unscheduled: { hearings: [] },
      lastAllocatedHearing: {
        availableHearing: true,
        hearing: validHearingMock1
      } as LastAllocatedHearing,
      restrictedHearing: null,
      restrictListExpanded: null,
      available: null,
      weekcommencingHearing: null,
      publishCourtListStatuses: null,
      scheduledHearingForAllocation: null,
      hearingSchedule: null
    } as HearingState;
    const actual = hearingLegacyReducer(state, new ClearLastAllocatedHearingAction());
    expect(actual.lastAllocatedHearing).toBeNull();
  });

  it('should update the sequences for allocated hearings', () => {
    const state = {
      unallocated: { hearings: [] } as UnallocatedHearings,
      allocated: [validHearingMock1, validHearingMock2],
      unscheduled: { hearings: [] },
      lastAllocatedHearing: null,
      restrictedHearing: null,
      restrictListExpanded: null,
      available: null,
      weekcommencingHearing: null,
      publishCourtListStatuses: null,
      scheduledHearingForAllocation: null,
      hearingSchedule: null
    } as HearingState;
    const action = new SequenceHearingSuccessAction({ hearings: sequenceMock });
    const updatedState = hearingLegacyReducer(state, action);
    expect(updatedState.allocated).toMatchSnapshot();
  });

  it('should update the judiciary for allocated hearings', () => {
    const judge = {
      judicialId: '19ffac44-3533-410d-868e-81cf825844b6',
      judicialRoleType: { judiciaryType: 'CIRCUIT_JUDGE' } as JudicialRoleType,
      judicialMember: {
        id: '19ffac44-3533-410d-868e-81cf825844b6',
        forenames: 'Lord Fabio',
        surname: 'Tisci'
      } as JudicialMember
    };

    const recorder = {
      judicialId: '328bfc4e-e661-470e-ac7d-35809a4bb298',
      judicialRoleType: { judiciaryType: 'RECORDER' } as JudicialRoleType,
      judicialMember: {
        id: '328bfc4e-e661-470e-ac7d-35809a4bb298',
        forenames: 'Corporal Fabiano',
        surname: 'Tiscman'
      } as JudicialMember
    };

    validHearingMock1.judiciary = [judge];

    const state = {
      unscheduled: { hearings: [] },
      unallocated: { hearings: [] },
      allocated: [validHearingMock1],
      lastAllocatedHearing: null,
      restrictedHearing: null,
      restrictListExpanded: null,
      available: null,
      weekcommencingHearing: null,
      publishCourtListStatuses: null,
      scheduledHearingForAllocation: null,
      hearingSchedule: null
    } as HearingState;
    const action = new ChangeJudicaryForHearingsSuccessAction({
      hearings: [validHearingMock1],
      judiciary: [recorder]
    });
    const updatedState = hearingLegacyReducer(state, action);

    expect(updatedState.allocated[0].judiciary).toEqual([recorder]);
    expect(updatedState.allocated).toMatchSnapshot();
  });

  it('should return rstricted hearing from allocated hearings', () => {
    const state = mockedHearingState;
    const actual = hearingLegacyReducer(
      state,
      new SearchAllocatedHearingsSuccessAction([validHearingMock1, validHearingMock2])
    );
    expect(actual.allocated.length).toBe(2);
    const courtRestriction: CourtRestriction = {
      hearingId: 'b1bfe644-15d3-46aa-bdeb-fe8d18c16a42',
      caseIds: ['123456'],
      restrictCourtList: true
    };
    const stateAfterTrestriction = hearingLegacyReducer(
      actual,
      new CourtRestrictionSuccessAction({ courtRestriction })
    );
    expect(stateAfterTrestriction.restrictedHearing.id).toBe(validHearingMock1.id);
  });

  it('should return hearings for week commencing', () => {
    const state = mockedHearingState;
    const weekcommencingHearing = {
      ...validHearingMock1,
      weekCommencingStartDate: '2018-10-05',
      weekCommencingEndDate: '2018-10-05',
      startDate: null,
      endDate: null
    };
    const actual = hearingLegacyReducer(
      state,
      new WeekCommencingHearingSearchSuccessAction({
        hearings: [weekcommencingHearing, validHearingMock2]
      } as PaginatedHearings)
    );
    expect(actual.weekcommencingHearing.hearings[0].id).toBe(validHearingMock1.id);
  });

  it('should get Court List Publish statuses on GetPublishListStatusSuccessAction ', () => {
    const state = {
      ...mockedHearingState,
      publishCourtListStatuses: []
    };
    const warnStatus = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListType: PublishCourtListType.Warn,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'SUCCESS',
      failureMessage: ''
    };
    const firmStatus = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListType: PublishCourtListType.Firm,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'SUCCESS',
      failureMessage: ''
    };
    const finalStatus = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListType: PublishCourtListType.Final,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'SUCCESS',
      failureMessage: ''
    };

    const draftStatus = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListType: PublishCourtListType.Final,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'SUCCESS',
      failureMessage: ''
    };
    const statusItems = [warnStatus, firmStatus, finalStatus, draftStatus];
    const actual = hearingLegacyReducer(state, new GetPublishListStatusSuccessAction(statusItems));
    expect(actual.publishCourtListStatuses.length).toBe(4);
  });

  it('should update Court List Publish status on SetPublishListStatusSuccessAction ', () => {
    const state = {
      ...mockedHearingState,
      publishCourtListStatuses: [
        {
          courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
          publishCourtListType: PublishCourtListType.Warn,
          lastUpdated: '12-12-2022 12:12:00',
          publishStatus: '',
          failureMessage: ''
        }
      ]
    };
    const optomisticStatus = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListType: PublishCourtListType.Warn,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'a new status',
      failureMessage: ''
    };

    const actual = hearingLegacyReducer(
      state,
      new SetPublishListStatusSuccessAction(optomisticStatus)
    );
    let nowMoment = moment().utc().format();
    nowMoment = nowMoment.substring(0, nowMoment.lastIndexOf(':'));
    const lastUpdatedStateValue = actual.publishCourtListStatuses[0].lastUpdated;
    const stateValueWithoutSeconds = lastUpdatedStateValue.substring(
      0,
      lastUpdatedStateValue.lastIndexOf(':')
    );
    expect(stateValueWithoutSeconds).toBe(nowMoment);
  });

  it('should update the correct status statuses on SetPublishListStatusSuccessAction ', () => {
    const state = {
      ...mockedHearingState,
      publishCourtListStatuses: []
    };
    const warnStatus = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListType: PublishCourtListType.Warn,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'SUCCESS',
      failureMessage: ''
    };
    const firmStatus = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListType: PublishCourtListType.Firm,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'SUCCESS',
      failureMessage: ''
    };
    const finalStatus = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListType: PublishCourtListType.Final,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'SUCCESS',
      failureMessage: ''
    };

    const draftStatus = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListType: PublishCourtListType.Final,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'SUCCESS',
      failureMessage: ''
    };
    const publishCourtListStatuses = [warnStatus, firmStatus, finalStatus, draftStatus];
    const stateWithPublishListStatus = { ...state, publishCourtListStatuses };
    const newDraftStatus = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListType: PublishCourtListType.Draft,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'SUCCESS FOR NEW DRAFT STATUS',
      failureMessage: ''
    };
    const actual = hearingLegacyReducer(
      stateWithPublishListStatus,
      new SetPublishListStatusSuccessAction(newDraftStatus)
    );

    const updatedDraftStatus = actual.publishCourtListStatuses.find(
      (s) => s.publishCourtListType === PublishCourtListType.Draft
    );
    expect(updatedDraftStatus.publishStatus).toBe('SUCCESS FOR NEW DRAFT STATUS');

    const newFinalStatus = {
      courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
      publishCourtListType: PublishCourtListType.Final,
      lastUpdated: '12-12-2022 12:42:00',
      publishStatus: 'SUCCESS FOR NEW FINAL STATUS',
      failureMessage: ''
    };

    const actualAfterFinal = hearingLegacyReducer(
      stateWithPublishListStatus,
      new SetPublishListStatusSuccessAction(newFinalStatus)
    );
    const updatedFinalStatus = actualAfterFinal.publishCourtListStatuses.find(
      (s) => s.publishCourtListType === PublishCourtListType.Final
    );

    expect(updatedFinalStatus.publishStatus).toBe('SUCCESS FOR NEW FINAL STATUS');
  });

  it('should update editAllocationError', () => {
    const editAllocationError: ValidationError = { id: 'id', message: 'message' };
    const state = {
      ...mockedHearingState,
      editAllocationError
    };

    const actualState = hearingReducer(state, setEditAllocationError({ editAllocationError }));

    expect(actualState.editAllocationError).toEqual(editAllocationError);
  });

  it('should update hearingToEditAllocation', () => {
    const hearingToEditAllocation: Hearing = testHearing;
    const state = {
      ...mockedHearingState,
      allocated: [testHearing],
      hearingToEditAllocation
    };

    const actualState = hearingReducer(
      state,
      setHearingToEditAllocation({ hearingToEditAllocation })
    );

    expect(actualState.hearingToEditAllocation).toEqual(hearingToEditAllocation);
  });
});
