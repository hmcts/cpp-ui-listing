import { Component, OnInit } from '@angular/core';
import { PdkErrorSummaryComponent, PdkCore, PdkGrid, ValidationError } from '@cpp/pdk';
import { AsyncPipe } from '@angular/common';
import { HearingType } from '@cpp/reference-data';
import {
  ChangeHearingDetailsComponent,
  ChangeHearingDetailsFormValues
} from '../components/change-hearing-details.component';
import {
  AllocatingHearingDetailsWithCourtCentre,
  AppState,
  CourtCentre,
  getCourtCentres,
  Hearing
} from '../../../core';
import { combineLatest, Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import {
  getSelectedHearing,
  getSessionsForSelectedHearingBusinessType
} from '../../state/selectors';
import { filter, map, switchMap } from 'rxjs/operators';
import { CourtCalendarActions } from '../../state';
import { Router } from '@angular/router';
import { HearingSlot } from '@cpp/scheduling';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';

@Component({
  selector: 'change-hearing-details-container',
  template: `
    <pdk-grid container>
      <pdk-grid full>
        <back-button [linkUrl]="'../../'"></back-button>
        @if (errors) {
          <pdk-error-summary focusOnChange="true" [errors]="errors"> </pdk-error-summary>
        }
        <h1 pdk-typography="heading-large" pdk-margin-bottom="3" pdk-margin-top="2">
          Change Hearing Details
        </h1>
        <change-hearing-details
          [initialValues]="initialValues$ | async"
          [selectedHearing]="selectedHearing$ | async"
          [selectedCourtCentre]="selectedCourtCentre$ | async"
          [hearingSlots]="hearingSlots$ | async"
          (onSubmit)="updateHearing($event)"
          (onCancel)="cancelSelectedHearingData()"
          (onValidationError)="showValidationError($event)"
        ></change-hearing-details>
      </pdk-grid>
    </pdk-grid>
  `,
  imports: [
    AsyncPipe,
    PdkGrid,
    BackButtonComponent,
    PdkErrorSummaryComponent,
    PdkCore,
    ChangeHearingDetailsComponent
  ]
})
export class ChangehearingDetailsContainer implements OnInit {
  selectedHearing$: Observable<Hearing | {}>;
  initialValues$: Observable<ChangeHearingDetailsFormValues>;
  courtCentres: CourtCentre[];
  selectedCourtCentre$: Observable<CourtCentre>;
  errors: ValidationError[] = null;
  hearingSlots$: Observable<HearingSlot[]>;
  constructor(
    private store: Store<AppState>,
    private route: Router
  ) {}

  ngOnInit(): void {
    this.selectedHearing$ = this.store.pipe(select(getSelectedHearing));
    this.selectedCourtCentre$ = combineLatest([
      this.store.select(getCourtCentres),
      this.selectedHearing$
    ]).pipe(
      map(([courtCentres, selectedHearing]) => {
        const courtCentreId = (selectedHearing as Hearing)?.courtCentreId;
        return courtCentres.find((cc) => cc.id === courtCentreId);
      })
    );
    this.initialValues$ = this.selectedHearing$.pipe(
      map((selectedHearing: Hearing) => this.getInitialValues(selectedHearing))
    );
    this.hearingSlots$ = this.selectedHearing$.pipe(
      filter((hearing: Hearing) => hearing?.jurisdictionType === 'MAGISTRATES'),
      switchMap(({ hearingDays }: Hearing) =>
        this.store.pipe(
          select(getSessionsForSelectedHearingBusinessType(hearingDays[0]?.courtScheduleId))
        )
      )
    );
  }

  private getInitialValues(selectedHearing: Hearing): ChangeHearingDetailsFormValues {
    if (!selectedHearing) return null;

    return {
      hasVideoLink: selectedHearing.hasVideoLink,
      sendNotificationToParties: selectedHearing.sendNotificationToParties,
      hearingLanguage: selectedHearing.hearingLanguage,
      publicListNote: selectedHearing.publicListNote,
      nonSittingDays: selectedHearing.nonSittingDays,
      nonDefaultDays: selectedHearing.hearingDayCount === 1 ? [] : selectedHearing.nonDefaultDays,
      dateRange: {
        startDate: selectedHearing.startDate,
        endDate: selectedHearing.endDate
      },
      selectedHearingType: {
        id: selectedHearing.type.id,
        hearingDescription: selectedHearing.type.description
      } as HearingType,
      startTime: selectedHearing.hearingDays[0].startTime,
      duration: selectedHearing.hearingDays[0].durationMinutes
    };
  }

  async updateHearing({ originHearing, updatedHearing }: AllocatingHearingDetailsWithCourtCentre) {
    this.store.dispatch(
      CourtCalendarActions.updateSelectedHearingData({
        originHearing,
        updatedHearing
      })
    );
  }

  cancelSelectedHearingData() {
    this.store.dispatch(CourtCalendarActions.setSelectedHearingData({ selectedHearing: null }));
    this.route.navigate(['/court-calendar']);
  }

  showValidationError(errors: ValidationError[]) {
    this.errors = errors;
  }
}
