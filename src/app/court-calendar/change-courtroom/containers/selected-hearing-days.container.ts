import { Component, inject, output } from '@angular/core';
import { SelectOption, ValidationError, PdkErrorSummaryComponent, PdkCore } from '@cpp/pdk';
import { SelectedHearingDaysComponent } from '../components/selected-hearing-days/selected-hearing-days.component';
import { ChangeCourtroomStateService } from '../component-store/change-courtroom-state.service';
import { Observable } from 'rxjs';
import {
  ChangeCourtroomVM,
  ConfirmCourtRoomChange,
  ConfirmCourtRoomChangeEvent
} from '../../model';
import { AsyncPipe } from '@angular/common';
import { HearingDay } from '../../../core';
import { HearingDetailsSectionComponent } from '../components/hearing-details-section/hearing-details-section.component';
import { AppConfigService } from '../../../config';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';

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
    @if (hearingVM$ | async; as hearingVM) {
      <hearing-details-section
        [hearingVM]="hearingVM"
        [baseUrl]="getBaseUrl()"
      ></hearing-details-section>
      <selected-hearing-days
        [selectedHearingDays]="selectedHearingDays$ | async"
        [courtRoomOptions]="courtroomOptions$ | async"
        [hearingVM]="hearingVM"
        (onValidationError)="showValidationError($event)"
        (onSubmitForm)="onConfirmation.emit({ confirmed: $event.changeCourtRoomConfirmation })"
      >
      </selected-hearing-days>
    }
  `,
  imports: [
    SelectedHearingDaysComponent,
    AsyncPipe,
    HearingDetailsSectionComponent,
    BackButtonComponent,
    PdkErrorSummaryComponent,
    PdkCore
  ]
})
export class selectedhearingDaysContainer implements ConfirmCourtRoomChange {
  readonly onConfirmation = output<ConfirmCourtRoomChangeEvent>();
  hearingVM$: Observable<ChangeCourtroomVM>;
  selectedHearingDays$: Observable<HearingDay[]>;
  courtroomOptions$: Observable<SelectOption<string>[]>;
  changeCourtroomStateService = inject(ChangeCourtroomStateService);
  appConfig = inject(AppConfigService);
  errors: ValidationError[] = null;

  constructor() {
    this.hearingVM$ = this.changeCourtroomStateService.hearingVM$;
    this.selectedHearingDays$ = this.changeCourtroomStateService.selectedHearingDays$;
    this.courtroomOptions$ = this.changeCourtroomStateService.getCourtRooms;
  }

  showValidationError(errors: ValidationError[]) {
    this.errors = errors;
  }

  getBaseUrl() {
    return this.appConfig.getBaseUrl();
  }
}
