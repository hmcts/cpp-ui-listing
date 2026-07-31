import { TestBed } from '@angular/core/testing';
import { Store, select, provideStore } from '@ngrx/store';
import { ApiError, completedApiRequest, pendingApiRequest } from '../actions';
import { AppState, reducers } from '../reducers';
import { getHasApiActivity, getHasApiError } from './api';

let store: Store<AppState>;

describe('Api selectors', () => {
  const url = '/resultinghmps-query-api/query/api/rest/resultinghmps/people/1/hearings/1';
  const requestType = 'application/vnd.resultinghmps.person-details+json';

  const request = { url, requestType };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore(reducers, { runtimeChecks: {} })],
      teardown: { destroyAfterEach: false }
    });

    store = TestBed.inject(Store);
  });

  it('should return true when there are pending Api requests', () => {
    let result;

    store.pipe(select(getHasApiActivity)).subscribe((value) => (result = value));

    store.dispatch(pendingApiRequest({ request }));

    expect(result).toEqual(true);
  });

  it('should return false when all api requests are complete', () => {
    let result;

    store.pipe(select(getHasApiActivity)).subscribe((value) => (result = value));

    store.dispatch(pendingApiRequest({ request }));

    store.dispatch(completedApiRequest({ request }));

    expect(result).toEqual(false);
  });

  it('should return true when there are Api errors', () => {
    let result;

    store.pipe(select(getHasApiError)).subscribe((value) => (result = value));

    store.dispatch(new ApiError('Network Error'));

    expect(result).toEqual(true);
  });
});
