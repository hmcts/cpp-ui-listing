import { DatePipe } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { CourtRoomSessionCalendar } from '../model';
import { SelectedHearingState } from '../court-calendar-hearing-tables/component-store/hearing-table-actions.store';
import { uniq } from 'lodash-es';
import { CPPDate } from '../../core/util';

@Pipe({ name: 'displayBusinessTypeAllocate' })
export class DisplayBusinessTypeAllocatePipe implements PipeTransform {
  datePipe = new DatePipe('en-GB');
  ccpDateUtil = inject(CPPDate);

  transform(
    selectedHearings: SelectedHearingState[] | undefined,
    slot: CourtRoomSessionCalendar['slot'],
    eligibleScheduleIds?: string[] | null
  ): boolean {
    if (selectedHearings.length === 0 || !slot) {
      return false;
    }
    const { session } = slot;
    const sessionStartTime = this.datePipe.transform(session?.startTime, 'HH:mm a');
    const sessionEndTime = this.datePipe.transform(session?.endTime, 'HH:mm a');
    const selectedHearingsTimes = uniq(
      selectedHearings.map(({ hearingDateTime }) =>
        this.datePipe.transform(hearingDateTime, 'HH:mm a')
      )
    );
    const timeCheck = selectedHearingsTimes.every(
      time =>
        this.ccpDateUtil.isSameOrAfter(time, sessionStartTime, 'HH:mm A') &&
        this.ccpDateUtil.isSameOrBefore(time, sessionEndTime, 'HH:mm A')
    );
    if (eligibleScheduleIds === undefined) {
      return false;
    }
    if (eligibleScheduleIds === null) {
      return timeCheck;
    }
    return timeCheck && eligibleScheduleIds.includes(slot.courtScheduleId);
  }
}
