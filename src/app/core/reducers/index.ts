import { referenceDataReducer, ReferenceDataState } from '@cpp/reference-data';
import { usersGroups, UsersGroupsState } from '@cpp/users-groups';
import { routerReducer as router, RouterReducerState } from '@ngrx/router-store';
import { ActionReducerMap } from '@ngrx/store';
import { apiReducer, ApiState } from './api';
import { displayReducer, DisplayState } from './display';
import { composeHearingReducers, HearingState } from './hearing';
import { onlineReducer, OnlineState } from './network-connectivity.reducer';
import { listingReferenceDataReducer, ListingReferenceDataState } from './reference-data';
import { schedulingReducer, SchedulingState } from '@cpp/scheduling';

// The top level Listing application state interface.
export interface AppState extends ReferenceDataState, UsersGroupsState, SchedulingState {
  readonly api: ApiState;
  readonly display: DisplayState;
  readonly hearings: HearingState;
  readonly online: OnlineState;
  readonly listingReferenceData: ListingReferenceDataState;
  readonly router: RouterReducerState;
}

export const reducers: ActionReducerMap<AppState> = {
  api: apiReducer,
  display: displayReducer,
  hearings: composeHearingReducers,
  online: onlineReducer,
  referenceData: referenceDataReducer,
  usersGroups: usersGroups,
  listingReferenceData: listingReferenceDataReducer,
  scheduling: schedulingReducer,
  router
};

export * from './api';
export * from './display';
export * from './hearing';
export * from './network-connectivity.reducer';
