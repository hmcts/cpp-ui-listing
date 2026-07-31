import { Action, createAction, props } from '@ngrx/store';
import { pickBy } from 'lodash-es';
import { Hearing } from '../model';
import {
  AllocatingHearingDetails,
  ExtendedJudicialRole,
  HearingSchedule,
  HearingWithSelectedCourtCentre,
  PaginatedHearings,
  PublishStatus,
  SequenceHearing
} from '../model/hearing';
import {
  CourtRestriction,
  SearchAvailableHearingsFormOptions,
  SelectedFilterOptions
} from '../model/';
import { TypeOfListSummary } from '../../unscheduled-listings/unscheduled-listings.interfaces';
import { CaseNotesMap } from '../reducers';
import { ValidationError } from '@cpp/pdk';
import { DownloadListRequest } from '../../create-a-list/models/mags-publish-list.dto';

export const LIST_UNALLOCATED_HEARINGS = 'LIST_UNALLOCATED_HEARINGS';
export const LIST_UNALLOCATED_HEARINGS_SUCCESS = 'LIST_UNALLOCATED_HEARINGS_SUCCESS';
export const CLEAR_UNALLOCATED_HEARINGS = 'CLEAR_UNALLOCATED_HEARINGS';
export const CLEAR_UNSCHEDULED_HEARINGS = 'CLEAR_UNSCHEDULED_HEARINGS';
export const CLEAR_ALLOCATED_HEARINGS = 'CLEAR_ALLOCATED_HEARINGS';

export const LIST_UNSCHEDULED_HEARINGS = 'LIST_UNSCHEDULED_HEARINGS';
export const LIST_UNSCHEDULED_HEARINGS_SUCCESS = 'LIST_UNSCHEDULED_HEARINGS_SUCCESS';

export const TYPE_OF_LIST = 'TYPE_OF_LIST';
export const TYPE_OF_LIST_SUCCESS = 'TYPE_OF_LIST_SUCCESS';

export const LIST_UNALLOCATED_FIXED_AND_WEEK_COMMENCING_HEARINGS =
  'LIST_UNALLOCATED_FIXED_AND_WEEK_COMMENCING_HEARINGS';

export const SEARCH_ALLOCATED_HEARINGS = 'SEARCH_ALLOCATED_HEARINGS';
export const SEARCH_ALLOCATED_HEARINGS_SUCCESS = 'SEARCH_ALLOCATED_HEARINGS_SUCCESS';

export const UPDATE_ADJOURNED_HEARING_JUDICIARY = 'UPDATE_ADJOURNED_HEARING_JUDICIARY';

export const SEARCH_AVAILABLE_HEARINGS = 'SEARCH_AVAILABLE_HEARINGS';
export const SEARCH_AVAILABLE_HEARINGS_SUCCESS = 'SEARCH_AVAILABLE_HEARINGS_SUCCESS';
export const RESET_AVAILABLE_HEARINGS = 'RESET_AVAILABLE_HEARINGS';

export const CLEAR_LAST_ALLOCATED_HEARING = 'CLEAR_LAST_ALLOCATED_HEARING';

export const SEARCH_ALLOCATED_HEARINGS_BY_DATE_RANGE = 'SEARCH_ALLOCATED_HEARINGS_BY_DATE_RANGE';
export const SEARCH_ALLOCATED_HEARINGS_BY_DATE_RANGE_SUCCESS =
  'SEARCH_ALLOCATED_HEARINGS_BY_DATE_RANGE_SUCCESS';

export const UPDATE_ALLOCATED_HEARING_ACTION = 'UPDATE_ALLOCATED_HEARING_ACTION';
export const UPDATE_ALLOCATED_HEARING_SUCCESS_ACTION = 'UPDATE_ALLOCATED_HEARING_SUCCESS_ACTION';

export const ALLOCATE_HEARING_ACTION = 'ALLOCATE_HEARING_ACTION';
export const ALLOCATE_HEARING_SUCCESS_ACTION = 'ALLOCATE_HEARING_SUCCESS_ACTION';

