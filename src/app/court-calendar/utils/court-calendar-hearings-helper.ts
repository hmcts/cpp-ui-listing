import { CourtRoom, OrganisationUnit } from '@cpp/reference-data';
import { HearingSlot } from '@cpp/scheduling';
import { differenceBy, sortBy, uniq } from 'lodash-es';
import {
  ExtendedJudicialRole,
  Hearing,
  ListedCase,
  PaginatedHearingResponse,
  PaginatedHearings,
  SequenceHearing
} from '../../core';
import {
  AllocateHearingCase,
  AllocationHearingsSectionVm,
  AllocationHearingsVM,
  AllocationType,
  CourtCalendarFeature,
  CourtCalendarVM,
  CourtRoomCalendarVM,
  CourtRoomHearingTimeCalendar,
  CourtRoomJudicialCalendar,
  PaginatedHearingMap,
  CourtRoomBusinessTypeCalendar,
  MagsWidgetCourtroomCalendarVm
} from '../model';
import { BaseHearingRowDataVM } from '../model/hearing-table-renderer.vm';
import { CourtCalendarManager, getCourtCalendarManager } from './courtroom-calendar-manager';

type HearingCalendarRecordLike = CourtRoomJudicialCalendar | CourtRoomBusinessTypeCalendar;

export function judiciaryIsEqual(
  judiciary: ExtendedJudicialRole[],
  judiciaryToCompare: ExtendedJudicialRole[]
) {
  return (
    judiciary.length === judiciaryToCompare.length &&
    differenceBy(judiciary, judiciaryToCompare, 'judicialId').length === 0
  );
}

export const getCourtCalendarViewModel = (
  { hearings, pagination }: Partial<PaginatedHearings>,
  courtCentre: OrganisationUnit,
  courtRoomsByDate: Record<string, string[]>,
  feature: CourtCalendarFeature
): CourtCalendarVM => {
  const courtRoomCalendarManager = getCourtCalendarManager<CourtRoomCalendarVM>();
  const courtRoomCalendars = sortBy(
    Object.entries(courtRoomsByDate).reduce((viewModels, [date, courtRooms]) => {
      return [
        ...viewModels,
        ...courtRooms.reduce((calendars, roomId) => {
          const courtRoom = courtCentre.courtrooms?.find(({ id }) => roomId === id);
          const filteredHearingsByDate = hearings.filter(({ hearingDays }) =>
            hearingDays.some(
              ({ courtRoomId, hearingDate }) =>
                date === hearingDate && courtRoom?.id === courtRoomId
            )
          );

          if (filteredHearingsByDate.length === 0 && feature === CourtCalendarFeature.calendar) {
            return calendars;
          }

          calendars.push(
            courtRoomCalendarManager
              .initialise({
                courtRoom,
                date,
                hearings: filteredHearingsByDate,
                courtCentre
              })
              .upsertJudicialCalendar()
              .getCourtCalendar()
          );

          return calendars;
        }, [] as CourtRoomCalendarVM[])
      ];
    }, [] as CourtRoomCalendarVM[]),
    'date',
    'courtRoomName'
  );

  return {
    courtRoomCalendars,
    pagination,
    totalHearingsDisplayed: (hearings ?? []).length
  };
};

export const getMagsWidgetCourtCalendarViewModel = (
  { hearings }: PaginatedHearings,
  courtCentre: OrganisationUnit,
  courtRoomsByDate: Record<string, string[]>,
  hearingSlots: HearingSlot[]
): MagsWidgetCourtroomCalendarVm[] => {
  const courtRoomCalendarManager = getCourtCalendarManager<MagsWidgetCourtroomCalendarVm>();
  const courtRoomCalendars = sortBy(
    Object.entries(courtRoomsByDate).reduce((viewModels, [date, courtRooms]) => {
      return [
        ...viewModels,
        ...courtRooms.reduce((calendars, roomId) => {
          const courtRoom = courtCentre.courtrooms?.find(({ id }) => roomId === id);
          const filteredHearingsByDate = hearings.filter(({ hearingDays }) =>
            hearingDays.some(
              ({ courtRoomId, hearingDate }) =>
                date === hearingDate && courtRoom?.id === courtRoomId
            )
          );

          calendars.push(
            courtRoomCalendarManager
              .initialise({
                courtRoom,
                date,
                hearings: filteredHearingsByDate,
                courtCentre
              })
              .upsertBusinessTypeCalendar(hearingSlots)
              .getCourtCalendar()
          );

          return calendars;
        }, [] as MagsWidgetCourtroomCalendarVm[])
      ];
    }, [] as MagsWidgetCourtroomCalendarVm[]),
    'date',
    'courtRoomName'
  );

  return courtRoomCalendars;
};

