import * as DisplayActions from '../actions/display';
import { displayReducer, DisplayState } from './display';

describe('displayReducer', () => {
  const mockedDisplayState: DisplayState = {
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

  const mockTestFilters: DisplayState = {
    showUnallocatedHearings: false,
    showUnscheduledHearings: false,
    unallocatedPageVisited: false,
    unscheduledPageVisited: false,
    hearingFilters: {
      courtCentreId: 'test-court-centre-id',
      authorityId: 'test-authority-id',
      hearingTypeId: 'test-hearing-type-id',
      jurisdictionType: 'CROWN'
    },
    unscheduledFilters: {
      oucodeL2Code: 'test-oucode',
      courtCentreId: 'test-court-centre-id',
      typeOfList: 'test-type-of-list',
      caseUrn: 'test-case-urn'
    }
  };

  it('should return true when show unallocated hearings', () => {
    const state = mockedDisplayState;
    const actual = displayReducer(state, new DisplayActions.ShowUnallocatedHearingsAction(true));
    expect(actual.showUnallocatedHearings).toBeTruthy();
  });

  it('should return false when hide unallocated hearings', () => {
    const state = { ...mockedDisplayState, showUnallocatedHearings: true };
    const actual = displayReducer(state, new DisplayActions.ShowUnallocatedHearingsAction(false));
    expect(actual.showUnallocatedHearings).toBeFalsy();
  });

  it('should return true when show unscheduled hearings', () => {
    const state = mockedDisplayState;
    const actual = displayReducer(state, new DisplayActions.ShowUnscheduledHearingsAction(true));
    expect(actual.showUnscheduledHearings).toBeTruthy();
  });

  it('should return false when hide unscheduled hearings', () => {
    const state = { ...mockedDisplayState, showUnscheduledHearings: true };
    const actual = displayReducer(state, new DisplayActions.ShowUnscheduledHearingsAction(false));
    expect(actual.showUnscheduledHearings).toBeFalsy();
  });

  it('should return true when unallocated page is visited', () => {
    const state = { ...mockedDisplayState };
    const actual = displayReducer(state, new DisplayActions.UnallocatedPageVisitedAction());
    expect(actual.unallocatedPageVisited).toBeTruthy();
  });

  it('should return true when unscheduled page is visited', () => {
    const state = { ...mockedDisplayState };
    const actual = displayReducer(state, new DisplayActions.UnscheduledPageVisitedAction());
    expect(actual.unscheduledPageVisited).toBeTruthy();
  });

  it('should return true when hearing filters are reset', () => {
    const state = { ...mockTestFilters };
    const actual = displayReducer(state, new DisplayActions.ResetHearingFiltersAction());
    expect(actual.hearingFilters).toEqual(mockedDisplayState.hearingFilters);
  });

  it('should return true when unscheduled hearing filters are reset', () => {
    const state = { ...mockTestFilters };
    const actual = displayReducer(state, new DisplayActions.ResetUnscheduledFiltersAction());
    expect(actual.unscheduledFilters).toEqual(mockedDisplayState.unscheduledFilters);
  });
});
