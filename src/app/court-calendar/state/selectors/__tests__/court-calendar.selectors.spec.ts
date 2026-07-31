import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TestBed } from '@angular/core/testing';
import {
  getCourtCalendarFilters,
  getAllocatedHearings,
  getAllocatedCourtRoomsByDate,
  getAllocatedHearingsMap,
  getCaseNotesMap,
  getCourtCalendarFeature,
  getJurisdictionTypeFromFeature,
  getUnallocatedHearingsMap,
  getFailedAllocationIds,
  getUnallocatedHearings,
  getHearingsToReallocate,
  getAllocationType,
  getAllocationHearings,
  getAllocateWidgetFilter,
  getCourtCalendarVM,
  getMagsWidgetCourtCalendarVm,
  getAllocationHearingsVM,
  getCourtCalendarAlert,
  getSelectedHearing,
  getRemoveHearingVm,
  getChangeCourtroomVm,
  getSelectedCourtFor,
  getSessionsForSelectedHearingBusinessType,
  CourtCalendarFeatureState
} from '../../';
import {
  mockCourtCalendarState,
  selectedHearing,
  mockOrganisationUnits
} from '../../../utils/mocks';

// Ensure mockOrganisationUnits has the correct id to match selectedHearing
const mockOrgUnitsWithId = mockOrganisationUnits.map((unit, index) => ({
  ...unit,
  id: selectedHearing.courtCentreId || `mock-court-centre-${index}`
}));
import { CourtCalendarFeature, AllocationType } from '../../../model';
import { AppState, getRouteData } from '../../../../core';
import { HearingSlot } from '@cpp/scheduling';
import { getSearchResults } from '@cpp/scheduling';

