import { inject, Injectable } from '@angular/core';
import { HearingType, OrganisationUnit } from '@cpp/reference-data';
import {
  CourtCentre,
  ExtendedJudicialRole,
  Hearing,
  HearingDay,
  HearingWithSelectedCourtCentre,
  NonDefaultDay
} from '../../core';
import { CPPDate } from '../../core/util';
import { DateRange } from '../../shared/components/date-range/date-range';
import { ChangeHearingDetailsFormValues } from '../change-hearing-details/components/change-hearing-details.component';
import { HearingAllocationPayload } from '../model';
import { getAllocateProsecutionCases } from './court-calendar-hearings-helper';
const SITTING_DAY_MINUTES = 360;

interface NonDefaultDayData {
  startTime: string;
  duration: number;
  courtCentreId: string;
  courtRoomId: string;
  startDate: string;
  courtScheduleId?: string;
  oucode?: string;
  session?: string;
}

@Injectable({ providedIn: 'root' })
export class AllocateHearingFactory {
  private readonly cppDate = inject(CPPDate);

  computeAllocatedHearing(
    {
      weekCommencingStartDate,
      weekCommencingEndDate,
      weekCommencingDurationInWeeks,
      id,
      listedCases,
      ...rest
    }: Hearing,
    courtCentre: OrganisationUnit,
    courtRoomId: string,
    startDate: string,
    hearingDateTime: string,
    judiciary: ExtendedJudicialRole[],
    courtScheduleId?: string,
    courtSession?: string
  ): HearingAllocationPayload {
    const endDate = this.getEndDate(startDate, rest);
    return {
      courtRoomId,
      courtCentreId: courtCentre.id,
      startDate,
      endDate,
      prosecutionCases: getAllocateProsecutionCases(listedCases),
      nonDefaultDays: this.computeNonDefaultDays(
        rest,
        startDate,
        hearingDateTime,
        courtCentre.id,
        courtRoomId,
        courtScheduleId,
        courtCentre.oucode,
        courtSession
      ),
      nonSittingDays: this.computeNonSittingDays(rest, startDate),
      hearingId: id,
      judiciary: (judiciary ?? []).map(({ judicialMember, ...restJudiciary }) => restJudiciary),
      jurisdictionType: rest.jurisdictionType,
      hearingLanguage: rest.hearingLanguage,
      publicListNote: rest.publicListNote,
      hasVideoLink: rest.hasVideoLink,
      bookingType: rest.bookingType,
      priority: rest.priority,
      type: rest.type,
      specialRequirements: rest.specialRequirements,
      sendNotificationToParties: rest.sendNotificationToParties
    };
  }

  hearingStartTime({ hearingDays }: Hearing): string {
    return this.cppDate.format(hearingDays[0].startTime, this.cppDate.HOURS_MINUTES_24H);
  }

  multiDayDurationMinutes({ startDate, endDate }: DateRange): number {
    return this.cppDate.countWorkingDays(startDate, endDate) * SITTING_DAY_MINUTES;
  }

  hearingToUpdateValues(
    hearing: Hearing,
    overrides: Partial<ChangeHearingDetailsFormValues> = {}
  ): ChangeHearingDetailsFormValues {
    const [{ durationMinutes, courtScheduleId }] = hearing.hearingDays;
    const dateRange = overrides.dateRange ?? new DateRange(hearing.startDate, hearing.endDate);
    const isMultiDay = dateRange.startDate !== dateRange.endDate;
    return {
      hasVideoLink: !!hearing.hasVideoLink,
      sendNotificationToParties: !!hearing.sendNotificationToParties,
      hearingLanguage: hearing.hearingLanguage,
      publicListNote: hearing.publicListNote,
      nonSittingDays: hearing.nonSittingDays,
      nonDefaultDays: hearing.hearingDayCount === 1 ? [] : hearing.nonDefaultDays,
      selectedHearingType: {
        id: hearing.type.id,
        hearingDescription: hearing.type.description
      } as HearingType,
      dateRange,
      startTime: this.hearingStartTime(hearing),
      duration: isMultiDay ? this.multiDayDurationMinutes(dateRange) : durationMinutes,
      courtScheduleId,
      ...overrides
    };
  }

