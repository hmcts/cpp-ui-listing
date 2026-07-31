import { Component, OnChanges, SimpleChanges, input, output } from '@angular/core';
import { Hearing, HearingsGroupedByStartTime, SequenceHearing } from '../../core/model';
import { GroupHearingsByStartTimeAndThenOrderBySequenceNumberPipe } from '../../shared/pipes';
import moment from 'moment';
import { keys, forOwn } from 'lodash-es';
import { UpdateSequenceEvent, SequenceGroupComponent } from './sequence-group.component';
import { SequenceDay, ExtendedJudicialRole } from '../../core/model/hearing';
import { CourtRestriction } from '../../core/model/court-restriction';
import { HearingType } from '@cpp/reference-data';

import {
  PdkLinkDirective,
  PdkButtonComponent,
  PdkButtonDirective,
  PdkMarginDirective,
  PdkTypographyDirective,
  PdkTextColorDirective
} from '@cpp/pdk';
import { HearingsPerJudiciaryComponent } from '../../shared/components/hearings-per-judiciary/hearings-per-judiciary.component';
import { JudiciaryMemberNamesPipe } from '../../shared/pipes/judiciary-member-names.pipe';

@Component({
  selector: 'sequence-hearings',
  styleUrls: ['./sequence-hearings.scss'],
  templateUrl: './sequence-hearings.html',
  imports: [
    PdkLinkDirective,
    HearingsPerJudiciaryComponent,
    PdkButtonComponent,
    PdkButtonDirective,
    PdkMarginDirective,
    PdkTypographyDirective,
    PdkTextColorDirective,
    SequenceGroupComponent,
    JudiciaryMemberNamesPipe
  ],
  providers: [GroupHearingsByStartTimeAndThenOrderBySequenceNumberPipe]
})
export class SequenceHearingsComponent implements OnChanges {
  readonly hearings = input<Hearing[]>(undefined);
  readonly judiciary = input<ExtendedJudicialRole[]>(undefined);
  readonly timeFormat = input('HH:mm');
  readonly selectedDate = input<string>(undefined);
  readonly defaultStartTime = input('10:30');
  readonly restrictLists = input<boolean>(undefined);
  readonly reorderLists = input<boolean>(undefined);
  readonly hearingTypes = input<HearingType[]>(undefined);
  readonly save = output<SequenceHearing[]>();
  readonly courtRestrictionCheckEvent = output<CourtRestriction>();
  readonly restrictedCourtHearingSelected = input<Hearing>(undefined);
  readonly weekCommencingSelected = input<boolean>(undefined);

  hearingsGroupedByStartTime: HearingsGroupedByStartTime = {};
  showReorder: boolean;
  updated: boolean;
  sequenceHearings: HearingsGroupedByStartTime;

  constructor(
    private groupHearingsByStartTimeThenOrderBySequenceNumber: GroupHearingsByStartTimeAndThenOrderBySequenceNumberPipe
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hearings || changes.selectedDate) {
      this.hearingsGroupedByStartTime = this.groupHearingsByStartTimeThenOrderBySequence();
      this.showReorder = this.checkIfShowReorder(this.hearingsGroupedByStartTime);
    }
  }
  get showReorderLink() {
    return (
      this.reorderLists() &&
      this.showReorder &&
      !this.weekCommencingSelected() &&
      !this.hearings().some((h) => h.allocated === false)
    );
  }

  startClicked() {
    this.updated = false;
    this.sequenceHearings = {};
  }

  cancelClicked() {
    this.sequenceHearings = null;
  }

  saveClicked() {
    const sequencedHearings: SequenceHearing[] = this.groupedHearingsToSequences(
      this.sequenceHearings,
      this.selectedDate()
    );
    this.save.emit(sequencedHearings);
    this.sequenceHearings = null;
  }

  sequenceUpdated(event: UpdateSequenceEvent) {
    this.updated = true;
    this.sequenceHearings[event.name] = event.hearings;
  }

  // TODO : took this from 'hearing-search.ts' (but it's edited to update the sequence from the index).
  private groupedHearingsToSequences = (
    hearingsGroupedByStartTime: HearingsGroupedByStartTime,
    selectedDate: string
  ): SequenceHearing[] => {
    let allSequencedHearings: SequenceHearing[] = [];
    forOwn(hearingsGroupedByStartTime, (hearingsForStartTime, startTime) => {
      const sequencedHearings: SequenceHearing[] = hearingsForStartTime.map((hearing, index) => {
        const foundHearingDay = hearing.hearingDays.find((hearingDay) =>
          moment(hearingDay.startTime).isSame(selectedDate, 'day')
        );
        const sequencedDay: SequenceDay = {
          hearingDate: foundHearingDay.hearingDate,
          sequence: index + 1
        };
        return {
          id: hearing.id,
          sequenceHearingDays: [sequencedDay]
        };
      });
      allSequencedHearings = [...allSequencedHearings, ...sequencedHearings];
    });

    return allSequencedHearings;
  };

  private groupHearingsByStartTimeThenOrderBySequence(): HearingsGroupedByStartTime {
    return this.groupHearingsByStartTimeThenOrderBySequenceNumber.transform(
      this.hearings(),
      this.selectedDate()
    );
  }

  // todo : move to pipe as shared......
  getKeysSortedByStartTime(hearingsGroupedByStartTime: HearingsGroupedByStartTime): string[] {
    const startTimes = keys(hearingsGroupedByStartTime);
    // because we want to sort by time, we add the time to any given date and we sort them by date
    return startTimes.sort((a, b) => moment('1970-01-01 ' + a).diff('1970-01-01 ' + b));
  }

  // todo : this could be a 'hasMultipleKeys' pipe?
  checkIfShowReorder(hearingsGroupedByStartTime: HearingsGroupedByStartTime): boolean {
    return Object.keys(hearingsGroupedByStartTime).some(
      (key) => hearingsGroupedByStartTime[key].length > 1
    );
  }

  restrictionChanged(courtRestriction: CourtRestriction) {
    this.courtRestrictionCheckEvent.emit(courtRestriction);
  }
}
