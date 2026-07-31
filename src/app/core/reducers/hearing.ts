import baseMoment from 'moment';
import { extendMoment } from 'moment-range';
import {
  HearingAction,
  setCaseNotes,
  setEditAllocationError,
  setHearingToEditAllocation,
  splitHearingUnallocated
} from '../actions';
import * as HearingActions from '../actions/hearing';
import { TypeOfListSummary } from '../../unscheduled-listings/unscheduled-listings.interfaces';
import { Hearing, LastAllocatedHearing, SequenceDay, SequenceHearing } from '../model';
import {
  HearingSchedule,
  PaginatedHearings,
  PublishCourtListType,
  PublishStatus
} from '../model/hearing';
import { createReducer, on } from '@ngrx/store';
import { CaseNote } from '../../allocate-hearing/allocate-hearing.interfaces';
import { ValidationError } from '@cpp/pdk';

// we cast as any because there is a problem with Es6 moment range
// see https://github.com/rotaready/moment-range/issues/263 for more details
const moment = extendMoment(baseMoment as any);

export type CaseNotesMap = Record<string, CaseNote[]>;

export interface HearingState {
  unscheduled: PaginatedHearings;
  typeOfList: TypeOfListSummary[];
  unallocated: PaginatedHearings;
  hearingCourtList: PaginatedHearings;
  allocated: Hearing[];
  lastAllocatedHearing: LastAllocatedHearing;
  restrictedHearing: Hearing;
  restrictListExpanded: { [id: string]: boolean };
  available: Hearing[];
  weekcommencingHearing: PaginatedHearings;
  publishCourtListStatuses: PublishStatus[];
  scheduledHearingForAllocation: Hearing;
  hearingSchedule: HearingSchedule;
  caseNotes?: Record<string, CaseNotesMap>;
  hasSplitHearingFromUnallocated: boolean;
  editAllocationError?: ValidationError;
  hearingToEditAllocation?: Hearing;
}

const initialState: HearingState = {
  unscheduled: { hearings: [], pagination: { currentPage: 1, pageCount: 1, totalNumber: null } },
  typeOfList: [],
  unallocated: { hearings: [], pagination: { currentPage: 1, pageCount: 1, totalNumber: null } },
  allocated: [],
  lastAllocatedHearing: null,
  restrictedHearing: null,
  restrictListExpanded: null,
  available: null,
  weekcommencingHearing: null,
  publishCourtListStatuses: null,
  scheduledHearingForAllocation: null,
  hearingSchedule: null,
  hearingCourtList: null,
  hasSplitHearingFromUnallocated: false,
  editAllocationError: null,
  hearingToEditAllocation: null
};

