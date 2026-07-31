import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { PdkInsetTextComponent, PdkCore, PdkGrid, ValidationError } from '@cpp/pdk';
import { AsyncPipe } from '@angular/common';
import { AppState, CourtCentre, Hearing, getCourtCentres } from '../../core';
import { CourtCalendarActions, getCourtCalendarFilters } from '../state';
import { ChangeJudiciaryForHearingsFormComponent } from '../../edit-allocation/change-judiciary-for-hearings-form/change-judiciary-for-hearings-form.component';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';

@Component({
  selector: 'edit-judiciary-container',
  template: `
    <back-button [linkUrl]="'../'"></back-button>
    <pdk-grid container pdk-padding-top="2">
      <pdk-grid two-thirds>
        <h1 pdk-typography="heading-xlarge" pdk-margin-bottom="1">Edit Judiciary</h1>
        <pdk-inset-text>
          <p pdk-typography="body">
            The judiciary you are amending will update details of
            {{ (allocatedHearings$ | async).hearings.length }} hearings.
          </p>
        </pdk-inset-text>
        <change-judiciary-for-hearings-form
          [courtCentres]="organisationUnits$ | async"
          [maxInputWidth]="30"
          [hearings]="(allocatedHearings$ | async).hearings"
          (onSubmit)="onChangeJudiciary($event)"
          (onCancel)="onCancel()"
          (onValidationError)="formErrors($event)"
        >
        </change-judiciary-for-hearings-form>
      </pdk-grid>
    </pdk-grid>
  `,
  styles: [
    `
      edit-judiciary-container fieldset {
        border: none;
        padding-left: 0;
      }
      edit-judiciary-container h2 {
        display: none;
      }
      edit-judiciary-container legend {
        visibility: hidden;
      }
    `
  ],
  encapsulation: ViewEncapsulation.None,
  imports: [
    AsyncPipe,
    ChangeJudiciaryForHearingsFormComponent,
    BackButtonComponent,
    PdkGrid,
    PdkCore,
    PdkInsetTextComponent
  ]
})
export class EditJudiciaryContainer implements OnInit {
  organisationUnits$: Observable<CourtCentre[]>;
  allocatedHearings$: Observable<{ hearings: Hearing[]; judiciaryIds: string }>;
  errors: ValidationError[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.organisationUnits$ = this.store.select(getCourtCentres);
  }

  formErrors(errors) {
    this.errors = errors;
  }

  ngOnInit(): void {
    this.allocatedHearings$ = this.route.data.pipe(map((data) => data['allocatedHearings']));
  }

  onChangeJudiciary({ hearings, judiciary }) {
    this.store.pipe(select(getCourtCalendarFilters), take(1)).subscribe((filterOptions) => {
      this.store.dispatch(
        CourtCalendarActions.changeHearingsJudiciaryAction({
          hearings,
          judiciary: (judiciary ?? []).filter((judic) => !!judic),
          filterOptions: {
            ...filterOptions,
            courtRoomId: this.route.snapshot.queryParams.courtRoomId
          }
        })
      );
    });
  }

  onCancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
