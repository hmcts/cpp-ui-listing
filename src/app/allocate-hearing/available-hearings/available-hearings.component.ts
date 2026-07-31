import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CourtCentre, Hearing } from '../../core';
import { ValidationError, PdkInsetTextComponent } from '@cpp/pdk';

import { AvailableHearingsTableComponent } from '../available-hearings-table/available-hearings-table.component';

@Component({
  selector: 'available-hearings',
  templateUrl: './available-hearings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvailableHearingsTableComponent, PdkInsetTextComponent]
})
export class AvailableHearingsComponent {
  readonly hearings = input<Hearing[]>(undefined);
  readonly courtCentres = input<CourtCentre[]>(undefined);
  readonly isCivil = input<boolean>(false);

  readonly onViewHearingDetails = output<Hearing>();
  readonly onExtendHearingForHearing = output<{
    selectedHearingId: string;
    sendNotificationToParties: boolean;
  }>();
  readonly errors = output<ValidationError[]>();

  /**
   * Filters hearings based on civil/criminal case type.
   * - For civil cases: includes hearing if any listed case is civil
   * - For criminal cases: includes hearing only if all listed cases are criminal
   */
  get filteredHearings(): Hearing[] {
    const hearings = this.hearings();
    if (!hearings) {
      return [];
    }
    return hearings.filter(hearing => {
      if (!hearing?.listedCases || hearing.listedCases.length === 0) {
        return false;
      }
      if (this.isCivil()) {
        return hearing.listedCases.some(listedCase => listedCase.isCivil);
      } else {
        return hearing.listedCases.every(listedCase => !listedCase.isCivil);
      }
    });
  }

  get isHearingWithAvailableHearings(): boolean {
    return this.filteredHearings.length > 0;
  }

  get isHearingWithoutAvailableHearings(): boolean {
    const hearings = this.hearings();
    return !!hearings && this.filteredHearings.length === 0;
  }

  viewHearingDetails(hearing: Hearing): void {
    this.onViewHearingDetails.emit(hearing);
  }

  extendHearingForHearing({ selectedHearingId, sendNotificationToParties }): void {
    this.onExtendHearingForHearing.emit({
      selectedHearingId,
      sendNotificationToParties
    });
  }
}
