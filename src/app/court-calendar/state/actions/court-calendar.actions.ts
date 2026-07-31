import {
  ExtendedJudicialRole,
  HearingDay,
  HearingWithSelectedCourtCentre
} from './../../../core/model/hearing';
import { createAction, props } from '@ngrx/store';
import { CaseNote } from '../../../allocate-hearing/allocate-hearing.interfaces';
import { Hearing, SequenceHearing } from '../../../core';
import {
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
    onSequenceOnly?: boolean;
  }>()
);

export const searchCourtCalendarSuccess = createAction(
  'SEARCH_COURT_CALENDAR_SUCCESS',
  props<{
    payload: PaginatedHearingMap;
    onSequenceOnly?: boolean;
  }>()
);

export const sequenceGroupHearings = createAction(
  'SEQUENCE_GROUP_HEARINGS',
  props<{ sequencedHearings: SequenceHearing[]; onSectionAllocate?: boolean }>()
);

export const sequenceGroupHearingsSuccess = createAction(
  'SEQUENCE_GROUP_HEARINGS_SUCCESS',
  props<{ onSectionAllocate?: boolean }>()
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
    onSectionAllocate?: boolean;
    onSequenceOnly?: boolean;
  }>()
);

export const getAllocatedHearingsForWidgetSuccess = createAction(
  'GET_ALLOCATED_HEARINGS_FOR_WIDGET_SUCCESS',
  props<{
    payload: PaginatedHearingMap;
    onSectionAllocate?: boolean;
    onSequenceOnly?: boolean;
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

export const bulkUpdateHearings = createAction(
  'BULK_UPDATE_HEARINGS',
  props<{ payload: BulkAllocatePayload }>()
);

export const bulkUpdateHearingsSuccess = createAction(
  'BULK_UPDATE_HEARINGS_SUCCESS',
  props<{ payload: BulkAllocatePayload; failedAllocationIds: string[] }>()
);

export const triggerComponentOnSectionAllocated = createAction(
  'TRIGGER_COMPONENT_ON_SECTION_ALLOCATED',
  props<{ failedHearingIds: string[] }>()
);

export const triggerComponentOnSequenceOnly = createAction(
  'TRIGGER_COMPONENT_ON_SEQUENCE_FINISHED'
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

export const unallocateHearings = createAction(
  'UNALLOCATE_HEARINGS',
  props<{ payload: BulkAllocatePayload }>()
);

export const unallocateHearingsSuccess = createAction(
  'UNALLOCATE_HEARINGS_SUCCESS',
  props<{ failedAllocationIds: string[] }>()
);

export const splitHearings = createAction(
  'SPLIT_HEARINGS',
  props<{ originHearing: Hearing; updatedHearing: HearingWithSelectedCourtCentre }>()
);

export const magistratesSplitHearings = createAction(
  'MAGISTRATES_SPLIT_HEARINGS',
  props<{ hearingSlotAllocations: HearingSlotAllocation[]; sendNotificationToParties: boolean }>()
);

export const updateSplitHearingDataSuccess = createAction('UPDATE_SPLIT_HEARING_DATA_SUCCESS');

export const updateSelectedHearingDays = createAction(
  'UPDATE_SELECTED_HEARING_DAYS',
  props<{ updatedHearingDays: HearingDay[] }>()
);

export const clearUnallocatedWidgetFilter = createAction('CLEAR_UNALLOCATED_WIDGET_FILTER');

export const moveHearingEndDate = createAction(
  'CHANGE_MULTI_DAY_HEARING_END_DATE',
  props<{ hearing: Hearing; newEndDate: string }>()
);
