import { Component, ChangeDetectionStrategy, input, model } from '@angular/core';
import { ControlContainer, NgForm, FormsModule } from '@angular/forms';

import {
  PdkFormFieldComponent,
  PdkCheckboxComponent,
  PdkMarginDirective,
  PdkTextInputDirective,
  PdkInput,
  PdkResizeDirective,
  PdkCharacterCountComponent
} from '@cpp/pdk';
import { PUBLIC_LIST_NOTE_MAX_LENGTH } from '../../../core/util/constants';

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
          <textarea
            pdk-text-input
            pdk-resize
            #publicListNoteModel="ngModel"
            [ngModel]="publicListNote()"
            [maxlength]="publicListNoteMaxLength"
            [id]="'public-list-details'"
            name="publicListNote"
            pdk-input
          ></textarea>
          <pdk-character-count
            [value]="publicListNoteModel.value"
            [limit]="publicListNoteMaxLength"
          ></pdk-character-count>
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
    PdkInput,
    PdkResizeDirective,
    PdkCharacterCountComponent
  ]
})
export class VideoHearingComponent {
  readonly hasVideoLink = model(false);
  readonly publicListNote = input<string>(undefined);
  readonly jurisdictionType = input<string>(undefined);
  readonly publicListNoteMaxLength = PUBLIC_LIST_NOTE_MAX_LENGTH;

  togglepublicListNote() {
    this.hasVideoLink.set(!this.hasVideoLink());
  }
}
