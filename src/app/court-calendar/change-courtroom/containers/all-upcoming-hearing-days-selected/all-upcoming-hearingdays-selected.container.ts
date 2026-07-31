import { Component, inject, OnInit } from '@angular/core';
import {
  SelectOption,
  ValidationError,
  PdkErrorSummaryComponent,
  PdkCore,
  PdkForm,
  PdkButton,
  PdkSelectComponent
} from '@cpp/pdk';
import { ChangeCourtroomStateService } from '../../component-store/change-courtroom-state.service';
import { ChangeCourtroomVM } from '../../../model';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HearingDetailsSectionComponent } from '../../components/hearing-details-section/hearing-details-section.component';
import { take } from 'rxjs/operators';
import { TotalNoOfSelectedHearingDays } from '../../components/no-of-selected-hearingdays/no-of-selected-hearingdays.component';
import { AppConfigService } from '../../../../config';
import { FormsModule } from '@angular/forms';
import { BackButtonComponent } from '../../../../shared/components/back-button/back-button.component';

@Component({
  selector: 'all-upcoming-hearingdays-selected',
  templateUrl: './all-upcoming-hearingdays-selected.container.html',
  styles: [
    `
      dl > div {
        border-bottom: 1px solid;
      }
    `
  ],
  imports: [
    FormsModule,
    AsyncPipe,
    HearingDetailsSectionComponent,
    TotalNoOfSelectedHearingDays,
    BackButtonComponent,
    PdkErrorSummaryComponent,
    PdkCore,
    PdkForm,
    PdkButton,
    PdkSelectComponent
  ]
})
export class AllFutureHearingDaysSelectedContainer implements OnInit {
  errors: ValidationError[] = null;
  hearingVM$: Observable<ChangeCourtroomVM>;
  courtRoomOptions$: Observable<SelectOption<string>[]>;
  selectedCourtRoomId: string | null = null;

  router = inject(Router);
  route = inject(ActivatedRoute);
  changeCourtroomStateService = inject(ChangeCourtroomStateService);
  appConfig = inject(AppConfigService);

  ngOnInit(): void {
    this.hearingVM$ = this.changeCourtroomStateService.hearingVM$;
    this.courtRoomOptions$ = this.changeCourtroomStateService.getCourtRooms;
  }

  showValidationError(errors: ValidationError[]) {
    this.errors = errors;
  }

  handleSubmit({ courtRoomId }: { courtRoomId: string }): void {
    this.hearingVM$.pipe(take(1)).subscribe(({ upComingHearingDays }) =>
      this.changeCourtroomStateService.updateSelectedHearingDays({
        hearingDays: upComingHearingDays,
        courtRoomId: courtRoomId
      })
    );

    this.router.navigate(['../all-future-hearingdays-selected-confirm'], {
      relativeTo: this.route
    });
  }

  getBaseUrl() {
    return this.appConfig.getBaseUrl();
  }
}
