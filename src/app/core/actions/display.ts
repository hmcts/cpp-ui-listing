import { Action } from '@ngrx/store';
import { SelectedFilterOptions } from '../model/';

export const SAVE_HEARING_FILTERS = 'SAVE_HEARING_FILTERS';
export const RESET_HEARING_FILTERS = 'RESET_HEARING_FILTERS';

export const SAVE_UNSCHEDULED_FILTERS = 'SAVE_UNSCHEDULED_FILTERS';
export const RESET_UNSCHEDULED_FILTERS = 'RESET_UNSCHEDULED_FILTERS';

export const SHOW_UNALLOCATED_HEARINGS = 'SHOW_UNALLOCATED_HEARINGS';
export const SHOW_UNSCHEDULED_HEARINGS = 'SHOW_UNSCHEDULED_HEARINGS';

export const UNALLOCATED_PAGE_VISITED = 'UNALLOCATED_PAGE_VISITED';
export const UNSCHEDULED_PAGE_VISITED = 'UNSCHEDULED_PAGE_VISITED';

export class SaveHearingFiltersAction implements Action {
  readonly type = SAVE_HEARING_FILTERS;

  constructor(public payload: SelectedFilterOptions) {}
}

export class ResetHearingFiltersAction implements Action {
  readonly type = RESET_HEARING_FILTERS;
}

export class SaveUnscheduledFiltersAction implements Action {
  readonly type = SAVE_UNSCHEDULED_FILTERS;

  constructor(public payload: SelectedFilterOptions) {}
}

export class ResetUnscheduledFiltersAction implements Action {
  readonly type = RESET_UNSCHEDULED_FILTERS;
}

export class ShowUnallocatedHearingsAction implements Action {
  readonly type = SHOW_UNALLOCATED_HEARINGS;

  constructor(public payload: boolean) {}
}

export class ShowUnscheduledHearingsAction implements Action {
  readonly type = SHOW_UNSCHEDULED_HEARINGS;

  constructor(public payload: boolean) {}
}

export class UnallocatedPageVisitedAction implements Action {
  readonly type = UNALLOCATED_PAGE_VISITED;
}

export class UnscheduledPageVisitedAction implements Action {
  readonly type = UNSCHEDULED_PAGE_VISITED;
}

export type DisplayAction =
  | SaveHearingFiltersAction
  | ResetHearingFiltersAction
  | SaveUnscheduledFiltersAction
  | ResetUnscheduledFiltersAction
  | ShowUnallocatedHearingsAction
  | ShowUnscheduledHearingsAction
  | UnallocatedPageVisitedAction
  | UnscheduledPageVisitedAction;