export const getAllocationHearingsViewModel = (
  { hearings, pagination }: PaginatedHearings,
  allocationType: AllocationType,
  courtCentre: OrganisationUnit
): AllocationHearingsVM => {
  if (!allocationType) {
    return undefined;
  }
  const courtCalendarManager = getCourtCalendarManager<AllocationHearingsSectionVm>();
  if (allocationType === AllocationType.allocate) {
    return {
      allocationHearings: getUnallocatedHearingsViewModel(
        courtCalendarManager,
        hearings,
        courtCentre
      ),
      pagination,
      allocationType
    };
  }
  return {
    allocationHearings: getReallocateHearingsViewModel(courtCalendarManager, hearings, courtCentre),
    pagination,
    allocationType
  };
};

export const mapResponseToPaginatedHearingMap = (
  { hearings, results, pageCount }: PaginatedHearingResponse,
  startDate?: string,
  endDate?: string,
  currentPage?: number,
  courtRooms?: CourtRoom[]
): PaginatedHearingMap => {
  let courtRoomMapByDate: Record<string, string[]> = {};
  const filterdHearings = hearings.filter(hearing => hearing.hearingDays?.length > 0);

  if (!!startDate && (!endDate || startDate === endDate) && courtRooms?.length > 0) {
    courtRoomMapByDate[startDate] = courtRooms.map(({ id }) => id);
  } else {
    courtRoomMapByDate = filterdHearings.reduce((maps, hearing) => {
      if (!hearing.hearingDays || hearing.hearingDays.length === 0) {
        return maps;
      }
      // if we have a single day in the hearing there is
      //the possibility of multidays where all but one day are non sitting days
      // we should filter as a safe bet
      if (hearingDateFilterPredicate(hearing.hearingDays[0].hearingDate, startDate, endDate)) {
        maps[hearing.hearingDays[0].hearingDate] = uniq([
          ...(maps[hearing.hearingDays[0].hearingDate] ?? []),
          hearing.hearingDays[0].courtRoomId
        ]);
      }
      return maps;
    }, {});
  }
  return {
    courtRoomMapByDate,
    paginatedHearings: {
      hearings: filterdHearings,
      pagination: {
        totalNumber: results,
        currentPage,
        pageCount
      }
    }
  };
};

export const mapHearingRowVmToSequencedHearings = (
  groupHearings: BaseHearingRowDataVM[],
  hearingsToInsertIds: string[],
  insertBeforeId?: string,
  insertafterId?: string
) => {
  const splicedHearings = spliceHearingsToSequence(
    groupHearings,
    hearingsToInsertIds,
    insertBeforeId,
    insertafterId
  );
  return splicedHearings.map(
    (hearing, index) =>
      ({
        id: hearing.id,
        sequenceHearingDays: [
          {
            hearingDate: hearing.hearingDate,
            sequence: ++index
          }
        ]
      }) as SequenceHearing
  );
};

export const getAllHearingCalendars = (
  calendars: HearingCalendarRecordLike[],
  predicate: (calendar: CourtRoomHearingTimeCalendar) => boolean = (
    c: CourtRoomHearingTimeCalendar
  ) => true
): CourtRoomHearingTimeCalendar[] => {
  return (calendars ?? []).reduce(
    (total, { hearingTimeCalendar }) => [...total, ...hearingTimeCalendar.filter(predicate)],
    [] as CourtRoomHearingTimeCalendar[]
  );
};

const startOfDay = (date: string | Date): Date => {
  const startOfDayDate = new Date(date);
  startOfDayDate.setHours(0, 0, 0, 0);
  return startOfDayDate;
};

export const dateIsCurrentOrGreaterThan = (hearingDate: string | Date): boolean => {
  return startOfDay(hearingDate).getTime() >= startOfDay(new Date()).getTime();
};

