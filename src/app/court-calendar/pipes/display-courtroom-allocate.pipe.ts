import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { uniq } from 'lodash-es';
import { CourtRoomJudicialCalendar } from '../model';
import { getAllHearingCalendars } from '../utils/court-calendar-hearings-helper';
import { SelectedHearingState } from '../court-calendar-hearing-tables/component-store/hearing-table-actions.store';

@Pipe({ name: 'displayCourtRoomAllocate' })
export class DisplayCourtRoomAllocatePipe implements PipeTransform {
  datePipe = new DatePipe('en-GB');
  transform(
    selectedHearings: SelectedHearingState[],
    judicialCalendar: CourtRoomJudicialCalendar[]
  ): boolean {
    if (selectedHearings.length === 0) {
      return false;
    }
    const hearingTimeGroups = getAllHearingCalendars(judicialCalendar);
    const grouptimes = uniq(
      hearingTimeGroups.map(({ time }) => this.datePipe.transform(time, 'HH:mm'))
    );
    const selectedHearingsTimes = uniq(
      selectedHearings.map(({ hearingDateTime }) =>
        this.datePipe.transform(hearingDateTime, 'HH:mm')
      )
    );

    return (
      selectedHearingsTimes.some((hearingTime) => !grouptimes.includes(hearingTime)) ||
      grouptimes.filter((time) => selectedHearingsTimes.includes(time)).length > 1
    );
  }
}
