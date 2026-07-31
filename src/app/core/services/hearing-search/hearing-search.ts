import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { forOwn, groupBy, reduce, toArray } from 'lodash-es';
import baseMoment from 'moment';
import { DateRange, extendMoment } from 'moment-range';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SequenceHearingAction } from '../../actions';
import {
  Hearing,
  HearingDay,
  PaginatedHearingResponse,
  SelectedFilterOptions,
  SequenceDay,
  SequenceHearing
} from '../../model';
import { AppState } from '../../reducers';
import { getCourtCentres } from '../../selectors';
import { getMomentValue } from '../../util';
import { ListingService } from '../listing/listing.service';
import { ListingNote } from '@cpp/scheduling';

interface MapOfSequenceDaysByHearingId {
  [id: string]: SequenceDay[];
}

export interface HearingsGroupedByStartTime {
  [hearingDate: string]: Hearing[];
}
// we cast as any because there is a problem with Es6 moment range
// see https://github.com/rotaready/moment-range/issues/263 for more details
const moment = extendMoment(baseMoment as any);

@Injectable()
export class HearingSearchService {
  courtCentre$: Observable<
    {
      id: string;
      name: string;
      courtCode: string;
      defaultStartTime: string;
      defaultDuration: string;
      courtRooms: {
        id: string;
        name: string;
      }[];
    }[]
  >;
  constructor(private listing: ListingService, private store: Store<AppState>) {
    this.courtCentre$ = this.store.select(getCourtCentres);
  }

  searchHearingsWithTimeRange(
    options: SelectedFilterOptions
  ): Observable<{ hearings: Hearing[]; notes: ListingNote[] }> {
    return combineLatest([
      this.listing.searchHearingsWithTimeRange(options),
      this.courtCentre$
    ]).pipe(
      map(([{ hearings, notes }, courtCentres]) => {
        const { defaultStartTime } = courtCentres.find(
          (courtCentre) => courtCentre.id === options.courtCentreId
        );

        const sequencedHearings = this.updateHearingSequences(
          hearings,
          [getMomentValue(options.searchDate)],
          defaultStartTime
        );

        return { hearings: sequencedHearings, notes };
      })
    );
  }

  getAllocatedHearings(options: SelectedFilterOptions): Observable<PaginatedHearingResponse> {
    let range: DateRange;

    if (options.weekCommencingStartDate && options.isCrownCourt) {
      range = moment.range(
        getMomentValue(options.weekCommencingStartDate),
        getMomentValue(options.weekCommencingEndDate)
      );
    } else {
      range = moment.range(getMomentValue(options.startDate), getMomentValue(options.endDate));
    }

    return combineLatest([this.listing.getAllocatedHearings(options), this.courtCentre$]).pipe(
      map(([paginatedHearing, courtCentres]) => {
        const { defaultStartTime } = courtCentres.find(
          (courtCentre) => courtCentre.id === options.courtCentreId
        );
        const { hearings } = paginatedHearing;

        const updatedHearings = this.updateHearingSequences(
          hearings,
          Array.from(range.by('day')),
          defaultStartTime
        );

        return { ...paginatedHearing, hearings: updatedHearings };
      })
    );
  }

  private updateHearingSequences(
    hearings: Hearing[],
    selectedDates: baseMoment.Moment[],
    defaultStartTime: string
  ): Hearing[] {
    if (hearings.length > 0) {
      const allHearings = JSON.parse(JSON.stringify(hearings));
      const hearingsByCourtRoomId = groupBy(hearings, (hearing) => hearing.courtRoomId);

      const allSequencedHearings = reduce(
        toArray(hearingsByCourtRoomId),
        (sequencedHearings: SequenceHearing[], hearings) => [
          ...sequencedHearings,
          ...this.sequencedHearings(hearings, selectedDates, defaultStartTime)
        ],
        []
      );

      const changedSequenceHearing = this.hearingsWithChangedSequence(
        allHearings,
        allSequencedHearings
      );
      if (changedSequenceHearing.length) {
        this.dispatchSequenceHearingAction(changedSequenceHearing);
      }
    }
    return hearings;
  }

  private hearingsWithChangedSequence(
    originalHearings: Hearing[],
    sequencedHearings: SequenceHearing[]
  ) {
    return sequencedHearings.filter((seqHearing) => {
      const originalHearing = originalHearings.find(({ id }) => id === seqHearing.id);
      return seqHearing.sequenceHearingDays.some(
        (seqHearingDay) =>
          seqHearingDay.sequence !==
          originalHearing.hearingDays.find(
            (originalHearingDay) => originalHearingDay.hearingDate === seqHearingDay.hearingDate
          ).sequence
      );
    });
  }

  private sequencedHearings(
    hearings: Hearing[],
    selectedDates: baseMoment.Moment[],
    defaultStartTime: string
  ): SequenceHearing[] {
    const hearingsGroupedByDateAndStartTime: HearingsGroupedByStartTime[] =
      this.groupHearingsByDateAndStartTime(hearings, selectedDates, defaultStartTime);
    this.sequenceGroupedHearingDays(hearingsGroupedByDateAndStartTime);

    const mapOfSequencedDays: MapOfSequenceDaysByHearingId = this.getMapOfSequenceDays(
      hearingsGroupedByDateAndStartTime
    );

    return this.convertMapToSequencedHearingsArray(mapOfSequencedDays);
  }