export const ALLOCATE_HEARING_MAGS_ACTION = 'ALLOCATE_HEARING_MAGS_ACTION';
export const ALLOCATE_HEARING_MAGS_SUCCESS_ACTION = 'ALLOCATE_HEARING_MAGS_SUCCESS_ACTION';

export const WEEK_COMMENCING_HEARING_ACTION = 'WEEK_COMMENCING_HEARING_ACTION';
export const WEEK_COMMENCING_HEARING_SUCCESS_ACTION = 'WEEK_COMMENCING_HEARING_SUCCESS_ACTION';

export const SEQUENCE_HEARINGS_ACTION = 'SEQUENCE_HEARINGS_ACTION';
export const SEQUENCE_HEARINGS_SUCCESS_ACTION = 'SEQUENCE_HEARINGS_SUCCESS_ACTION';

export const CHANGE_JUDICIARY_FOR_HEARINGS_ACTION = 'CHANGE_JUDICIARY_FOR_HEARINGS_ACTION';
export const CHANGE_JUDICIARY_FOR_HEARINGS_SUCCESS_ACTION =
  'CHANGE_JUDICIARY_FOR_HEARINGS_SUCCESS_ACTION';

export const DOWNLOAD_LIST_ACTION = 'DOWNLOAD_LIST_ACTION';
export const DOWNLOAD_LIST_SUCCESS_ACTION = 'DOWNLOAD_LIST_SUCCESS_ACTION';

export const COURT_RESTRICTION_ACTION = 'COURT_RESTRICTION_ACTION';
export const COURT_RESTRICTION_SUCCESS_ACTION = 'COURT_RESTRICTION_SUCCESS_ACTION';
export const COURT_RESTRICTION_EXPAND_ACTION = 'COURT_RESTRICTION_EXPAND_ACTION';

export const EXTEND_HEARING_FOR_HEARING = 'EXTEND_HEARING_FOR_HEARING';
export const EXTEND_HEARING_FOR_HEARING_SUCCESS = 'EXTEND_HEARING_FOR_HEARING_SUCCESS';

export const GET_PUBLISH_LIST_STATUS_ACTION = 'GET_PUBLISH_LIST_STATUS_ACTION';
export const GET_PUBLISH_LIST_STATUS_SUCCESS_ACTION = 'GET_PUBLISH_LIST_STATUS_SUCCESS_ACTION';
export const SET_PUBLISH_LIST_STATUS_ACTION = 'SET_PUBLISH_LIST_STATUS_ACTION';
export const SET_PUBLISH_LIST_STATUS_SUCCESS_ACTION = 'SET_PUBLISH_LIST_STATUS_SUCCESS_ACTION';
export const SCHEDULED_ALLOCATE_HEARING_ACTION = 'SCHEDULED_ALLOCATE_HEARING_ACTION';
export const CLEAR_HEARING_SLOTS = 'CLEAR_HEARING_SLOTS';

export class ListUnallocatedHearingsAction implements Action {
  readonly type = LIST_UNALLOCATED_HEARINGS;

  filterOptions: SelectedFilterOptions;

  constructor(public payload: SelectedFilterOptions) {
    // Remove filter options with 'ALL' value
    this.filterOptions = pickBy(payload, (value, key) => value !== 'ALL');
  }
}

export class ListUnallocatedFixedAndWeekCommencingHearings implements Action {
  readonly type = LIST_UNALLOCATED_FIXED_AND_WEEK_COMMENCING_HEARINGS;
  filterOptions: SelectedFilterOptions;

  constructor(public payload: SelectedFilterOptions) {
    this.filterOptions = pickBy(payload, (value, key) => value !== 'ALL');
  }
}

export class ListUnallocatedHearingsSuccessAction implements Action {
  readonly type = LIST_UNALLOCATED_HEARINGS_SUCCESS;

  constructor(public payload: PaginatedHearings) {}
}