  updateAllocatedHearing(
    originalHearing: Hearing,
    values: ChangeHearingDetailsFormValues,
    courtCentre: CourtCentre,
    selectedJudiciary?: ExtendedJudicialRole[]
  ): HearingWithSelectedCourtCentre {
    const {
      dateRange,
      startTime,
      duration,
      selectedHearingType,
      nonSittingDays,
      nonDefaultDays = [],
      courtScheduleId,
      courtSession,
      ...rest
    } = values;
    const {
      courtRoomId,
      courtCentreId,
      jurisdictionType,
      listedCases,
      judiciary,
      courtApplications,
      estimatedMinutes
    } = originalHearing;
    const virtualNonDefaultDay = this.computeVirtualNonDefaultDayForUpdate(
      dateRange,
      jurisdictionType,
      startTime,
      duration,
      courtCentreId,
      courtRoomId,
      courtCentre,
      courtScheduleId,
      courtSession
    );
    return {
      ...rest,
      id: originalHearing.id,
      allocated: true,
      estimatedMinutes,
      type: {
        id: selectedHearingType.id,
        description: selectedHearingType.hearingDescription
      },
      courtRoomId,
      courtCentreId,
      jurisdictionType,
      hasVideoLink: values.hasVideoLink ?? false,
      judiciary: selectedJudiciary ?? judiciary,
      nonSittingDays: nonSittingDays || [],
      nonDefaultDays: [...virtualNonDefaultDay, ...nonDefaultDays],
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      listedCases,
      courtApplications,
      selectedCourtCentre: {
        id: courtCentreId,
        courtRoomId,
        courtCentreName: courtCentre?.name,
        ouCode: jurisdictionType === 'MAGISTRATES' ? courtCentre.oucode : undefined
      }
    } as HearingWithSelectedCourtCentre;
  }
  /**
   * Transforms a hearing object into the required payload format for unallocation.
   * Removes unnecessary properties and ensures only expected fields are sent.
   *
   * @param {Hearing} hearing - The hearing object to be unallocated.
   * @param {string} [courtScheduleId] - Optional courtScheduleId of a session to associate with the unallocated hearing (Crown only).
   * @returns {HearingUpdatePayload} - The transformed payload for unallocating a hearing.
   */
  unallocateHearing(hearing: Hearing, courtScheduleId?: string): HearingAllocationPayload {
    const { startTime } = hearing.hearingDays[0];
    return {
      hearingId: hearing.id,
      courtCentreId: hearing.courtCentreId,
      courtRoomId: undefined,
      type: hearing.type,
      judiciary: hearing.judiciary?.map(({ judicialMember, ...rest }) => rest) ?? [],
      jurisdictionType: hearing.jurisdictionType,
      startDate: hearing.startDate,
      endDate: hearing.startDate, // Unallocated hearings have the same start and end date
      nonSittingDays: [],
      nonDefaultDays: [
        this.createFakeNonDefaultDay({
          startDate: hearing.startDate,
          startTime: this.cppDate.format(startTime, this.cppDate.HOURS_MINUTES_24H),
          courtCentreId: hearing.courtCentreId,
          courtRoomId: undefined,
          courtScheduleId,
          duration: hearing.estimatedMinutes
        })
      ],
      hasVideoLink: hearing.hasVideoLink,
      hearingLanguage: hearing.hearingLanguage,
      publicListNote: hearing.publicListNote,
      prosecutionCases: getAllocateProsecutionCases(hearing.listedCases)
    };
  }

  parseBulkVirtualNonDefaultDays(
    { nonDefaultDays }: Hearing,
    updatedHearingDays: HearingDay[]
  ): NonDefaultDay[] {
    return updatedHearingDays.reduce(
      (
        nonDefaultDayList: NonDefaultDay[],
        { hearingDate, courtRoomId, courtCentreId, ...rest }
      ) => {
        const existing = (nonDefaultDayList ?? []).find(
          ({ startTime }) => this.cppDate.format(startTime) === this.cppDate.format(hearingDate)
        );
        if (!!existing) {
          return [
            ...nonDefaultDayList.filter(ndd => ndd !== existing),
            {
              ...existing,
              courtCentreId,
              roomId: courtRoomId,
              courtScheduleId: rest.courtScheduleId
            }
          ];
        }

        return [
          ...nonDefaultDayList,
          this.createFakeNonDefaultDay({
            startTime: this.cppDate.format(rest.startTime, this.cppDate.HOURS_MINUTES_24H),
            startDate: hearingDate,
            courtRoomId,
            courtCentreId,
            courtScheduleId: rest.courtScheduleId,
            duration: rest.durationMinutes
          })
        ];
      },
      nonDefaultDays
    );
  }

