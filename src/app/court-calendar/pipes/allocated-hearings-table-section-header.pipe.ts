import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { CourtRoomCalendarVM } from '../model';
import { getAllHearingCalendars } from '../utils/court-calendar-hearings-helper';
import { TotalHearingAndDurationTextPipe } from './total-hearings-and-duration-text.pipe';

@Pipe({
  name: 'allocatedHearingTableSectionHeader'
})
export class AllocatedHearingsTableSectionHeaderPipe implements PipeTransform {
  totalHearingAndDurationTextPipe = new TotalHearingAndDurationTextPipe();
  transform(section: CourtRoomCalendarVM): { sectionName: string; totalDurationText: string } {
    return this.sectionHeaderResolver(section);
  }

  private sectionHeaderResolver = (section: CourtRoomCalendarVM) => {
    const { courtRoomName, date, judiciaryCalendar } = section;
    const formattedDate = new DatePipe('en-GB').transform(date, 'dd MMMM yyyy');
    const allHearingCalendars = getAllHearingCalendars(judiciaryCalendar);
    return {
      sectionName: `${formattedDate}: ${courtRoomName}`,
      totalDurationText: this.totalHearingAndDurationTextPipe.transform(allHearingCalendars)
    };
  };
}
