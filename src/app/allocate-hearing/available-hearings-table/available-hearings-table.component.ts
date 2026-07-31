import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Hearing, Type, CourtCentre } from '../../core';
import { CapitalizeFirstLetterPipe } from '../../shared/pipes';
import { Location, NgPlural, NgPluralCase } from '@angular/common';
import {
  ValidationError,
  PdkInsetTextComponent,
  PdkTable,
  PdkRadio,
  PdkCore,
  PdkForm,
  PdkButton
} from '@cpp/pdk';
import { FormsModule } from '@angular/forms';
import { CaseMarkersComponent } from '../../shared/components/case-markers/case-markers.component';
import { ListingNoteContainerComponent } from '@cpp/scheduling';
import { FullNamePipe } from '../../shared/pipes/full-name.pipe';
import { CPPDatePipe } from '../../shared/pipes/cpp-date.pipe';
@Component({
  selector: 'available-hearings-table',
  templateUrl: './available-hearings-table.component.html',
  styleUrls: ['./available-hearings-table.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PdkRadio,
    FormsModule,
    PdkTable,
    PdkInsetTextComponent,
    NgPlural,
    NgPluralCase,
    PdkTable,
    PdkCore,
    CaseMarkersComponent,
    ListingNoteContainerComponent,
    PdkForm,
    PdkButton,
    FullNamePipe,
    CPPDatePipe
  ],
  providers: [CapitalizeFirstLetterPipe]
})
export class AvailableHearingsTableComponent {
  readonly hearings = input<Hearing[]>(undefined);
  readonly courtCentres = input<CourtCentre[]>(undefined);
  readonly onViewHearingDetails = output<Hearing>();
  readonly onExtendHearingForHearing = output<{
    selectedHearingId: string;
    sendNotificationToParties: boolean;
  }>();
  readonly errors = output<ValidationError[]>();

  get isContinueButtonDisabled(): boolean {
    return !this.selectedHearingId || this.sendNotificationToParties === undefined;
  }

  selectedHearingId: string;
  sendNotificationToParties = false;

  constructor(
    private capitalizeFirstLetter: CapitalizeFirstLetterPipe,
    private location: Location
  ) {}

  formatHearingType(hearingType: Type): string {
    return this.capitalizeFirstLetter.transform(hearingType.description);
  }

  getCourtCentreName(courtCentreId: string): string {
    return this.courtCentres().find((cc) => cc.id === courtCentreId).name;
  }

  getCourtRoomName(courtCentreId: string, courtRoomId: string): string {
    return courtRoomId
      ? this.courtCentres()
          .find((cc) => cc.id === courtCentreId)
          .courtRooms.find((cr) => cr.id === courtRoomId).name
      : null;
  }

  viewHearingDetails(hearing: Hearing): void {
    this.onViewHearingDetails.emit(hearing);
  }

  extendHearingForHearing(): void {
    this.onExtendHearingForHearing.emit({
      selectedHearingId: this.selectedHearingId,
      sendNotificationToParties: this.sendNotificationToParties
    });
  }

  cancel(): void {
    this.location.back();
  }
}
