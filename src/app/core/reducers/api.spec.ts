import { ApiError } from '../actions';
import { apiReducer } from './api';

describe('apiReducer', () => {
  const mockedApiState = {
    errors: [],
    requests: []
  };

  it('should add any api errors to the list of errors', () => {
    const networkError = 'Network Error';
    const state = mockedApiState;
    const actual = apiReducer(state, new ApiError(networkError));
    expect(actual.errors).toEqual([networkError]);
  });
});
