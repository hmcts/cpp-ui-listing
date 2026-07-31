import { Component, inject, OnInit, output } from '@angular/core';
import {
  SelectOption,
  ValidationError,
  PdkErrorSummaryComponent,
  PdkCore,
  PdkGrid
} from '@cpp/pdk';
import { ChangeCourtroomStateService } from '../../component-store/change-courtroom-state.service';
import {
  ChangeCourtroomVM,
  ConfirmCourtRoomChange,
  ConfirmCourtRoomChangeEvent
} from '../../../model';
import { Observable } from 'rxjs';
import { HearingDay } from '../../../../core';
import { AsyncPipe } from '@angular/common';
import { CourtRoomNamePipe } from '../../../../shared/pipes/court-room-name.pipe';
import { CourtroomChangeConfirmationFormComponent } from '../../components/courtroom-change-confirmation-form/courtroom-change-confirmation-form.component';
import { BackButtonComponent } from '../../../../shared/components/back-button/back-button.component';

@Component({
  selector: 'all-upcoming-hearingdays-selected-confirm',
  templateUrl: './all-upcoming-hearingdays-selected-confirm.container.html',
  styles: [
    `
      dl > div {
        border-bottom: 1px solid;
      }
    `
  ],
  imports: [
    PdkCore,
    PdkGrid,
    AsyncPipe,
    CourtRoomNamePipe,
    CourtroomChangeConfirmationFormComponent,
    BackButtonComponent,
    PdkErrorSummaryComponent
  ]
})
export class AllFutureHearingDaysSelectedConfirmContainer
  implements OnInit, ConfirmCourtRoomChange
{
  readonly onConfirmation = output<ConfirmCourtRoomChangeEvent>();
  errors: ValidationError[] = null;
  hearingVM$: Observable<ChangeCourtroomVM>;
  selectedHearingDays$: Observable<HearingDay[]>;
  courtRoomOptions$: Observable<SelectOption<string>[]>;
  selectedCourtroom$: Observable<string>;

  readonly onSubmitForm = output<{
    changeCourtRoomConfirmation: string;
  }>();

  changeCourtroomStateService = inject(ChangeCourtroomStateService);

  ngOnInit(): void {
    this.hearingVM$ = this.changeCourtroomStateService.hearingVM$;
    this.selectedHearingDays$ = this.changeCourtroomStateService.selectedHearingDays$;
    this.courtRoomOptions$ = this.changeCourtroomStateService.getCourtRooms;
    this.selectedCourtroom$ = this.changeCourtroomStateService.selectedCourtroom$;
  }

  onValidationError(errors: ValidationError[]) {
    this.errors = errors;
  }

  handleFormSubmission({ changeCourtRoom }: { changeCourtRoom: boolean }): void {
    this.onConfirmation.emit({ confirmed: changeCourtRoom, clearSelection: !changeCourtRoom });
  }

  clearSelection() {
    this.changeCourtroomStateService.setSelectedHearingDays([]);
  }
}
