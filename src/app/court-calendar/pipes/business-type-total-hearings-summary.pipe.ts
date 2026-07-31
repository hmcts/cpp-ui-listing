import { Pipe, PipeTransform } from '@angular/core';
import { CourtRoomBusinessTypeCalendar } from '../model';
import { getAllHearingCalendars } from '../utils/court-calendar-hearings-helper';
import { TotalHearingAndDurationTextPipe } from './total-hearings-and-duration-text.pipe';

@Pipe({
  name: 'businessTypeTotalHearingsSummary'
})
export class BusinessTypeTotalHearingsSummaryPipe implements PipeTransform {
  private readonly totalHearingsAndDurationText = new TotalHearingAndDurationTextPipe();
  transform(businessTypeCalendar: CourtRoomBusinessTypeCalendar): string {
    const hearingCalendars = getAllHearingCalendars(
      !!businessTypeCalendar ? [businessTypeCalendar] : []
    );
    const businessTypeHearingsdurationSummary =
      this.totalHearingsAndDurationText.transform(hearingCalendars);
    return businessTypeHearingsdurationSummary;
  }
}
