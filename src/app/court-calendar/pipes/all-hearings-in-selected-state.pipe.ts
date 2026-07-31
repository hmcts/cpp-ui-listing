import { Pipe, PipeTransform } from '@angular/core';
import { HearingRowVM } from '../model';
import { SelectedHearingState } from '../court-calendar-hearing-tables/component-store/hearing-table-actions.store';

@Pipe({ name: 'allMasterHearingsInSelectedState' })
export class AllMasterHearingsInSelectedStatePipe implements PipeTransform {
  transform(hearingRows: HearingRowVM[], selectedHearings: SelectedHearingState[]): boolean {
    if (!hearingRows || hearingRows.length === 0) {
      return false;
    }
    const masterHearings = hearingRows.filter(({ isMaster }) => isMaster);
    return masterHearings.every(({ id, dateTime }) =>
      selectedHearings.some(
        ({ hearingId, hearingDateTime }) => hearingDateTime === dateTime && hearingId === id
      )
    );
  }
}
