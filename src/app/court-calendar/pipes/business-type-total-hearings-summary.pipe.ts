import { Pipe, PipeTransform } from '@angular/core';
import { CourtRoomBusinessTypeCalendar, CourtRoomSessionCalendar } from '../model';
import { getAllHearingCalendars } from '../utils/court-calendar-hearings-helper';
import { TotalHearingAndDurationTextPipe } from './total-hearings-and-duration-text.pipe';

@Pipe({
  name: 'businessTypeTotalHearingsSummary'
})
export class BusinessTypeTotalHearingsSummaryPipe implements PipeTransform {
  private readonly totalHearingsAndDurationText = new TotalHearingAndDurationTextPipe();
  transform(calendar: CourtRoomBusinessTypeCalendar | CourtRoomSessionCalendar): string {
    const judiciaryCalendars =
      'sessions' in calendar
        ? calendar.sessions.flatMap(session => session.judiciaryCalendar)
        : calendar.judiciaryCalendar;
    const hearingCalendars = getAllHearingCalendars(judiciaryCalendars ?? []);
    return this.totalHearingsAndDurationText.transform(hearingCalendars);
  }
}
