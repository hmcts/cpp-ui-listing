import { Action, createReducer, on } from '@ngrx/store';
import { initialState } from '../court-calendar.state';
import { CourtCalendarActions } from '../actions';
import { AllocationType, CourtCalendarState } from '../../model';
import { RotaBusinessTypeCode } from '@cpp/reference-data';

export function courtCalendarFeatureReducer(state: CourtCalendarState | undefined, action: Action) {
  return courtCalendarReducer(state, action);
}

export const courtCalendarReducer = createReducer(
  initialState,
  on(CourtCalendarActions.searchCourtCalendar, (state, { filterOptions }) => {
    return {
      ...state,
      filterOptions,
      allocationType: undefined,
      hearingsToReallocate: undefined,
      failedAllocationIds: undefined
    };
  }),

  on(
    CourtCalendarActions.getUnallocatedHearings,
    (state, { filterOptions: { pageNumber, pageSize, ...restOptions } }) => {
      return {
        ...state,
        filterOptions: {
          ...state.filterOptions,
          ...restOptions
        },
        allocationType: AllocationType.allocate,
        hearingsToReallocate: undefined
      };
    }
  ),

  on(CourtCalendarActions.resetAllocatedHearings, state => {
    return {
      ...state,
      allocated: initialState.allocated,
      hearingsToReallocate: undefined
    };
  }),
  on(CourtCalendarActions.searchCourtCalendarSuccess, (state, { payload }) => {
    return {
      ...state,
      allocated: payload,
      caseNotesMap: {}
    };
  }),
  on(CourtCalendarActions.getAllocatedHearingsForWidgetSuccess, (state, { payload }) => {
    return {
      ...state,
      allocated: {
        ...payload,
        paginatedHearings: {
          ...payload.paginatedHearings,
          hearings: payload.paginatedHearings.hearings.filter(
            ({ id }) =>
              !(state.hearingsToReallocate ?? []).some(
                reallocateHearing => reallocateHearing.id === id
              )
          )
        }
      },
      caseNotesMap: {}
    };
  }),
  on(CourtCalendarActions.setCaseNotesForCaseSuccess, (state, { caseNotes }) => {
    return {
      ...state,
      caseNotesMap: {
        ...(state.caseNotesMap ?? {}),
        ...caseNotes
      }
    };
  }),
  on(CourtCalendarActions.setSelectedHearingData, (state, { selectedHearing }) => {
    return {
      ...state,
      selectedHearing
    };
  }),
  on(CourtCalendarActions.setAlertMessage, (state, { successAlert, failureAlert }) => {
    return {
      ...state,
      successAlert,
      failureAlert
    };
  }),
  on(
    CourtCalendarActions.getAllocatedHearingsForWidget,
    (
      state,
      { filterOptions: { startDate, businessType, hearingType, courtSession, courtCentre } }
    ) => {
      return {
        ...state,
        unallocated: {
          ...state.unallocated,
          allocateWidgetFilter: {
            startDate,
            businessType: businessType as RotaBusinessTypeCode,
            hearingType,
            courtSession,
            courtCentre
          }
        }
      };
    }
  ),
  on(CourtCalendarActions.getUnallocatedHearingsSuccess, (state, { payload }) => {
    return {
      ...state,
      unallocated: {
        ...state.unallocated,
        hearingMap: payload
      },
      caseNotesMap: {}
    };
  }),

  on(CourtCalendarActions.bulkUpdateHearings, state => {
    return {
      ...state,
      failedAllocationIds: undefined,
      caseNotesMap: {}
    };
  }),

  on(CourtCalendarActions.bulkUpdateHearingsSuccess, (state, { payload, failedAllocationIds }) => {
    const { hearings } = payload;
    return {
      ...state,
      failedAllocationIds,
      hearingsToReallocate:
        state.hearingsToReallocate &&
        (state.hearingsToReallocate ?? []).filter(({ id }) => {
          if (
            hearings.some(hearing => hearing.hearingId === id) &&
            !failedAllocationIds.includes(id)
          ) {
            return false;
          }
          return true;
        }),
      caseNotesMap: {}
    };
  }),

  on(
    CourtCalendarActions.updateHearingPublicListNoteSuccess,
    (state, { updatedUnallocatedHearing }) => {
      const existingHearings = state.unallocated.hearingMap?.paginatedHearings?.hearings ?? [];
      const updatedHearings = [...existingHearings];
      const index = updatedHearings.findIndex(
        hearing => hearing.id === updatedUnallocatedHearing.id
      );
      if (index > -1) {
        updatedHearings.splice(index, 1, updatedUnallocatedHearing);
      }
      return {
        ...state,
        unallocated: {
          ...state.unallocated,
          hearingMap: {
            ...state.unallocated.hearingMap,
            paginatedHearings: {
              ...state.unallocated.hearingMap.paginatedHearings,
              hearings: updatedHearings
            }
          }
        }
      };
    }
  ),
  on(CourtCalendarActions.setHearingsToReallocate, (state, { hearings: hearingsToReallocate }) => {
    return {
      ...state,
      hearingsToReallocate,
      allocationType: AllocationType.reallocate
    };
  }),
  on(CourtCalendarActions.clearUnallocatedWidgetFilter, state => {
    return {
      ...state,
      unallocated: {
        ...state.unallocated,
        allocateWidgetFilter: initialState.unallocated.allocateWidgetFilter
      }
    };
  })
);
