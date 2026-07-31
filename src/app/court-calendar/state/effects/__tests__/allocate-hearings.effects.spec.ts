import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable } from 'rxjs';
import { cold, hot } from 'jasmine-marbles';
import { CourtCalendarActions, COURT_CALENDAR_FEATURE_KEY, PaginatedHearingMap } from '../..';
import * as effects from '../allocate-hearings.effects';
import { ApiError, Hearing, ListingService } from '../../../../core';

import { mockSearchFormValues, mockCourtCalendarState } from '../../../utils/mocks';
import { TestColdObservable } from 'jasmine-marbles/src/test-observables';
import { SchedulingService } from '@cpp/scheduling';

let searchCourtCalendarHearings: jest.Mock;
const schedulingServiceMock = { searchHearingSlots: jest.fn() };

const mockWidgetFilter = {
  startDate: '2025-01-28',
  courtCentre: {
    id: 'courtCentreId',
    oucode: 'B01EF00',
    courtrooms: []
  }
};

const initialState = {
  [COURT_CALENDAR_FEATURE_KEY]: {
    ...mockCourtCalendarState,
    filterOptions: {
      ...mockSearchFormValues,
      courtCentre: {
        ...mockSearchFormValues.courtCentre,
        oucode: 'B01EF00'
      }
    },
    unallocated: {
      allocateWidgetFilter: mockWidgetFilter
    }
  }
};
describe('CourtCalendar', () => {
  let actions$: Observable<any>;
  let listingService: ListingService;
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
        { provide: SchedulingService, useValue: schedulingServiceMock }
      ]
    });

    listingService = TestBed.inject(ListingService);
  });

  describe('Allocate hearings Effects', () => {
    describe('Allocated Hearings Widget', () => {
      let expectedPayload: PaginatedHearingMap;
      let response$: TestColdObservable;

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

        const effect$ = effects.getAllocatedHearingsForWidgetEffect(actions$, listingService);

        const expected$ = cold('-b', {
          b: CourtCalendarActions.getAllocatedHearingsForWidgetSuccess({
            payload: expectedPayload
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

        const effect$ = effects.getAllocatedHearingsForWidgetEffect(actions$, listingService);

        expect(effect$).toBeObservable(expected$);
      });
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
