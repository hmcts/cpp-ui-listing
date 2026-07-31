import { Component, computed, inject, signal } from '@angular/core';
import { PdkErrorSummaryComponent, PdkCore, PdkGrid, ValidationError } from '@cpp/pdk';
import { HearingType } from '@cpp/reference-data';
import {
  ChangeHearingDetailsComponent,
  ChangeHearingDetailsFormValues
} from '../components/change-hearing-details.component';
import { AllocatingHearingDetailsWithCourtCentre, getCourtCentres, Hearing } from '../../../core';
import { Store } from '@ngrx/store';
import { getSelectedHearing } from '../../state/selectors';
import { CourtCalendarActions } from '../../state';
import { Router } from '@angular/router';
import { getSearchResults } from '@cpp/scheduling';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';

@Component({
  selector: 'change-hearing-details-container',
  template: `
    <pdk-grid container>
      <pdk-grid full>
        <back-button [linkUrl]="'../../'"></back-button>
        @if (errors()) {
          <pdk-error-summary focusOnChange="true" [errors]="errors()"> </pdk-error-summary>
        }
        <h1 pdk-typography="heading-large" pdk-margin-bottom="3" pdk-margin-top="2">
          Change Hearing Details
        </h1>
        <change-hearing-details
          [initialValues]="initialValues()"
          [selectedHearing]="selectedHearing()"
          [selectedCourtCentre]="selectedCourtCentre()"
          [hearingSlots]="hearingSlots()"
          (onSubmit)="updateHearing($event)"
          (onCancel)="cancelSelectedHearingData()"
          (onValidationError)="showValidationError($event)"
        ></change-hearing-details>
      </pdk-grid>
    </pdk-grid>
  `,
  imports: [
    PdkGrid,
    BackButtonComponent,
    PdkErrorSummaryComponent,
    PdkCore,
    ChangeHearingDetailsComponent
  ]
})
export class ChangehearingDetailsContainer {
  private readonly store = inject(Store);
  private readonly route = inject(Router);
  private readonly courtCentres = this.store.selectSignal(getCourtCentres);

  readonly selectedHearing = this.store.selectSignal(getSelectedHearing);
  readonly hearingSlots = this.store.selectSignal(getSearchResults);
  readonly selectedCourtCentre = computed(() =>
    this.courtCentres().find(cc => cc.id === (this.selectedHearing() as Hearing)?.courtCentreId)
  );
  readonly initialValues = computed(() => this.getInitialValues(this.selectedHearing() as Hearing));
  readonly errors = signal<ValidationError[]>(null);

  updateHearing({ originHearing, updatedHearing }: AllocatingHearingDetailsWithCourtCentre): void {
    this.store.dispatch(
      CourtCalendarActions.updateSelectedHearingData({ originHearing, updatedHearing })
    );
  }

  cancelSelectedHearingData(): void {
    this.store.dispatch(CourtCalendarActions.setSelectedHearingData({ selectedHearing: null }));
    this.route.navigate(['/court-calendar']);
  }

  showValidationError(errors: ValidationError[]): void {
    this.errors.set(errors);
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
}