export class ListUnscheduledHearingsAction implements Action {
  readonly type = LIST_UNSCHEDULED_HEARINGS;

  filterOptions: SelectedFilterOptions;

  constructor(public payload: SelectedFilterOptions) {
    this.filterOptions = pickBy(payload, value => value !== 'ALL');
  }
}

export class ListUnscheduledHearingsSuccessAction implements Action {
  readonly type = LIST_UNSCHEDULED_HEARINGS_SUCCESS;

  constructor(public payload: PaginatedHearings) {}
}

export class TypeOfListAction implements Action {
  readonly type = TYPE_OF_LIST;
}

export class TypeOfListActionSuccess implements Action {
  readonly type = TYPE_OF_LIST_SUCCESS;

  constructor(public payload: TypeOfListSummary[]) {}
}

export class ClearUnallocatedHearingsAction implements Action {
  readonly type = CLEAR_UNALLOCATED_HEARINGS;
}

export class ClearAllocatedHearingsAction implements Action {
  readonly type = CLEAR_ALLOCATED_HEARINGS;
}

export class ClearUnscheduledHearingsAction implements Action {
  readonly type = CLEAR_UNSCHEDULED_HEARINGS;
}

export class SearchAllocatedHearingsAction implements Action {
  readonly type = SEARCH_ALLOCATED_HEARINGS;

  constructor(public payload: { options: SelectedFilterOptions; from?: Date; to?: Date }) {}
}

export class SearchAllocatedHearingsSuccessAction implements Action {
  readonly type = SEARCH_ALLOCATED_HEARINGS_SUCCESS;

  constructor(public payload: Hearing[]) {}
}

export class SearchAllocatedHearingsByDateRangeAction implements Action {
  readonly type = SEARCH_ALLOCATED_HEARINGS_BY_DATE_RANGE;

  constructor(public payload: { options: SelectedFilterOptions }) {}
}

export class SearchAllocatedHearingsByDateRangeSuccessAction implements Action {
  readonly type = SEARCH_ALLOCATED_HEARINGS_BY_DATE_RANGE_SUCCESS;

  constructor(public payload: PaginatedHearings) {}
}
export class ScheduledAllocateHearingAction implements Action {
  readonly type = SCHEDULED_ALLOCATE_HEARING_ACTION;

  constructor(public payload: Hearing) {}
}

export class AllocateHearingAction implements Action {
  readonly type = ALLOCATE_HEARING_ACTION;

  constructor(public payload: AllocatingHearingDetails) {}
}

export class AllocateHearingSuccessAction implements Action {
  readonly type = ALLOCATE_HEARING_SUCCESS_ACTION;
}

export class AllocateHearingMagsAction implements Action {
  readonly type = ALLOCATE_HEARING_MAGS_ACTION;
  constructor(public payload: HearingSchedule) {}
}

export class AllocateHearingMagsSuccessAction implements Action {
  readonly type = ALLOCATE_HEARING_MAGS_SUCCESS_ACTION;
}

export class WeekCommencingHearingSearchAction implements Action {
  readonly type = WEEK_COMMENCING_HEARING_ACTION;

  constructor(public payload: { options: SelectedFilterOptions }) {}
}

export class WeekCommencingHearingSearchSuccessAction implements Action {
  readonly type = WEEK_COMMENCING_HEARING_SUCCESS_ACTION;

  constructor(public payload: PaginatedHearings) {}
}

export class ClearLastAllocatedHearingAction implements Action {
  readonly type = CLEAR_LAST_ALLOCATED_HEARING;
}

export class ClearHearingSlots implements Action {
  readonly type = CLEAR_HEARING_SLOTS;
}

export class UpdateAllocatedHearingAction implements Action {
  readonly type = UPDATE_ALLOCATED_HEARING_ACTION;

  constructor(public payload: AllocatingHearingDetails) {}
}

export class UpdateAllocatedHearingSuccessAction implements Action {
  readonly type = UPDATE_ALLOCATED_HEARING_SUCCESS_ACTION;

