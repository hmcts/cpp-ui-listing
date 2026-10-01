import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnDestroy,
  input,
  output
} from '@angular/core';
import * as _ from 'lodash-es';
import moment from 'moment';
import {
  CourtApplication,
  CourtCentre,
  CourtRoom,
  Defendant,
  Hearing,
  ListedCase
} from '../../../core';
import { LastAllocatedHearing } from './../../../core/model/last-allocated-hearing';
import { HearingSlotAllocation } from '@cpp/scheduling';
import { NgPlural, NgPluralCase, DatePipe } from '@angular/common';
import { PdkContextPanelComponent, PdkMarginDirective } from '@cpp/pdk';
import { DefendantsNameAlphabeticallyPipe } from '../../pipes/defendants-name-alphabetically.pipe';
import { ApplicantRespondentFullNamePipe } from '../../pipes/applicant-respondent-full-name.pipe';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.html',
  changeDetection: ChangeDetectionStrategy.Default,
  styles: [
    `
      .app-notification {
        margin-top: 17px;
      }
    `
  ],
  imports: [PdkContextPanelComponent, NgPlural, NgPluralCase, PdkMarginDirective, DatePipe]
})
export class AppNotificationComponent implements OnChanges, OnDestroy {
  readonly split = input<boolean>(undefined);
  readonly allocation = input<HearingSlotAllocation>(undefined);
  readonly courtCentres = input<CourtCentre[]>(undefined);
  readonly lastAllocatedHearing = input<LastAllocatedHearing>(undefined);

  readonly onDestroy = output<void>();

  defendants: Defendant[];
  displayNames: string;
  courtCentre: CourtCentre;
  courtRoom: CourtRoom;
  startTime: string;
  listedCases: string[];

  ngOnChanges(): void {
    const hearing = this.lastAllocatedHearing().hearing;
    this.defendants = this.getAllDefendants(hearing);
    this.displayNames = this.getDisplayNames(hearing);
    this.courtCentre = this.getCourtCentre(
      this.courtCentres(),
      this.lastAllocatedHearing().hearing.courtCentreId
    );
    this.courtRoom = this.getCourtRoom(
      this.courtCentre,
      this.lastAllocatedHearing().hearing.courtRoomId
    );
    this.listedCases = this.getAllListedCases(this.lastAllocatedHearing().hearing.listedCases);

    // as weekcommencing hearing has no startTime will get startTime from first nonDefaultDays
    const lastAllocatedHearing = this.lastAllocatedHearing();
    const startDateStartOfDay = !lastAllocatedHearing.hearing.weekCommencingStartDate
      ? moment(lastAllocatedHearing.hearing.startDate).startOf('day')
      : moment(lastAllocatedHearing.hearing.nonDefaultDays[0].startTime).startOf('day');
    this.startTime = this.lastAllocatedHearing().hearing.nonDefaultDays.reduce(
      (calculatedStartTime, ndd) => {
        const startOfDay = moment(ndd.startTime).startOf('day');
        return startOfDay.isSame(startDateStartOfDay)
          ? moment(ndd.startTime).format('HH:mm')
          : calculatedStartTime;
      },
      this.courtCentre.defaultStartTime
    );
  }

  ngOnDestroy() {
    this.onDestroy.emit();
  }

  private getAllDefendants(hearing: Hearing): Defendant[] {
    return _.flatten(_.map(hearing.listedCases, 'defendants'));
  }

  private getDisplayNames(hearing: Hearing): string {
    return this.defendants.length
      ? new DefendantsNameAlphabeticallyPipe().transform(this.defendants)
      : this.getSubjectName(hearing.courtApplications);
  }

  private getSubjectName(courtApplications: CourtApplication[]): string {
    const subject = courtApplications?.[0]?.subject;
    return subject ? new ApplicantRespondentFullNamePipe().transform(subject) : '';
  }

  private getCourtCentre(courtCentres: CourtCentre[], courtCentreId: string) {
    return courtCentres.find(cc => cc.id === courtCentreId);
  }

  private getCourtRoom(courtCentre: CourtCentre, courtRoomId: string) {
    return courtCentre.courtRooms.find(courtRoom => courtRoom.id === courtRoomId);
  }

  private getAllListedCases(listedCases: ListedCase[]): string[] {
    return _.flatten(_.map(listedCases, 'caseIdentifier.caseReference'));
  }
}
