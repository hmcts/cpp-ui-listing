import { CourtRoom, OrganisationUnit, RotaBusinessTypeCode } from '@cpp/reference-data';
import { Hearing } from '../../core';
import {
  AllocationHearingsSectionVm,
  CourtRoomBusinessTypeCalendar,
  CourtRoomCalendarVM,
  CourtRoomHearingTimeCalendar,
  CourtRoomJudicialCalendar,
  HearingRowVM,
  MagsWidgetCourtroomCalendarVm
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
    CourtRoomCalendarVM & AllocationHearingsSectionVm & MagsWidgetCourtroomCalendarVm
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
      const slotsRecord = Object.groupBy(courtRoomSlots, (slot) =>
        slot.totalBooked > 0 ? 'withHearings' : 'withNoHearings'
      );

      if (slotsRecord.withHearings?.length > 0) {
        courtCalendarVariant = {
          ...courtCalendarVariant,
          businessTypeCalendar: slotsRecord.withHearings.reduce((calendars, slot) => {
            const slotHearings = (this.hearingViewModels ?? []).filter(
              ({ details }) => details.hearingDays[0].courtScheduleId === slot.courtScheduleId
            );
            if (slotHearings.length <= 0) {
              return calendars;
            }
            calendars.push({
              businessTypeAndSlot: {
                businessTypeCode: slot.businessType as RotaBusinessTypeCode,
                courtScheduleId: slot.courtScheduleId,
                session: {
                  startTime: slot.sessionStartTime,
                  endTime: slot.sessionEndTime,
                  type: slot.courtSession
                }
              },
              hearingTimeCalendar: slotHearings.reduce((hearingCalendars, hearingVm) => {
                hearingCalendars = mapToHearingTimeCalendar(hearingVm, hearingCalendars);
                return hearingCalendars;
              }, [] as CourtRoomHearingTimeCalendar[])
            });
            return calendars;
          }, [] as CourtRoomBusinessTypeCalendar[])
        };
      }

      if (slotsRecord.withNoHearings?.length > 0) {
        courtCalendarVariant = {
          ...courtCalendarVariant,
          businessTypeCalendar: [
            ...(courtCalendarVariant.businessTypeCalendar ?? []),
            ...slotsRecord.withNoHearings.map((hearingSlot) => ({
              businessTypeAndSlot: {
                businessTypeCode: hearingSlot.businessType,
                courtScheduleId: hearingSlot.courtScheduleId,
                session: {
                  startTime: hearingSlot.sessionStartTime,
                  endTime: hearingSlot.sessionEndTime,
                  type: hearingSlot.courtSession
                }
              },
              hearingTimeCalendar: []
            }))
          ]
        };
      }
      return this;
    },
    hearingViewModels
  };
};
