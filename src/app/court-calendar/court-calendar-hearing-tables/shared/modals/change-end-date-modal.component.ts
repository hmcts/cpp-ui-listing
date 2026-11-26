import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PDK_MODAL_DATA_TOKEN,
  PdkButton,
  PdkCore,
  PdkDateInput,
  PdkForm,
  PdkWarningTextComponent
} from '@cpp/pdk';
import { CPPDate } from '../../../../core/util';

export interface ChangeEndDateModalData extends Record<string, unknown> {
  hearingTypeDescription: string;
  hearingDayCount: number;
  endDate: string;
  continue: (newEndDate: string) => void;
  cancel: () => void;
}

@Component({
  selector: 'change-end-date-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PdkCore,
    FormsModule,
    PdkForm,
    PdkButton,
    PdkWarningTextComponent,
    PdkDateInput,
    DatePipe
  ],
  template: `
    <pdk-focus-trap>
      <div role="alertdialog" aria-modal="true" pdk-fill-colour="white" pdk-padding="6">
        <h2 pdk-typography="heading-medium" pdk-margin-vertical="0" pdk-margin-bottom="4">
          Change end date
        </h2>
        <pdk-warning-text pdk-margin-bottom="4">
          You're changing hearing end date for {{ modalData.hearingTypeDescription }} with
          {{ modalData.hearingDayCount }} hearing days with end date
          {{ modalData.endDate | date: 'dd MMMM yyyy' }}
        </pdk-warning-text>
        <form
          pdk-form
          #form="ngForm"
          data-test-id="change-end-date-form"
          (validSubmit)="modalData.continue(form.value.newEndDate)"
          novalidate
        >
          <pdk-form-field
            label="Select new hearing end date"
            labelType="small"
            [errorMessages]="errorMessages"
          >
            <pdk-date-input
              [id]="'new-hearing-endDate'"
              name="newEndDate"
              [ngModel]="todayDate"
              [futureDate]="true"
              [weekDate]="true"
              required
              picker
            >
            </pdk-date-input>
          </pdk-form-field>
          <pdk-button-group aria-label="actions">
            <button type="submit" pdk-button pdk-margin-right="4" pdk-margin-bottom="1">
              Change hearing end date
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
export class ChangeEndDateModalComponent {
  private readonly cppDate = inject(CPPDate);
  errorMessages = [{ rule: 'required', message: 'Enter a new hearing end date' }];
  todayDate = this.cppDate.format(new Date());
  modalData = inject<ChangeEndDateModalData>(PDK_MODAL_DATA_TOKEN);
}