export function hearingLegacyReducer(
  state: HearingState = initialState,
  action: HearingAction
): HearingState {
  switch (action.type) {
    case HearingActions.LIST_UNALLOCATED_HEARINGS_SUCCESS:
      return {
        ...state,
        unallocated: {
          ...action.payload
        }
      };

    case HearingActions.LIST_UNSCHEDULED_HEARINGS_SUCCESS:
      return {
        ...state,
        unscheduled: {
          hearings: action.payload.hearings,
          pagination: action.payload.pagination
        }
      };

    case HearingActions.CLEAR_UNSCHEDULED_HEARINGS:
      return {
        ...state,
        unscheduled: {
          ...state.unscheduled,
          hearings: []
        }
      };

    case HearingActions.TYPE_OF_LIST_SUCCESS:
      return {
        ...state,
        typeOfList: action.payload
      };

    case HearingActions.CLEAR_UNALLOCATED_HEARINGS:
      return {
        ...state,
        unallocated: {
          ...state.unallocated,
          hearings: []
        }
      };
    case HearingActions.CLEAR_ALLOCATED_HEARINGS:
      return {
        ...state,
        allocated: []
      };
    case HearingActions.UPDATE_ALLOCATED_HEARING_ACTION:
      // Filter previous version and add updated hearing
      const currentAllocated: Hearing[] = [...state.allocated].filter(
        (h) => h.id !== action.payload.updatedHearing.id
      );
      return {
        ...state,
        allocated: [...currentAllocated, action.payload.updatedHearing],
        lastAllocatedHearing: null
      };

    case HearingActions.UPDATE_ALLOCATED_HEARING_SUCCESS_ACTION:
      // Filter previous version and add updated hearing
      const currentHearings: Hearing[] = [...state.allocated].filter(
        (h) => h.id !== action.payload.id
      );
      return {
        ...state,
        allocated: [...currentHearings, action.payload],
        lastAllocatedHearing: null
      };

    case HearingActions.ALLOCATE_HEARING_ACTION:
      return {
        ...state,
        lastAllocatedHearing: {
          hearing: action.payload.updatedHearing,
          availableHearing: false
        }
      };

    case HearingActions.EXTEND_HEARING_FOR_HEARING_SUCCESS:
      return {
        ...state,
        lastAllocatedHearing: {
          hearing: action.payload,
          availableHearing: true
        }
      };

    case HearingActions.ALLOCATE_HEARING_SUCCESS_ACTION:
      return {
        ...state
      };

    case HearingActions.CLEAR_LAST_ALLOCATED_HEARING:
      return {
        ...state,
        lastAllocatedHearing: null
      };

    case HearingActions.SEARCH_ALLOCATED_HEARINGS:
      return {
        ...state,
        allocated: []
      };

    case HearingActions.SEARCH_ALLOCATED_HEARINGS_SUCCESS:
      return {
        ...state,
        allocated: action.payload
      };

    case HearingActions.WEEK_COMMENCING_HEARING_SUCCESS_ACTION:
      return {
        ...state,
        weekcommencingHearing: {
          ...action.payload
        }
      };

    case HearingActions.SEARCH_AVAILABLE_HEARINGS_SUCCESS:
      return {
        ...state,
        available: action.payload
      };

    case HearingActions.RESET_AVAILABLE_HEARINGS:
      return {
        ...state,
        available: null
      };

    case HearingActions.SEARCH_ALLOCATED_HEARINGS_BY_DATE_RANGE_SUCCESS:
      let allocatedUpdateRestricted: Hearing = null;
      if (state.restrictedHearing) {
        const allocatedRestricted = state.restrictedHearing.id;
        const { hearings } = action.payload;
        allocatedUpdateRestricted = hearings.find((a) => a.id === allocatedRestricted);
      }
      return {
        ...state,
        hearingCourtList: action.payload,
        restrictedHearing: allocatedUpdateRestricted
      };

    // todo : code this in a nicer way....
    case HearingActions.SEQUENCE_HEARINGS_SUCCESS_ACTION:
      const updatedHearings = state.allocated.map((stateHearing) => {
        const sequencedHearing: SequenceHearing = action.payload.hearings.find(
          (item) => item.id === stateHearing.id
        );

        if (sequencedHearing) {
          const updatedSequenceDays = stateHearing.hearingDays.map((stateDay) => {
            const sequencedDay: SequenceDay = sequencedHearing.sequenceHearingDays.find(
              (item) => item.hearingDate === stateDay.hearingDate
            );
            if (sequencedDay) {
              return {
                ...stateDay,
                sequence: sequencedDay.sequence
              };
            }
            return { ...stateDay };
          });
          return { ...stateHearing, hearingDays: updatedSequenceDays };
        }
        return { ...stateHearing };
      });
      return {
        ...state,
        allocated: updatedHearings
      };

    case HearingActions.CHANGE_JUDICIARY_FOR_HEARINGS_SUCCESS_ACTION:
      const { hearings, judiciary } = action.payload;

      return {
        ...state,
        allocated: state.allocated.map((allocated) => {
          const matchedHearing = hearings.find((item) => item.id === allocated.id);
          return matchedHearing ? { ...allocated, judiciary } : allocated;
        })
      };

    case HearingActions.COURT_RESTRICTION_EXPAND_ACTION:
      return {
        ...state,
        restrictListExpanded: {
          ...state.restrictListExpanded,
          [action.payload]: state.restrictListExpanded
            ? !state.restrictListExpanded[action.payload]
            : true
        }
      };

    case HearingActions.COURT_RESTRICTION_SUCCESS_ACTION:
      const allocatedHearings = [...state.allocated];
      const selectedHearingId = action.payload.courtRestriction.hearingId;
      const restrictedHearing = allocatedHearings.find((h) => h.id === selectedHearingId);
      return {
        ...state,
        restrictedHearing
      };

    case HearingActions.GET_PUBLISH_LIST_STATUS_SUCCESS_ACTION:
      return {
        ...state,
        publishCourtListStatuses: action.payload
      };
    case HearingActions.SET_PUBLISH_LIST_STATUS_SUCCESS_ACTION:
      const listType = action.payload.publishCourtListType;
      const lastUpdated = moment().utc().format();
      const optomisticStatus = {
        ...action.payload,
        publishCourtListType: <PublishCourtListType>listType,
        lastUpdated
      };

      const publishCourtListStatuses = [
        ...state.publishCourtListStatuses.filter((s) => s.publishCourtListType !== listType),
        optomisticStatus
      ];
      return {
        ...state,
        publishCourtListStatuses
      };
    case HearingActions.SCHEDULED_ALLOCATE_HEARING_ACTION:
      return {
        ...state,
        scheduledHearingForAllocation: action.payload
      };

    case HearingActions.ALLOCATE_HEARING_MAGS_ACTION:
      return {
        ...state,
        hearingSchedule: action.payload
      };
    case HearingActions.CLEAR_HEARING_SLOTS:
      return {
        ...state,
        hearingSchedule: null
      };

    default:
      return state;
  }
}

export const hearingReducer = createReducer(
  initialState,

  on(setCaseNotes, (state, { caseNotes }) => ({
    ...state,
    caseNotes
  })),

  on(splitHearingUnallocated, (state, { splitHearingUnallocated }) => ({
    ...state,
    hasSplitHearingFromUnallocated: splitHearingUnallocated
  })),
  on(setEditAllocationError, (state, { editAllocationError }) => ({
    ...state,
    editAllocationError
  })),
  on(setHearingToEditAllocation, (state, { hearingToEditAllocation }) => {
    return {
      ...state,
      hearingToEditAllocation
    };
  })
);

// we compose both reducers until we migrate the hearing legacy reducer above

export function composeHearingReducers(state = initialState, action: HearingAction) {
  return [hearingLegacyReducer, hearingReducer].reduce(
    (prevState, reducer: (state, action: HearingAction) => HearingState) => {
      return reducer(prevState, action);
    },
    state
  );
}
