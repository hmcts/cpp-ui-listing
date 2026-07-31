import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Observable } from 'rxjs';
import { hot, cold } from 'jasmine-marbles';
import {
  CourtCalendarActions,
  CourtCalendarFeature,
  COURT_CALENDAR_FEATURE_KEY,
  getCourtCalendarFeature,
  getAllocateWidgetFilter,
  getAllocationType,
  AllocationType
} from '../../';
import * as effects from '../sequence-hearings.effects';
import { ListingService } from '../../../../core';

import { mockSearchFormValues, mockCourtCalendarState } from '../../../utils/mocks';

let sequenceHearingSync: jest.Mock;

const initialState = {
  [COURT_CALENDAR_FEATURE_KEY]: mockCourtCalendarState
};
describe('CourtCalendar', () => {
  let actions$: Observable<any>;
  let listingService: ListingService;
  let store: MockStore;
  beforeEach(() => {
    jest.useFakeTimers();
    sequenceHearingSync = jest.fn();
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
        {
          provide: ListingService,
          useValue: {
            sequenceHearingSync
          }
        }
      ]
    });

    listingService = TestBed.inject(ListingService);
    store = TestBed.inject(MockStore);
  });

  describe('Sequence hearings Effects', () => {
    it('should dispatch success action when sequence is successful', () => {
      const actions$ = cold('-a', {
        a: CourtCalendarActions.sequenceGroupHearings({ sequencedHearings: [] })
      });
      sequenceHearingSync.mockReturnValueOnce(cold('b|', { b: { sequencedHearings: [] } }));

      const effect$ = effects.sequenceHearingsEffect(actions$, listingService);

      const expected$ = cold('-b', {
        b: CourtCalendarActions.sequenceGroupHearingsSuccess({})
      });
      expect(effect$).toBeObservable(expected$);
    });

    it('should dispatch searchCourtCalendar when sequenceGroupHearingsSuccess is dispatched', () => {
      store.overrideSelector(getCourtCalendarFeature, CourtCalendarFeature.calendar);
      store.overrideSelector(getAllocateWidgetFilter, {
        startDate: '2000-09-09',
        courtCentre: mockSearchFormValues.courtCentre
      });
      const action = CourtCalendarActions.sequenceGroupHearingsSuccess({});

      const expectedAction = CourtCalendarActions.searchCourtCalendar({
        filterOptions: mockSearchFormValues,
        onSequenceOnly: true
      });

      actions$ = hot('-a-', { a: action });
      const expected$ = cold('-b', { b: expectedAction });
      expect(effects.sequenceHearingsSuccessEffect(actions$, store)).toBeObservable(expected$);
    });

    it('should dispatch getUnallocatedHearings and getAllocatedHearingsForWidget when sequenceGroupHearingsSuccess is dispatched after new allocation', () => {
      store.overrideSelector(getCourtCalendarFeature, CourtCalendarFeature.allocateCrown);
      store.overrideSelector(getAllocationType, AllocationType.allocate);
      store.overrideSelector(getAllocateWidgetFilter, {
        startDate: '2000-09-09',
        courtCentre: mockSearchFormValues.courtCentre
      });
      const action = CourtCalendarActions.sequenceGroupHearingsSuccess({ onSectionAllocate: true });

      const expectedAction1 = CourtCalendarActions.getUnallocatedHearings({
        filterOptions: mockSearchFormValues
      });

      const expectedAction2 = CourtCalendarActions.getAllocatedHearingsForWidget({
        filterOptions: { ...mockSearchFormValues, endDate: undefined, startDate: '2000-09-09' },
        onSectionAllocate: true,
        onSequenceOnly: false
      });

      actions$ = hot('-a-', { a: action });
      const expected$ = cold('-(bc)', { b: expectedAction1, c: expectedAction2 });
      expect(effects.sequenceHearingsSuccessEffect(actions$, store)).toBeObservable(expected$);
    });

    it('should dispatch getAllocatedHearingsForWidget when sequenceGroupHearingsSuccess is dispatched after  reallocation', () => {
      store.overrideSelector(getCourtCalendarFeature, CourtCalendarFeature.allocateCrown);
      store.overrideSelector(getAllocationType, AllocationType.reallocate);
      store.overrideSelector(getAllocateWidgetFilter, {
        startDate: '2000-09-09',
        courtCentre: mockSearchFormValues.courtCentre
      });
      const action = CourtCalendarActions.sequenceGroupHearingsSuccess({ onSectionAllocate: true });

      const expectedAction1 = CourtCalendarActions.getAllocatedHearingsForWidget({
        filterOptions: { ...mockSearchFormValues, endDate: undefined, startDate: '2000-09-09' },
        onSectionAllocate: true,
        onSequenceOnly: false
      });

      actions$ = hot('-a-', { a: action });
      const expected$ = cold('-(b)', { b: expectedAction1 });
      expect(effects.sequenceHearingsSuccessEffect(actions$, store)).toBeObservable(expected$);
    });
  });
});
