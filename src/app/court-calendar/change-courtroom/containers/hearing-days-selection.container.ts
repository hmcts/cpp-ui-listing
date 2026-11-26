import { Component, inject } from '@angular/core';
import { ValidationError, PdkErrorSummaryComponent, PdkCore } from '@cpp/pdk';
import { ChangeCourtroomStore } from '../component-store/change-courtroom.store';
import {
  HearingDaysSelectionFormComponent,
  SelectionNavigateEvent
} from '../components/hearing-days-selection-form/hearing-days-selection-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HearingDetailsSectionComponent } from '../components/hearing-details-section/hearing-details-section.component';
import { AppConfigService } from '../../../config';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';

@Component({
  selector: 'hearing-days-selection',
  template: `
    <back-button [linkUrl]="'../../../'"></back-button>
    @if (errors) {
      <pdk-error-summary focusOnChange="true" [errors]="errors"> </pdk-error-summary>
    }

    <h1 pdk-typography="heading-large" pdk-margin-bottom="3" pdk-margin-top="2">
      Change Courtroom <span pdk-visually-hidden> for hearing days</span>
    </h1>

    @if (changeCourtroomStore.hearingVM(); as hearingVM) {
      <hearing-details-section
        [hearingVM]="hearingVM"
        [baseUrl]="appConfig.getBaseUrl()"
      ></hearing-details-section>
      <div pdk-margin-top="4">
        <hearing-days-selection-form
          [allUpcomingHearingDays]="changeCourtroomStore.upcomingHearingDays()"
          [totalHearingDaysCount]="changeCourtroomStore.hearingVM()?.totalHearingDaysCount"
          [courtCentreName]="hearingVM?.courtCentre"
          [startDate]="hearingVM?.startDate"
          [endDate]="hearingVM?.endDate"
          [slots]="changeCourtroomStore.hearingSlots()"
          [selectedHearingDays]="changeCourtroomStore.selectedHearingDays()"
          [courtRoomOptions]="changeCourtroomStore.courtRooms()"
          (onValidationError)="showValidationError($event)"
          (onSelectionNavigate)="selectHearingDaysAndNavigate($event)"
          (onChangeForAllNavigate)="navigateToChangeForAll()"
        ></hearing-days-selection-form>
      </div>
    }
  `,
  imports: [
    HearingDaysSelectionFormComponent,
    HearingDetailsSectionComponent,
    BackButtonComponent,
    PdkErrorSummaryComponent,
    PdkCore
  ]
})
export class HearingDaysSelectionContainer {
  errors: ValidationError[] | null = null;
  readonly changeCourtroomStore = inject(ChangeCourtroomStore);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly appConfig = inject(AppConfigService);

  showValidationError(errors: ValidationError[]) {
    this.errors = errors;
  }

  navigateToChangeForAll() {
    this.changeCourtroomStore.setSelectedHearingDays([]);
    this.router.navigate(['../all-future-hearingdays-selected'], { relativeTo: this.route });
  }

  selectHearingDaysAndNavigate({ selectedHearingDays, courtRoomId }: SelectionNavigateEvent) {
    this.changeCourtroomStore.updateSelectedHearingDays({
      hearingDays: selectedHearingDays,
      courtRoomId
    });
    this.router.navigate(['../selected-hearing-days'], { relativeTo: this.route });
  }
}
