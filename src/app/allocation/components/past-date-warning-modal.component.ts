import { Component, Inject } from '@angular/core';
import { PDK_MODAL_DATA_TOKEN, PdkCore, PdkButton, PdkWarningTextComponent } from '@cpp/pdk';
import { PAST_DATE_MESSAGES } from '../../core/util';

export interface PastDateWarningModalData extends Record<string, unknown> {
  continue: () => void;
  cancel: () => void;
}

@Component({
  selector: 'past-date-warning-modal',
  imports: [PdkCore, PdkButton, PdkWarningTextComponent],
  template: `
    <pdk-focus-trap>
      <div role="alertdialog" aria-modal="true" pdk-fill-colour="white" pdk-padding="6">
        <h2 pdk-margin-vertical="0">
          <pdk-warning-text pdk-margin-bottom="0">
            <span pdk-typography="heading-medium" pdk-margin-bottom="3">{{ message }}</span>
          </pdk-warning-text>
        </h2>
        <pdk-button-group aria-label="actions">
          <button
            type="button"
            pdk-button
            pdk-margin-right="4"
            pdk-margin-bottom="1"
            data-test-id="past-date-continue"
            (click)="modalData.continue()"
          >
            Continue
          </button>
          <a
            [style.display]="'inline-block'"
            pdk-margin-top="2"
            pdk-link
            href="javascript:void(0);"
            data-test-id="past-date-cancel"
            (click)="modalData.cancel()"
          >
            Cancel
          </a>
        </pdk-button-group>
      </div>
    </pdk-focus-trap>
  `
})
export class PastDateWarningModalComponent {
  readonly message = PAST_DATE_MESSAGES.warning;

  constructor(@Inject(PDK_MODAL_DATA_TOKEN) public modalData: PastDateWarningModalData) {}
}
