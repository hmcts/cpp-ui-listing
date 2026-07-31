import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PDK_MODAL_DATA_TOKEN,
  PdkCore,
  PdkForm,
  PdkRadio,
  PdkButton,
  PdkWarningTextComponent
} from '@cpp/pdk';

export interface SendNotificationModalData extends Record<string, unknown> {
  continue: (sendNotification: boolean) => void;
  newStartDate: string;
  cancel: () => void;
}

@Component({
  selector: 'send-notification-modal',
  imports: [PdkCore, FormsModule, PdkForm, PdkRadio, PdkButton, PdkWarningTextComponent, DatePipe],
  template: `
    <pdk-focus-trap>
      <div role="alertdialog" aria-modal="true" pdk-fill-colour="white" pdk-padding="6">
        <h2 pdk-margin-vertical="0">
          <pdk-warning-text pdk-margin-bottom="0">
            <span pdk-typography="heading-medium" pdk-margin-bottom="3">
              You are allocating hearings to a different date.</span
            >
          </pdk-warning-text>
        </h2>
        <p pdk-margin-bottom="3" pdk-typography="body">
          You have changed date of hearing(s) to
          <b>{{ modalData.newStartDate | date: 'dd MMMM yyyy' }}</b>
        </p>
        <form
          pdk-form
          #form="ngForm"
          data-test-id="send-notification-form"
          (validSubmit)="modalData.continue(form.value.sendNotificationToParties)"
          novalidate
        >
          <pdk-form-field
            [errorMessages]="[
              {
                rule: 'required',
                message: 'You must select if you want to notify all relevant parties'
              }
            ]"
            label="Do you want to send notification to relevant parties?"
            labelType="small"
          >
            <pdk-radio-group name="sendNotificationToParties" ngModel required>
              <pdk-radio-button [value]="true">Yes</pdk-radio-button>
              <pdk-radio-button [value]="false">No</pdk-radio-button>
            </pdk-radio-group>
          </pdk-form-field>
          <pdk-button-group aria-label="actions">
            <button type="submit" pdk-button pdk-margin-right="4" pdk-margin-bottom="1">
              Continue
            </button>

            <a
              [style.display]="'inline-block'"
              pdk-margin-top="2"
              pdk-link
              href="javascript:void(0);"
              (click)="modalData.cancel()"
            >
              Cancel
            </a>
          </pdk-button-group>
        </form>
      </div>
    </pdk-focus-trap>
  `
})
export class SendNotificationModalComponent {
  constructor(@Inject(PDK_MODAL_DATA_TOKEN) public modalData: SendNotificationModalData) {}
}
