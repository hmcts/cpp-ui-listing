import { Component, inject, OnInit } from '@angular/core';
import { SelectOption, ValidationError, PdkErrorSummaryComponent, PdkCore } from '@cpp/pdk';
import { ChangeCourtroomStateService } from '../component-store/change-courtroom-state.service';
import {
  HearingDaysSelectionFormComponent,
  SelectionNavigateEvent
} from '../components/hearing-days-selection-form/hearing-days-selection-form.component';
import { Observable, of } from 'rxjs';
import { ChangeCourtroomVM } from '../../model';
import { AsyncPipe } from '@angular/common';
import { HearingDay } from '../../../core';
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

    @if (hearingVM$ | async; as hearingVM) {
      <hearing-details-section
        [hearingVM]="hearingVM"
        [baseUrl]="getBaseUrl()"
      ></hearing-details-section>
      <div pdk-margin-top="4">
        <hearing-days-selection-form
          [allUpcomingHearingDays]="(hearingVM$ | async)?.upComingHearingDays"
          [totalHearingDaysCount]="(hearingVM$ | async)?.totalHearingDaysCount"
          [courtCentreName]="hearingVM?.courtCentre"
          [startDate]="hearingVM?.startDate"
          [endDate]="hearingVM?.endDate"
          [selectedHearingDays]="selectedHearingDays$ | async"
          [courtRoomOptions]="courtroomOptions$ | async"
          (onValidationError)="showValidationError($event)"
          (onSelectionNavigate)="selectHearingDaysAndNavigate($event)"
          (onChangeForAllNavigate)="navigateToChangeForAll()"
        ></hearing-days-selection-form>
      </div>
    }
  `,
  imports: [
    HearingDaysSelectionFormComponent,
    AsyncPipe,
    HearingDetailsSectionComponent,
    BackButtonComponent,
    PdkErrorSummaryComponent,
    PdkCore
  ]
})
export class HearingDaysSelectionContainer implements OnInit {
  errors: ValidationError[] = null;
  hearingVM$: Observable<ChangeCourtroomVM>;
  selectedHearingDays$: Observable<HearingDay[]>;
  courtroomOptions$: Observable<SelectOption<string>[]>;
  router = inject(Router);
  route = inject(ActivatedRoute);
  changeCourtroomStateService = inject(ChangeCourtroomStateService);
  appConfig = inject(AppConfigService);

  ngOnInit(): void {
    this.hearingVM$ = this.changeCourtroomStateService.hearingVM$;
    this.selectedHearingDays$ = this.changeCourtroomStateService.selectedHearingDays$;
    this.courtroomOptions$ = this.changeCourtroomStateService.getCourtRooms;
  }

  showValidationError(errors: ValidationError[]) {
    this.errors = errors;
  }

  navigateToChangeForAll() {
    this.changeCourtroomStateService.setSelectedHearingDays([]);
    this.router.navigate(['../all-future-hearingdays-selected'], { relativeTo: this.route });
  }

  selectHearingDaysAndNavigate({ selectedHearingDays, courtRoomId }: SelectionNavigateEvent) {
    this.changeCourtroomStateService.updateSelectedHearingDays(
      of({
        hearingDays: selectedHearingDays,
        courtRoomId
      })
    );
    this.router.navigate(['../selected-hearing-days'], { relativeTo: this.route });
  }

  getBaseUrl() {
    return this.appConfig.getBaseUrl();
  }
}