export const dateIsWithinLastSevenDays = (endDate: string | Date): boolean => {
  const today = startOfDay(new Date());
  const end = startOfDay(endDate);

  let sevenDaysAgo = startOfDay(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return end.getTime() >= sevenDaysAgo.getTime() && end.getTime() < today.getTime();
};

export const isEligibleForEndDateChange = (details?: Hearing): boolean => {
  if (!details) {
    return false;
  }
  const { jurisdictionType, hearingDayCount, endDate } = details;
  return jurisdictionType === 'CROWN' && hearingDayCount > 1 && dateIsWithinLastSevenDays(endDate);
};

export const getAllocateProsecutionCases = (
  listedCases: ListedCase[] = []
): AllocateHearingCase[] => {
  if (listedCases.length === 0) {
    return undefined;
  }
  return listedCases.map(({ id, defendants }) => ({
    caseId: id,
    defendants: defendants.map(({ id: defendantId, offences }) => ({
      defendantId,
      offences: offences.map(({ id }) => ({ offenceId: id }))
    }))
  }));
};

const spliceHearingsToSequence = (
  groupHearings: BaseHearingRowDataVM[],
  hearingsToInsertIds: string[],
  insertBeforeId?: string,
  insertafterId?: string
) => {
  const hearings = groupHearings.filter(row => row.isMaster);
  const hearingsToMove = hearings.filter(hearing => hearingsToInsertIds.includes(hearing.id));
  const restHearings = hearings.filter(hearing => !hearingsToInsertIds.includes(hearing.id));
  let benchMarkIndex = 0;
  if (insertBeforeId) {
    benchMarkIndex = restHearings.findIndex(hearing => hearing.id === insertBeforeId);
  }

  if (insertafterId) {
    benchMarkIndex = restHearings.findIndex(hearing => hearing.id === insertafterId) + 1;
  }
  restHearings.splice(benchMarkIndex, 0, ...hearingsToMove);
  return restHearings;
};

const hearingDateFilterPredicate = (
  hearingDate: string | Date,
  start?: string | Date,
  end?: string | Date
): boolean => {
  const dateToCompare = new Date(hearingDate);
  const startDate = start && new Date(start);
  const endDate = end && new Date(end);

  if (!start) {
    return true;
  }
  if (!!end && startDate.getTime() !== endDate.getTime()) {
    return (
      dateToCompare.getTime() >= startDate.getTime() && dateToCompare.getTime() <= endDate.getTime()
    );
  }

  return dateToCompare.getTime() === startDate.getTime();
};

const getUnallocatedHearingsViewModel = (
  manager: CourtCalendarManager<AllocationHearingsSectionVm>,
  hearings: Hearing[],
  courtCentre: OrganisationUnit
): AllocationHearingsSectionVm[] => {
  const { fixed, weekCommencing } = getUnallocatedDateVariationMap(hearings);
  const startDateModels = sortBy(
    (Object.entries(fixed) ?? []).map(([startDate, fixedHearings]) => {
      return manager
        .initialise({ date: startDate, hearings: fixedHearings, courtCentre })
        .upsertAllocationCalendar()
        .getCourtCalendar();
    }),
    'date'
  );
  const weekCommencingstartDateModels = sortBy(
    (Object.entries(weekCommencing) ?? []).map(([startDate, weekCommencingHearings]) => {
      return manager
        .initialise({
          date: startDate,
          hearings: weekCommencingHearings,
          isWeekCommencing: true,
          courtCentre
        })
        .upsertAllocationCalendar()
        .getCourtCalendar();
    }),
    'date'
  );
  return [...startDateModels, ...weekCommencingstartDateModels];
};

const getUnallocatedDateVariationMap = (hearings: Hearing[]) => {
  return (hearings ?? []).reduce(
    (variations, { weekCommencingStartDate, startDate, ...hearing }) => {
      if (!weekCommencingStartDate) {
        variations.fixed[startDate] = [
          ...(variations.fixed[startDate] ?? []),
          { ...hearing, startDate }
        ];
        return variations;
      }
      variations.weekCommencing[weekCommencingStartDate] = [
        ...(variations.weekCommencing[weekCommencingStartDate] ?? []),
        { ...hearing, startDate, weekCommencingStartDate }
      ];
      return variations;
    },
    {
      fixed: {},
      weekCommencing: {}
    } as {
      fixed: Record<string, Hearing[]>;
      weekCommencing: Record<string, Hearing[]>;
    }
  );
};

const getReallocateHearingsViewModel = (
  manager: CourtCalendarManager<AllocationHearingsSectionVm>,
  hearings: Hearing[],
  courtCentre: OrganisationUnit
): AllocationHearingsSectionVm[] => {
  const { singleDay, multiDay } = getReallocateDateVariationMap(hearings);
  const singleDayModels = sortBy(
    (Object.entries(singleDay) ?? []).map(([startDate, singleDayHearings]) => {
      return manager
        .initialise({ date: startDate, hearings: singleDayHearings, courtCentre })
        .upsertAllocationCalendar()
        .getCourtCalendar();
    }),
    'date'
  );
  const multiDayModels = sortBy(
    (Object.entries(multiDay) ?? []).map(([startDate, multiDayHearings]) => {
      return manager
        .initialise({
          date: startDate,
          hearings: multiDayHearings,
          forMultiReallocate: true,
          courtCentre
        })
        .upsertAllocationCalendar()
        .getCourtCalendar();
    }),
    'date'
  );
  return [...multiDayModels, ...singleDayModels];
};

const getReallocateDateVariationMap = (hearings: Hearing[]) => {
  return (hearings ?? []).reduce(
    (variations, { hearingDayCount, startDate, ...hearing }) => {
      if (hearingDayCount <= 1) {
        variations.singleDay[startDate] = [
          ...(variations.singleDay[startDate] ?? []),
          { ...hearing, hearingDayCount, startDate }
        ];
        return variations;
      }
      variations.multiDay[startDate] = [
        ...(variations.multiDay[startDate] ?? []),
        { ...hearing, hearingDayCount, startDate }
      ];
      return variations;
    },
    {
      singleDay: {},
      multiDay: {}
    } as {
      singleDay: Record<string, Hearing[]>;
      multiDay: Record<string, Hearing[]>;
    }
  );
};
