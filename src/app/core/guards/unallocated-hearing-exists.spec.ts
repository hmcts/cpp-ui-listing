import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { provideStore, Store } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { validHearingMock1 } from '../../../mock-data/test-fixtures';
import {
  ListUnallocatedHearingsSuccessAction,
  SearchAllocatedHearingsSuccessAction
} from '../actions';
import { Hearing } from '../model';
import { AppState, reducers } from '../reducers';
import { ListingService } from '../services';
import { UnallocatedHearingExistsGuard } from './unallocated-hearing-exists';
import { UnallocatedHearings } from '../model/hearing';
import { CppHttp } from '@cpp/core';

describe('UnallocatedHearingExistsGuard', () => {
  let guard: UnallocatedHearingExistsGuard;
  let store: Store<AppState>;

  let fetchHearingById: jest.Mock;
  let navigate: jest.Mock;

  beforeEach(() => {
    fetchHearingById = jest.fn();
    navigate = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        provideStore(reducers, { runtimeChecks: {} }),
        UnallocatedHearingExistsGuard,
        {
          provide: ListingService,
          useValue: {
            fetchHearingById
          }
        },
        {
          provide: Router,
          useValue: {
            navigate
          }
        },
        {
          provide: CppHttp,
          useValue: {
            query: jasmine.createSpy(),
            commandSync: jasmine.createSpy()
          }
        }
      ],
      teardown: { destroyAfterEach: false }
    });

    guard = TestBed.inject(UnallocatedHearingExistsGuard);
    store = TestBed.inject(Store);

    spyOn(store, 'dispatch').and.callThrough();
  });

  const createSnapshot = (id: string) => {
    const snapshot = new ActivatedRouteSnapshot();
    snapshot.params = { id };
    return snapshot;
  };

  it('should resolve to true when the unallocated hearing is in the store', () => {
    store.dispatch(
      new ListUnallocatedHearingsSuccessAction({
        hearings: [{ ...validHearingMock1, id: '123' }]
      } as UnallocatedHearings)
    );

    const snapshot = createSnapshot('123');
    const expected$ = cold('(a|)', { a: true });
    const activate$ = guard.canActivate(snapshot);

    expect(activate$).toBeObservable(expected$);
  });

  it('should fetch an unallocated hearing when not found in the store', () => {
    const hearing = { id: '*', allocated: false, judiciary: [] } as Hearing;
    const snapshot = createSnapshot('456');
    const response$ = cold('--(r|)', { r: hearing });
    const expected$ = cold('--(a|)', { a: true });

    fetchHearingById.mockReturnValue(response$);

    expect(guard.canActivate(snapshot)).toBeObservable(expected$);
    expect(store.dispatch).toHaveBeenCalledWith(
      new ListUnallocatedHearingsSuccessAction({
        hearings: [hearing],
        pagination: {
          currentPage: 1,
          totalNumber: 1
        }
      } as UnallocatedHearings)
    );
  });

  it('should do the activation when an allocated hearing exist', () => {
    const hearing = { id: '*', allocated: true } as Hearing;
    const snapshot = createSnapshot('456');
    const response$ = cold('--(r|)', { r: { ...hearing, judiciary: [] } });
    const expected$ = cold('--(a|)', { a: true });

    fetchHearingById.mockReturnValue(response$);

    expect(guard.canActivate(snapshot)).toBeObservable(expected$);
    expect(store.dispatch).toHaveBeenCalledWith(
      new SearchAllocatedHearingsSuccessAction([{ ...hearing, judiciary: [] }])
    );
  });

  it('should reject the activation when an error occurs', () => {
    const snapshot = createSnapshot('456');
    const response$ = cold('--#');
    const expected$ = cold('--(a|)', { a: false });

    fetchHearingById.mockReturnValue(response$);

    expect(guard.canActivate(snapshot)).toBeObservable(expected$);
    expect(navigate).toHaveBeenCalledWith(['/technical-error']);
  });
});
