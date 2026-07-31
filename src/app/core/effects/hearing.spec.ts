import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { JudicialMember, OrganisationUnit, ReferenceDataActions } from '@cpp/reference-data';
import { UsersGroupsService } from '@cpp/users-groups';
import { Action, provideStore, Store } from '@ngrx/store';
import * as FileSaver from 'file-saver';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of } from 'rxjs';
import { editAllocationError, selectedOptionsMock } from '../../../mock-data/test-fixtures';
import { TypeOfListSummary } from '../../unscheduled-listings/unscheduled-listings.interfaces';
import {
  AllocateHearingAction,
  AllocateHearingSuccessAction,
  ApiError,
  ChangeJudicaryForHearingsAction,
  CourtRestrictionAction,
  CourtRestrictionSuccessAction,
  DownloadListAction,
  ListUnallocatedHearingsAction,
  ListUnallocatedHearingsSuccessAction,
  ListUnscheduledHearingsAction,
  ListUnscheduledHearingsSuccessAction,
  SearchAllocatedHearingsAction,
  SearchAllocatedHearingsByDateRangeAction,
  SearchAllocatedHearingsByDateRangeSuccessAction,
  SearchAllocatedHearingsSuccessAction,
  SequenceHearingAction,
  SequenceHearingSuccessAction,
  setEditAllocationError,
  setHearingToEditAllocation,
  ShowUnallocatedHearingsAction,
  ShowUnscheduledHearingsAction,
  TypeOfListAction,
  TypeOfListActionSuccess,
  UpdateAllocatedHearingAction,
  UpdateAllocatedHearingSuccessAction
} from '../actions';
import {
  ChangeJudicaryForHearingsSuccessAction,
  DownloadListSuccessAction,
  downloadPrisonListAction,
  downloadPrisonListSuccessAction,
  GetPublishListStatusAction,
  GetPublishListStatusSuccessAction,
  ScheduledAllocateHearingAction,
  SearchAvailableHearingsAction,
  SearchAvailableHearingsSuccessAction,
  SetPublishListStatusAction,
  SetPublishListStatusSuccessAction,
  downloadUpcomingHearingsAction,
  downloadUpcomingHearingsSuccessAction,
  UpdateAdjournedHearingJudiciaryAction,
  WeekCommencingHearingSearchAction,
  WeekCommencingHearingSearchSuccessAction
} from '../actions/hearing';
import { LoadJudiciariesSuccessAction } from '../actions/reference-data';
import {
  AllocatingHearingDetailsWithCourtCentre,
  CourtCentre,
  CourtRestriction,
  ExtendedJudicialRole,
  Hearing as LocalHearing,
  HearingWithSelectedCourtCentre,
  JurisdictionType,
  PaginatedHearings,
  PublishCourtListType,
  SearchAvailableHearingsFormOptions,
  SearchCriteriaAvailableHearingsType,
  SelectedFilterOptions,
  SequenceHearing
} from '../model';
import { reducers } from '../reducers';
import { HearingSearchService, ListingService } from '../services';
import { permissions } from '../services/listing/mocks';
import { HearingEffects } from './hearing';
import { prosecutionCaseIds, testHearing } from './mocks';
import { provideMockActions } from '@ngrx/effects/testing';
import {
  deleteListingNote as deleteListingNoteAction,
  createListingNoteSuccess,
  deleteListingNoteSuccess,
  ListingNote,
  loadListingNotes as loadListingNotesAction,
  SchedulingService,
  updateListingNote as updateListingNoteAction,
  updateListingNoteSuccess,
  createListingNote as createListingNoteAction,
  ListingNotesService
} from '@cpp/scheduling';
import { CppHttp } from '@cpp/core';
import { CourtListType } from '../../create-a-list/models/mags-publish-list.dto';

jest.mock('file-saver', () => ({ saveAs: jest.fn() }));

const courtCentre: CourtCentre = {
  id: '1',
  name: 'test',
  courtRooms: [],
  defaultStartTime: '10.00',
  defaultDuration: '7:00',
  courtCode: 'CODE'
};

const testTypeOfList: TypeOfListSummary[] = [
  {
    value: 'c98cb51f-8639-49c1-91f0-a7e820c34355',
    label: 'Warrant for arrest without bail'
  },
  {
    value: 'ed34136f-2a13-45a4-8d4f-27075ae3a8a9',
    label: 'Warrant for arrest for community penalty without bail'
  }
];