  constructor(public payload: Hearing) {}
}

export class SequenceHearingAction implements Action {
  readonly type = SEQUENCE_HEARINGS_ACTION;

  constructor(
    public payload: {
      hearings: SequenceHearing[];
    }
  ) {}
}

export class SequenceHearingSuccessAction implements Action {
  readonly type = SEQUENCE_HEARINGS_SUCCESS_ACTION;

  constructor(
    public payload: {
      hearings: SequenceHearing[];
    }
  ) {}
}

export class ChangeJudicaryForHearingsAction implements Action {
  readonly type = CHANGE_JUDICIARY_FOR_HEARINGS_ACTION;

  constructor(
    public payload: {
      hearings: HearingWithSelectedCourtCentre[];
      judiciary: ExtendedJudicialRole[];
    }
  ) {}
}

export class ChangeJudicaryForHearingsSuccessAction implements Action {
  readonly type = CHANGE_JUDICIARY_FOR_HEARINGS_SUCCESS_ACTION;

  constructor(
    public payload: {
      hearings: Hearing[];
      judiciary: ExtendedJudicialRole[];
    }
  ) {}
}

export class DownloadListAction implements Action {
  readonly type = DOWNLOAD_LIST_ACTION;

  constructor(public payload: { options: DownloadListRequest }) {}
}

export class DownloadListSuccessAction implements Action {
  readonly type = DOWNLOAD_LIST_SUCCESS_ACTION;

  constructor() {}
}

export class CourtRestrictionAction implements Action {
  readonly type = COURT_RESTRICTION_ACTION;

  constructor(
    public payload: {
      courtRestriction: CourtRestriction;
      options: SelectedFilterOptions;
    }
  ) {}
}

export class CourtRestrictionSuccessAction implements Action {
  readonly type = COURT_RESTRICTION_SUCCESS_ACTION;

  constructor(
    public payload: {
      courtRestriction: CourtRestriction;
    }
  ) {}
}

export class CourtRestrictionExpandAction implements Action {
  readonly type = COURT_RESTRICTION_EXPAND_ACTION;
  constructor(public payload: string) {}
}

export class SearchAvailableHearingsAction implements Action {
  readonly type = SEARCH_AVAILABLE_HEARINGS;

  constructor(public payload: SearchAvailableHearingsFormOptions) {}
}

export class SearchAvailableHearingsSuccessAction implements Action {
  readonly type = SEARCH_AVAILABLE_HEARINGS_SUCCESS;

  constructor(public payload: Hearing[]) {}
}

export class ResetAvailableHearingsAction implements Action {
  readonly type = RESET_AVAILABLE_HEARINGS;
}

export class ExtendHearingForHearingAction implements Action {
  readonly type = EXTEND_HEARING_FOR_HEARING;

  constructor(
    public payload: {
      selectedHearingId: string;
      extendedHearingId: string;
      isUnscheduledHearing?: boolean;
      sendNotificationToParties?: boolean;
    }
  ) {}
}

export class ExtendHearingForHearingSuccessAction implements Action {
  readonly type = EXTEND_HEARING_FOR_HEARING_SUCCESS;

  constructor(public payload: Hearing) {}
}

export class GetPublishListStatusAction implements Action {
  readonly type = GET_PUBLISH_LIST_STATUS_ACTION;
  constructor(public payload: PublishStatus) {}
}

export class GetPublishListStatusSuccessAction implements Action {
  readonly type = GET_PUBLISH_LIST_STATUS_SUCCESS_ACTION;
  constructor(public payload: PublishStatus[]) {}
}

export class SetPublishListStatusAction implements Action {
  readonly type = SET_PUBLISH_LIST_STATUS_ACTION;
  constructor(public payload: PublishStatus) {}
}

export class SetPublishListStatusSuccessAction implements Action {
  readonly type = SET_PUBLISH_LIST_STATUS_SUCCESS_ACTION;
  constructor(public payload: PublishStatus) {}
}

