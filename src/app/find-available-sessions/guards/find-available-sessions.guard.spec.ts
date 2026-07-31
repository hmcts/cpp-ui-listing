import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  ActivatedRouteSnapshot,
  createUrlTreeFromSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { FindAvailableSessionsGuard } from './find-available-sessions.guard';
import { cold } from 'jasmine-marbles';
import { AppState } from '../../core';
import {
  HearingSlot,
  loadHearingSlotsSuccess,
  resetHearingSlots,
  SchedulingService
} from '@cpp/scheduling';

jest.mock('@angular/router', () => ({
  ...jest.requireActual('@angular/router'),
  createUrlTreeFromSnapshot: jest.fn()
}));

describe('findAvailableSessionsGuard', () => {
  let mockStore: MockStore<AppState>;
  let mockSearchHearingSlots: jest.Mock;
  let mockNavigate: jest.Mock;
  const mockUrlTree = {
    toString: () => `/technical-error`
  } as UrlTree;

  (createUrlTreeFromSnapshot as jest.Mock).mockReturnValue(mockUrlTree);

  beforeEach(() => {
    mockSearchHearingSlots = jest.fn();
    mockNavigate = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        {
          provide: SchedulingService,
          useValue: {
            searchHearingSlots: mockSearchHearingSlots
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: mockNavigate
          }
        }
      ]
    });

    mockStore = TestBed.inject(MockStore);
    jest.spyOn(mockStore, 'dispatch');
  });

  const createActivatedRouteSnapshot = (params?: Record<string, unknown>) =>
    ({
      queryParams: params ? { mf: JSON.stringify(params) } : {}
    }) as ActivatedRouteSnapshot;

  it('should reset available slots and allow navigation if no search parameter is provided', () => {
    const snapshot = createActivatedRouteSnapshot();

    const expected$ = cold('(a|)', { a: true });
    const result = TestBed.runInInjectionContext(() => FindAvailableSessionsGuard(snapshot));

    expect(result).toBeObservable(expected$);
    expect(mockStore.dispatch).toHaveBeenCalledWith(resetHearingSlots());
  });

  it('should search for available slots when valid parameters are provided', () => {
    const searchParams = {
      oucodeL2Code: 'test',
      sessionStartDate: '2024-01-01',
      sessionEndDate: '2024-01-31'
    };
    const snapshot = createActivatedRouteSnapshot(searchParams);

    const mockSearchResult = {
      totalResults: 2,
      hearingSlots: [
        {
          courtScheduleId: '1',
          sessionDate: '2024-01-10',
          courtSession: 'AM',
          panel: 'ADULT',
          courtHouseName: 'Court 1'
        },
        {
          courtScheduleId: '2',
          sessionDate: '2024-01-15',
          courtSession: 'PM',
          panel: 'YOUTH',
          courtHouseName: 'Court 2'
        }
      ] as HearingSlot[]
    };

    mockSearchHearingSlots.mockReturnValue(cold('---a|', { a: mockSearchResult }));
    const expected$ = cold('---b|', { b: true });

    const result = TestBed.runInInjectionContext(() => FindAvailableSessionsGuard(snapshot));

    expect(result).toBeObservable(expected$);
    expect(mockSearchHearingSlots).toHaveBeenCalledWith(expect.objectContaining(searchParams));
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      loadHearingSlotsSuccess({
        params: expect.objectContaining(searchParams),
        hearingSlots: mockSearchResult.hearingSlots,
        totalResults: mockSearchResult.totalResults
      })
    );
  });

  it('should navigate to technical-error if search fails', () => {
    const snapshot = createActivatedRouteSnapshot({
      oucodeL2Code: 'test'
    });

    mockSearchHearingSlots.mockReturnValue(cold('---#', {}, new Error('Search failed')));

    (createUrlTreeFromSnapshot as jest.Mock).mockReturnValue(mockUrlTree);

    const expected$ = cold('---(a|)', { a: mockUrlTree });

    const result = TestBed.runInInjectionContext(() => FindAvailableSessionsGuard(snapshot));

    expect(result).toBeObservable(expected$);
    expect(mockSearchHearingSlots).toHaveBeenCalled();
    expect(createUrlTreeFromSnapshot).toHaveBeenCalledWith(snapshot, ['/technical-error']);
  });
});