describe('Hearing effects', () => {
  let actions$ = new Observable<Action>();
  let effects: HearingEffects;

  let getAllocatedHearings: jasmine.Spy;
  let getUnallocatedHearings: jasmine.Spy;
  let updateAllocatedHearing: jasmine.Spy;
  let getUnscheduledHearings: jasmine.Spy;
  let getTypeOfList: jasmine.Spy;
  let hearingSearchService: jasmine.Spy;
  let searchHearingsWithTimeRange: jasmine.Spy;
  let sequenceHearings: jasmine.Spy;
  let changeJudiciaryForHearings: jasmine.Spy;
  let downloadCourtList: jasmine.Spy;
  let publishCourtListStatus: jasmine.Spy;
  let updateCourtRestrictionsSync: jasmine.Spy;
  let allocateHearing: jasmine.Spy;
  let searchAvailableHearings: jasmine.Spy;
  let retrieveLatestCourtListStatus: jasmine.Spy;
  let getTrialTypes: jasmine.Spy;
  let vacateTrial: jasmine.Spy;
  let fetchHearingById: jasmine.Spy;
  let extractProsecutionCasesIdsFromHearing: jasmine.Spy;
  let updateUnallocatedHearing: jasmine.Spy;
  let createListingNotes: jasmine.Spy;
  let updateListingNote: jasmine.Spy;
  let deleteListingNote: jasmine.Spy;
  let sendEmailNotification: jasmine.Spy;
  let grantBulkJudiciaryPermission: jasmine.Spy;
  let revokeBulkJudiciaryPermission: jasmine.Spy;
  let store;
  let navigate: jest.Mock;
  let getPermissionsBy: jasmine.Spy;
  let downloadPrisonList: jasmine.Spy;
  let searchHearingSlots: jasmine.Spy;
  let downloadUpcomingHearings: jasmine.Spy;

  beforeEach(() => {
    getAllocatedHearings = jasmine.createSpy('getAllocatedHearings');
    getUnallocatedHearings = jasmine.createSpy('getUnallocatedHearings');
    getUnscheduledHearings = jasmine.createSpy('getUnscheduledHearings');
    getTypeOfList = jasmine.createSpy('getTypeOfList');
    searchHearingsWithTimeRange = jasmine.createSpy('searchHearingsWithTimeRange');
    updateAllocatedHearing = jasmine.createSpy('updateAllocatedHearing');
    hearingSearchService = jasmine.createSpy('hearingSearchService');
    sequenceHearings = jasmine.createSpy('sequenceHearings');
    changeJudiciaryForHearings = jasmine.createSpy('changeJudiciaryForHearings');
    downloadCourtList = jasmine.createSpy('downloadCourtList');
    updateCourtRestrictionsSync = jasmine.createSpy('updateCourtRestrictionsSync');
    allocateHearing = jasmine.createSpy('allocateHearing');
    searchAvailableHearings = jasmine.createSpy('searchAvailableHearings');
    publishCourtListStatus = jasmine.createSpy('publishCourtListStatus');
    retrieveLatestCourtListStatus = jasmine.createSpy('retrieveLatestCourtListStatus');
    getTrialTypes = jasmine.createSpy('getTrialTypes');
    vacateTrial = jasmine.createSpy('vacateTrial');
    fetchHearingById = jasmine.createSpy('fetchHearingById');
    extractProsecutionCasesIdsFromHearing = jasmine
      .createSpy('extractProsecutionCasesIdsFromHearing')
      .and.returnValue(prosecutionCaseIds);
    updateUnallocatedHearing = jasmine.createSpy('updateUnallocatedHearing');
    createListingNotes = jasmine.createSpy('createListingNotes');
    updateListingNote = jasmine.createSpy('updateListingNote');
    deleteListingNote = jasmine.createSpy('deleteListingNote');
    sendEmailNotification = jasmine.createSpy('sendEmailNotification');
    grantBulkJudiciaryPermission = jasmine.createSpy('grantBulkJudiciaryPermission');
    revokeBulkJudiciaryPermission = jasmine.createSpy('revokeBulkJudiciaryPermission');
    getPermissionsBy = jasmine.createSpy('getPermissionsBy');
    downloadPrisonList = jasmine.createSpy('downloadPrisonList');
    searchHearingSlots = jasmine.createSpy('searchHearingSlots');
    downloadUpcomingHearings = jasmine.createSpy('downloadUpcomingHearings');
    navigate = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        provideStore(reducers, { runtimeChecks: {} }),
        provideMockActions(() => actions$),
        HearingEffects,
        {
          provide: ListingService,
          useValue: {
            getAllocatedHearings,
            getUnallocatedHearings,
            updateAllocatedHearing,
            getUnscheduledHearings,
            getTypeOfList,
            searchHearingsWithTimeRange,
            hearingSearchService,
            sequenceHearings,
            changeJudiciaryForHearings,
            downloadCourtList,
            updateCourtRestrictionsSync,
            allocateHearing,
            updateUnallocatedHearing,
            searchAvailableHearings,
            publishCourtListStatus,
            retrieveLatestCourtListStatus,
            getTrialTypes,
            vacateTrial,
            fetchHearingById,
            extractProsecutionCasesIdsFromHearing,
            sendEmailNotification,
            grantBulkJudiciaryPermission,
            revokeBulkJudiciaryPermission,
            downloadPrisonList,
            downloadUpcomingHearings
          }
        },
        {
          provide: SchedulingService,
          useValue: {
            searchHearingSlots
          }
        },
        {
          provide: ListingNotesService,
          useValue: {
            createListingNotes,
            updateListingNote,
            deleteListingNote
          }
        },
        {
          provide: CppHttp,
          useValue: {
            query: jasmine.createSpy(),
            commandSync: jasmine.createSpy()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: { isUnscheduled: false } } }
        },
        {
          provide: HearingSearchService,
          useValue: {
            searchHearingsWithTimeRange,
            getAllocatedHearings
          }
        },
        {
          provide: Router,
          useValue: {
            navigate
          }
        },
        {
          provide: UsersGroupsService,
          useValue: {
            getPermissionsBy
          }
        }
      ],
      teardown: { destroyAfterEach: false }
    });

    // actions$ = TestBed.inject(TestHotObservable);
    effects = TestBed.inject(HearingEffects);
    store = TestBed.inject(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  describe('listUnallocatedHearings$', () => {
    const listUnallocatedHearings = new ListUnallocatedHearingsAction({
      courtCentreId: courtCentre.id,
      pageNumber: 1
    });

    it('should fetch the list of unallocated hearings', () => {
      const judicialMembers = [{ id: '1' }, { id: '2' }] as JudicialMember[];
      const hearings = {
        pageCount: 2,
        results: 100,
        hearings: [
          { id: 'a', judiciary: [{ judicialId: '1', judicialMember: judicialMembers[0] }] },
          { id: 'b', judiciary: [{ judicialId: '2', judicialMember: judicialMembers[1] }] }
        ] as LocalHearing[]
      };
      const listUnallocatedHearingsSuccess = new ListUnallocatedHearingsSuccessAction({
        hearings: [
          {
            id: 'a',
            judiciary: [{ judicialId: '1', judicialMember: judicialMembers[0] }]
          },
          {
            id: 'b',
            judiciary: [{ judicialId: '2', judicialMember: judicialMembers[1] }]
          }
        ] as LocalHearing[],
        pagination: {
          currentPage: 1,
          pageCount: 2,
          totalNumber: 100
        }
      });
      const showUnallocatedHearings = new ShowUnallocatedHearingsAction(true);

      actions$ = hot('-a', { a: listUnallocatedHearings });
      const hearings$ = cold('-(b|)', { b: hearings });
      const expected$ = cold('--(xy)', {
        x: listUnallocatedHearingsSuccess,
        y: showUnallocatedHearings
      });

      getUnallocatedHearings.and.returnValue(hearings$);

      expect(effects.listUnallocatedHearings$).toBeObservable(expected$);

      expect(getUnallocatedHearings).toHaveBeenCalledWith({
        courtCentreId: courtCentre.id,
        pageNumber: 1
      });
    });

    it('should handle an api error from fetching the unallocated hearings', () => {
      const error = { status: 500 };
      const apiError = new ApiError(error);

      actions$ = hot('-a', { a: listUnallocatedHearings });
      const hearings$ = cold('#', null, error);
      const expected$ = cold('-b', { b: apiError });

      getUnallocatedHearings.and.returnValue(hearings$);

      expect(effects.listUnallocatedHearings$).toBeObservable(expected$);
    });
  });

  describe('listUnscheduledHearings$', () => {
    const listUnscheduledAction = new ListUnscheduledHearingsAction({
      courtCentreId: courtCentre.id
    });

    it('should fetch the list of unscheduled hearings', () => {
      const judicialMembers = [{ id: '1' }, { id: '2' }] as JudicialMember[];
      const hearings = {
        pageCount: 1,
        results: 50,
        hearings: [
          { id: 'a', judiciary: [{ judicialId: '1', judicialMember: judicialMembers[0] }] },
          { id: 'b', judiciary: [{ judicialId: '2', judicialMember: judicialMembers[1] }] }
        ] as LocalHearing[]
      };

      const listUnscheduledActionSuccess = new ListUnscheduledHearingsSuccessAction({
        hearings: [
          {
            id: 'a',
            judiciary: [{ judicialId: '1', judicialMember: judicialMembers[0] }]
          },
          {
            id: 'b',
            judiciary: [{ judicialId: '2', judicialMember: judicialMembers[1] }]
          }
        ] as LocalHearing[],
        pagination: { pageCount: 1, totalNumber: 50 }
      });
      const showUnscheduledHearingsAction = new ShowUnscheduledHearingsAction(true);

      actions$ = hot('-a', { a: listUnscheduledAction });
      const hearings$ = cold('(b|)', { b: hearings });
      const expected$ = cold('-(xy)', {
        x: listUnscheduledActionSuccess,
        y: showUnscheduledHearingsAction
      });

      getUnscheduledHearings.and.returnValue(hearings$);

      expect(effects.listUnscheduledHearings$).toBeObservable(expected$);

      expect(getUnscheduledHearings).toHaveBeenCalledWith({ courtCentreId: courtCentre.id });
    });

    it('should handle an api error from fetching the unscheduled hearings', () => {
      const error = { status: 500 };
      const apiError = new ApiError(error);

      actions$ = hot('a', { a: listUnscheduledAction });
      const hearings$ = cold('#', null, error);
      const expected$ = cold('b', { b: apiError });

      getUnscheduledHearings.and.returnValue(hearings$);

      expect(effects.listUnscheduledHearings$).toBeObservable(expected$);
    });
  });

  describe('typeOfList$', () => {
    it('should get the data from api', () => {
      const inputAction = new TypeOfListAction();
      const outputAction = new TypeOfListActionSuccess(testTypeOfList);

      actions$ = hot('-a--', { a: inputAction });
      const populateTypeOfList = cold('-b|', { b: testTypeOfList });
      const expected$ = cold('--(c)-', {
        c: outputAction
      });

      getTypeOfList.and.returnValue(populateTypeOfList);

      expect(effects.typeOfList$).toBeObservable(expected$);
    });
  });

  describe('allocateHearing$', () => {
    it('should allocate hearing', () => {
      store.dispatch(new ScheduledAllocateHearingAction(testHearing));

      const inputAction = new AllocateHearingAction({
        originHearing: testHearing,
        updatedHearing: testHearing
      });
      const { payload } = inputAction;

      const outputAction = new AllocateHearingSuccessAction();

      actions$ = hot('-a---------', { a: inputAction });
      const allocate$ = cold('---(b|)', { b: testHearing });
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const expected$ = cold('----f', {
        f: outputAction
      });

      allocateHearing.and.returnValue(allocate$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.allocateHearing$).toBeObservable(expected$);
      expect(allocateHearing).toHaveBeenCalledWith(
        {
          courtCentreId: payload.originHearing.courtCentreId,
          courtRoomId: payload.originHearing.courtRoomId,
          endDate: payload.originHearing.endDate,
          hearingId: payload.originHearing.id,
          hearingLanguage: payload.originHearing.hearingLanguage,
          judiciary: payload.originHearing.judiciary,
          jurisdictionType: payload.originHearing.jurisdictionType,
          nonDefaultDays: payload.originHearing.nonDefaultDays,
          nonSittingDays: payload.originHearing.nonSittingDays,
          prosecutionCases: prosecutionCaseIds,
          startDate: payload.originHearing.startDate,
          publicListNote: payload.originHearing.publicListNote,
          hasVideoLink: payload.originHearing.hasVideoLink,
          type: payload.originHearing.type
        },
        false
      );
      expect(navigate).toHaveBeenCalledWith(['/unallocated']);
    });

    it('should update a week commencing hearing', () => {
      store.dispatch(new ScheduledAllocateHearingAction(testHearing));

      const inputAction = new AllocateHearingAction({
        originHearing: testHearing,
        updatedHearing: { ...testHearing, weekCommencingStartDate: '2020-01-01' }
      });
      const outputAction = new AllocateHearingSuccessAction();

      actions$ = hot('-a---------', { a: inputAction });
      const updatedHearing = cold('---(b|)', { b: testHearing });
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const expected$ = cold('----(f)', {
        f: outputAction
      });

      updateUnallocatedHearing.and.returnValue(updatedHearing);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.allocateHearing$).toBeObservable(expected$);
      expect(updateUnallocatedHearing).toHaveBeenCalledWith(
        inputAction.payload.updatedHearing,
        prosecutionCaseIds,
        false
      );
      expect(navigate).toHaveBeenCalledWith(['/unallocated']);
    });

    it('should grant permission and send notification if any DDJ is selected as judiciary', () => {
      store.dispatch(new ScheduledAllocateHearingAction(testHearing));

      const updatedHearing = {
        ...testHearing,
        judiciary: [
          {
            isDeputy: true,
            judicialId: '19ffac44-3533-410d-868e-81cf825844b6',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'DEPUTY_DISTRICT_JUDGE' },
            judicialMember: {
              id: '1',
              seqId: 1,
              surname: 'Jones',
              forenames: 'John',
              judiciaryType: 'Deputy District Judge (MC)- Fee paid',
              emailAddress: 'address1'
            }
          }
        ]
      } as LocalHearing;

      const inputAction = new AllocateHearingAction({
        originHearing: testHearing,
        updatedHearing
      });

      const outputAction = new AllocateHearingSuccessAction();
      const { payload } = inputAction;

      actions$ = hot(' -a-----', { a: inputAction });
      const allocate$ = cold(' --(b|)', { b: testHearing });
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const expected$ = cold('---f', {
        f: outputAction
      });

      allocateHearing.and.returnValue(allocate$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.allocateHearing$).toBeObservable(expected$);
      expect(revokeBulkJudiciaryPermission).toHaveBeenCalledTimes(1);
      expect(revokeBulkJudiciaryPermission).toHaveBeenCalledWith(
        [payload.originHearing],
        payload.originHearing.judiciary[0].judicialRoleType.judiciaryType
      );
      expect(sendEmailNotification).toHaveBeenCalledWith(
        [payload.updatedHearing],
        payload.updatedHearing.judiciary,
        payload.updatedHearing.judiciary[0].judicialRoleType.judiciaryType
      );
      expect(grantBulkJudiciaryPermission).toHaveBeenCalledWith(
        [payload.originHearing],
        payload.updatedHearing.judiciary
      );
    });

    it('should revoke permission and grant new permission with sending notification for new DDJ if selected DDJ is changed', () => {
      store.dispatch(new ScheduledAllocateHearingAction(testHearing));

      const originHearing = {
        ...testHearing,
        judiciary: [
          {
            isDeputy: true,
            judicialId: 'id-1',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'DEPUTY_DISTRICT_JUDGE' },
            judicialMember: {
              id: 'id-1',
              seqId: 1,
              surname: 'Jones',
              forenames: 'John',
              judiciaryType: 'Deputy District Judge (MC)- Fee paid',
              emailAddress: 'address1'
            }
          }
        ]
      } as LocalHearing;

      const updatedHearing = {
        ...testHearing,
        judiciary: [
          {
            isDeputy: true,
            judicialId: 'id-2',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'DEPUTY_DISTRICT_JUDGE' },
            judicialMember: {
              id: 'id-2',
              seqId: 1,
              surname: 'Does',
              forenames: 'Mike',
              judiciaryType: 'Deputy District Judge (MC)- Fee paid',
              emailAddress: 'address2'
            }
          }
        ]
      } as LocalHearing;

      const inputAction = new AllocateHearingAction({
        originHearing,
        updatedHearing
      });

      const outputAction = new AllocateHearingSuccessAction();
      const { payload } = inputAction;

      actions$ = hot(' -a-----', { a: inputAction });
      const allocate$ = cold(' --(b|)', { b: testHearing });
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const expected$ = cold('-----f', {
        f: outputAction
      });

      allocateHearing.and.returnValue(allocate$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.allocateHearing$).toBeObservable(expected$);
      expect(revokeBulkJudiciaryPermission).toHaveBeenCalledWith(
        [payload.originHearing],
        payload.originHearing.judiciary[0].judicialRoleType.judiciaryType
      );
      expect(sendEmailNotification).toHaveBeenCalledTimes(1);
      expect(sendEmailNotification).toHaveBeenCalledWith(
        [payload.updatedHearing],
        payload.updatedHearing.judiciary,
        payload.updatedHearing.judiciary[0].judicialRoleType.judiciaryType
      );
      expect(grantBulkJudiciaryPermission).toHaveBeenCalledWith(
        [payload.originHearing],
        payload.updatedHearing.judiciary
      );
    });

    it('should revoke permission and do not send notification if already selected DDJ is removed', () => {
      store.dispatch(new ScheduledAllocateHearingAction(testHearing));

      const originHearing = {
        ...testHearing,
        judiciary: [
          {
            isDeputy: true,
            judicialId: 'id-1',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'DEPUTY_DISTRICT_JUDGE' },
            judicialMember: {
              id: 'id-1',
              seqId: 1,
              surname: 'Jones',
              forenames: 'John',
              judiciaryType: 'Deputy District Judge (MC)- Fee paid',
              emailAddress: 'address1'
            }
          }
        ]
      } as LocalHearing;

      const updatedHearing = {
        ...testHearing,
        judiciary: []
      } as LocalHearing;

      const inputAction = new AllocateHearingAction({
        originHearing,
        updatedHearing
      });

      const outputAction = new AllocateHearingSuccessAction();
      const { payload } = inputAction;

      actions$ = hot(' -a-----', { a: inputAction });
      const allocate$ = cold(' --(b|)', { b: testHearing });
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const expected$ = cold('---f', {
        f: outputAction
      });

      allocateHearing.and.returnValue(allocate$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.allocateHearing$).toBeObservable(expected$);
      expect(revokeBulkJudiciaryPermission).toHaveBeenCalledWith(
        [payload.originHearing],
        payload.originHearing.judiciary[0].judicialRoleType.judiciaryType
      );
      expect(sendEmailNotification).not.toHaveBeenCalled();
      expect(grantBulkJudiciaryPermission).not.toHaveBeenCalled();
    });

    it('should handle an api error from allocating the hearing', () => {
      store.dispatch(new ScheduledAllocateHearingAction(testHearing));

      const inputAction = new AllocateHearingAction({
        originHearing: testHearing,
        updatedHearing: testHearing
      });
      const error = { status: 500 };
      const apiError = new ApiError(error);

      actions$ = hot('-a-', { a: inputAction });
      const update$ = cold('-#', null, error);
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const expected$ = cold('--b', { b: apiError });

      allocateHearing.and.returnValue(update$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.allocateHearing$).toBeObservable(expected$);
      expect(navigate);
    });
  });

  describe('updateAdjournedHearingJudiciary$ for DDJ', () => {
    const ddjs = [
      {
        id: 'some-id',
        cpUserId: 'cp-user-id',
        seqId: 1,
        emailAddress: 'address@adress',
        surname: 'Surname',
        forenames: 'Firstname middlename',
        judiciaryType: 'Deputy District Judge (MC)- Fee paid'
      },
      {
        id: 'some-id2',
        cpUserId: 'cp-user-id2',
        seqId: 1,
        emailAddress: 'address2@adress',
        surname: 'Surname2',
        forenames: 'Firstname2 middlename2',
        judiciaryType: 'Deputy District Judge (MC)- Fee paid'
      }
    ] as JudicialMember[];

    it('should grant permission for adjourned hearing cases if hearing 1 is already has DDJ', () => {
      const hearing1 = {
        ...testHearing,
        judiciary: [
          {
            isDeputy: true,
            judicialId: '1',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'DEPUTY_DISTRICT_JUDGE' },
            judicialMember: {
              id: '1',
              seqId: 1,
              surname: 'Jones',
              forenames: 'John',
              judiciaryType: 'Deputy District Judge (MC)- Fee paid',
              emailAddress: 'address1'
            }
          }
        ]
      } as LocalHearing;

      const adjournedHearing = {
        ...testHearing,
        adjournedFromDate: '01-01-2021',
        judiciary: []
      } as LocalHearing;

      store.dispatch(new SearchAllocatedHearingsSuccessAction([hearing1, adjournedHearing]));
      store.dispatch(new LoadJudiciariesSuccessAction(ddjs));

      const expectedHearing = {
        ...adjournedHearing,
        judiciary: [
          ...adjournedHearing.judiciary,
          ...[
            {
              judicialId: 'some-id',
              judicialMember: {
                id: 'some-id',
                cpUserId: 'cp-user-id',
                seqId: 1,
                emailAddress: 'address@adress',
                surname: 'Surname',
                forenames: 'Firstname middlename',
                judiciaryType: 'Deputy District Judge (MC)- Fee paid'
              },
              judicialRoleType: { judiciaryType: 'DEPUTY_DISTRICT_JUDGE' }
            }
          ]
        ]
      } as LocalHearing;
      const inputAction = new UpdateAdjournedHearingJudiciaryAction();
      const successAction = new UpdateAllocatedHearingSuccessAction(expectedHearing);

      actions$ = hot(' -a-----', { a: inputAction });
      const allocate$ = cold(' --(b|)', { b: adjournedHearing });
      const permissionsByCaseId$ = cold(' --(c|)', { c: permissions.permissions });
      const expected$ = cold('---f', {
        f: successAction
      });

      allocateHearing.and.returnValue(allocate$);
      getPermissionsBy.and.returnValue(permissionsByCaseId$);
      changeJudiciaryForHearings.and.returnValue(of(null));

      expect(effects.updateAdjournedHearingJudiciary$).toBeObservable(expected$);
      expect(changeJudiciaryForHearings).toHaveBeenCalledTimes(1);
      expect(changeJudiciaryForHearings).toHaveBeenCalledWith({
        hearings: [expectedHearing.id],
        judiciary: [
          {
            judicialId: 'some-id',
            judicialRoleType: { judiciaryType: 'DEPUTY_DISTRICT_JUDGE' }
          }
        ]
      });
    });

    it('should not do anything if hearing 1 does not have any DDJ', () => {
      const hearing1 = {
        ...testHearing,
        judiciary: []
      } as LocalHearing;

      const adjournedHearing = {
        ...testHearing,
        adjournedFromDate: '01-01-2021',
        judiciary: []
      } as LocalHearing;

      store.dispatch(new SearchAllocatedHearingsSuccessAction([hearing1, adjournedHearing]));
      store.dispatch(new LoadJudiciariesSuccessAction(ddjs));

      const inputAction = new UpdateAdjournedHearingJudiciaryAction();

      actions$ = hot(' -a-----', { a: inputAction });
      const allocate$ = cold(' --(b|)', { b: adjournedHearing });
      const permissionsByCaseId$ = cold(' --(c|)', { c: [] });
      const expected$ = cold('----');

      allocateHearing.and.returnValue(allocate$);
      getPermissionsBy.and.returnValue(permissionsByCaseId$);
      changeJudiciaryForHearings.and.returnValue(of(null));

      expect(effects.updateAdjournedHearingJudiciary$).toBeObservable(expected$);
      expect(changeJudiciaryForHearings).not.toHaveBeenCalled();
    });

    it('should not do anything if adjourned hearing already has DDJ', () => {
      const hearing1 = {
        ...testHearing,
        judiciary: []
      } as LocalHearing;

      const adjournedHearing = {
        ...testHearing,
        adjournedFromDate: '01-01-2021',
        judiciary: [
          {
            isDeputy: true,
            judicialId: '1',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'DEPUTY_DISTRICT_JUDGE' },
            judicialMember: {
              id: '1',
              seqId: 1,
              surname: 'Jones',
              forenames: 'John',
              judiciaryType: 'Deputy District Judge (MC)- Fee paid',
              emailAddress: 'address1'
            }
          }
        ]
      } as LocalHearing;

      store.dispatch(new SearchAllocatedHearingsSuccessAction([hearing1, adjournedHearing]));
      store.dispatch(new LoadJudiciariesSuccessAction(ddjs));

      const inputAction = new UpdateAdjournedHearingJudiciaryAction();

      actions$ = hot(' -a-----', { a: inputAction });
      const allocate$ = cold(' --(b|)', { b: adjournedHearing });
      const permissionsByCaseId$ = cold(' --(c|)', { c: [] });
      const expected$ = cold('--');

      allocateHearing.and.returnValue(allocate$);
      getPermissionsBy.and.returnValue(permissionsByCaseId$);
      changeJudiciaryForHearings.and.returnValue(of(null));

      expect(effects.updateAdjournedHearingJudiciary$).toBeObservable(expected$);
      expect(changeJudiciaryForHearings).not.toHaveBeenCalled();
    });
  });

  describe('updateAdjournedHearingJudiciary$ for RECORDER', () => {
    const recorders = [
      {
        id: 'some-id',
        cpUserId: 'cp-user-id',
        seqId: 1,
        emailAddress: 'address@adress',
        surname: 'Surname',
        forenames: 'Firstname middlename',
        judiciaryType: 'Recorder'
      },
      {
        id: 'some-id2',
        cpUserId: 'cp-user-id2',
        seqId: 1,
        emailAddress: 'address2@adress',
        surname: 'Surname2',
        forenames: 'Firstname2 middlename2',
        judiciaryType: 'Recorder'
      }
    ] as JudicialMember[];

    it('should grant permission for adjourned hearing cases if hearing 1 is already has RECORDER', () => {
      const hearing1 = {
        ...testHearing,
        judiciary: [
          {
            isDeputy: true,
            judicialId: '1',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'RECORDER' },
            judicialMember: {
              id: '1',
              seqId: 1,
              surname: 'Jones',
              forenames: 'John',
              judiciaryType: 'Recorder',
              emailAddress: 'address1'
            }
          }
        ]
      } as LocalHearing;

      const adjournedHearing = {
        ...testHearing,
        adjournedFromDate: '01-01-2021',
        judiciary: []
      } as LocalHearing;

      const expectedHearing = {
        ...adjournedHearing,
        judiciary: [
          ...adjournedHearing.judiciary,
          ...[
            {
              judicialId: 'some-id',
              judicialMember: {
                id: 'some-id',
                cpUserId: 'cp-user-id',
                seqId: 1,
                emailAddress: 'address@adress',
                surname: 'Surname',
                forenames: 'Firstname middlename',
                judiciaryType: 'Recorder'
              },
              judicialRoleType: { judiciaryType: 'RECORDER' }
            }
          ]
        ]
      } as LocalHearing;

      store.dispatch(new SearchAllocatedHearingsSuccessAction([hearing1, adjournedHearing]));
      store.dispatch(new LoadJudiciariesSuccessAction(recorders));

      const inputAction = new UpdateAdjournedHearingJudiciaryAction();
      const successAction = new UpdateAllocatedHearingSuccessAction(expectedHearing);

      actions$ = hot(' -a-----', { a: inputAction });
      const allocate$ = cold(' --(b|)', { b: adjournedHearing });
      const permissionsByCaseId$ = cold(' --(c|)', { c: permissions.permissions });
      const expected$ = cold('---f', {
        f: successAction
      });

      allocateHearing.and.returnValue(allocate$);
      getPermissionsBy.and.returnValue(permissionsByCaseId$);
      changeJudiciaryForHearings.and.returnValue(of(null));

      expect(effects.updateAdjournedHearingJudiciary$).toBeObservable(expected$);
      expect(changeJudiciaryForHearings).toHaveBeenCalledTimes(1);
      expect(changeJudiciaryForHearings).toHaveBeenCalledWith({
        hearings: [expectedHearing.id],
        judiciary: [
          {
            judicialId: 'some-id',
            judicialRoleType: { judiciaryType: 'RECORDER' }
          }
        ]
      });
    });

    it('should not do anything if hearing 1 does not have any RECORDER', () => {
      const hearing1 = {
        ...testHearing,
        judiciary: []
      } as LocalHearing;

      const adjournedHearing = {
        ...testHearing,
        adjournedFromDate: '01-01-2021',
        judiciary: []
      } as LocalHearing;

      store.dispatch(new SearchAllocatedHearingsSuccessAction([hearing1, adjournedHearing]));
      store.dispatch(new LoadJudiciariesSuccessAction(recorders));

      const inputAction = new UpdateAdjournedHearingJudiciaryAction();

      actions$ = hot(' -a-----', { a: inputAction });
      const allocate$ = cold(' --(b|)', { b: adjournedHearing });
      const permissionsByCaseId$ = cold(' --(c|)', { c: [] });
      const expected$ = cold('----');

      allocateHearing.and.returnValue(allocate$);
      getPermissionsBy.and.returnValue(permissionsByCaseId$);
      changeJudiciaryForHearings.and.returnValue(of(null));

      expect(effects.updateAdjournedHearingJudiciary$).toBeObservable(expected$);
      expect(changeJudiciaryForHearings).not.toHaveBeenCalled();
    });

    it('should not do anything if adjourned hearing already has RECORDER', () => {
      const hearing1 = {
        ...testHearing,
        judiciary: []
      } as LocalHearing;

      const adjournedHearing = {
        ...testHearing,
        adjournedFromDate: '01-01-2021',
        judiciary: [
          {
            isDeputy: true,
            judicialId: '1',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'RECORDER' },
            judicialMember: {
              id: '1',
              seqId: 1,
              surname: 'Jones',
              forenames: 'John',
              judiciaryType: 'Recorder',
              emailAddress: 'address1'
            }
          }
        ]
      } as LocalHearing;

      store.dispatch(new SearchAllocatedHearingsSuccessAction([hearing1, adjournedHearing]));
      store.dispatch(new LoadJudiciariesSuccessAction(recorders));

      const inputAction = new UpdateAdjournedHearingJudiciaryAction();

      actions$ = hot(' -a-----', { a: inputAction });
      const allocate$ = cold(' --(b|)', { b: adjournedHearing });
      const permissionsByCaseId$ = cold(' --(c|)', { c: [] });
      const expected$ = cold('--');

      allocateHearing.and.returnValue(allocate$);
      getPermissionsBy.and.returnValue(permissionsByCaseId$);
      changeJudiciaryForHearings.and.returnValue(of(null));

      expect(effects.updateAdjournedHearingJudiciary$).toBeObservable(expected$);
      expect(changeJudiciaryForHearings).not.toHaveBeenCalled();
    });
  });

  describe('updateAllocatedHearing$', () => {
    const startDate = new Date(testHearing.startDate);
    startDate.setDate(startDate.getDate() + 1);
    const formattedStartDate = startDate.toISOString().split('T')[0];

    const searchHearingSlotsParams = {
      courtRoomId: testHearing.courtRoomId,
      sessionStartDate: formattedStartDate,
      sessionEndDate: formattedStartDate,
      hearingStartTime: testHearing.nonDefaultDays[0].startTime,
      panel: 'ADULT,YOUTH',
      ouCode: 'oucode',
      pageNumber: 1,
      pageSize: 10,
      showOverbookedSlots: true
    };

    beforeEach(() => {
      store.dispatch(new SearchAllocatedHearingsSuccessAction([testHearing]));
      store.dispatch(setHearingToEditAllocation({ hearingToEditAllocation: testHearing }));
    });

    it('should update allocated hearing', () => {
      const inputAction = new UpdateAllocatedHearingAction({
        originHearing: testHearing,
        updatedHearing: testHearing
      });
      const outputAction = new UpdateAllocatedHearingSuccessAction(testHearing);

      actions$ = hot('-a---', { a: inputAction });
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const updateHearing$ = cold('-b|', { b: testHearing });
      const expected$ = cold('---d-', {
        d: outputAction
      });

      updateAllocatedHearing.and.returnValue(updateHearing$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.updateAllocatedHearing$).toBeObservable(expected$);
    });

    it('should not update allocated hearing due to no sessions available', () => {
      const inputAction = new UpdateAllocatedHearingAction({
        originHearing: testHearing,
        updatedHearing: {
          ...testHearing,
          startDate: formattedStartDate,
          endDate: formattedStartDate,
          selectedCourtCentre: {
            id: testHearing.courtCentreId,
            ouCode: 'oucode'
          }
        }
      } as AllocatingHearingDetailsWithCourtCentre);

      const editAllocationErrorAction = setEditAllocationError({
        editAllocationError: editAllocationError
      });

      const updateAllocatedHearingSuccessAction = new UpdateAllocatedHearingSuccessAction(
        testHearing
      );

      actions$ = hot('-a---', { a: inputAction });
      const searchHearingSlots$ = cold('-b|', { b: { hearingSlots: [] } });
      const expected$ = cold('--(cd)-', {
        c: editAllocationErrorAction,
        d: updateAllocatedHearingSuccessAction
      });

      searchHearingSlots.and.returnValue(searchHearingSlots$);

      expect(effects.updateAllocatedHearing$).toBeObservable(expected$);

      expect(searchHearingSlots).toHaveBeenCalledWith(searchHearingSlotsParams);
    });

    it('should update allocated hearing if at least one session is available', () => {
      const updatedHearing = {
        ...testHearing,
        startDate: formattedStartDate,
        endDate: formattedStartDate,
        selectedCourtCentre: {
          id: testHearing.courtCentreId,
          ouCode: 'oucode'
        }
      };

      const inputAction = new UpdateAllocatedHearingAction({
        originHearing: testHearing,
        updatedHearing
      } as AllocatingHearingDetailsWithCourtCentre);

      const outputAction = new UpdateAllocatedHearingSuccessAction(updatedHearing);

      actions$ = hot('-a---', { a: inputAction });
      const searchHearingSlots$ = cold('-b|', { b: { hearingSlots: [{ id: 'hearing-slot' }] } });
      const updateHearing$ = cold('-c|', { c: updatedHearing });
      const grantPermission$ = cold('--(d|)', { d: null });
      const revokePermission$ = cold('--(e|)', { e: null });
      const sendEmail$ = cold('--(f|)', { f: null });

      const expected$ = cold('----(e)-', {
        e: outputAction
      });

      searchHearingSlots.and.returnValue(searchHearingSlots$);
      updateAllocatedHearing.and.returnValue(updateHearing$);

      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.updateAllocatedHearing$).toBeObservable(expected$);

      expect(searchHearingSlots).toHaveBeenCalledWith(searchHearingSlotsParams);
    });

    it('should grant DDJ permission and send notification if DDJ selected as judiciary', () => {
      const updatedHearing = {
        ...testHearing,
        judiciary: [
          {
            isDeputy: true,
            judicialId: 'id-2',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'DEPUTY_DISTRICT_JUDGE' },
            judicialMember: {
              id: 'id-2',
              seqId: 1,
              surname: 'Does',
              forenames: 'Mike',
              judiciaryType: 'Deputy District Judge (MC)- Fee paid',
              emailAddress: 'address2'
            }
          }
        ]
      } as LocalHearing;

      const inputAction = new UpdateAllocatedHearingAction({
        originHearing: testHearing,
        updatedHearing
      });
      const outputAction = new UpdateAllocatedHearingSuccessAction(updatedHearing);
      const { payload } = inputAction;

      actions$ = hot('-a---', { a: inputAction });
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const updateHearing$ = cold('-b|', { b: updatedHearing });
      const expected$ = cold('---d-', {
        d: outputAction
      });

      updateAllocatedHearing.and.returnValue(updateHearing$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.updateAllocatedHearing$).toBeObservable(expected$);
      expect(revokeBulkJudiciaryPermission).toHaveBeenCalledTimes(1);
      expect(sendEmailNotification).toHaveBeenCalledWith(
        [payload.updatedHearing],
        payload.updatedHearing.judiciary,
        payload.updatedHearing.judiciary[0].judicialRoleType.judiciaryType
      );
      expect(grantBulkJudiciaryPermission).toHaveBeenCalledWith(
        [payload.originHearing],
        payload.updatedHearing.judiciary
      );
    });

    it('should grant RECORDER permission and send notification if RECORDER selected as judiciary', () => {
      const updatedHearing = {
        ...testHearing,
        judiciary: [
          {
            isDeputy: true,
            judicialId: 'id-2',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'RECORDER' },
            judicialMember: {
              id: 'id-2',
              seqId: 1,
              surname: 'Does',
              forenames: 'Mike',
              judiciaryType: 'Recorder',
              emailAddress: 'address2'
            }
          }
        ]
      } as LocalHearing;

      const inputAction = new UpdateAllocatedHearingAction({
        originHearing: testHearing,
        updatedHearing
      });
      const outputAction = new UpdateAllocatedHearingSuccessAction(updatedHearing);
      const { payload } = inputAction;

      actions$ = hot('-a---', { a: inputAction });
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const updateHearing$ = cold('-b|', { b: updatedHearing });
      const expected$ = cold('-----d-', {
        d: outputAction
      });

      updateAllocatedHearing.and.returnValue(updateHearing$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.updateAllocatedHearing$).toBeObservable(expected$);
      expect(revokeBulkJudiciaryPermission).toHaveBeenCalledTimes(1);
      expect(sendEmailNotification).toHaveBeenCalledWith(
        [payload.updatedHearing],
        payload.updatedHearing.judiciary,
        payload.originHearing.judiciary[0].judicialRoleType.judiciaryType
      );
      expect(grantBulkJudiciaryPermission).toHaveBeenCalledWith(
        [payload.originHearing],
        payload.updatedHearing.judiciary
      );
    });

    it('should revoke previous DDJ grant new DDJ permission with sending notification if DDJ is changed', () => {
      const originHearing = {
        ...testHearing,
        judiciary: [
          {
            isDeputy: true,
            judicialId: 'id-1',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'DEPUTY_DISTRICT_JUDGE' },
            judicialMember: {
              id: 'id-1',
              seqId: 1,
              surname: 'Jones',
              forenames: 'John',
              judiciaryType: 'Deputy District Judge (MC)- Fee paid',
              emailAddress: 'address1'
            }
          }
        ]
      } as LocalHearing;

      const updatedHearing = {
        ...testHearing,
        judiciary: [
          {
            isDeputy: true,
            judicialId: 'id-2',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'DEPUTY_DISTRICT_JUDGE' },
            judicialMember: {
              id: 'id-2',
              seqId: 1,
              surname: 'Does',
              forenames: 'Mike',
              judiciaryType: 'Deputy District Judge (MC)- Fee paid',
              emailAddress: 'address2'
            }
          }
        ]
      } as LocalHearing;

      store.dispatch(new SearchAllocatedHearingsSuccessAction([originHearing]));
      store.dispatch(setHearingToEditAllocation({ hearingToEditAllocation: originHearing }));

      const inputAction = new UpdateAllocatedHearingAction({
        originHearing,
        updatedHearing
      });
      const outputAction = new UpdateAllocatedHearingSuccessAction(updatedHearing);
      const { payload } = inputAction;

      actions$ = hot('-a-----', { a: inputAction });
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const updateHearing$ = cold('---(b|)', { b: updatedHearing });
      const expected$ = cold('-----d-', {
        d: outputAction
      });

      updateAllocatedHearing.and.returnValue(updateHearing$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.updateAllocatedHearing$).toBeObservable(expected$);
      expect(revokeBulkJudiciaryPermission).toHaveBeenCalledWith(
        [payload.originHearing],
        payload.originHearing.judiciary[0].judicialRoleType.judiciaryType
      );
      expect(sendEmailNotification).toHaveBeenCalledTimes(1);
      expect(sendEmailNotification).toHaveBeenCalledWith(
        [payload.updatedHearing],
        payload.updatedHearing.judiciary,
        payload.updatedHearing.judiciary[0].judicialRoleType.judiciaryType
      );
      expect(grantBulkJudiciaryPermission).toHaveBeenCalledWith(
        [payload.originHearing],
        payload.updatedHearing.judiciary
      );
    });

    it('should revoke previous RECORDER grant new RECORDER permission with sending notification if RECORDER is changed', () => {
      const originHearing = {
        ...testHearing,
        judiciary: [
          {
            isDeputy: true,
            judicialId: 'id-1',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'RECORDER' },
            judicialMember: {
              id: 'id-1',
              seqId: 1,
              surname: 'Jones',
              forenames: 'John',
              judiciaryType: 'Recorder',
              emailAddress: 'address1'
            }
          }
        ]
      } as LocalHearing;

      const updatedHearing = {
        ...testHearing,
        judiciary: [
          {
            isDeputy: true,
            judicialId: 'id-2',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'RECORDER' },
            judicialMember: {
              id: 'id-2',
              seqId: 1,
              surname: 'Does',
              forenames: 'Mike',
              judiciaryType: 'Recorder',
              emailAddress: 'address2'
            }
          }
        ]
      } as LocalHearing;

      store.dispatch(new SearchAllocatedHearingsSuccessAction([originHearing]));
      store.dispatch(setHearingToEditAllocation({ hearingToEditAllocation: originHearing }));

      const inputAction = new UpdateAllocatedHearingAction({
        originHearing,
        updatedHearing
      });
      const outputAction = new UpdateAllocatedHearingSuccessAction(updatedHearing);
      const { payload } = inputAction;

      actions$ = hot('-a-----', { a: inputAction });
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const updateHearing$ = cold('---(b|)', { b: updatedHearing });
      const expected$ = cold('-----d-', {
        d: outputAction
      });

      updateAllocatedHearing.and.returnValue(updateHearing$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.updateAllocatedHearing$).toBeObservable(expected$);
      expect(revokeBulkJudiciaryPermission).toHaveBeenCalledWith(
        [payload.originHearing],
        payload.originHearing.judiciary[0].judicialRoleType.judiciaryType
      );
      expect(sendEmailNotification).toHaveBeenCalledTimes(1);
      expect(sendEmailNotification).toHaveBeenCalledWith(
        [payload.updatedHearing],
        payload.updatedHearing.judiciary,
        payload.updatedHearing.judiciary[0].judicialRoleType.judiciaryType
      );
      expect(grantBulkJudiciaryPermission).toHaveBeenCalledWith(
        [payload.originHearing],
        payload.updatedHearing.judiciary
      );
    });

    it('should revoke permission and do not send notification if DDJ is removed', () => {
      const originHearing = {
        ...testHearing,
        judiciary: [
          {
            isDeputy: true,
            judicialId: 'id-1',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'DEPUTY_DISTRICT_JUDGE' },
            judicialMember: {
              id: 'id-1',
              seqId: 1,
              surname: 'Jones',
              forenames: 'John',
              judiciaryType: 'Deputy District Judge (MC)- Fee paid',
              emailAddress: 'address1'
            }
          }
        ]
      } as LocalHearing;

      const updatedHearing = {
        ...testHearing,
        judiciary: []
      } as LocalHearing;

      store.dispatch(new SearchAllocatedHearingsSuccessAction([originHearing]));
      store.dispatch(setHearingToEditAllocation({ hearingToEditAllocation: originHearing }));

      const inputAction = new UpdateAllocatedHearingAction({
        originHearing,
        updatedHearing
      });
      const outputAction = new UpdateAllocatedHearingSuccessAction(updatedHearing);
      const { payload } = inputAction;

      actions$ = hot('-a-----', { a: inputAction });
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const updateHearing$ = cold('---(b|)', { b: updatedHearing });
      const expected$ = cold('----d-', {
        d: outputAction
      });

      updateAllocatedHearing.and.returnValue(updateHearing$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.updateAllocatedHearing$).toBeObservable(expected$);
      expect(revokeBulkJudiciaryPermission).toHaveBeenCalledWith(
        [payload.originHearing],
        payload.originHearing.judiciary[0].judicialRoleType.judiciaryType
      );
      expect(sendEmailNotification).not.toHaveBeenCalled();
      expect(grantBulkJudiciaryPermission).not.toHaveBeenCalled();
    });

    it('should revoke permission and do not send notification if RECORDER is removed', () => {
      const originHearing = {
        ...testHearing,
        judiciary: [
          {
            isDeputy: true,
            judicialId: 'id-1',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'RECORDER' },
            judicialMember: {
              id: 'id-1',
              seqId: 1,
              surname: 'Jones',
              forenames: 'John',
              judiciaryType: 'Recorder',
              emailAddress: 'address1'
            }
          }
        ]
      } as LocalHearing;

      const updatedHearing = {
        ...testHearing,
        judiciary: []
      } as LocalHearing;

      store.dispatch(new SearchAllocatedHearingsSuccessAction([originHearing]));
      store.dispatch(setHearingToEditAllocation({ hearingToEditAllocation: originHearing }));

      const inputAction = new UpdateAllocatedHearingAction({
        originHearing,
        updatedHearing
      });
      const outputAction = new UpdateAllocatedHearingSuccessAction(updatedHearing);
      const { payload } = inputAction;

      actions$ = hot('-a-----', { a: inputAction });
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const updateHearing$ = cold('---(b|)', { b: updatedHearing });
      const expected$ = cold('----d-', {
        d: outputAction
      });

      updateAllocatedHearing.and.returnValue(updateHearing$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.updateAllocatedHearing$).toBeObservable(expected$);
      expect(revokeBulkJudiciaryPermission).toHaveBeenCalledWith(
        [payload.originHearing],
        payload.originHearing.judiciary[0].judicialRoleType.judiciaryType
      );
      expect(sendEmailNotification).not.toHaveBeenCalled();
      expect(grantBulkJudiciaryPermission).not.toHaveBeenCalled();
    });

    it('should handle an api error from updating the hearing', () => {
      const inputAction = new UpdateAllocatedHearingAction({
        originHearing: testHearing,
        updatedHearing: testHearing
      });
      const error = { status: 500 };
      const apiError = new ApiError(error);

      actions$ = hot('-a-', { a: inputAction });
      const update$ = cold('-#', null, error);
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const expected$ = cold('--c', { c: apiError });

      updateAllocatedHearing.and.returnValue(update$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.updateAllocatedHearing$).toBeObservable(expected$);
    });
  });

  describe('sequenceHearings$', () => {
    const hearings = [
      {
        id: 'a',
        sequenceHearingDays: [
          { hearingDate: '2018-12-01', sequence: 1 },
          { hearingDate: '2018-12-02', sequence: 2 },
          { hearingDate: '2018-12-03', sequence: 3 }
        ]
      },
      {
        id: 'b',
        sequenceHearingDays: [
          { hearingDate: '2019-01-20', sequence: 1 },
          { hearingDate: '2019-01-21', sequence: 2 }
        ]
      }
    ] as SequenceHearing[];

    const sequenceHearingsAction = new SequenceHearingAction({ hearings });

    it('should sequence the allocated hearings', () => {
      const sequenceHearingsSuccess = new SequenceHearingSuccessAction({
        hearings
      });

      actions$ = hot('-a-------', { a: sequenceHearingsAction });
      const hearings$ = cold('(b|)', { b: hearings });
      const expected$ = cold('-y', {
        y: sequenceHearingsSuccess
      });

      sequenceHearings.and.returnValue(hearings$);

      expect(effects.sequenceHearings$).toBeObservable(expected$);

      expect(sequenceHearings).toHaveBeenCalledWith(hearings);
    });

    it('should handle an api error from sequencing the allocated hearings', () => {
      const error = { status: 500 };
      const apiError = new ApiError(error);

      actions$ = hot('-a-', { a: sequenceHearingsAction });
      const hearings$ = cold('-#', null, error);
      const expected$ = cold('--c', { c: apiError });

      sequenceHearings.and.returnValue(hearings$);

      expect(effects.sequenceHearings$).toBeObservable(expected$);
    });
  });

  describe('searchAllocatedHearings$', () => {
    const options = {
      courtCentreId: '123',
      authorityId: '456',
      hearingTypeId: '567',
      jurisdictionType: 'CROWN' as JurisdictionType,
      courtRoomId: '678',
      searchDate: '2000-01-01',
      startTime: '10:30',
      endTime: '11:30'
    };

    const seachAllocatedHearings = new SearchAllocatedHearingsAction({
      options
    });

    it('should search the allocated hearings', () => {
      const judicialMembers = [{ id: '1' }, { id: '2' }] as JudicialMember[];
      const hearings = [
        { id: 'a', judiciary: [{ judicialId: '1', judicialMember: judicialMembers[0] }] },
        { id: 'b', judiciary: [{ judicialId: '2', judicialMember: judicialMembers[1] }] }
      ] as LocalHearing[];

      const notes = [{ id: 'notes-id-1' }, { id: 'notes-id-2' }] as ListingNote[];

      const listUnallocatedHearingsSuccess = new SearchAllocatedHearingsSuccessAction([
        {
          id: 'a',
          judiciary: [{ judicialId: '1', judicialMember: judicialMembers[0] }]
        },
        {
          id: 'b',
          judiciary: [{ judicialId: '2', judicialMember: judicialMembers[1] }]
        }
      ] as LocalHearing[]);
      const updateAdjournedHearingJudiciary = new UpdateAdjournedHearingJudiciaryAction();

      const outputNotesAction = loadListingNotesAction({ notes });

      actions$ = hot('-a', { a: seachAllocatedHearings });
      const payload$ = cold('--(b|)', { b: { hearings, notes } });
      const expected$ = cold('---(xyz)', {
        x: listUnallocatedHearingsSuccess,
        y: outputNotesAction,
        z: updateAdjournedHearingJudiciary
      });

      searchHearingsWithTimeRange.and.returnValue(payload$);

      expect(effects.searchAllocatedHearings$).toBeObservable(expected$);

      expect(searchHearingsWithTimeRange).toHaveBeenCalledWith(options);
    });

    it('should handle an api error from searching the allocated hearings', () => {
      const error = { status: 500 };
      const apiError = new ApiError(error);

      actions$ = hot('-a-', { a: seachAllocatedHearings });
      const hearings$ = cold('-#', null, error);
      const expected$ = cold('--c', { c: apiError });

      searchHearingsWithTimeRange.and.returnValue(hearings$);

      expect(effects.searchAllocatedHearings$).toBeObservable(expected$);
    });
  });

  describe('searchAllocatedHearingsByDateRange$', () => {
    const options = {
      courtCentreId: '123',
      authorityId: '456',
      hearingTypeId: '567',
      jurisdictionType: 'CROWN',
      courtRoomId: '678',
      searchDate: '2000-01-01',
      startDate: '2018-10-10,',
      endDate: '2018-10-14',
      startTime: '10:30',
      endTime: '11:30'
    } as SelectedFilterOptions;

    const searchAllocatedHearingsByDateRange = new SearchAllocatedHearingsByDateRangeAction({
      options
    });

    it('should search the allocated hearings by date range', () => {
      const judicialMembers = [{ id: '1' }, { id: '2' }] as JudicialMember[];
      const hearings = [
        { id: 'a', judiciary: [{ judicialId: '1', judicialMember: judicialMembers[0] }] },
        { id: 'b', judiciary: [{ judicialId: '2', judicialMember: judicialMembers[1] }] }
      ] as LocalHearing[];

      const successPagedHearing: PaginatedHearings = {
        hearings: [
          {
            id: 'a',
            judiciary: [{ judicialId: '1', judicialMember: judicialMembers[0] }]
          },
          {
            id: 'b',
            judiciary: [{ judicialId: '2', judicialMember: judicialMembers[1] }]
          }
        ] as LocalHearing[],

        pagination: { totalNumber: 100, pageCount: 2 }
      };
      const listAllocatedHearingByDateRangeSuccess =
        new SearchAllocatedHearingsByDateRangeSuccessAction(successPagedHearing);

      actions$ = hot('-a', {
        a: searchAllocatedHearingsByDateRange
      });
      const hearings$ = cold('--(b|)', { b: { hearings, results: 100, pageCount: 2 } });
      const expected$ = cold('---y', {
        y: listAllocatedHearingByDateRangeSuccess
      });

      getAllocatedHearings.and.returnValue(hearings$);

      expect(effects.searchAllocatedHearingsByDateRange$).toBeObservable(expected$);

      expect(getAllocatedHearings).toHaveBeenCalledWith(options);
    });

    it('should handle an api error from searching the allocated hearings by date range', () => {
      const error = { status: 500 };
      const apiError = new ApiError(error);

      actions$ = hot('-a-', { a: searchAllocatedHearingsByDateRange });
      const hearings$ = cold('-#', null, error);
      const expected$ = cold('--c', { c: apiError });

      getAllocatedHearings.and.returnValue(hearings$);

      expect(effects.searchAllocatedHearingsByDateRange$).toBeObservable(expected$);
    });
  });

  describe('searchWeekCommencingHearingsByDateRange$', () => {
    const options = {
      courtCentreId: '123',
      authorityId: '456',
      hearingTypeId: '567',
      jurisdictionType: 'CROWN',
      courtRoomId: '678',
      searchDate: '2000-01-01',
      startDate: '2018-10-10,',
      endDate: '2018-10-14',
      startTime: '10:30',
      endTime: '11:30'
    } as SelectedFilterOptions;

    const weekCommencingHearingSearchAction = new WeekCommencingHearingSearchAction({
      options
    });

    it('should search the week commencing hearings by date range', () => {
      const judicialMembers = [{ id: '1' }, { id: '2' }] as JudicialMember[];
      const hearings = [
        { id: 'a', judiciary: [{ judicialId: '1', judicialMember: judicialMembers[0] }] },
        { id: 'b', judiciary: [{ judicialId: '2', judicialMember: judicialMembers[1] }] }
      ] as LocalHearing[];

      const successPagedHearing: PaginatedHearings = {
        hearings: [
          {
            id: 'a',
            judiciary: [{ judicialId: '1', judicialMember: judicialMembers[0] }]
          },
          {
            id: 'b',
            judiciary: [{ judicialId: '2', judicialMember: judicialMembers[1] }]
          }
        ] as LocalHearing[],

        pagination: { totalNumber: 100, pageCount: 2 }
      };
      const weekCommencingSuccess = new WeekCommencingHearingSearchSuccessAction(
        successPagedHearing
      );

      actions$ = hot('-a', {
        a: weekCommencingHearingSearchAction
      });
      const hearings$ = cold('--(b|)', { b: { hearings, results: 100, pageCount: 2 } });
      const expected$ = cold('---y', {
        y: weekCommencingSuccess
      });

      getAllocatedHearings.and.returnValue(hearings$);

      expect(effects.searchWeekCommencingHearingsByDateRange$).toBeObservable(expected$);

      expect(getAllocatedHearings).toHaveBeenCalledWith(options);
    });
  });

  describe('changeJudiciaryForHearings$', () => {
    it('should change the judiciary details for a list of hearings ', () => {
      const payload = {
        hearings: [testHearing] as HearingWithSelectedCourtCentre[],
        judiciary: []
      };

      const changeJudiciaryForHearingsAction = new ChangeJudicaryForHearingsAction(payload);

      const outputAction = new ChangeJudicaryForHearingsSuccessAction(payload);

      actions$ = hot('-a-----', { a: changeJudiciaryForHearingsAction });
      const hearings$ = cold('--(b|)', { b: testHearing });
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const expected$ = cold('---e-', {
        e: outputAction
      });

      changeJudiciaryForHearings.and.returnValue(hearings$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.changeJudiciaryForHearings$).toBeObservable(expected$);
    });

    it('should grant permission and send notification if there is any DDJ assigned', () => {
      const payload = {
        hearings: [testHearing] as HearingWithSelectedCourtCentre[],
        judiciary: [
          {
            isDeputy: true,
            judicialId: '19ffac44-3533-410d-868e-81cf825844b6',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'DEPUTY_DISTRICT_JUDGE' },
            judicialMember: {
              id: '1',
              seqId: 1,
              surname: 'Jones',
              forenames: 'John',
              judiciaryType: 'Deputy District Judge (MC)- Fee paid',
              emailAddress: 'address1'
            }
          } as ExtendedJudicialRole
        ]
      };

      const changeJudiciaryForHearingsAction = new ChangeJudicaryForHearingsAction(payload);

      const outputAction = new ChangeJudicaryForHearingsSuccessAction(payload);

      actions$ = hot('-a-----', { a: changeJudiciaryForHearingsAction });
      const hearings$ = cold('--(b|)', { b: testHearing });
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const expected$ = cold('---e-', {
        e: outputAction
      });

      changeJudiciaryForHearings.and.returnValue(hearings$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.changeJudiciaryForHearings$).toBeObservable(expected$);
      expect(revokeBulkJudiciaryPermission).toHaveBeenCalledTimes(1);
      expect(sendEmailNotification).toHaveBeenCalledWith(
        payload.hearings,
        payload.judiciary,
        payload.judiciary[0].judicialRoleType.judiciaryType
      );
      expect(grantBulkJudiciaryPermission).toHaveBeenCalledWith(
        payload.hearings,
        payload.judiciary
      );
    });

    it('should grant permission and send notification if there is any DDJ assigned to multiple hearings', () => {
      const testHearing2 = {
        ...testHearing,
        id: 'b1bfe644-15d3-46aa-bdeb-fe8d18c16a43'
      };

      const payload = {
        hearings: [testHearing, testHearing2] as HearingWithSelectedCourtCentre[],
        judiciary: [
          {
            isDeputy: true,
            judicialId: '19ffac44-3533-410d-868e-81cf825844b6',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'DEPUTY_DISTRICT_JUDGE' },
            judicialMember: {
              id: '1',
              seqId: 1,
              surname: 'Jones',
              forenames: 'John',
              judiciaryType: 'Deputy District Judge (MC)- Fee paid',
              emailAddress: 'address1'
            }
          } as ExtendedJudicialRole
        ]
      };

      const changeJudiciaryForHearingsAction = new ChangeJudicaryForHearingsAction(payload);

      const outputAction = new ChangeJudicaryForHearingsSuccessAction(payload);

      actions$ = hot('-a-----', { a: changeJudiciaryForHearingsAction });
      const hearings$ = cold('--(b|)', { b: testHearing });
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const expected$ = cold('---e-', {
        e: outputAction
      });

      changeJudiciaryForHearings.and.returnValue(hearings$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.changeJudiciaryForHearings$).toBeObservable(expected$);
      expect(revokeBulkJudiciaryPermission).toHaveBeenCalledTimes(1);
      expect(sendEmailNotification).toHaveBeenCalledWith(
        payload.hearings,
        payload.judiciary,
        payload.judiciary[0].judicialRoleType.judiciaryType
      );
      expect(grantBulkJudiciaryPermission).toHaveBeenCalledWith(
        payload.hearings,
        payload.judiciary
      );
    });

    it('should revoke permission and grant new permission and send notification if DDJ is changed', () => {
      const testHearingOverride = {
        ...testHearing,
        judiciary: [
          {
            isDeputy: true,
            judicialId: 'id-1',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'DEPUTY_DISTRICT_JUDGE' },
            judicialMember: {
              id: 'id-1',
              seqId: 1,
              surname: 'Jones',
              forenames: 'John',
              judiciaryType: 'DEPUTY_DISTRICT_JUDGE',
              emailAddress: 'address1'
            }
          }
        ]
      };

      const payload = {
        hearings: [testHearingOverride] as HearingWithSelectedCourtCentre[],
        judiciary: [
          {
            isDeputy: true,
            judicialId: '19ffac44-3533-410d-868e-81cf825844b6',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'DEPUTY_DISTRICT_JUDGE' },
            judicialMember: {
              id: '1',
              seqId: 1,
              surname: 'Verdict',
              forenames: 'Mike',
              judiciaryType: 'Deputy District Judge (MC)- Fee paid',
              emailAddress: 'address1'
            }
          } as ExtendedJudicialRole
        ]
      };

      const changeJudiciaryForHearingsAction = new ChangeJudicaryForHearingsAction(payload);

      const outputAction = new ChangeJudicaryForHearingsSuccessAction(payload);

      actions$ = hot('-a-----', { a: changeJudiciaryForHearingsAction });
      const hearings$ = cold('--(b|)', { b: testHearing });
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const expected$ = cold('-----e-', {
        e: outputAction
      });

      changeJudiciaryForHearings.and.returnValue(hearings$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.changeJudiciaryForHearings$).toBeObservable(expected$);
      expect(revokeBulkJudiciaryPermission).toHaveBeenCalledWith(
        payload.hearings,
        payload.judiciary[0].judicialRoleType.judiciaryType
      );
      expect(sendEmailNotification).toHaveBeenCalledTimes(1);
      expect(sendEmailNotification).toHaveBeenCalledWith(
        payload.hearings,
        payload.judiciary,
        payload.judiciary[0].judicialRoleType.judiciaryType
      );
      expect(grantBulkJudiciaryPermission).toHaveBeenCalledWith(
        payload.hearings,
        payload.judiciary
      );
    });

    it('should revoke permission and do not send notification if already selected DDJ is removed', () => {
      const testHearingOverride = {
        ...testHearing,
        judiciary: [
          {
            isDeputy: true,
            judicialId: 'id-1',
            isBenchChairman: false,
            judicialRoleType: { judiciaryType: 'DEPUTY_DISTRICT_JUDGE' },
            judicialMember: {
              id: 'id-1',
              seqId: 1,
              surname: 'Jones',
              forenames: 'John',
              judiciaryType: 'DEPUTY_DISTRICT_JUDGE',
              emailAddress: 'address1'
            }
          }
        ]
      };

      const payload = {
        hearings: [testHearingOverride] as HearingWithSelectedCourtCentre[],
        judiciary: []
      };

      const changeJudiciaryForHearingsAction = new ChangeJudicaryForHearingsAction(payload);

      const outputAction = new ChangeJudicaryForHearingsSuccessAction(payload);

      actions$ = hot('-a-----', { a: changeJudiciaryForHearingsAction });
      const hearings$ = cold('--(b|)', { b: testHearing });
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const expected$ = cold('---e-', {
        e: outputAction
      });

      changeJudiciaryForHearings.and.returnValue(hearings$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.changeJudiciaryForHearings$).toBeObservable(expected$);
      expect(revokeBulkJudiciaryPermission).toHaveBeenCalledWith(
        payload.hearings,
        testHearingOverride.judiciary[0].judicialRoleType.judiciaryType
      );
      expect(sendEmailNotification).not.toHaveBeenCalled();
      expect(grantBulkJudiciaryPermission).not.toHaveBeenCalled();
    });

    it('should handle an api error from searching the allocated hearings by date range', () => {
      const payload = {
        hearings: [testHearing] as HearingWithSelectedCourtCentre[],
        judiciary: []
      };

      const changeJudiciaryForHearingsAction = new ChangeJudicaryForHearingsAction(payload);

      const error = { status: 500 };
      const apiError = new ApiError(error);

      actions$ = hot('-a-', { a: changeJudiciaryForHearingsAction });
      const hearings$ = cold('-#', null, error);
      const grantPermission$ = cold('--(c|)', { c: null });
      const revokePermission$ = cold('--(d|)', { d: null });
      const sendEmail$ = cold('--(e|)', { e: null });
      const expected$ = cold('--c', { c: apiError });

      changeJudiciaryForHearings.and.returnValue(hearings$);
      sendEmailNotification.and.returnValue(sendEmail$);
      grantBulkJudiciaryPermission.and.returnValue(grantPermission$);
      revokeBulkJudiciaryPermission.and.returnValue(revokePermission$);

      expect(effects.changeJudiciaryForHearings$).toBeObservable(expected$);
    });
  });

  describe('downloadPrisonList$', () => {
    it('should download prison list of hearings', () => {
      store.dispatch(
        ReferenceDataActions.loadOrganisationUnitsSuccess({
          organisationUnits: [
            {
              id: 'organisationUnitId',
              oucodeL3Name: 'Test Court Centre',
              courtrooms: [
                {
                  id: 'courtroomId',
                  courtroomName: 'Test Courtroom'
                }
              ]
            } as OrganisationUnit
          ]
        })
      );
      const testBlob = new Blob(['textstream'], { type: 'application/pdf' });
      const options = {
        startDate: '2020-01-01',
        endDate: '2020-01-01',
        courtCentreId: 'organisationUnitId',
        courtRoomId: 'courtroomId'
      };
      const inputAction = downloadPrisonListAction({ options });

      actions$ = hot(' -a', { a: inputAction });
      const download$ = cold(' -(b|)   ', { b: testBlob });
      const expected$ = cold('--x', { x: downloadPrisonListSuccessAction() });

      downloadPrisonList.and.returnValue(download$);

      expect(effects.downloadPrisonList$).toBeObservable(expected$);
      expect(downloadPrisonList).toHaveBeenCalledWith(inputAction.options);
      expect(FileSaver.saveAs).toHaveBeenCalledWith(
        testBlob,
        'Prison list - Test Court Centre, Test Courtroom - 01-01-2020.pdf'
      );
    });

    it('should handle an api error from download prison list of hearings', () => {
      const error = { status: 500 };
      const apiError = new ApiError(error);
      const inputAction = downloadPrisonListAction({ options: selectedOptionsMock });

      actions$ = hot('-a-', { a: inputAction });
      const downloadPrisonLists = cold('-#', null, error);
      const expected$ = cold('--b', { b: apiError });

      downloadPrisonList.and.returnValue(downloadPrisonLists);

      expect(effects.downloadPrisonList$).toBeObservable(expected$);
    });
  });
  describe('downloadCourtList$', () => {
    it('should download list of hearings', () => {
      store.dispatch(
        ReferenceDataActions.loadOrganisationUnitsSuccess({
          organisationUnits: [
            {
              id: 'organisationUnitId',
              oucodeL3Name: 'Test Court Centre',
              courtrooms: [
                {
                  id: 'courtroomId',
                  courtroomName: 'Test Courtroom'
                }
              ]
            } as OrganisationUnit
          ]
        })
      );
      const testBlob = new Blob(['textstream'], { type: 'application/pdf' });

      const alphabeticalListAction = new DownloadListAction({
        options: {
          startDate: '2020-01-01',
          endDate: '2020-01-01',
          courtListType: CourtListType.ALPHABETICAL,
          courtCentreId: 'organisationUnitId',
          courtRoomId: 'courtroomId'
        }
      });

      const publicCourtListAction = new DownloadListAction({
        options: {
          startDate: '2020-01-01',
          endDate: '2020-01-08',
          courtListType: CourtListType.PUBLIC,
          courtCentreId: 'organisationUnitId',
          courtRoomId: 'courtroomId'
        }
      });

      const standardListAction = new DownloadListAction({
        options: {
          startDate: '2020-01-01',
          endDate: '2020-01-01',
          courtListType: CourtListType.STANDARD,
          courtCentreId: 'organisationUnitId',
          courtRoomId: 'courtroomId'
        }
      });

      const standardRestrictedListAction = new DownloadListAction({
        options: {
          startDate: '2020-01-01',
          endDate: '2020-01-01',
          courtListType: CourtListType.STANDARD,
          courtCentreId: 'organisationUnitId',
          courtRoomId: 'courtroomId',
          restricted: true
        }
      });

      const benchListAction = new DownloadListAction({
        options: {
          startDate: '2020-01-01',
          endDate: '2020-01-01',
          courtListType: CourtListType.BENCH,
          courtCentreId: 'organisationUnitId',
          courtRoomId: 'courtroomId'
        }
      });

      const benchRestrictedListAction = new DownloadListAction({
        options: {
          startDate: '2020-01-01',
          endDate: '2020-01-01',
          courtListType: CourtListType.BENCH,
          courtCentreId: 'organisationUnitId',
          courtRoomId: 'courtroomId',
          restricted: true
        }
      });

      const judgeListAction = new DownloadListAction({
        options: {
          startDate: '2020-01-01',
          endDate: '2020-01-01',
          courtListType: CourtListType.JUDGE,
          courtCentreId: 'organisationUnitId',
          courtRoomId: 'courtroomId'
        }
      });

      const ushersListAction = new DownloadListAction({
        options: {
          startDate: '2020-01-01',
          endDate: '2020-01-01',
          courtListType: CourtListType.USHERS_MAGISTRATE,
          courtCentreId: 'organisationUnitId',
          courtRoomId: 'courtroomId'
        }
      });

      actions$ = hot(' -a-b-c-d-e-f-g-h', {
        a: alphabeticalListAction,
        b: publicCourtListAction,
        c: standardListAction,
        d: standardRestrictedListAction,
        e: benchListAction,
        f: benchRestrictedListAction,
        g: judgeListAction,
        h: ushersListAction
      });
      const download$ = cold(' -(b|)   ', { b: testBlob });
      const expected$ = cold('--x-x-x-x-x-x-x-x', { x: new DownloadListSuccessAction() });

      downloadCourtList.and.returnValue(download$);

      expect(effects.downloadCourtList$).toBeObservable(expected$);
      expect(downloadCourtList).toHaveBeenCalledWith(publicCourtListAction.payload.options);
      expect(FileSaver.saveAs).toHaveBeenCalledWith(
        testBlob,
        'Alphabetical list - Test Court Centre, Test Courtroom - 01-01-2020.pdf'
      );
      expect(FileSaver.saveAs).toHaveBeenCalledWith(
        testBlob,
        'Public court list - Test Court Centre, Test Courtroom - W/C 01-01-2020.pdf'
      );
      expect(FileSaver.saveAs).toHaveBeenCalledWith(
        testBlob,
        'Standard court list - Test Court Centre, Test Courtroom - 01-01-2020.pdf'
      );
      expect(FileSaver.saveAs).toHaveBeenCalledWith(
        testBlob,
        'Standard court list - Test Court Centre, Test Courtroom - 01-01-2020.pdf'
      );
      expect(FileSaver.saveAs).toHaveBeenCalledWith(
        testBlob,
        'Bench list - Test Court Centre, Test Courtroom - 01-01-2020.pdf'
      );
      expect(FileSaver.saveAs).toHaveBeenCalledWith(
        testBlob,
        'Bench list (restricted) - Test Court Centre, Test Courtroom - 01-01-2020.pdf'
      );
      expect(FileSaver.saveAs).toHaveBeenCalledWith(
        testBlob,
        'Judge list - Test Court Centre, Test Courtroom - 01-01-2020.pdf'
      );
      expect(FileSaver.saveAs).toHaveBeenCalledWith(
        testBlob,
        'Ushers list - Test Court Centre, Test Courtroom - 01-01-2020.docx'
      );
    });

    it('should handle an api error from download list of hearings', () => {
      const error = { status: 500 };
      const apiError = new ApiError(error);
      const inputAction = new DownloadListAction({
        options: {
          startDate: '2020-01-01',
          endDate: '2020-01-01',
          courtListType: CourtListType.PUBLIC,
          courtCentreId: 'organisationUnitId',
          courtRoomId: 'courtroomId'
        }
      });

      actions$ = hot('-a-', { a: inputAction });
      const downloadLists = cold('-#', null, error);
      const expected$ = cold('--b', { b: apiError });

      downloadCourtList.and.returnValue(downloadLists);

      expect(effects.downloadCourtList$).toBeObservable(expected$);
    });
  });

  describe('updateCourtRestrictions$', () => {
    it('should restrict court lists', () => {
      const courtRestrictionMock: CourtRestriction = {
        hearingId: '12345',
        caseIds: ['123456'],
        restrictCourtList: true
      };

      const options = {
        courtCentreId: '123',
        authorityId: '456',
        hearingTypeId: '567',
        jurisdictionType: 'CROWN',
        courtRoomId: '678',
        searchDate: '2000-01-01',
        startDate: '2018-10-10,',
        endDate: '2018-10-14',
        startTime: '10:30',
        endTime: '11:30'
      } as SelectedFilterOptions;

      const searchAllocatedHearingsByDateRange = new SearchAllocatedHearingsByDateRangeAction({
        options
      });

      const inputAction = new CourtRestrictionAction({
        courtRestriction: courtRestrictionMock,
        options
      });
      const outputAction = new CourtRestrictionSuccessAction({
        courtRestriction: courtRestrictionMock
      });

      actions$ = hot('-a', { a: inputAction });
      const expected$ = cold('--(cd)', {
        c: searchAllocatedHearingsByDateRange,
        d: outputAction
      });
      const courtRestriction$ = cold('-b|', { b: courtRestrictionMock });
      updateCourtRestrictionsSync.and.returnValue(courtRestriction$);
      expect(effects.updateCourtRestrictions$).toBeObservable(expected$);
    });
    describe('publishCourtList$', () => {
      it('should publish court list status', () => {
        const publishStatus = {
          courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
          publishCourtListType: PublishCourtListType.Warn,
          lastUpdated: '12-12-2022 12:42:00',
          publishStatus: 'a new status',
          failureMessage: ''
        };
        const inputAction = new SetPublishListStatusAction(publishStatus);
        const outputAction = new SetPublishListStatusSuccessAction(publishStatus);
        actions$ = hot('-a--', { a: inputAction });
        const publishStatusObs = cold('-b|', { b: publishStatus });
        const expected$ = cold('--c-', { c: outputAction });
        publishCourtListStatus.and.returnValue(publishStatusObs);
        expect(effects.publishCourtList$).toBeObservable(expected$);
      });

      it('should get court list statuses', () => {
        const publishStatusRequested = {
          courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
          publishCourtListTypes: PublishCourtListType.Draft,
          lastUpdated: '12-12-2022 12:42:00',
          publishStatus: 'a new status',
          failureMessage: ''
        };
        const publishStatus1 = {
          courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
          publishCourtListType: PublishCourtListType.Warn,
          lastUpdated: '12-12-2022 12:42:00',
          publishStatus: 'a new status',
          failureMessage: ''
        };
        const publishStatus2 = {
          courtCentreId: '820f5545-0067-4ed3-94f3-e46220154f90',
          publishCourtListType: PublishCourtListType.Draft,
          lastUpdated: '12-12-2022 12:42:00',
          publishStatus: 'a new status',
          failureMessage: ''
        };

        const publishStatuses = [publishStatus1, publishStatus2];
        const inputAction = new GetPublishListStatusAction(publishStatusRequested);
        const outputAction = new GetPublishListStatusSuccessAction(publishStatuses);
        actions$ = hot('-a--', { a: inputAction });
        const publishStatusListObs = cold('-b|', { b: publishStatuses });
        const expected$ = cold('--c-', { c: outputAction });
        retrieveLatestCourtListStatus.and.returnValue(publishStatusListObs);
        expect(effects.getLatestCourtListStatus$).toBeObservable(expected$);
      });
    });
  });

  describe('searchAvailableHearings$', () => {
    const formOptions = {
      hearingId: 'test-hearing-id',
      caseUrns: null,
      searchCriterias: [SearchCriteriaAvailableHearingsType.CASE_IN_HEARING]
    } as SearchAvailableHearingsFormOptions;

    const inputAction = new SearchAvailableHearingsAction(formOptions);

    it('should search available hearings', () => {
      const payload = {
        hearings: [],
        notes: [{ id: 'note-id' } as ListingNote]
      };

      const outputHearingAction = new SearchAvailableHearingsSuccessAction([]);
      const outputNotesAction = loadListingNotesAction({ notes: payload.notes });

      actions$ = hot('-a-------', { a: inputAction });
      const payload$ = cold('--(b|)', { b: payload });
      const expected$ = cold('---(xy)', {
        x: outputHearingAction,
        y: outputNotesAction
      });

      searchAvailableHearings.and.returnValue(payload$);

      expect(effects.searchAvailableHearings$).toBeObservable(expected$);

      expect(searchAvailableHearings).toHaveBeenCalledWith(formOptions);
    });

    it('should handle an api error from searching available hearings', () => {
      const error = { status: 500 };
      const apiError = new ApiError(error);

      actions$ = hot('-a-', { a: inputAction });
      const hearings$ = cold('-#', null, error);
      const expected$ = cold('--c', { c: apiError });

      searchAvailableHearings.and.returnValue(hearings$);

      expect(effects.searchAvailableHearings$).toBeObservable(expected$);
    });
  });

  describe('listingNotes', () => {
    describe('create listing note', () => {
      const note = {
        hearingDate: '2020-09-16',
        courtRoomId: 'courtRoom-id',
        noteDescription: 'new note'
      };

      it('should create listing notes', () => {
        const response = {
          id: 'note-1',
          date: '2020-09-16',
          courtRoomId: 'courtRoom-id',
          note: 'new note'
        } as ListingNote;

        const createListingNotesuccessAction = createListingNoteSuccess({ note: response });

        actions$ = hot('-a-', { a: createListingNoteAction({ note }) });
        const response$ = cold('-(b|)', { b: response });
        const expected$ = cold('--d', {
          d: createListingNotesuccessAction
        });
        createListingNotes.and.returnValue(response$);
        expect(effects.createListingNote$).toBeObservable(expected$);
      });

      it('should handle an api error from create listing note', () => {
        const error = { status: 500 };
        const apiError = new ApiError(error);

        actions$ = hot('-a-', { a: createListingNoteAction({ note }) });
        const response$ = cold('-#', null, error);
        const expected$ = cold('--d)', {
          d: apiError
        });

        createListingNotes.and.returnValue(response$);
        expect(effects.createListingNote$).toBeObservable(expected$);
      });
    });

    describe('update listing note', () => {
      const update = {
        noteId: 'note-id',
        noteDescription: 'new note'
      };

      it('should update a listing note', () => {
        const updateListingNoteSuccessAction = updateListingNoteSuccess(update);

        actions$ = hot('-a-', { a: updateListingNoteAction(update) });
        const response$ = cold('-(b|)', { b: update });
        const expected$ = cold('--d', {
          d: updateListingNoteSuccessAction
        });
        updateListingNote.and.returnValue(response$);
        expect(effects.updateListingNote$).toBeObservable(expected$);
      });

      it('should handle an api error from update listing note', () => {
        const error = { status: 500 };
        const apiError = new ApiError(error);

        actions$ = hot('-a-', { a: updateListingNoteAction(update) });
        const response$ = cold('-#', null, error);
        const expected$ = cold('--d', {
          d: apiError
        });

        updateListingNote.and.returnValue(response$);
        expect(effects.updateListingNote$).toBeObservable(expected$);
      });
    });

    describe('delete listing note', () => {
      const deleteNote = {
        noteId: 'note-id'
      };
      it('should delete a listing note', () => {
        const deleteListingNoteSuccessAction = deleteListingNoteSuccess(deleteNote);

        actions$ = hot('-a-', { a: deleteListingNoteAction(deleteNote) });
        const response$ = cold('-(b|)', { b: deleteNote });
        const expected$ = cold('--d', {
          d: deleteListingNoteSuccessAction
        });
        deleteListingNote.and.returnValue(response$);
        expect(effects.deleteListingNote$).toBeObservable(expected$);
      });

      it('should handle an api error from delete listing note', () => {
        const error = { status: 500 };
        const apiError = new ApiError(error);

        actions$ = hot('-a-', { a: deleteListingNoteAction(deleteNote) });
        const response$ = cold('-#', null, error);
        const expected$ = cold('--d', {
          d: apiError
        });

        deleteListingNote.and.returnValue(response$);
        expect(effects.deleteListingNote$).toBeObservable(expected$);
      });
    });
  });

  describe('downloadUpcomingHearings$', () => {
    it('should download upcoming hearings report', () => {
      store.dispatch(
        ReferenceDataActions.loadOrganisationUnitsSuccess({
          organisationUnits: [
            {
              id: 'organisationUnitId',
              oucodeL3Name: 'Test Court Centre'
            } as OrganisationUnit
          ]
        })
      );
      const testBlob = new Blob(['textstream'], { type: 'text/csv' });
      const options = {
        startDate: '2020-01-01',
        courtCentreId: 'organisationUnitId'
      };
      const inputAction = downloadUpcomingHearingsAction({ options });

      actions$ = hot(' -a', { a: inputAction });
      const download$ = cold(' -(b|)   ', { b: testBlob });
      const expected$ = cold('--x', { x: downloadUpcomingHearingsSuccessAction() });

      downloadUpcomingHearings.and.returnValue(download$);

      expect(effects.downloadUpcomingHearings$).toBeObservable(expected$);
      expect(downloadUpcomingHearings).toHaveBeenCalledWith(inputAction.options);
      expect(FileSaver.saveAs).toHaveBeenCalledWith(
        testBlob,
        'Upcoming Hearings - Test Court Centre.csv'
      );
    });

    it('should handle an api error from upcoming hearing download', () => {
      const error = { status: 500 };
      const apiError = new ApiError(error);
      const inputAction = downloadUpcomingHearingsAction({ options: selectedOptionsMock });

      actions$ = hot('-a-', { a: inputAction });
      const downloadUpcomingHearings$ = cold('-#', null, error);
      const expected$ = cold('--b', { b: apiError });

      downloadUpcomingHearings.and.returnValue(downloadUpcomingHearings$);

      expect(effects.downloadUpcomingHearings$).toBeObservable(expected$);
    });
  });
});
