import { Pipe, PipeTransform } from '@angular/core';
import { Hearing, Defendant } from '../../core/';
import { first, sortBy, map, flatten } from 'lodash-es';
import moment from 'moment';

@Pipe({ name: 'sortHearingsByStartDateThenFirstDefendantNamePipe' })
export class SortHearingsByStartDateThenFirstDefendantNamePipe implements PipeTransform {
  transform(hearings: Hearing[], selectedDate) {
    // startime not available yet, so at the moment sorting by date, which is useless
    return [...hearings].sort((h1, h2) => {
      const dateSort = selectedDate
        ? this.getHearingTime(h2, selectedDate) - this.getHearingTime(h1, selectedDate)
        : null;
      return dateSort !== 0 ? dateSort : this.sortByFirstDefendantAlphabetically(h1, h2);
    });
  }

  private sortByFirstDefendantAlphabetically(hearingOne: Hearing, hearingTwo: Hearing): number {
    const h1Defendant = this.findFirstDefendant(flatten(map(hearingOne.listedCases, 'defendants')));
    const h2Defendant = this.findFirstDefendant(flatten(map(hearingTwo.listedCases, 'defendants')));

    const lastNameSort = this.sortValue(h1Defendant, h2Defendant);
    return lastNameSort !== 0 ? lastNameSort : this.sortValue(h1Defendant, h2Defendant);
  }

  private findFirstDefendant(defendants: Defendant[]) {
    return first(sortBy(defendants, ['organisationName', 'firstName']));
  }

  private sortValue(defA: Defendant, defB: Defendant): number {
    const valA = defA.organisationName || defA.lastName;
    const valB = defB.organisationName || defB.lastName;
    return valA < valB ? -1 : valA > valB ? 1 : 0;
  }

  private getHearingTime(hearing: Hearing, selectedDate): number {
    return new Date(
      hearing.hearingDays.find((calendarDay) =>
        moment(calendarDay.startTime).isSame(selectedDate, 'day')
      ).startTime
    ).getTime();
  }
}
