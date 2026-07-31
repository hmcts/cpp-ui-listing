import { AppState } from '../reducers';

export const showUnallocatedHearings = (state: AppState) => state.display.showUnallocatedHearings;

export const showUnscheduledHearings = (state: AppState) => state.display.showUnscheduledHearings;

export const isUnallocatedPageVisited = (state: AppState) => state.display.unallocatedPageVisited;

export const isUnscheduledPageVisited = (state: AppState) => state.display.unscheduledPageVisited;

export const getSelectedHearingFilters = (state: AppState) => state.display.hearingFilters;

export const getSelectedUnscheduledHearingFilters = (state: AppState) =>
  state.display.unscheduledFilters;
