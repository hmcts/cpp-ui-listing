import { Component, inject, input } from '@angular/core';
import { PdkDividerComponent, PdkCore } from '@cpp/pdk';

import { Location } from '@angular/common';
import { HearingDayVM } from '../../../../court-calendar/model';

@Component({
  selector: 'no-of-selected-hearing-days',
  template: `
    <h3 pdk-typography="heading-medium" pdk-margin-bottom="5" pdk-margin-top="8">Hearing days</h3>
    <div>
      <div class="future-hearingday-selected">
        <span pdk-typography="body" data-test-id="no-of-selected-hearing-days">
          <b>Number of hearing days selected</b> {{ selectedHearingDays().length }}
          {{ selectedHearingDays().length === 1 ? 'day' : 'days' }}
        </span>
        @if (showChangeLink()) {
          <a
            pdk-link
            href="javascript:void(0);"
            (click)="change()"
            pdk-margin-left="3"
            pdk-typography="body"
          >
            Change
          </a>
        }
      </div>
      <pdk-divider pdk-margin-bottom="1" pdk-margin-top="0"></pdk-divider>
    </div>
  `,
  imports: [PdkCore, PdkDividerComponent],
  styles: [
    `
      .future-hearingday-selected {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    `
  ]
})
export class TotalNoOfSelectedHearingDays {
  readonly selectedHearingDays = input<HearingDayVM[]>(undefined);
  readonly showChangeLink = input<boolean>(false);

  location = inject(Location);

  change(): void {
    this.location.back();
  }
}
