import { Component, ChangeDetectionStrategy, input, model } from '@angular/core';
import { ControlContainer, NgForm, FormsModule } from '@angular/forms';

import {
  PdkFormFieldComponent,
  PdkCheckboxComponent,
  PdkMarginDirective,
  PdkTextInputDirective,
  PdkInput
} from '@cpp/pdk';

@Component({
  selector: 'video-hearing',
  template: `@if (jurisdictionType() === 'CROWN') {
    <pdk-form-field>
      <pdk-checkbox
        [ngModel]="hasVideoLink()"
        name="hasVideoLink"
        (ngModelChange)="togglepublicListNote()"
      >
        Video hearing
      </pdk-checkbox>
    </pdk-form-field>
    <ng-container>
      <div pdk-margin-bottom="7">
        <pdk-form-field label="Public list note" labelType="small">
          <input
            pdk-text-input
            [ngModel]="publicListNote()"
            maxlength="80"
            type="text"
            [id]="'public-list-details'"
            name="publicListNote"
            pdk-input
          />
        </pdk-form-field>
      </div>
    </ng-container>
  }`,
  styleUrls: ['./video-hearing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
  imports: [
    PdkFormFieldComponent,
    PdkCheckboxComponent,
    FormsModule,
    PdkMarginDirective,
    PdkTextInputDirective,
    PdkInput
  ]
})
export class VideoHearingComponent {
  readonly hasVideoLink = model(false);
  readonly publicListNote = input<string>(undefined);
  readonly jurisdictionType = input<string>(undefined);

  togglepublicListNote() {
    this.hasVideoLink.set(!this.hasVideoLink());
  }
}
