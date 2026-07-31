import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of } from 'rxjs';
import { cold, hot } from 'jasmine-marbles';
import {
  CourtCalendarActions,
  COURT_CALENDAR_FEATURE_KEY,
  getFailedAllocationIds,
  PaginatedHearingMap
} from '../..';
import * as effects from '../allocate-hearings.effects';
import { ApiError, Hearing, ListingService } from '../../../../core';

import { mockSearchFormValues, mockCourtCalendarState } from '../../../utils/mocks';
import { TestColdObservable } from 'jasmine-marbles/src/test-observables';
import { SchedulingService } from '@cpp/scheduling';

let searchCourtCalendarHearings: jest.Mock;

let store: MockStore;
const initialState = {
  [COURT_CALENDAR_FEATURE_KEY]: mockCourtCalendarState
};
describe('CourtCalendar', () => {
  let actions$: Observable<any>;
  let listingService: ListingService;
  let schedulingService: SchedulingService;
  beforeEach(() => {
    jest.useFakeTimers();
    searchCourtCalendarHearings = jest.fn();
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
        {
          provide: ListingService,
          useValue: {
            searchCourtCalendarHearings
          }
        },
        {
          provide: SchedulingService,
          useValue: {
            schedulingService
          }
        }
      ]
    });

    listingService = TestBed.inject(ListingService);
    schedulingService = TestBed.inject(SchedulingService);
    store = TestBed.inject(MockStore);
  });

  describe('Allocate hearings Effects', () => {
    describe('Allocated Hearings Widget', () => {
      let expectedPayload: PaginatedHearingMap;
      let response$: TestColdObservable;
      const mockSearchHearingSlots = () => {
        schedulingService.searchHearingSlots = jest
          .fn()
          .mockReturnValue(of({ hearingSlots: null, totalResults: 0 }));
      };

      beforeEach(() => {
        expectedPayload = {
          courtRoomMapByDate: {
            [mockSearchFormValues.startDate]: [mockSearchFormValues.courtCentre.courtrooms[0].id]
          },
          paginatedHearings: {
            hearings: [],
            pagination: {
              totalNumber: 0,
              currentPage: 1,
              pageCount: 1
            }
          }
        };
        response$ = cold('b|', {
          b: {
            hearings: [],
            results: 0,
            pageCount: 1,
            notes: []
          }
        });
      });
      it('should dispatch getAllocatedHearingsForWidgetSuccess action when allocated hearings for widget is fired', () => {
        actions$ = cold('-a', {
          a: CourtCalendarActions.getAllocatedHearingsForWidget({
            filterOptions: mockSearchFormValues
          })
        });
        searchCourtCalendarHearings.mockReturnValueOnce(response$);
        mockSearchHearingSlots();

        const effect$ = effects.getAllocatedHearingsForWidgetEffect(
          actions$,
          listingService,
          schedulingService
        );

        const expected$ = cold('--b', {
          b: CourtCalendarActions.getAllocatedHearingsForWidgetSuccess({
            payload: expectedPayload
          })
        });
        expect(effect$).toBeObservable(expected$);
      });

      it('should dispatch getAllocatedHearingsForWidgetSuccess action when allocated hearings for widget is fired after new Allocation', () => {
        actions$ = cold('-a', {
          a: CourtCalendarActions.getAllocatedHearingsForWidget({
            filterOptions: mockSearchFormValues,
            onSectionAllocate: true
          })
        });
        searchCourtCalendarHearings.mockReturnValueOnce(response$);
        mockSearchHearingSlots();

        const effect$ = effects.getAllocatedHearingsForWidgetEffect(
          actions$,
          listingService,
          schedulingService
        );

        const expected$ = cold('--b', {
          b: CourtCalendarActions.getAllocatedHearingsForWidgetSuccess({
            payload: expectedPayload,
            onSectionAllocate: true
          })
        });
        expect(effect$).toBeObservable(expected$);
      });

      it('should dispatch getAllocatedHearingsForWidgetSuccess action when allocated hearings for widget is fired after new sequence', () => {
        actions$ = cold('-a', {
          a: CourtCalendarActions.getAllocatedHearingsForWidget({
            filterOptions: mockSearchFormValues,
            onSequenceOnly: true
          })
        });
        searchCourtCalendarHearings.mockReturnValueOnce(response$);
        mockSearchHearingSlots();

        const effect$ = effects.getAllocatedHearingsForWidgetEffect(
          actions$,
          listingService,
          schedulingService
        );

        const expected$ = cold('--b', {
          b: CourtCalendarActions.getAllocatedHearingsForWidgetSuccess({
            payload: expectedPayload,
            onSequenceOnly: true
          })
        });
        expect(effect$).toBeObservable(expected$);
      });

      it('should handle an api error from fetching the allocated hearings', () => {
        const error = { status: 500 };
        const apiError = new ApiError(error);
        const action = CourtCalendarActions.getAllocatedHearingsForWidget({
          filterOptions: mockSearchFormValues
        });
        actions$ = hot('-a-', { a: action });
        const hearings$ = cold('#', null, error);
        const expected$ = cold('-c', { c: apiError });

        searchCourtCalendarHearings.mockReturnValueOnce(hearings$);
        schedulingService.searchHearingSlots = jest
          .fn()
          .mockReturnValueOnce(of({ hearingSlots: null, totalResults: 0 }));

        const effect$ = effects.getAllocatedHearingsForWidgetEffect(
          actions$,
          listingService,
          schedulingService
        );

        expect(effect$).toBeObservable(expected$);
      });

      it('should fire the component store trigger when allocation in successful on new allocations', () => {
        actions$ = cold('-a', {
          a: CourtCalendarActions.getAllocatedHearingsForWidgetSuccess({
            payload: expectedPayload,
            onSectionAllocate: true
          })
        });

        const expected$ = cold('-b', {
          b: CourtCalendarActions.triggerComponentOnSectionAllocated({ failedHearingIds: [] })
        });
        expect(effects.getAllocatedHearingsForWidgetSuccessEffect(actions$, store)).toBeObservable(
          expected$
        );
      });

      it('should fire the component store trigger when allocation in successful on some allocations', () => {
        store.overrideSelector(getFailedAllocationIds, ['id1']);
        actions$ = cold('-a', {
          a: CourtCalendarActions.getAllocatedHearingsForWidgetSuccess({
            payload: expectedPayload,
            onSectionAllocate: true
          })
        });

        const expected$ = cold('-b', {
          b: CourtCalendarActions.triggerComponentOnSectionAllocated({ failedHearingIds: ['id1'] })
        });
        expect(effects.getAllocatedHearingsForWidgetSuccessEffect(actions$, store)).toBeObservable(
          expected$
        );
      });

      it('should fire the component store trigger when sequence in successful', () => {
        actions$ = cold('-a', {
          a: CourtCalendarActions.getAllocatedHearingsForWidgetSuccess({
            payload: expectedPayload,
            onSequenceOnly: true
          })
        });

        const expected$ = cold('-b', {
          b: CourtCalendarActions.triggerComponentOnSequenceOnly()
        });
        expect(effects.getAllocatedHearingsForWidgetSuccessEffect(actions$, store)).toBeObservable(
          expected$
        );
      });

      it('should dispatch updateHearingPublicListNoteSuccess when hearing is updated successfully', () => {
        const mockHearing = {
          id: 'hearing-id',
          listedCases: [{ id: 'case-1' }]
        } as Hearing;

        const prosecutionCases = [
          { id: 'case-1', prosecutionCaseId: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef' }
        ];

        actions$ = hot('-a', {
          a: CourtCalendarActions.updateHearingPublicListNote({
            updatedUnallocatedHearing: mockHearing
          })
        });

        listingService.extractProsecutionCasesIdsFromHearing = jest
          .fn()
          .mockReturnValue(prosecutionCases);

        const response$ = cold('-b|', { b: {} });
        listingService.updateUnallocatedHearing = jest.fn().mockReturnValue(response$);

        const expected$ = cold('--c', {
          c: CourtCalendarActions.updateHearingPublicListNoteSuccess({
            updatedUnallocatedHearing: mockHearing
          })
        });

        const effect$ = effects.updateHearingPublicListNoteEffect(actions$, listingService);

        expect(effect$).toBeObservable(expected$);
      });
    });
  });
});
