import { DisplayAction } from '../actions';
import * as DisplayActions from '../actions/display';
import { SelectedFilterOptions } from '../model/';

export interface DisplayState {
  unallocatedPageVisited: boolean;
  unscheduledPageVisited: boolean;
  showUnallocatedHearings: boolean;
  showUnscheduledHearings: boolean;
  hearingFilters: SelectedFilterOptions;
  unscheduledFilters: SelectedFilterOptions;
}

const initialState: DisplayState = {
  showUnallocatedHearings: false,
  showUnscheduledHearings: false,
  unallocatedPageVisited: false,
  unscheduledPageVisited: false,
  hearingFilters: {
    courtCentreId: 'ALL',
    authorityId: 'ALL',
    hearingTypeId: 'ALL',
    jurisdictionType: 'ALL',
    possibleDisqualification: 'ALL'
  },
  unscheduledFilters: {
    oucodeL2Code: 'ALL',
    courtCentreId: 'ALL',
    typeOfList: 'ALL',
    caseUrn: ''
  }
};

export function displayReducer(
  state: DisplayState = initialState,
  action: DisplayAction
): DisplayState {
  switch (action.type) {
    case DisplayActions.SHOW_UNALLOCATED_HEARINGS:
      return {
        ...state,
        showUnallocatedHearings: action.payload
      };

    case DisplayActions.SHOW_UNSCHEDULED_HEARINGS:
      return {
        ...state,
        showUnscheduledHearings: action.payload
      };

    case DisplayActions.UNALLOCATED_PAGE_VISITED:
      return {
        ...state,
        unallocatedPageVisited: true
      };

    case DisplayActions.UNSCHEDULED_PAGE_VISITED:
      return {
        ...state,
        unscheduledPageVisited: true
      };

    case DisplayActions.SAVE_HEARING_FILTERS:
      return {
        ...state,
        hearingFilters: action.payload
      };

    case DisplayActions.SAVE_UNSCHEDULED_FILTERS:
      return {
        ...state,
        unscheduledFilters: action.payload
      };

    case DisplayActions.RESET_HEARING_FILTERS:
      return {
        ...state,
        hearingFilters: {
          courtCentreId: 'ALL',
          authorityId: 'ALL',
          hearingTypeId: 'ALL',
          jurisdictionType: 'ALL',
          possibleDisqualification: 'ALL'
        }
      };

    case DisplayActions.RESET_UNSCHEDULED_FILTERS:
      return {
        ...state,
        unscheduledFilters: {
          oucodeL2Code: 'ALL',
          courtCentreId: 'ALL',
          typeOfList: 'ALL',
          caseUrn: ''
        }
      };

    default:
      return state;
  }
}
