import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { SelectedHearingState } from '../court-calendar-hearing-tables/component-store/hearing-table-actions.store';

@Pipe({ name: 'displayAllocateForHearingTimeGroup' })
export class DisplayAllocateForHearingTimeGroupPipe implements PipeTransform {
  datePipe = new DatePipe('en-GB');
  transform(selectedHearings: SelectedHearingState[], groupTime: string): boolean {
    if (selectedHearings.length === 0) {
      return false;
    }
    const transformedGroupTime = this.datePipe.transform(groupTime, 'HH:mm');
    return selectedHearings.every(
      ({ hearingDateTime }) =>
        this.datePipe.transform(hearingDateTime, 'HH:mm') === transformedGroupTime
    );
  }
}