export class UpdateAdjournedHearingJudiciaryAction implements Action {
  readonly type = UPDATE_ADJOURNED_HEARING_JUDICIARY;

  constructor() {}
}

export const setCaseNotes = createAction(
  'SET_CASE_NOTES',
  props<{ caseNotes: Record<string, CaseNotesMap> }>()
);

export const searchAllocatedHearingsForPrisonListAction = createAction(
  'SEARCH_ALLOCATED_HEARINGS_FOR_PRISON_LIST',
  props<{ options: SelectedFilterOptions }>()
);

export const downloadPrisonListAction = createAction(
  'DOWNLOAD_PRISON_LIST',
  props<{ options: SelectedFilterOptions }>()
);

export const downloadPrisonListSuccessAction = createAction('DOWNLOAD_PRISON_LIST_SUCCESS');

export const splitHearingUnallocated = createAction(
  'SPLIT_HEARING_UNALLOCATED',
  props<{ splitHearingUnallocated: boolean }>()
);

export const setEditAllocationError = createAction(
  'SET_EDIT_ALLOCATION_ERROR',
  props<{ editAllocationError: ValidationError }>()
);

export const setHearingToEditAllocation = createAction(
  'SET_HEARING_TO_EDIT_ALLOCATION',
  props<{ hearingToEditAllocation: Hearing }>()
);

export const downloadUpcomingHearingsAction = createAction(
  'DOWNLOAD_UPCOMING_HEARINGS',
  props<{ options: SelectedFilterOptions }>()
);

export const downloadUpcomingHearingsSuccessAction = createAction(
  'DOWNLOAD_UPCOMING_HEARINGS_SUCCESS'
);

export type HearingAction =
  | ListUnallocatedHearingsAction
  | ListUnallocatedHearingsSuccessAction
  | ClearUnallocatedHearingsAction
  | ClearAllocatedHearingsAction
  | ClearUnscheduledHearingsAction
  | ListUnscheduledHearingsAction
  | ListUnscheduledHearingsSuccessAction
  | TypeOfListAction
  | TypeOfListActionSuccess
  | SearchAllocatedHearingsAction
  | SearchAllocatedHearingsSuccessAction
  | SearchAllocatedHearingsByDateRangeAction
  | SearchAllocatedHearingsByDateRangeSuccessAction
  | AllocateHearingAction
  | AllocateHearingSuccessAction
  | ClearLastAllocatedHearingAction
  | UpdateAllocatedHearingAction
  | UpdateAllocatedHearingSuccessAction
  | SequenceHearingAction
  | SequenceHearingSuccessAction
  | ChangeJudicaryForHearingsAction
  | ChangeJudicaryForHearingsSuccessAction
  | DownloadListAction
  | CourtRestrictionAction
  | CourtRestrictionSuccessAction
  | CourtRestrictionExpandAction
  | SearchAvailableHearingsAction
  | SearchAvailableHearingsSuccessAction
  | ResetAvailableHearingsAction
  | ExtendHearingForHearingAction
  | ExtendHearingForHearingSuccessAction
  | WeekCommencingHearingSearchAction
  | WeekCommencingHearingSearchSuccessAction
  | ListUnallocatedFixedAndWeekCommencingHearings
  | GetPublishListStatusAction
  | GetPublishListStatusSuccessAction
  | SetPublishListStatusAction
  | SetPublishListStatusSuccessAction
  | ScheduledAllocateHearingAction
  | AllocateHearingMagsAction
  | AllocateHearingMagsSuccessAction
  | ClearHearingSlots
  | ReturnType<typeof setCaseNotes>
  | ReturnType<typeof searchAllocatedHearingsForPrisonListAction>
  | ReturnType<typeof downloadPrisonListAction>
  | ReturnType<typeof splitHearingUnallocated>
  | ReturnType<typeof setEditAllocationError>
  | ReturnType<typeof setHearingToEditAllocation>;
