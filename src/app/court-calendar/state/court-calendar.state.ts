import { AppState } from '../../core/reducers';
import { CourtCalendarState } from '../model';

export const COURT_CALENDAR_FEATURE_KEY = 'courtCalendar';

export interface CourtCalendarFeatureState extends AppState {
  courtCalendar: CourtCalendarState;
}

export const initialFilters = {
  courtType: null,
  courtCentre: null,
  businessType: null,
  courtRoomId: null,
  startDate: undefined,
  minEndDate: null,
  endDate: undefined,
  session: null,
  pageSize: 40,
  pageNumber: 1
};

export const initialState: CourtCalendarState = {
  filterOptions: initialFilters,
  selectedHearing: null,
  successAlert: undefined,
  allocated: {
    courtRoomMapByDate: {},
    paginatedHearings: {
      hearings: null,
      pagination: {
        currentPage: 1,
        totalNumber: null,
        pageCount: -1
      }
    }
  },
  unallocated: {
    hearingMap: {
      courtRoomMapByDate: {},
      paginatedHearings: {
        hearings: null,
        pagination: {
          currentPage: 1,
          totalNumber: null,
          pageCount: -1
        }
      }
    },
    allocateWidgetFilter: {
      startDate: null,
      courtCentre: null
    }
  },
  caseNotesMap: undefined
};
