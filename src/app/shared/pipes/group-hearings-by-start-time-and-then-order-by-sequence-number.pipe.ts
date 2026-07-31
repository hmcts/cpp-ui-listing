import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
import { Hearing, HearingsGroupedByStartTime } from '../../core';

@Pipe({ name: 'groupHearingsByStartTimeAndThenOrderBySequenceNumber' })
export class GroupHearingsByStartTimeAndThenOrderBySequenceNumberPipe implements PipeTransform {
  timeFormat = 'HH:mm';

  transform(
    hearings: Hearing[],
    selectedDate: string,
    weekCommencing = false
  ): HearingsGroupedByStartTime {
    const hearingsGroupedByStartTime = this.groupHearingsByStartTime(
      hearings,
      selectedDate,
      weekCommencing
    );

    return this.orderBySequenceNumber(hearingsGroupedByStartTime, selectedDate, weekCommencing);
  }

  private groupHearingsByStartTime(
    hearings: Hearing[],
    selectedDate: string,
    weekCommencing: boolean
  ): HearingsGroupedByStartTime {
    return hearings.reduce((hearingsGroupedByTime: HearingsGroupedByStartTime, hearing) => {
      const matchingHearingDay = this.getHearingDayMatchingSelectedDate(
        hearing,
        selectedDate,
        weekCommencing
      );
      if (matchingHearingDay) {
        const startTime = moment(matchingHearingDay.startTime).format(this.timeFormat);
        return {
          ...hearingsGroupedByTime,
          [startTime]: [...(hearingsGroupedByTime[startTime] || []), hearing]
        };
      }
      return hearingsGroupedByTime;
    }, {});
  }

  private orderBySequenceNumber(
    hearingsGroupedByStartTime: HearingsGroupedByStartTime,
    selectedDate: string,
    weekCommencing: boolean
  ): HearingsGroupedByStartTime {
    Object.entries(hearingsGroupedByStartTime).forEach(([startTime, hearings]) => {
      hearings = hearings.sort((h1, h2) => {
        const h1Day = this.getHearingDayMatchingSelectedDate(h1, selectedDate, weekCommencing);
        const h2Day = this.getHearingDayMatchingSelectedDate(h2, selectedDate, weekCommencing);
        return h1Day.sequence < h2Day.sequence ? -1 : h1Day.sequence > h2Day.sequence ? 1 : 0;
      });
    });

    return hearingsGroupedByStartTime;
  }

  private getHearingDayMatchingSelectedDate(
    hearing: Hearing,
    selectedDate: string,
    weekCommencing: boolean
  ) {
    return weekCommencing
      ? hearing.hearingDays[0]
      : hearing.hearingDays.find((day) => day.hearingDate === selectedDate);
  }
}
