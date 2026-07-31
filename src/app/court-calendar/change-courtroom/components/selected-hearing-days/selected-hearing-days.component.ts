import { Component, inject, input, output } from '@angular/core';
import { PdkCore, PdkGrid, SelectOption, ValidationError } from '@cpp/pdk';
import { Location } from '@angular/common';
import { HearingDaysTableComponent } from '../hearing-days-table/hearing-days-table.component';
import { ChangeCourtroomVM, HearingDayVM } from '../../../model';
import { CourtroomChangeConfirmationFormComponent } from '../courtroom-change-confirmation-form/courtroom-change-confirmation-form.component';
import { TotalNoOfSelectedHearingDays } from '../no-of-selected-hearingdays/no-of-selected-hearingdays.component';

@Component({
  selector: 'selected-hearing-days',
  templateUrl: './selected-hearing-days.component.html',
  imports: [
    PdkGrid,
    PdkCore,
    HearingDaysTableComponent,
    CourtroomChangeConfirmationFormComponent,
    TotalNoOfSelectedHearingDays
  ],
  styles: [
    `
      .future-hearingday-selected {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    `
  ]
})
export class SelectedHearingDaysComponent {
  readonly courtRoomOptions = input<SelectOption<string>[]>([]);
  readonly selectedHearingDays = input<HearingDayVM[]>([]);
  readonly hearingVM = input<ChangeCourtroomVM | null>(null);
  readonly onValidationError = output<ValidationError[]>();
  readonly onSubmitForm = output<{
    changeCourtRoomConfirmation: boolean;
  }>();

  location = inject(Location);

  change(): void {
    this.location.back();
  }

  handleConfirmationSubmit({ changeCourtRoom }: { changeCourtRoom: boolean }): void {
    this.onSubmitForm.emit({
      changeCourtRoomConfirmation: changeCourtRoom
    });
  }
}
