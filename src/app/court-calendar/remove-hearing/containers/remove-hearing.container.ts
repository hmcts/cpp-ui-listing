import { Component, inject } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PdkErrorSummaryComponent, PdkGrid, ValidationError } from '@cpp/pdk';
import { RemoveHearingPayload, RemoveHearingVM } from '../../model';
import { CourtCalendarActions, CourtCalendarFeatureState, getRemoveHearingVm } from '../../state';
import { RemoveHearingComponent } from '../components/remove-hearing.component';
import { Router } from '@angular/router';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'remove-hearing-container',
  template: `
    <back-button [linkUrl]="'../../'"></back-button>
    <pdk-grid container>
      <pdk-grid full>
        @if (errors?.length > 0) {
          <pdk-error-summary focusOnChange="true" [errors]="errors"> </pdk-error-summary>
        }
      </pdk-grid>
      <court-calendar-remove-hearing
        [hearingToRemove]="hearingToRemove$ | async"
        (onValidateError)="errors = $event"
        (cancel)="onCancel()"
        (onRemoveHearing)="removeHearing($event)"
      >
      </court-calendar-remove-hearing>
    </pdk-grid>
  `,
  imports: [
    AsyncPipe,
    RemoveHearingComponent,
    BackButtonComponent,
    PdkGrid,
    PdkErrorSummaryComponent
  ]
})
export class RemoveHearingContainer {
  hearingToRemove$: Observable<RemoveHearingVM>;
  errors: ValidationError[] = [];
  readonly store = inject(Store<CourtCalendarFeatureState>);
  readonly router = inject(Router);
  constructor() {
    this.hearingToRemove$ = this.store.pipe(select(getRemoveHearingVm));
  }

  removeHearing(payload: RemoveHearingPayload) {
    this.store.dispatch(CourtCalendarActions.removeSelectedHearing({ payload }));
  }

  onCancel() {
    this.store.dispatch(CourtCalendarActions.setSelectedHearingData({ selectedHearing: null }));
    this.router.navigate(['/court-calendar']);
  }
}
