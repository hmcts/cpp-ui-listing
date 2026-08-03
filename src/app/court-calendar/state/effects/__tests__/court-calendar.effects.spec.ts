import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable } from 'rxjs';
import { hot, cold } from 'jasmine-marbles';
import { CourtCalendarActions, COURT_CALENDAR_FEATURE_KEY } from '../../';
import * as effects from '../court-calendar.effects';
import { ApiError, ListingService } from '../../../../core';

import { mockSearchFormValues, mockCourtCalendarState } from '../../../utils/mocks';
import { loadListingNotes, resetHearingSlots } from '@cpp/scheduling';

let searchCourtCalendarHearings: jest.Mock;
let sequenceHearingSync: jest.Mock;
let getCaseNotes: jest.Mock;
let updateAllocatedHearing: jest.Mock;

const initialState = {
  [COURT_CALENDAR_FEATURE_KEY]: mockCourtCalendarState
};
describe('CourtCalendar', () => {
  let actions$: Observable<any>;
  let listingService: ListingService;
  beforeEach(() => {
    jest.useFakeTimers();
    searchCourtCalendarHearings = jest.fn();
    sequenceHearingSync = jest.fn();
    getCaseNotes = jest.fn();
    updateAllocatedHearing = jest.fn();
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
        {
          provide: ListingService,
          useValue: {
            searchCourtCalendarHearings,
            sequenceHearingSync,
            getCaseNotes,
            updateAllocatedHearing
          }
        }
      ]
    });

    listingService = TestBed.inject(ListingService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Effects', () => {
    const filterOptions = mockSearchFormValues;
    it('searchCourtCalendarsEffect should dispatch searchCourtCalendarSuccess and loadListingNotes on success', () => {
      const action = CourtCalendarActions.searchCourtCalendar({ filterOptions });

      const apiResponse = {
        hearings: [],
        results: 0,
        pageCount: 1,
        notes: []
      };

      const expectedPayload = {
        courtRoomMapByDate: {},
        paginatedHearings: {
          hearings: [],
          pagination: {
            totalNumber: 0,
            currentPage: 1,
            pageCount: 1
          }
        }
      };

      const response$ = cold('b', {
        b: { ...apiResponse }
      });

      searchCourtCalendarHearings.mockReturnValueOnce(response$);
      actions$ = hot('-a-', { a: action });

      const expectedActions = cold('-(abc)', {
        a: CourtCalendarActions.searchCourtCalendarSuccess({ payload: expectedPayload }),
        b: loadListingNotes({ notes: apiResponse.notes }),
        c: resetHearingSlots()
      });

      const effect$ = effects.searchCourtCalendarsEffect(actions$, listingService);

      expect(effect$).toBeObservable(expectedActions);
    });

    it('should handle an api error from fetching the allocated hearings', () => {
      const error = { status: 500 };
      const apiError = new ApiError(error);
      const action = CourtCalendarActions.searchCourtCalendar({ filterOptions });
      actions$ = hot('-a-', { a: action });
      const hearings$ = cold('#', null, error);
      const expected$ = cold('-c', { c: apiError });

      searchCourtCalendarHearings.mockReturnValueOnce(hearings$);

      const effect$ = effects.searchCourtCalendarsEffect(actions$, listingService);

      expect(effect$).toBeObservable(expected$);
    });

    it('setCaseNotesEffect should dispatch setCaseNotes', () => {
      const action = CourtCalendarActions.setCaseNotesForCase({ caseId: 'caseId' });

      const expectedAction = CourtCalendarActions.setCaseNotesForCaseSuccess({
        caseNotes: { caseNotes: [] }
      });

      const apiResponse = {
        caseNotes: []
      };

      const response$ = cold('-b', {
        b: { ...apiResponse }
      });

      getCaseNotes.mockReturnValueOnce(response$);
      actions$ = hot('-a-', { a: action });

      actions$ = hot('-a-', { a: action });
      const expected$ = cold('--b', { b: expectedAction });
      expect(effects.setCaseNotesEffect(actions$, listingService)).toBeObservable(expected$);
    });
  });
});
