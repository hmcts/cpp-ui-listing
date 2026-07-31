import { DatePipe } from '@angular/common';
import { getOrganisationUnits, OrganisationUnit } from '@cpp/reference-data';
import { getSearchResults, HearingSlot } from '@cpp/scheduling';
import { createSelector, defaultMemoize, MemoizedSelector } from '@ngrx/store';
import { AppState, getRouteData, JurisdictionType } from '../../../core';
import { TimeDurationPipe } from '../../pipes/time-duration.pipe';
import {
  AllocationType,
  CourtCalendarFeature,
  PaginatedHearings,
  RemoveHearingVM,
  ChangeCourtroomVM
} from '../../model';
import {
  getAllocationHearingsViewModel,
  getCourtCalendarViewModel,
  getMagsWidgetCourtCalendarViewModel
} from '../../utils/court-calendar-hearings-helper';
import { CourtCalendarFeatureState } from '../court-calendar.state';
import { caseReferencesVM } from '../../utils/view-model-getters';

export const getCourtCalendarState = (state: CourtCalendarFeatureState) => state.courtCalendar;
export const getCourtCalendarFeature = createSelector(getRouteData, data => {
  if (!!data) {
    return data['feature'] as CourtCalendarFeature;
  }
});

export const getJurisdictionTypeFromFeature = createSelector(
  getCourtCalendarFeature,
  (feature): JurisdictionType => {
    if (feature === CourtCalendarFeature.allocateCrown) {
      return 'CROWN';
    }
    if (feature === CourtCalendarFeature.allocateMag) {
      return 'MAGISTRATES';
    }
    return undefined;
  }
);

export const getCourtCalendarFilters = createSelector(
  getCourtCalendarState,
  state => state?.filterOptions
);

export const getAllocatedHearingsMap = createSelector(
  getCourtCalendarState,
  state => state?.allocated
);

export const getUnallocatedHearingsMap = createSelector(
  getCourtCalendarState,
  state => state?.unallocated?.hearingMap
);
export const getFailedAllocationIds = createSelector(
  getCourtCalendarState,
  state => state?.failedAllocationIds ?? []
);

export const getAllocatedHearings = createSelector(
  getAllocatedHearingsMap,
  hearingsMap => hearingsMap?.paginatedHearings
);

export const getUnallocatedHearings = createSelector(
  getUnallocatedHearingsMap,
  hearingsMap => hearingsMap?.paginatedHearings
);

export const getHearingsToReallocate = createSelector(
  getCourtCalendarState,
  state => state?.hearingsToReallocate
);

export const getAllocationType = createSelector(
  getCourtCalendarState,
  state => state?.allocationType
);

export const getAllocationHearings = createSelector(
  getUnallocatedHearings,
  getHearingsToReallocate,
  getAllocationType,
  (unallocatedHearings, hearingsToReallocate, allocationType) => {
    return allocationType === AllocationType.allocate
      ? unallocatedHearings
      : ({ hearings: hearingsToReallocate } as PaginatedHearings);
  }
);

export const getAllocateWidgetFilter = createSelector(
  getCourtCalendarState,
  state => state?.unallocated?.allocateWidgetFilter
);

export const getAllocatedCourtRoomsByDate = createSelector(
  getAllocatedHearingsMap,
  hearingsMap => hearingsMap?.courtRoomMapByDate
);

export const getCourtCalendarVM = createSelector(
  getAllocatedHearings,
  getAllocatedCourtRoomsByDate,
  getCourtCalendarFilters,
  getAllocateWidgetFilter,
  getCourtCalendarFeature,
  (paginatedHearings, courtRoomsByDate, filters, widgetFilter, feature) => {
    let courtCentre = filters.courtCentre;
    if (feature !== 'CALENDAR' && widgetFilter.courtCentre) {
      courtCentre = widgetFilter.courtCentre;
    }

    return getCourtCalendarViewModel(paginatedHearings, courtCentre, courtRoomsByDate, feature);
  }
);

export const getMagsWidgetCourtCalendarVm = createSelector(
  getAllocatedHearings,
  getAllocatedCourtRoomsByDate,
  getCourtCalendarFilters,
  getAllocateWidgetFilter,
  getSearchResults,
  (paginatedHearings, courtRoomsByDate, filters, widgetFilter, hearingSlots) => {
    const courtCentre = widgetFilter?.courtCentre ?? filters.courtCentre;
    return getMagsWidgetCourtCalendarViewModel(
      paginatedHearings,
      courtCentre,
      courtRoomsByDate,
      hearingSlots
    );
  }
);

export const getAllocationHearingsVM = createSelector(
  getAllocationHearings,
  getCourtCalendarFilters,
  getAllocationType,
  (hearingsForAllocation, { courtCentre }, allocationType) => {
    return getAllocationHearingsViewModel(hearingsForAllocation, allocationType, courtCentre);
  }
);

