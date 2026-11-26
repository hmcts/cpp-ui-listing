import { CourtRoom, OrganisationUnit, RotaBusinessTypeCode } from '@cpp/reference-data';
import { Hearing } from '../../core';
import {
  AllocatedWidgetCourtroomCalendarVm,
  AllocationHearingsSectionVm,
  CourtRoomBusinessTypeCalendar,
  CourtRoomCalendarVM,
  CourtRoomHearingTimeCalendar,
  CourtRoomJudicialCalendar,
  CourtRoomSessionCalendar,
  HearingRowVM
} from '../model';
import { getHearingsViewModel, normaliseCourtCalendarVariant } from './view-model-getters';
import { judiciaryIsEqual } from './court-calendar-hearings-helper';
import { generateId } from '@cpp/pdk';
import { HearingSlot } from '@cpp/scheduling';
interface InitialiseData {
  date: string;
  hearings: Hearing[];
  courtRoom?: CourtRoom;
  isWeekCommencing?: boolean;
  courtCentre: OrganisationUnit;
  forMultiReallocate?: boolean;
}
export interface CourtCalendarManager<T> {
  initialise: (initialData: InitialiseData) => this;
  upsertJudicialCalendar: () => this;
  upsertAllocationCalendar: () => this;
  upsertBusinessTypeCalendar: (hearingSlots: HearingSlot[]) => this;
  getCourtCalendar: () => T;
  hearingViewModels: HearingRowVM[];
}

export const getCourtCalendarManager = <
  T extends Partial<
    CourtRoomCalendarVM & AllocationHearingsSectionVm & AllocatedWidgetCourtroomCalendarVm
  >
>(): CourtCalendarManager<T> => {
  let courtCalendarVariant: T;
  let hearingViewModels: HearingRowVM[];

  function mapToHearingTimeCalendar(
    hearing: HearingRowVM,
    seed: CourtRoomHearingTimeCalendar[] = []
  ) {
    const existingTimeCalendar = seed.find(({ time }) => time === hearing.dateTime);
    if (!!existingTimeCalendar) {
      existingTimeCalendar.hearings.push(hearing);
    } else {
      seed.push({
        time: hearing.dateTime,
        hearings: [hearing]
      });
    }
    return seed;
  }

  return {
    initialise: function ({
      date,
      hearings,
      courtRoom,
      forMultiReallocate,
      isWeekCommencing,
      courtCentre
    }: InitialiseData) {
      courtCalendarVariant = {
        courtRoomId: courtRoom?.id,
        courtRoomName: courtRoom?.courtroomName,
        forMultiReallocate,
        isWeekCommencing,
        sectionIdentifier: generateId('court-calendar-section'),
        courtCentre,
        date
      } as T;
      this.hearingViewModels = getHearingsViewModel(
        hearings,
        date,
        courtCentre?.defaultStartTime ?? '10:00',
        forMultiReallocate
      );
      return this;
    },
    getCourtCalendar: function (): T {
      return normaliseCourtCalendarVariant(courtCalendarVariant) as T;
    },

    upsertJudicialCalendar: function (this: CourtCalendarManager<T>) {
      courtCalendarVariant = {
        ...courtCalendarVariant,
        judiciaryCalendar: (this.hearingViewModels ?? []).reduce(
          (judicialCalendars, courtRoomHearing) => {
            const existingJudicialCalendar = judicialCalendars.find(({ judiciary }) =>
              judiciaryIsEqual(courtRoomHearing.judiciary, judiciary)
            );
            if (!!existingJudicialCalendar) {
              existingJudicialCalendar.hearingTimeCalendar = mapToHearingTimeCalendar(
                courtRoomHearing,
                existingJudicialCalendar.hearingTimeCalendar
              );
            } else {
              judicialCalendars.push({
                judiciary: courtRoomHearing.judiciary,
                hearingTimeCalendar: mapToHearingTimeCalendar(courtRoomHearing)
              });
            }
            return judicialCalendars;
          },
          [] as CourtRoomJudicialCalendar[]
        )
      };
      return this;
    },
    upsertAllocationCalendar: function (this: CourtCalendarManager<T>) {
      courtCalendarVariant = {
        ...courtCalendarVariant,
        allocationCalendar: this.hearingViewModels.reduce(
          (calendar, allocationHearing) => ({
            ...calendar,
            hearingTimeCalendar: mapToHearingTimeCalendar(
              allocationHearing,
              calendar?.hearingTimeCalendar ?? []
            )
          }),
          {} as AllocationHearingsSectionVm['allocationCalendar']
        )
      } as T;
      return this;
    },
    upsertBusinessTypeCalendar: function (
      this: CourtCalendarManager<T>,
      hearingSlots: HearingSlot[]
    ) {
      const courtRoomSlots = hearingSlots.filter(
        ({ courtRoomId }) => courtCalendarVariant.courtRoomId === courtRoomId
      );
      if (courtRoomSlots.length <= 0) {
        courtCalendarVariant = {
          ...courtCalendarVariant,
          businessTypeCalendar: []
        };
        return this;
      }

      const slotsByBusinessType = Object.groupBy(courtRoomSlots, slot => slot.businessType);

      const businessTypeCalendar: CourtRoomBusinessTypeCalendar[] = Object.entries(
        slotsByBusinessType
      ).map(([businessType, slots]) => ({
        businessType: businessType as RotaBusinessTypeCode,
        sessions: slots.map((slot): CourtRoomSessionCalendar => {
          const slotHearings = (this.hearingViewModels ?? []).filter(
            ({ details }) => details.hearingDays[0].courtScheduleId === slot.courtScheduleId
          );
          const judiciaryCalendar = slotHearings.reduce((judicialCalendars, hearing) => {
            const existing = judicialCalendars.find(({ judiciary }) =>
              judiciaryIsEqual(hearing.judiciary, judiciary)
            );
            if (existing) {
              existing.hearingTimeCalendar = mapToHearingTimeCalendar(
                hearing,
                existing.hearingTimeCalendar
              );
            } else {
              judicialCalendars.push({
                judiciary: hearing.judiciary,
                hearingTimeCalendar: mapToHearingTimeCalendar(hearing)
              });
            }
            return judicialCalendars;
          }, [] as CourtRoomJudicialCalendar[]);

          return {
            slot: {
              courtScheduleId: slot.courtScheduleId,
              session: {
                startTime: slot.sessionStartTime,
                endTime: slot.sessionEndTime,
                type: slot.courtSession
              }
            },
            judiciaryCalendar
          };
        })
      }));

      courtCalendarVariant = {
        ...courtCalendarVariant,
        businessTypeCalendar
      };
      return this;
    },
    hearingViewModels
  };
};
