import { createReducer, on } from '@ngrx/store';
import { ApiActions, API_ERROR, completedApiRequest, pendingApiRequest } from '../actions/api';
import { RequestOptions } from '../http/http-service';

export interface ApiState {
  errors: any[];
  requests: RequestOptions[];
}

export const initialState = {
  errors: [] as RequestOptions[],
  requests: [] as RequestOptions[]
};

const apiRequestReducers = createReducer(
  initialState,
  on(pendingApiRequest, (state, { request }) => ({
    ...state,
    requests: [...state.requests, request]
  })),
  on(completedApiRequest, (state, { request }) => ({
    ...state,
    requests: state.requests.filter((req) => req !== request)
  }))
);

export function apiReducer(state: ApiState = initialState, action: ApiActions): ApiState {
  switch (action.type) {
    case API_ERROR:
      return {
        ...state,
        errors: [...state.errors, action.response]
      };

    default:
      return apiRequestReducers(state, action);
  }
}