export const getCaseNotesMap = createSelector(
  getCourtCalendarState,
  state => state?.caseNotesMap ?? {}
);

export const getCourtCalendarAlert = createSelector(getCourtCalendarState, state => {
  if (state?.successAlert || state?.failureAlert) {
    return { successAlert: state?.successAlert, failureAlert: state?.failureAlert };
  }
  return undefined;
});

export const getSelectedHearing = createSelector(
  getCourtCalendarState,
  state => state.selectedHearing
);

export const getRemoveHearingVm = createSelector(
  getSelectedHearing,
  getOrganisationUnits,
  (hearing, courtCentres): RemoveHearingVM => {
    const datePipe = new DatePipe('en-UK');
    const timeDurationPipe = new TimeDurationPipe();
    if (!hearing) {
      return null;
    }
    const courtCentre = courtCentres.find(orgUnit => orgUnit.id === hearing.courtCentreId);
    const courtRoom = courtCentre.courtrooms?.find(cRoom => cRoom?.id === hearing.courtRoomId);
    let totalHearingdurations: number = 0;
    if (hearing.hearingDayCount <= 1) {
      totalHearingdurations = hearing.hearingDays[0].durationMinutes;
    } else {
      totalHearingdurations = 360 * hearing.hearingDayCount;
    }
    return {
      id: hearing.id,
      courtName: courtCentre?.oucodeL3Name,
      courtRoom: courtRoom?.courtroomName,
      startDate: datePipe.transform(hearing.startDate, 'dd/MM/yyyy'),
      duration: timeDurationPipe.transform(totalHearingdurations),
      hearingType: hearing?.type?.description,
      hearingLanguage: `${(hearing?.hearingLanguage ?? '').charAt(0).toUpperCase() ?? ''}${(
        hearing?.hearingLanguage ?? ''
      )
        .slice(1)
        .toLowerCase()}`,
      videoHearing: hearing?.hasVideoLink ? 'Yes' : 'No',
      multiDayHearing: {
        isMultiDay: hearing?.hearingDayCount > 1 ? 'Yes' : 'No',
        startDate: hearing?.startDate,
        endDate: hearing?.endDate
      }
    };
  }
);

export const getChangeCourtroomVm = createSelector(
  getSelectedHearing,
  getOrganisationUnits,
  (hearing, courtCentres): ChangeCourtroomVM => {
    if (!hearing) {
      return null;
    }

    const courtCentre = courtCentres.find(orgUnit => orgUnit.id === hearing.courtCentreId);
    const courtRooms = courtCentre?.courtrooms ?? [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upComingHearingDays = hearing?.hearingDays.reduce(
      (hearingDaysList: ChangeCourtroomVM['upComingHearingDays'], hearingDay, index) => {
        if (new Date(hearingDay.hearingDate) >= today) {
          hearingDaysList.push({ ...hearingDay, position: index + 1 });
        }
        return hearingDaysList;
      },
      []
    );
    return {
      time: upComingHearingDays?.[0]?.startTime,
      hearingType: hearing?.type?.description || '',
      cases: caseReferencesVM(hearing),
      upComingHearingDays,
      totalHearingDaysCount: hearing?.hearingDays.length,
      hasReportingRestriction: (hearing.listedCases ?? []).some(({ defendants }) =>
        (defendants ?? []).some(({ offences }) =>
          (offences ?? []).some(
            ({ reportingRestrictions }) => (reportingRestrictions?.length ?? 0) > 0
          )
        )
      ),
      courtCentre: courtCentre?.oucodeL3Name || '',
      courtRooms,
      startDate: hearing.startDate,
      endDate: hearing.endDate
    };
  }
);

export const getSelectedCourtFor = (id: string): MemoizedSelector<AppState, OrganisationUnit> =>
  defaultMemoize((courtCentreId: string) =>
    createSelector(getOrganisationUnits, units => units.find(({ id }) => id === courtCentreId))
  ).memoized(id);

export const getSessionsForSelectedHearingBusinessType = (
  scheduleId: string
): MemoizedSelector<AppState, HearingSlot[]> =>
  defaultMemoize((id: string) =>
    createSelector(getSearchResults, hearingSlots => {
      const currentHearingSlot = (hearingSlots ?? []).find(
        ({ courtScheduleId }) => courtScheduleId === id
      );
      return (hearingSlots ?? []).filter(
        ({ businessType, courtRoomId }) =>
          businessType === currentHearingSlot?.businessType &&
          courtRoomId === currentHearingSlot?.courtRoomId
      );
    })
  ).memoized(scheduleId);
