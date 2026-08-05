import { CourtCalendarActions } from '../../actions/';
import { CourtCalendarFilters, RemoveHearingPayload } from '../../';
import {
  mockCaseNotes,
  mockRemoveHearingPayload,
  mockSearchFormValues
} from '../../../utils/mocks';
import { CaseNote } from '../../../../allocate-hearing/allocate-hearing.interfaces';

describe('CourtCalendar Actions', () => {
  it('should create the searchCourtCalendar action with the correct type and payload', () => {
    const filters: CourtCalendarFilters = mockSearchFormValues;

    const action = CourtCalendarActions.searchCourtCalendar({ filterOptions: filters });

    expect(action.type).toBe('SEARCH_FILTERS');
    expect(action.filterOptions).toEqual(filters);
  });

  it('should create setCaseNotesForCase action with correct caseId', () => {
    const caseId = 'e024469d-ca7f-49da-b677-0ea58633a0ec';
    const action = CourtCalendarActions.setCaseNotesForCase({ caseId });

    expect(action.type).toBe('SET_CASE_NOTES_FOR_CASE');
    expect(action.caseId).toBe(caseId);
  });

  it('should create setCaseNotesForCaseSuccess action with correct caseNotes', () => {
    const caseNotes: Record<string, CaseNote[]> = { '1234': mockCaseNotes };
    const action = CourtCalendarActions.setCaseNotesForCaseSuccess({ caseNotes });

    expect(action.type).toBe('SET_CASE_NOTES_FOR_CASE_SUCCESS');
    expect(action.caseNotes).toBe(caseNotes);
  });

  it('should create updateSelectedHearingDataSuccess action', () => {
    const action = CourtCalendarActions.updateSelectedHearingDataSuccess();

    expect(action.type).toBe('UPDATE_SELECTED_HEARING_DATA_SUCCESS');
  });

  it('should create removeSelectedHearing action with correct payload', () => {
    const payload: RemoveHearingPayload = mockRemoveHearingPayload;
    const action = CourtCalendarActions.removeSelectedHearing({ payload });

    expect(action.type).toBe('REMOVE_SELECTED_HEARING');
    expect(action.payload).toBe(payload);
  });

  it('should create removeSelectedHearingSuccess action', () => {
    const action = CourtCalendarActions.removeSelectedHearingSuccess();

    expect(action.type).toBe('REMOVE_SELECTED_HEARING_SUCCESS');
  });

  it('should create setSuccessAlertMessage action with correct successAlert message', () => {
    const successAlert = 'Test success message';
    const action = CourtCalendarActions.setAlertMessage({ successAlert });

    expect(action.type).toBe('SET_SUCCESS_ALERT_MESSAGE');
    expect(action.successAlert).toBe(successAlert);
  });

  it('should create resetAllocatedHearings action', () => {
    const action = CourtCalendarActions.resetAllocatedHearings();

    expect(action.type).toBe('RESET_ALLOCATED_HEARINGS');
  });
});
