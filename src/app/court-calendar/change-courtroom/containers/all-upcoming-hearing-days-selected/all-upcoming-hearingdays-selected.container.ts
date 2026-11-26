import { Component, computed, inject, signal } from '@angular/core';
import {
  ValidationError,
  PdkErrorSummaryComponent,
  PdkCore,
  PdkForm,
  PdkButton,
  PdkSelectComponent
} from '@cpp/pdk';
import { ChangeCourtroomStore } from '../../component-store/change-courtroom.store';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HearingDetailsSectionComponent } from '../../components/hearing-details-section/hearing-details-section.component';
import { TotalNoOfSelectedHearingDays } from '../../components/no-of-selected-hearingdays/no-of-selected-hearingdays.component';
import { AppConfigService } from '../../../../config';
import { BackButtonComponent } from '../../../../shared/components/back-button/back-button.component';
import { CourtRoomAvailabilityDirective } from '../../directives/court-room-availability.validator.directive';

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
    HearingDetailsSectionComponent,
    TotalNoOfSelectedHearingDays,
    BackButtonComponent,
    PdkErrorSummaryComponent,
    PdkCore,
    PdkForm,
    PdkButton,
    PdkSelectComponent,
    CourtRoomAvailabilityDirective
  ]
})
export class AllFutureHearingDaysSelectedContainer {
  errors: ValidationError[] | null = null;
  readonly selectedCourtRoomId = signal<string | null>(null);

  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly store = inject(ChangeCourtroomStore);
  readonly appConfig = inject(AppConfigService);
  readonly upcomingHearingDates = computed(() =>
    this.store.upcomingHearingDays().map(day => day.hearingDate)
  );
  readonly courtRoomAvailabilityError = computed(() => {
    const label =
      this.store.courtRooms().find(o => o.value === this.selectedCourtRoomId())?.label ?? '';
    return `No sessions are available for ${label}`;
  });

  showValidationError(errors: ValidationError[]) {
    this.errors = errors;
  }

  handleSubmit({ courtRoomId }: { courtRoomId: string }): void {
    const { upComingHearingDays } = this.store.hearingVM();
    this.store.updateSelectedHearingDays({
      hearingDays: upComingHearingDays,
      courtRoomId
    });

    this.router.navigate(['../all-future-hearingdays-selected-confirm'], {
      relativeTo: this.route
    });
  }

  getBaseUrl(): string {
    return this.appConfig.getBaseUrl();
  }
}
