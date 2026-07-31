import { initialState, CourtCalendarActions, courtCalendarFeatureReducer } from '../../';
import { mockSearchFormValues, mockCourtCalendarState } from '../../../utils/mocks';

describe('CourtCalendar Reducer', () => {
  it('should return the initial state when an unknown action is passed', () => {
    const action = { type: 'UNKNOWN_ACTION' } as any;
    const state = courtCalendarFeatureReducer(undefined, action);

    expect(state).toBe(initialState);
  });

  it('should update the state with search filters when searchCourtCalendar action is dispatched', () => {
    const action = CourtCalendarActions.searchCourtCalendar({
      filterOptions: mockSearchFormValues
    });
    const state = courtCalendarFeatureReducer(initialState, action);

    expect(state).toEqual({
      ...initialState,
      filterOptions: mockSearchFormValues
    });
  });

  it('searchCourtCalendarSuccess: should update the state with allocated hearings', () => {
    const action = CourtCalendarActions.searchCourtCalendarSuccess({
      payload: mockCourtCalendarState.allocated
    });
    const state = courtCalendarFeatureReducer(initialState, action);

    expect(state).toEqual({
      ...initialState,
      allocated: mockCourtCalendarState.allocated,
      caseNotesMap: {}
    });
  });

  it('setCaseNotesForCaseSuccess: should update the state with case notes', () => {
    const action = CourtCalendarActions.setCaseNotesForCaseSuccess({
      caseNotes: mockCourtCalendarState.caseNotesMap
    });
    const state = courtCalendarFeatureReducer(initialState, action);

    expect(state).toEqual({
      ...initialState,
      caseNotesMap: mockCourtCalendarState.caseNotesMap
    });
  });
});