  private groupHearingsByDateAndStartTime(
    hearings: Hearing[],
    selectedDates: baseMoment.Moment[],
    defaultStartTime: string
  ): HearingsGroupedByStartTime[] {
    return selectedDates.map((hearingDate) =>
      this.groupHearingsByStartTime(hearings, hearingDate.format('YYYY-MM-DD'), defaultStartTime)
    );
  }

  private sequenceGroupedHearingDays(
    hearingsGroupedByDateAndStartTime: HearingsGroupedByStartTime[]
  ): void {
    hearingsGroupedByDateAndStartTime.forEach((hearingsGroupedByStartTime) =>
      this.sequenceHearingDays(hearingsGroupedByStartTime)
    );
  }

  private getMapOfSequenceDays(
    hearingsGroupedByDateAndStartTime: HearingsGroupedByStartTime[]
  ): MapOfSequenceDaysByHearingId {
    return hearingsGroupedByDateAndStartTime.reduce(
      (mapsOfAllHearings: MapOfSequenceDaysByHearingId, hearingsGroupedByStartTime) => {
        const sequencedHearings: SequenceHearing[] = this.mapToSequenceHearings(
          hearingsGroupedByStartTime
        );
        sequencedHearings.forEach((sequencedHearing) => {
          mapsOfAllHearings = {
            ...mapsOfAllHearings,
            [sequencedHearing.id]: [
              ...(mapsOfAllHearings[sequencedHearing.id] || []),
              ...sequencedHearing.sequenceHearingDays
            ]
          };
        });
        return mapsOfAllHearings;
      },
      {}
    );
  }

  private convertMapToSequencedHearingsArray(
    mapOfSequncedHearings: MapOfSequenceDaysByHearingId
  ): SequenceHearing[] {
    let allSequencedHearings: SequenceHearing[] = [];
    forOwn(mapOfSequncedHearings, (sequenceDays, hearingId) => {
      const newSequenceHearing: SequenceHearing = {
        id: hearingId,
        sequenceHearingDays: sequenceDays
      };
      allSequencedHearings = [...allSequencedHearings, newSequenceHearing];
    });

    return allSequencedHearings;
  }

  private dispatchSequenceHearingAction(hearings: SequenceHearing[]): void {
    if (hearings.length) {
      this.store.dispatch(
        new SequenceHearingAction({
          hearings: hearings
        })
      );
    }
  }

  private sequenceHearingDays(hearingsGroupedByStartTime: HearingsGroupedByStartTime): void {
    forOwn(hearingsGroupedByStartTime, (hearingsForStartTime, startTime) => {
      const sequencedHearings: HearingDay[] = hearingsForStartTime.map((hearing) => {
        return hearing.hearingDays.find(
          (hearingDay) =>
            getMomentValue(hearingDay.startTime).format('YYYY-DD-MMTHH:mm') === startTime
        );
      });
      this.resequenceHearings(sequencedHearings);
    });
  }

  private mapToSequenceHearings(
    hearingsGroupedByStartTime: HearingsGroupedByStartTime
  ): SequenceHearing[] {
    let allSequencedHearings: SequenceHearing[] = [];
    forOwn(hearingsGroupedByStartTime, (hearingsForStartTime, startTime) => {
      const sequencedHearings: SequenceHearing[] = hearingsForStartTime.map((hearing) => {
        const foundHearingDay = hearing.hearingDays.find(
          (hearingDay) =>
            getMomentValue(hearingDay.startTime).format('YYYY-DD-MMTHH:mm') === startTime
        );
        const sequencedDay: SequenceDay = {
          hearingDate: foundHearingDay.hearingDate,
          sequence: foundHearingDay.sequence
        };
        return {
          id: hearing.id,
          sequenceHearingDays: [sequencedDay]
        };
      });
      allSequencedHearings = [...allSequencedHearings, ...sequencedHearings];
    });

    return allSequencedHearings;
  }

  resequenceHearings(sequencedHearings: HearingDay[]) {
    const nextSequenceNumber = Math.max(...sequencedHearings.map((s) => s.sequence)) + 1;
    const nonZeroSequences = sequencedHearings
      .filter((s) => s.sequence !== 0)
      .sort((h1, h2) => h1.sequence - h2.sequence);
    const zeroSequences = sequencedHearings
      .filter((s) => s.sequence === 0)
      .map((sequencedHearing, index) => {
        sequencedHearing.sequence = index + nextSequenceNumber;
        return sequencedHearing;
      });
    return [...nonZeroSequences, ...zeroSequences];
  }

  private groupHearingsByStartTime(
    hearings: Hearing[],
    selectedDate: string,
    defaultStartTime: string
  ): HearingsGroupedByStartTime {
    return hearings.reduce((hearingsGroupedByTime: HearingsGroupedByStartTime, hearing) => {
      const defaultDateStartTime = selectedDate + 'T' + defaultStartTime;
      const hearingDates = hearing.hearingDays.map((hearingDay) => hearingDay.hearingDate);
      if (hearingDates.findIndex((hearingDate) => hearingDate === selectedDate) >= 0) {
        const startTimeIndex = hearingDates.indexOf(selectedDate);
        const startTime =
          startTimeIndex >= 0
            ? getMomentValue(hearing.hearingDays[startTimeIndex].startTime).format(
                'YYYY-DD-MMTHH:mm'
              )
            : defaultDateStartTime;
        return {
          ...hearingsGroupedByTime,
          [startTime]: [...(hearingsGroupedByTime[startTime] || []), hearing]
        };
      } else {
        return hearingsGroupedByTime;
      }
    }, {});
  }
}