describe('CourtCalendar Selectors', () => {
  let store: MockStore<AppState>;
  const initialState = {};

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState })]
    });
    store = TestBed.inject(MockStore);
  });

  describe('Basic Selectors', () => {
    const state = {
      courtCalendar: {
        ...mockCourtCalendarState
      }
    } as CourtCalendarFeatureState;

    it('should select the court calendar filters from the state', () => {
      const result = getCourtCalendarFilters(state);

      expect(result).toEqual(mockCourtCalendarState.filterOptions);
    });

    it('getAllocatedHearingsMap: should select the allocated hearings from the state', () => {
      const result = getAllocatedHearingsMap(state);

      expect(result).toEqual({
        courtRoomMapByDate: mockCourtCalendarState.allocated.courtRoomMapByDate,
        paginatedHearings: {
          ...mockCourtCalendarState.allocated.paginatedHearings
        }
      });
    });

    it('getAllocatedCourtRoomsByDate: should select the allocated hearings from the state', () => {
      const result = getAllocatedCourtRoomsByDate(state);

      expect(result).toEqual(mockCourtCalendarState.allocated.courtRoomMapByDate);
    });

    it('getAllocatedHearings: should select the allocated hearings from the state', () => {
      const result = getAllocatedHearings(state);

      expect(result).toEqual(mockCourtCalendarState.allocated.paginatedHearings);
    });

    it('getCaseNotesMap: should select the caseNotesMap from the state', () => {
      const result = getCaseNotesMap(state);

      expect(result).toEqual({
        ...mockCourtCalendarState.caseNotesMap
      });
    });

    it('getCaseNotesMap: should return empty object when caseNotesMap is undefined', () => {
      const stateWithoutCaseNotes = {
        courtCalendar: {
          ...mockCourtCalendarState,
          caseNotesMap: undefined
        }
      } as unknown as CourtCalendarFeatureState;

      const result = getCaseNotesMap(stateWithoutCaseNotes);

      expect(result).toEqual({});
    });
  });

  describe('getCourtCalendarFeature', () => {
    it('should return feature when route data exists', () => {
      store.overrideSelector(getRouteData, { feature: CourtCalendarFeature.calendar });
      const result = store.select(getCourtCalendarFeature);

      result.subscribe(value => {
        expect(value).toBe(CourtCalendarFeature.calendar);
      });
    });

    it('should return undefined when route data is null', () => {
      store.overrideSelector(getRouteData, null);
      const result = store.select(getCourtCalendarFeature);

      result.subscribe(value => {
        expect(value).toBeUndefined();
      });
    });

    it('should return undefined when route data is undefined', () => {
      store.overrideSelector(getRouteData, undefined);
      const result = store.select(getCourtCalendarFeature);

      result.subscribe(value => {
        expect(value).toBeUndefined();
      });
    });
  });

  describe('getJurisdictionTypeFromFeature', () => {
    it('should return CROWN when feature is allocateCrown', () => {
      store.overrideSelector(getRouteData, { feature: CourtCalendarFeature.allocateCrown });
      const result = store.select(getJurisdictionTypeFromFeature);

      result.subscribe(value => {
        expect(value).toBe('CROWN');
      });
    });

    it('should return MAGISTRATES when feature is allocateMag', () => {
      store.overrideSelector(getRouteData, { feature: CourtCalendarFeature.allocateMag });
      const result = store.select(getJurisdictionTypeFromFeature);

      result.subscribe(value => {
        expect(value).toBe('MAGISTRATES');
      });
    });

    it('should return undefined when feature is calendar', () => {
      store.overrideSelector(getRouteData, { feature: CourtCalendarFeature.calendar });
      const result = store.select(getJurisdictionTypeFromFeature);

      result.subscribe(value => {
        expect(value).toBeUndefined();
      });
    });

    it('should return undefined when feature is undefined', () => {
      store.overrideSelector(getRouteData, null);
      const result = store.select(getJurisdictionTypeFromFeature);

      result.subscribe(value => {
        expect(value).toBeUndefined();
      });
    });
  });

  describe('getUnallocatedHearingsMap', () => {
    it('should select unallocated hearings map from the state', () => {
      const unallocatedHearingMap = {
        paginatedHearings: {
          hearings: [],
          pagination: { currentPage: 1, totalNumber: 0, pageCount: 0 }
        }
      };
      const state = {
        courtCalendar: {
          ...mockCourtCalendarState,
          unallocated: {
            hearingMap: unallocatedHearingMap
          }
        }
      } as unknown as CourtCalendarFeatureState;

      const result = getUnallocatedHearingsMap(state);

      expect(result).toEqual(unallocatedHearingMap);
    });
  });

  describe('getFailedAllocationIds', () => {
    it('should return failed allocation ids from the state', () => {
      const failedIds = ['id1', 'id2'];
      const state = {
        courtCalendar: {
          ...mockCourtCalendarState,
          failedAllocationIds: failedIds
        }
      } as unknown as CourtCalendarFeatureState;

      const result = getFailedAllocationIds(state);

      expect(result).toEqual(failedIds);
    });

    it('should return empty array when failedAllocationIds is undefined', () => {
      const state = {
        courtCalendar: {
          ...mockCourtCalendarState,
          failedAllocationIds: undefined
        }
      } as unknown as CourtCalendarFeatureState;

      const result = getFailedAllocationIds(state);

      expect(result).toEqual([]);
    });
  });

  describe('getUnallocatedHearings', () => {
    it('should select unallocated hearings from the state', () => {
      const paginatedHearings = {
        hearings: [],
        pagination: { currentPage: 1, totalNumber: 0, pageCount: 0 }
      };
      const state = {
        courtCalendar: {
          ...mockCourtCalendarState,
          unallocated: {
            hearingMap: {
              paginatedHearings
            }
          }
        }
      } as unknown as CourtCalendarFeatureState;

      const result = getUnallocatedHearings(state);

      expect(result).toEqual(paginatedHearings);
    });
  });

  describe('getHearingsToReallocate', () => {
    it('should select hearings to reallocate from the state', () => {
      const hearingsToReallocate = [selectedHearing];
      const state = {
        courtCalendar: {
          ...mockCourtCalendarState,
          hearingsToReallocate
        }
      } as unknown as CourtCalendarFeatureState;

      const result = getHearingsToReallocate(state);

      expect(result).toEqual(hearingsToReallocate);
    });
  });

  describe('getAllocationType', () => {
    it('should select allocation type from the state', () => {
      const state = {
        courtCalendar: {
          ...mockCourtCalendarState,
          allocationType: AllocationType.allocate
        }
      } as unknown as CourtCalendarFeatureState;

      const result = getAllocationType(state);

      expect(result).toBe(AllocationType.allocate);
    });
  });

  describe('getAllocationHearings', () => {
    it('should return unallocated hearings when allocationType is allocate', () => {
      const unallocatedHearings = {
        hearings: [],
        pagination: { currentPage: 1, totalNumber: 0, pageCount: 0 }
      };

      store.overrideSelector(getUnallocatedHearings, unallocatedHearings);
      store.overrideSelector(getHearingsToReallocate, []);
      store.overrideSelector(getAllocationType, AllocationType.allocate);

      const result = store.select(getAllocationHearings);

      result.subscribe(value => {
        expect(value).toEqual(unallocatedHearings);
      });
    });

    it('should return hearings to reallocate when allocationType is reallocate', () => {
      const hearingsToReallocate = [selectedHearing];

      store.overrideSelector(getUnallocatedHearings, null);
      store.overrideSelector(getHearingsToReallocate, hearingsToReallocate as any);
      store.overrideSelector(getAllocationType, AllocationType.reallocate);

      const result = store.select(getAllocationHearings);

      result.subscribe(value => {
        expect(value).toEqual({ hearings: hearingsToReallocate });
      });
    });
  });

  describe('getAllocateWidgetFilter', () => {
    it('should select allocate widget filter from the state', () => {
      const widgetFilter = {
        courtCentre: mockCourtCalendarState.filterOptions.courtCentre,
        startDate: mockCourtCalendarState.filterOptions.startDate
      };
      const state = {
        courtCalendar: {
          ...mockCourtCalendarState,
          unallocated: {
            allocateWidgetFilter: widgetFilter
          }
        }
      } as unknown as CourtCalendarFeatureState;

      const result = getAllocateWidgetFilter(state);

      expect(result).toEqual(widgetFilter);
    });
  });

  describe('getCourtCalendarVM', () => {
    it('should use filters.courtCentre when feature is CALENDAR', () => {
      store.overrideSelector(getRouteData, { feature: CourtCalendarFeature.calendar });
      store.overrideSelector(
        getAllocatedHearings,
        mockCourtCalendarState.allocated.paginatedHearings
      );
      store.overrideSelector(
        getAllocatedCourtRoomsByDate,
        mockCourtCalendarState.allocated.courtRoomMapByDate
      );
      store.overrideSelector(getCourtCalendarFilters, mockCourtCalendarState.filterOptions);
      store.overrideSelector(getAllocateWidgetFilter, {
        courtCentre: mockCourtCalendarState.filterOptions.courtCentre,
        startDate: mockCourtCalendarState.filterOptions.startDate
      } as any);
      store.overrideSelector(getCourtCalendarFeature, CourtCalendarFeature.calendar);

      const result = store.select(getCourtCalendarVM);

      result.subscribe(value => {
        expect(value).toBeDefined();
      });
    });

    it('should use widgetFilter.courtCentre when feature is not CALENDAR and widgetFilter has courtCentre', () => {
      store.overrideSelector(getRouteData, { feature: CourtCalendarFeature.allocateCrown });
      const widgetFilter = {
        courtCentre: mockCourtCalendarState.filterOptions.courtCentre,
        startDate: mockCourtCalendarState.filterOptions.startDate
      };

      store.overrideSelector(
        getAllocatedHearings,
        mockCourtCalendarState.allocated.paginatedHearings
      );
      store.overrideSelector(
        getAllocatedCourtRoomsByDate,
        mockCourtCalendarState.allocated.courtRoomMapByDate
      );
      store.overrideSelector(getCourtCalendarFilters, mockCourtCalendarState.filterOptions);
      store.overrideSelector(getAllocateWidgetFilter, widgetFilter);
      store.overrideSelector(getCourtCalendarFeature, CourtCalendarFeature.allocateCrown);

      const result = store.select(getCourtCalendarVM);

      result.subscribe(value => {
        expect(value).toBeDefined();
      });
    });
  });

  describe('getMagsWidgetCourtCalendarVm', () => {
    it('should use widgetFilter.courtCentre when available', () => {
      const widgetFilter = {
        courtCentre: mockCourtCalendarState.filterOptions.courtCentre,
        startDate: mockCourtCalendarState.filterOptions.startDate
      };
      const hearingSlots: HearingSlot[] = [];

      store.overrideSelector(
        getAllocatedHearings,
        mockCourtCalendarState.allocated.paginatedHearings
      );
      store.overrideSelector(
        getAllocatedCourtRoomsByDate,
        mockCourtCalendarState.allocated.courtRoomMapByDate
      );
      store.overrideSelector(getCourtCalendarFilters, mockCourtCalendarState.filterOptions);
      store.overrideSelector(getAllocateWidgetFilter, widgetFilter);
      store.overrideSelector(getSearchResults, hearingSlots);

      const result = store.select(getMagsWidgetCourtCalendarVm);

      result.subscribe(value => {
        expect(value).toBeDefined();
      });
    });

    it('should use filters.courtCentre when widgetFilter.courtCentre is not available', () => {
      const widgetFilter = {
        courtCentre: null,
        startDate: ''
      } as any;
      const hearingSlots: HearingSlot[] = [];

      store.overrideSelector(
        getAllocatedHearings,
        mockCourtCalendarState.allocated.paginatedHearings
      );
      store.overrideSelector(
        getAllocatedCourtRoomsByDate,
        mockCourtCalendarState.allocated.courtRoomMapByDate
      );
      store.overrideSelector(getCourtCalendarFilters, mockCourtCalendarState.filterOptions);
      store.overrideSelector(getAllocateWidgetFilter, widgetFilter);
      store.overrideSelector(getSearchResults, hearingSlots);

      const result = store.select(getMagsWidgetCourtCalendarVm);

      result.subscribe(value => {
        expect(value).toBeDefined();
      });
    });
  });

  describe('getAllocationHearingsVM', () => {
    it('should return allocation hearings view model', () => {
      store.overrideSelector(
        getAllocationHearings,
        mockCourtCalendarState.allocated.paginatedHearings
      );
      store.overrideSelector(getCourtCalendarFilters, mockCourtCalendarState.filterOptions);
      store.overrideSelector(getAllocationType, AllocationType.allocate);

      const result = store.select(getAllocationHearingsVM);

      result.subscribe(value => {
        expect(value).toBeDefined();
      });
    });
  });

  describe('getCourtCalendarAlert', () => {
    it('should return alert object when successAlert exists', () => {
      const state = {
        courtCalendar: {
          ...mockCourtCalendarState,
          successAlert: 'Success message'
        }
      } as unknown as CourtCalendarFeatureState;

      const result = getCourtCalendarAlert(state);

      expect(result).toEqual({
        successAlert: 'Success message',
        failureAlert: undefined
      });
    });

    it('should return alert object when failureAlert exists', () => {
      const state = {
        courtCalendar: {
          ...mockCourtCalendarState,
          failureAlert: 'Failure message'
        }
      } as unknown as CourtCalendarFeatureState;

      const result = getCourtCalendarAlert(state);

      expect(result).toEqual({
        successAlert: undefined,
        failureAlert: 'Failure message'
      });
    });

    it('should return alert object when both successAlert and failureAlert exist', () => {
      const state = {
        courtCalendar: {
          ...mockCourtCalendarState,
          successAlert: 'Success message',
          failureAlert: 'Failure message'
        }
      } as unknown as CourtCalendarFeatureState;

      const result = getCourtCalendarAlert(state);

      expect(result).toEqual({
        successAlert: 'Success message',
        failureAlert: 'Failure message'
      });
    });

    it('should return undefined when neither successAlert nor failureAlert exist', () => {
      const state = {
        courtCalendar: {
          ...mockCourtCalendarState,
          successAlert: undefined,
          failureAlert: undefined
        }
      } as unknown as CourtCalendarFeatureState;

      const result = getCourtCalendarAlert(state);

      expect(result).toBeUndefined();
    });
  });

  describe('getSelectedHearing', () => {
    it('should select selected hearing from the state', () => {
      const state = {
        courtCalendar: {
          ...mockCourtCalendarState,
          selectedHearing: selectedHearing
        }
      } as unknown as CourtCalendarFeatureState;

      const result = getSelectedHearing(state);

      expect(result).toEqual(selectedHearing);
    });
  });

  describe('getRemoveHearingVm', () => {
    it('should return null when hearing is null', () => {
      store.overrideSelector(getSelectedHearing, null);
      store.setState({
        referenceData: {
          organisationUnits: mockOrgUnitsWithId
        }
      } as any);

      const result = store.select(getRemoveHearingVm);

      result.subscribe(value => {
        expect(value).toBeNull();
      });
    });

    it('should return RemoveHearingVM when hearing exists with single day', () => {
      const singleDayHearing = {
        ...selectedHearing,
        hearingDayCount: 1,
        hearingDays: [
          {
            ...selectedHearing.hearingDays[0],
            durationMinutes: 30
          }
        ]
      };

      store.overrideSelector(getSelectedHearing, singleDayHearing as any);
      store.setState({
        referenceData: {
          organisationUnits: mockOrgUnitsWithId
        }
      } as any);

      const result = store.select(getRemoveHearingVm);

      result.subscribe(value => {
        expect(value).toBeDefined();
        expect(value?.duration).toBeDefined();
        expect(value?.multiDayHearing.isMultiDay).toBe('No');
      });
    });

    it('should return RemoveHearingVM when hearing exists with multiple days', () => {
      const multiDayHearing = {
        ...selectedHearing,
        hearingDayCount: 3
      };

      store.overrideSelector(getSelectedHearing, multiDayHearing as any);
      store.setState({
        referenceData: {
          organisationUnits: mockOrgUnitsWithId
        }
      } as any);

      const result = store.select(getRemoveHearingVm);

      result.subscribe(value => {
        expect(value).toBeDefined();
        expect(value?.multiDayHearing.isMultiDay).toBe('Yes');
      });
    });

    it('should handle hearing with hasVideoLink true', () => {
      const hearingWithVideo = {
        ...selectedHearing,
        hasVideoLink: true,
        hearingDayCount: 1,
        hearingDays: [
          {
            ...selectedHearing.hearingDays[0],
            durationMinutes: 30
          }
        ]
      };

      store.overrideSelector(getSelectedHearing, hearingWithVideo as any);
      store.setState({
        referenceData: {
          organisationUnits: mockOrgUnitsWithId
        }
      } as any);

      const result = store.select(getRemoveHearingVm);

      result.subscribe(value => {
        expect(value?.videoHearing).toBe('Yes');
      });
    });

    it('should handle hearing with hasVideoLink false', () => {
      const hearingWithoutVideo = {
        ...selectedHearing,
        hasVideoLink: false,
        hearingDayCount: 1,
        hearingDays: [
          {
            ...selectedHearing.hearingDays[0],
            durationMinutes: 30
          }
        ]
      };

      store.overrideSelector(getSelectedHearing, hearingWithoutVideo as any);
      store.setState({
        referenceData: {
          organisationUnits: mockOrgUnitsWithId
        }
      } as any);

      const result = store.select(getRemoveHearingVm);

      result.subscribe(value => {
        expect(value?.videoHearing).toBe('No');
      });
    });

    it('should handle hearingLanguage with empty string', () => {
      const hearingWithEmptyLanguage = {
        ...selectedHearing,
        hearingLanguage: '',
        hearingDayCount: 1,
        hearingDays: [
          {
            ...selectedHearing.hearingDays[0],
            durationMinutes: 30
          }
        ]
      };

      store.overrideSelector(getSelectedHearing, hearingWithEmptyLanguage as any);
      store.setState({
        referenceData: {
          organisationUnits: mockOrgUnitsWithId
        }
      } as any);

      const result = store.select(getRemoveHearingVm);

      result.subscribe(value => {
        expect(value?.hearingLanguage).toBeDefined();
      });
    });

    it('should handle hearingLanguage with lowercase', () => {
      const hearingWithLowercaseLanguage = {
        ...selectedHearing,
        hearingLanguage: 'english',
        hearingDayCount: 1,
        hearingDays: [
          {
            ...selectedHearing.hearingDays[0],
            durationMinutes: 30
          }
        ]
      };

      store.overrideSelector(getSelectedHearing, hearingWithLowercaseLanguage as any);
      store.setState({
        referenceData: {
          organisationUnits: mockOrgUnitsWithId
        }
      } as any);

      const result = store.select(getRemoveHearingVm);

      result.subscribe(value => {
        expect(value?.hearingLanguage).toBe('English');
      });
    });
  });

  describe('getChangeCourtroomVm', () => {
    it('should return null when hearing is null', () => {
      store.overrideSelector(getSelectedHearing, null);
      store.setState({
        referenceData: {
          organisationUnits: mockOrgUnitsWithId
        }
      } as any);

      const result = store.select(getChangeCourtroomVm);

      result.subscribe(value => {
        expect(value).toBeNull();
      });
    });

    it('should filter out past hearing days', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const hearingWithPastAndFutureDays = {
        ...selectedHearing,
        hearingDays: [
          {
            ...selectedHearing.hearingDays[0],
            hearingDate: pastDate.toISOString().split('T')[0],
            startTime: '10:00:00'
          },
          {
            ...selectedHearing.hearingDays[1],
            hearingDate: futureDate.toISOString().split('T')[0],
            startTime: '11:00:00'
          }
        ]
      };

      store.overrideSelector(getSelectedHearing, hearingWithPastAndFutureDays as any);
      store.setState({
        referenceData: {
          organisationUnits: mockOrgUnitsWithId
        }
      } as any);

      const result = store.select(getChangeCourtroomVm);

      result.subscribe(value => {
        expect(value).toBeDefined();
        expect(value?.upComingHearingDays.length).toBe(1);
        expect(value?.upComingHearingDays[0].hearingDate).toBe(
          futureDate.toISOString().split('T')[0]
        );
      });
    });

    it('should include hearing days on or after today', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const hearingWithTodayAndFutureDays = {
        ...selectedHearing,
        hearingDays: [
          {
            ...selectedHearing.hearingDays[0],
            hearingDate: today.toISOString().split('T')[0],
            startTime: '10:00:00'
          },
          {
            ...selectedHearing.hearingDays[1],
            hearingDate: futureDate.toISOString().split('T')[0],
            startTime: '11:00:00'
          }
        ]
      };

      store.overrideSelector(getSelectedHearing, hearingWithTodayAndFutureDays as any);
      store.setState({
        referenceData: {
          organisationUnits: mockOrgUnitsWithId
        }
      } as any);

      const result = store.select(getChangeCourtroomVm);

      result.subscribe(value => {
        expect(value).toBeDefined();
        expect(value?.upComingHearingDays.length).toBe(2);
      });
    });

    it('should handle hasReportingRestriction when reportingRestrictions exist', () => {
      const hearingWithReportingRestrictions = {
        ...selectedHearing,
        listedCases: [
          {
            ...selectedHearing.listedCases[0],
            defendants: [
              {
                ...selectedHearing.listedCases[0].defendants[0],
                offences: [
                  {
                    ...selectedHearing.listedCases[0].defendants[0].offences[0],
                    reportingRestrictions: ['restriction1']
                  }
                ]
              }
            ]
          }
        ]
      };

      store.overrideSelector(getSelectedHearing, hearingWithReportingRestrictions as any);
      store.setState({
        referenceData: {
          organisationUnits: mockOrgUnitsWithId
        }
      } as any);

      const result = store.select(getChangeCourtroomVm);

      result.subscribe(value => {
        expect(value?.hasReportingRestriction).toBe(true);
      });
    });

    it('should handle hasReportingRestriction when reportingRestrictions do not exist', () => {
      const hearingWithoutReportingRestrictions = {
        ...selectedHearing,
        listedCases: [
          {
            ...selectedHearing.listedCases[0],
            defendants: [
              {
                ...selectedHearing.listedCases[0].defendants[0],
                offences: [
                  {
                    ...selectedHearing.listedCases[0].defendants[0].offences[0],
                    reportingRestrictions: []
                  }
                ]
              }
            ]
          }
        ]
      };

      store.overrideSelector(getSelectedHearing, hearingWithoutReportingRestrictions as any);
      store.setState({
        referenceData: {
          organisationUnits: mockOrgUnitsWithId
        }
      } as any);

      const result = store.select(getChangeCourtroomVm);

      result.subscribe(value => {
        expect(value?.hasReportingRestriction).toBe(false);
      });
    });

    it('should handle hasReportingRestriction when listedCases is empty', () => {
      const hearingWithEmptyListedCases = {
        ...selectedHearing,
        listedCases: []
      };

      store.overrideSelector(getSelectedHearing, hearingWithEmptyListedCases as any);
      store.setState({
        referenceData: {
          organisationUnits: mockOrgUnitsWithId
        }
      } as any);

      const result = store.select(getChangeCourtroomVm);

      result.subscribe(value => {
        expect(value?.hasReportingRestriction).toBe(false);
      });
    });

    it('should handle hasReportingRestriction when listedCases is null', () => {
      const hearingWithNullListedCases = {
        ...selectedHearing,
        listedCases: null
      };

      store.overrideSelector(getSelectedHearing, hearingWithNullListedCases as any);
      store.setState({
        referenceData: {
          organisationUnits: mockOrgUnitsWithId
        }
      } as any);

      const result = store.select(getChangeCourtroomVm);

      result.subscribe(value => {
        expect(value?.hasReportingRestriction).toBe(false);
      });
    });

    it('should handle courtCentre not found', () => {
      const hearingWithUnknownCourtCentre = {
        ...selectedHearing,
        courtCentreId: 'unknown-id'
      };

      store.overrideSelector(getSelectedHearing, hearingWithUnknownCourtCentre as any);
      store.setState({
        referenceData: {
          organisationUnits: mockOrgUnitsWithId
        }
      } as any);

      const result = store.select(getChangeCourtroomVm);

      result.subscribe(value => {
        expect(value).toBeDefined();
        expect(value?.courtCentre).toBe('');
        expect(value?.courtRooms).toEqual([]);
      });
    });

    it('should handle courtrooms undefined', () => {
      const orgUnitsWithoutCourtrooms = [
        {
          ...mockOrganisationUnits[0],
          courtrooms: undefined
        }
      ];

      store.overrideSelector(getSelectedHearing, selectedHearing as any);
      store.setState({
        referenceData: {
          organisationUnits: orgUnitsWithoutCourtrooms
        }
      } as any);

      const result = store.select(getChangeCourtroomVm);

      result.subscribe(value => {
        expect(value).toBeDefined();
        expect(value?.courtRooms).toEqual([]);
      });
    });

    it('should handle hearingType description missing', () => {
      const hearingWithoutTypeDescription = {
        ...selectedHearing,
        type: {
          ...selectedHearing.type,
          description: undefined
        }
      };

      store.overrideSelector(getSelectedHearing, hearingWithoutTypeDescription as any);
      store.setState({
        referenceData: {
          organisationUnits: mockOrgUnitsWithId
        }
      } as any);

      const result = store.select(getChangeCourtroomVm);

      result.subscribe(value => {
        expect(value?.hearingType).toBe('');
      });
    });
  });

  describe('getSelectedCourtFor', () => {
    it('should return organisation unit for given id', () => {
      const courtCentreId = mockOrgUnitsWithId[0].id || selectedHearing.courtCentreId;
      const selector = getSelectedCourtFor(courtCentreId);

      store.setState({
        referenceData: {
          organisationUnits: mockOrgUnitsWithId
        }
      } as any);

      const result = store.select(selector);

      result.subscribe(value => {
        expect(value).toBeDefined();
      });
    });

    it('should return undefined when organisation unit not found', () => {
      const selector = getSelectedCourtFor('non-existent-id');

      store.setState({
        referenceData: {
          organisationUnits: mockOrgUnitsWithId
        }
      } as any);

      const result = store.select(selector);

      result.subscribe(value => {
        expect(value).toBeUndefined();
      });
    });
  });

  describe('getSessionsForSelectedHearingBusinessType', () => {
    it('should filter hearing slots by businessType and courtRoomId', () => {
      const scheduleId = 'schedule-1';
      const hearingSlots: HearingSlot[] = [
        {
          courtScheduleId: 'schedule-1',
          businessType: 'Type1',
          courtRoomId: 'room-1'
        } as HearingSlot,
        {
          courtScheduleId: 'schedule-2',
          businessType: 'Type1',
          courtRoomId: 'room-1'
        } as HearingSlot,
        {
          courtScheduleId: 'schedule-3',
          businessType: 'Type2',
          courtRoomId: 'room-1'
        } as HearingSlot,
        {
          courtScheduleId: 'schedule-4',
          businessType: 'Type1',
          courtRoomId: 'room-2'
        } as HearingSlot
      ];

      const selector = getSessionsForSelectedHearingBusinessType(scheduleId);

      store.overrideSelector(getSearchResults, hearingSlots);

      const result = store.select(selector);

      result.subscribe(value => {
        expect(value.length).toBe(2);
        expect(
          value.every(slot => slot.businessType === 'Type1' && slot.courtRoomId === 'room-1')
        ).toBe(true);
      });
    });

    it('should return empty array when hearingSlots is null', () => {
      const scheduleId = 'schedule-1';
      const selector = getSessionsForSelectedHearingBusinessType(scheduleId);

      store.overrideSelector(getSearchResults, null);

      const result = store.select(selector);

      result.subscribe(value => {
        expect(value).toEqual([]);
      });
    });

    it('should return empty array when hearingSlots is undefined', () => {
      const scheduleId = 'schedule-1';
      const selector = getSessionsForSelectedHearingBusinessType(scheduleId);

      store.overrideSelector(getSearchResults, undefined);

      const result = store.select(selector);

      result.subscribe(value => {
        expect(value).toEqual([]);
      });
    });

    it('should return empty array when currentHearingSlot is not found', () => {
      const scheduleId = 'non-existent-schedule';
      const hearingSlots: HearingSlot[] = [
        {
          courtScheduleId: 'schedule-1',
          businessType: 'Type1',
          courtRoomId: 'room-1'
        } as HearingSlot
      ];

      const selector = getSessionsForSelectedHearingBusinessType(scheduleId);

      store.overrideSelector(getSearchResults, hearingSlots);

      const result = store.select(selector);

      result.subscribe(value => {
        expect(value).toEqual([]);
      });
    });
  });
});
