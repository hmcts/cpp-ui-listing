import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ChangeCourtroomStateService } from '../component-store/change-courtroom-state.service';
import { Observable } from 'rxjs';
import { ChangeCourtroomVM } from '../../../court-calendar/model';
import { PdkContextPanelComponent, PdkButton, PdkCore } from '@cpp/pdk';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'success-banner-container',
  imports: [PdkContextPanelComponent, PdkCore, PdkButton, AsyncPipe],
  template: `
    <pdk-context-panel title="Courtrooms changed" class="success-panel" pdk-margin-bottom="3">
      <div class="case-details">
        <span class="case-label">Case number</span>
        @for (
          case of (hearingVM$ | async)?.cases;
          track case.caseUrn || case.applicationReference;
          let last = $last
        ) {
          <span class="case-number bold">
            {{ case.caseUrn || case.applicationReference }}
            @if (!last) {
              <span>, </span>
            }
          </span>
        }
      </div>
    </pdk-context-panel>
    <div class="button-wrapper">
      <button
        pdk-button="primary"
        type="button"
        aria-label="Navigate to court calendar"
        (click)="goToCourtCalendar()"
      >
        Go to court calendar
      </button>
    </div>
  `,
  styles: [
    `
      .success-panel {
        display: flex;
        flex-direction: column;
        text-align: center;
      }

      .case-details {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }

      .button-wrapper {
        display: flex;
        justify-content: center;
        margin-top: 1rem;
      }
    `
  ]
})
export class SuccessBannerContainer {
  private router = inject(Router);
  changeCourtroomStateService = inject(ChangeCourtroomStateService);

  hearingVM$: Observable<ChangeCourtroomVM>;

  constructor() {
    this.hearingVM$ = this.changeCourtroomStateService.hearingVM$;
  }

  goToCourtCalendar(): void {
    this.router.navigate(['/court-calendar']);
  }
}
