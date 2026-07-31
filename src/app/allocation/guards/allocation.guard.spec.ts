import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { provideStore, Store } from '@ngrx/store';
import { cold, hot } from 'jasmine-marbles';
import { AppState, Hearing, ListUnallocatedHearingsSuccessAction, reducers } from '../../core';
import {
  HearingSlot,
  ListingNote,
  loadHearingSlotsSuccess,
  loadListingNotes,
  resetHearingSlots,
  SchedulingService,
  SearchHearingSlotsParams
} from '@cpp/scheduling';
import { AllocationGuard } from './allocation.guard';
import { UnallocatedHearings } from '../../core/model/hearing';

describe('AllocationGuard', () => {
  let guard: AllocationGuard;
  let store: Store<AppState>;

  let navigate: jest.Mock;
  let searchHearingSlots: jest.Mock;

  beforeEach(() => {
    navigate = jest.fn();
    searchHearingSlots = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        provideStore(reducers, { runtimeChecks: {} }),
        AllocationGuard,
        {
          provide: SchedulingService,
          useValue: {
            searchHearingSlots
          }
        },
        {
          provide: Router,
          useValue: {
            navigate
          }
        }
      ],
      teardown: { destroyAfterEach: false }
    });
    guard = TestBed.inject<AllocationGuard>(AllocationGuard);
    store = TestBed.inject<Store<AppState>>(Store);

    jest.spyOn(store, 'dispatch');
  });

  const defaultSearchParams: SearchHearingSlotsParams = {
    oucodeL2Code: 'oucodeL2Code',
    oucodeL3Code: 'oucodeL3Code',
    courtRoomId: 'courtRoomId',
    sessionStartDate: '2019-01-01',
    sessionEndDate: '2019-31-01',
    courtSession: 'AM',
    panel: 'ADULT',
    businessType: 'businessTypeCode',
    availableDurationMins: 30,
    pageNumber: 2,
    jurisdiction: 'MAGISTRATES'
  };

  const createActivatedRouteSnapshot = (params?: Partial<SearchHearingSlotsParams>) => {
    const snapshot = new ActivatedRouteSnapshot();
    snapshot.params = { id: 'A' };
    snapshot.queryParams = params ? { mf: JSON.stringify(params) } : {};
    return snapshot;
  };

  it('should not resolve until the hearing becomes available', () => {
    const action = new ListUnallocatedHearingsSuccessAction({
      hearings: [
        {
          id: 'A',
          jurisdictionType: 'CROWN'
        } as Hearing
      ]
    } as UnallocatedHearings);
    const snapshot = createActivatedRouteSnapshot();
    const actions$ = hot('  --a---', { a: action });
    const expected$ = cold('--(o|)', { o: true });

    actions$.subscribe(store);

    expect(guard.canActivate(snapshot)).toBeObservable(expected$);
  });

  it('should search if the hearing is of the crown jurisdiction', () => {
    store.dispatch(
      new ListUnallocatedHearingsSuccessAction({
        hearings: [
          {
            id: 'A',
            jurisdictionType: 'CROWN'
          } as Hearing
        ]
      } as UnallocatedHearings)
    );
    const snapshot = createActivatedRouteSnapshot();
    const expected$ = cold('(o|)', { o: true });

    expect(guard.canActivate(snapshot)).toBeObservable(expected$);
    expect(store.dispatch).toHaveBeenCalledWith(resetHearingSlots());
  });

  it('should activate when there is no search parameter', () => {
    store.dispatch(
      new ListUnallocatedHearingsSuccessAction({
        hearings: [
          {
            id: 'A',
            jurisdictionType: 'MAGISTRATES'
          } as Hearing
        ]
      } as UnallocatedHearings)
    );
    const snapshot = createActivatedRouteSnapshot();
    const expected$ = cold('(o|)', { o: true });

    expect(guard.canActivate(snapshot)).toBeObservable(expected$);
    expect(store.dispatch).toHaveBeenCalledWith(resetHearingSlots());
  });

  it('should activate after searching the hearing slots remotely', () => {
    store.dispatch(
      new ListUnallocatedHearingsSuccessAction({
        hearings: [
          {
            id: 'A',
            jurisdictionType: 'MAGISTRATES'
          } as Hearing
        ]
      } as UnallocatedHearings)
    );
    const snapshot = createActivatedRouteSnapshot(defaultSearchParams);
    const searchResult = {
      totalResults: 1,
      hearingSlots: [{ courtScheduleId: '*' } as HearingSlot],
      notes: [{ id: 'note-id' } as ListingNote]
    };
    const search$ = cold('  --(r|)', { r: searchResult });
    const expected$ = cold('--(o|)', { o: true });

    searchHearingSlots.mockReturnValue(search$);

    const params: SearchHearingSlotsParams = {
      ...defaultSearchParams,
      pageSize: 10
    };
    const { hearingSlots, totalResults, notes } = searchResult;
    expect(guard.canActivate(snapshot)).toBeObservable(expected$);
    expect(searchHearingSlots).toHaveBeenCalledWith(params);
    expect(store.dispatch).toHaveBeenCalledWith(
      loadHearingSlotsSuccess({ hearingSlots, totalResults, params })
    );
    expect(store.dispatch).toHaveBeenCalledWith(loadListingNotes({ notes }));
  });

  it('should reject the activation when there is a search error', () => {
    store.dispatch(
      new ListUnallocatedHearingsSuccessAction({
        hearings: [
          {
            id: 'A',
            jurisdictionType: 'MAGISTRATES'
          } as Hearing
        ]
      } as UnallocatedHearings)
    );
    const search$ = cold('  --#   ', null, new Error());
    const expected$ = cold('--(o|)', { o: false });

    const snapshot = createActivatedRouteSnapshot(defaultSearchParams);
    searchHearingSlots.mockReturnValue(search$);

    expect(guard.canActivate(snapshot)).toBeObservable(expected$);
    expect(navigate).toHaveBeenCalledWith(['/technical-error']);
    expect(store.dispatch).toHaveBeenCalledWith(resetHearingSlots());
  });
});
