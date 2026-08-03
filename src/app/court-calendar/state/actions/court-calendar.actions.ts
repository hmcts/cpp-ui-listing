import {
  ExtendedJudicialRole,
  HearingType,
  HearingWithSelectedCourtCentre
} from './../../../core/model/hearing';
import { createAction, props } from '@ngrx/store';
import { CaseNote } from '../../../allocate-hearing/allocate-hearing.interfaces';
import { Hearing } from '../../../core';
import {
  AllocateWidgetFilters,
  BulkAllocatePayload,
  CourtCalendarFilters,
  PaginatedHearingMap,
  RemoveHearingPayload
} from '../../model';
import { HearingSlotAllocation } from '@cpp/scheduling';

export const searchCourtCalendar = createAction(
  'SEARCH_FILTERS',
  props<{
    filterOptions: CourtCalendarFilters;
  }>()
);

export const searchCourtCalendarSuccess = createAction(
  'SEARCH_COURT_CALENDAR_SUCCESS',
  props<{
    payload: PaginatedHearingMap;
  }>()
);

export const setCaseNotesForCase = createAction(
  'SET_CASE_NOTES_FOR_CASE',
  props<{ caseId: string }>()
);

export const setCaseNotesForCaseSuccess = createAction(
  'SET_CASE_NOTES_FOR_CASE_SUCCESS',
  props<{ caseNotes: Record<string, CaseNote[]> }>()
);

export const setSelectedHearingData = createAction(
  'SET_SELECTED_HEARING_DATA',
  props<{ selectedHearing: Hearing }>()
);

export const updateSelectedHearingData = createAction(
  'UPDATE_SELECTED_HEARING_DATA',
  props<{ originHearing: Hearing; updatedHearing: HearingWithSelectedCourtCentre }>()
);

export const updateSelectedHearingDataSuccess = createAction(
  'UPDATE_SELECTED_HEARING_DATA_SUCCESS'
);

export const changeHearingsJudiciaryAction = createAction(
  'CHANGE_HEARINGS_JUDICIARY_ACTION',
  props<{
    hearings: HearingWithSelectedCourtCentre[];
    judiciary: ExtendedJudicialRole[];
    filterOptions: CourtCalendarFilters;
  }>()
);

export const removeSelectedHearing = createAction(
  'REMOVE_SELECTED_HEARING',
  props<{ payload: RemoveHearingPayload }>()
);

export const removeSelectedHearingSuccess = createAction('REMOVE_SELECTED_HEARING_SUCCESS');

export const setAlertMessage = createAction(
  'SET_SUCCESS_ALERT_MESSAGE',
  props<{ successAlert?: string; failureAlert?: string }>()
);

export const resetAllocatedHearings = createAction('RESET_ALLOCATED_HEARINGS');

export const getAllocatedHearingsForWidget = createAction(
  'GET_ALLOCATED_HEARINGS_FOR_WIDGET',
  props<{
    filterOptions: CourtCalendarFilters;
  }>()
);

export const getAllocatedHearingsForWidgetSuccess = createAction(
  'GET_ALLOCATED_HEARINGS_FOR_WIDGET_SUCCESS',
  props<{
    payload: PaginatedHearingMap;
  }>()
);

export const reloadWidgetSchedules = createAction(
  'RELOAD_WIDGET_SCHEDULES',
  props<{
    filterOptions: AllocateWidgetFilters;
    courtType: CourtCalendarFilters['courtType'];
  }>()
);

export const getUnallocatedHearings = createAction(
  'GET_UNALLOCATED_HEARINGS',
  props<{ filterOptions: CourtCalendarFilters }>()
);

export const getUnallocatedHearingsSuccess = createAction(
  'GET_UNALLOCATED_HEARINGS_SUCCESS',
  props<{
    payload: PaginatedHearingMap;
  }>()
);

export const hearingBulkOperationComplete = createAction(
  'HEARING_BULK_OPERATION_COMPLETE',
  props<{ payload: BulkAllocatePayload; failedAllocationIds: string[] }>()
);

export const updateHearingPublicListNote = createAction(
  'UPDATE_HEARING_PUBLIC_LIST_NOTE',
  props<{ updatedUnallocatedHearing: Hearing }>()
);

export const updateHearingPublicListNoteSuccess = createAction(
  'UPDATE_HEARING_PUBLIC_LIST_NOTE_SUCCESS',
  props<{ updatedUnallocatedHearing: Hearing }>()
);

export const setHearingsToReallocate = createAction(
  'SET_HEARINGS_TO_REALLOCATE',
  props<{ hearings: Hearing[] }>()
);

export const splitHearings = createAction(
  'SPLIT_HEARINGS',
  props<{ originHearing: Hearing; updatedHearing: HearingWithSelectedCourtCentre }>()
);

export const allocateSelectedHearingSlots = createAction(
  'ALLOCATE_SELECTED_HEARING_SLOTS',
  props<{
    hearingSlotAllocations: HearingSlotAllocation[];
    sendNotificationToParties: boolean;
    hearingType?: HearingType;
  }>()
);

export const updateSplitHearingDataSuccess = createAction('UPDATE_SPLIT_HEARING_DATA_SUCCESS');

export const clearAllocationType = createAction('CLEAR_ALLOCATION_TYPE');

export const clearUnallocatedWidgetFilter = createAction('CLEAR_UNALLOCATED_WIDGET_FILTER');