  private getEndDate(
    newStartDate: string,
    { allocated, estimatedMinutes, endDate, hearingDayCount, startDate }: Partial<Hearing>
  ) {
    if (!allocated) {
      return this.computeEndDate(newStartDate, estimatedMinutes);
    }
    if (startDate === newStartDate) {
      return endDate;
    }

    if (hearingDayCount <= 1) {
      return newStartDate;
    }

    const newEndDate = this.cppDate.add(new Date(newStartDate), hearingDayCount - 1, 'days');
    return this.cppDate.format(newEndDate);
  }

  private computeEndDate(startDate: string, estimatedMinutes: number) {
    const days = Math.ceil(estimatedMinutes / 360);
    if (days === 1) {
      return startDate;
    }
    const endDate = this.cppDate.add(new Date(startDate), days - 1, 'days');
    return this.cppDate.format(endDate);
  }

  private computeVirtualNonDefaultDayForUpdate(
    dateRange: { startDate: string; endDate: string },
    jurisdictionType: string,
    startTime: string,
    duration: number,
    courtCentreId: string,
    courtRoomId: string,
    courtCentre: CourtCentre,
    courtScheduleId?: string,
    courtSession?: string
  ): NonDefaultDay[] {
    if (dateRange.startDate !== dateRange.endDate && jurisdictionType === 'MAGISTRATES') {
      return [];
    }
    return [
      this.createFakeNonDefaultDay({
        startTime,
        duration,
        courtCentreId,
        courtRoomId,
        courtScheduleId,
        startDate: dateRange.startDate,
        oucode: jurisdictionType === 'MAGISTRATES' ? courtCentre.oucode : undefined,
        session: courtSession
      })
    ];
  }

  /**
   * Generates a fake JSON NonDefaultDay object for backend as this is needed for single hearings to calculate duration in minutes from HH:mm.
   * This Nondefault day Includes start time in UTC ISO, courtCentreId, and roomId.
   */
  private createFakeNonDefaultDay(data: NonDefaultDayData): NonDefaultDay {
    const startTime = this.cppDate.localDate(`${data.startDate} ${data.startTime}`);
    return {
      startTime: this.cppDate.toUtcISO(startTime),
      courtCentreId: data.courtCentreId,
      roomId: data.courtRoomId,
      duration: data.duration,
      courtScheduleId: data.courtScheduleId,
      oucode: data.oucode,
      session: data.session,
      virtual: true
    };
  }

  private computeNonDefaultDays(
    {
      allocated,
      startDate,
      nonDefaultDays,
      estimatedMinutes,
      hearingDays,
      hearingDayCount
    }: Partial<Hearing>,
    newStartDate: string,
    hearingDateTime: string,
    courtCentreId: string,
    courtRoomId: string,
    courtScheduleId?: string,
    courtCentreOuCode?: string,
    courtSession?: string
  ) {
    let oucode = undefined;
    let session = undefined;
    let duration = hearingDays[0].durationMinutes;

    if (!allocated) {
      duration = estimatedMinutes;
    }
    if (allocated && hearingDayCount > 1) {
      duration = hearingDayCount * 360;
    }
    if (courtScheduleId) {
      oucode = courtCentreOuCode;
      session = courtSession;
    }
    const virtualNonDefaultDay = [
      this.createFakeNonDefaultDay({
        startTime: this.cppDate.format(hearingDateTime, this.cppDate.HOURS_MINUTES_24H),
        duration,
        courtCentreId,
        courtRoomId,
        startDate: newStartDate,
        courtScheduleId,
        oucode,
        session
      })
    ];

    if (allocated && startDate === newStartDate && (nonDefaultDays ?? []).length > 0) {
      return [
        ...virtualNonDefaultDay,
        ...nonDefaultDays.map(ndf => ({
          ...ndf,
          roomId: courtRoomId,
          courtCentreId
        }))
      ];
    }
    return virtualNonDefaultDay;
  }

  private computeNonSittingDays(hearing: Partial<Hearing>, newStartDate: string) {
    if (hearing.allocated && hearing.startDate === newStartDate) {
      return hearing.nonSittingDays;
    }

    return [];
  }
}
