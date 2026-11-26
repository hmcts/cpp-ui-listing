import { Component, inject } from '@angular/core';
import { ValidationError, PdkErrorSummaryComponent, PdkCore, PdkGrid } from '@cpp/pdk';
import { ChangeCourtroomStore } from '../../component-store/change-courtroom.store';
import { CourtRoomNamePipe } from '../../../../shared/pipes/court-room-name.pipe';
import { CourtroomChangeConfirmationFormComponent } from '../../components/courtroom-change-confirmation-form/courtroom-change-confirmation-form.component';
import { BackButtonComponent } from '../../../../shared/components/back-button/back-button.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../core';
import { setSelectedHearingData } from '../../../state/actions/court-calendar.actions';
import { getSelectedHearing } from '../../../state/selectors/court-calendar.selectors';

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
    CourtRoomNamePipe,
    CourtroomChangeConfirmationFormComponent,
    BackButtonComponent,
    PdkErrorSummaryComponent
  ]
})
export class AllFutureHearingDaysSelectedConfirmContainer {
  errors: ValidationError[] | null = null;
  readonly changeCourtroomStore = inject(ChangeCourtroomStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly ngrxStore = inject(Store<AppState>);
  private readonly selectedHearing = this.ngrxStore.selectSignal(getSelectedHearing);

  onValidationError(errors: ValidationError[]) {
    this.errors = errors;
  }

  handleFormSubmission({ changeCourtRoom }: { changeCourtRoom: boolean }): void {
    if (changeCourtRoom) {
      const selectedHearing = this.selectedHearing();
      this.changeCourtroomStore.confirmChange({
        selectedHearing,
        onSuccess: () => {
          this.ngrxStore.dispatch(setSelectedHearingData({ selectedHearing: null }));
          this.router.navigate([
            '/court-calendar/change-courtroom',
            selectedHearing.id,
            'success-banner'
          ]);
        }
      });
    } else {
      this.changeCourtroomStore.setSelectedHearingDays([]);
      this.router.navigate(['../all-hearing-days'], { relativeTo: this.route });
    }
  }

  clearSelection() {
    this.changeCourtroomStore.setSelectedHearingDays([]);
  }
}
