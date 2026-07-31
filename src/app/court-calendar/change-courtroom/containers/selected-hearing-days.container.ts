import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { ValidationError, PdkErrorSummaryComponent, PdkCore } from '@cpp/pdk';
import { SelectedHearingDaysComponent } from '../components/selected-hearing-days/selected-hearing-days.component';
import { ChangeCourtroomStore } from '../component-store/change-courtroom.store';
import { HearingDetailsSectionComponent } from '../components/hearing-details-section/hearing-details-section.component';
import { AppConfigService } from '../../../config';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../core';
import { setSelectedHearingData } from '../../state/actions/court-calendar.actions';
import { getSelectedHearing } from '../../state/selectors/court-calendar.selectors';

@Component({
  selector: 'select-hearing-days-container',
  template: `
    <back-button [linkUrl]="'../'"></back-button>
    @if (errors) {
      <pdk-error-summary focusOnChange="true" [errors]="errors"> </pdk-error-summary>
    }
    <h1 pdk-typography="heading-large" pdk-margin-bottom="3" pdk-margin-top="2">
      Check courtroom change for selected hearing days
    </h1>
    @if (changeCourtroomStore.hearingVM(); as hearingVM) {
      <hearing-details-section
        [hearingVM]="hearingVM"
        [baseUrl]="appConfig.getBaseUrl()"
      ></hearing-details-section>
      <selected-hearing-days
        [selectedHearingDays]="changeCourtroomStore.selectedHearingDays()"
        [courtRoomOptions]="changeCourtroomStore.courtRooms()"
        [hearingVM]="hearingVM"
        (onValidationError)="showValidationError($event)"
        (onSubmitForm)="handleSubmit($event)"
      >
      </selected-hearing-days>
    }
  `,
  imports: [
    SelectedHearingDaysComponent,
    HearingDetailsSectionComponent,
    BackButtonComponent,
    PdkErrorSummaryComponent,
    PdkCore
  ]
})
export class SelectedHearingDaysContainer {
  errors: ValidationError[] | null = null;
  readonly changeCourtroomStore = inject(ChangeCourtroomStore);
  readonly appConfig = inject(AppConfigService);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly ngrxStore = inject(Store<AppState>);
  private readonly selectedHearing = this.ngrxStore.selectSignal(getSelectedHearing);

  showValidationError(errors: ValidationError[]) {
    this.errors = errors;
  }

  handleSubmit({ changeCourtRoomConfirmation }: { changeCourtRoomConfirmation: boolean }) {
    if (changeCourtRoomConfirmation) {
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
      this.location.back();
    }
  }
}
