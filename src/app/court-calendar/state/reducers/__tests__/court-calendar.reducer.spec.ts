import { initialState, CourtCalendarActions, courtCalendarFeatureReducer } from '../../';
import { AllocationType } from '../../../model';
import { Hearing } from '../../../../core';
import { mockSearchFormValues, mockCourtCalendarState, MockHearing } from '../../../utils/mocks';

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

  it('getUnallocatedHearings: should switch the allocation type to ALLOCATE and drop the reallocate list', () => {
    const action = CourtCalendarActions.getUnallocatedHearings({
      filterOptions: mockSearchFormValues
    });
    const state = courtCalendarFeatureReducer(
      {
        ...initialState,
        allocationType: AllocationType.reallocate,
        hearingsToReallocate: [MockHearing as Hearing]
      },
      action
    );

    expect(state.allocationType).toEqual(AllocationType.allocate);
    expect(state.hearingsToReallocate).toBeUndefined();
  });

  it('setHearingsToReallocate: should switch the allocation type to REALLOCATE', () => {
    const action = CourtCalendarActions.setHearingsToReallocate({
      hearings: [MockHearing as Hearing]
    });
    const state = courtCalendarFeatureReducer(initialState, action);

    expect(state.allocationType).toEqual(AllocationType.reallocate);
    expect(state.hearingsToReallocate).toEqual([MockHearing]);
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
