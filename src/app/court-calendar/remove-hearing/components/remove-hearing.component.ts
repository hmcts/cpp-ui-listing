import { Component, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PdkButton,
  PdkCore,
  PdkForm,
  PdkGrid,
  PdkTextInput,
  PdkResizeDirective,
  ValidationError
} from '@cpp/pdk';
import { RemoveHearingPayload, RemoveHearingVM } from '../../model';
import { DatePipe, NgStyle } from '@angular/common';

@Component({
  selector: 'court-calendar-remove-hearing',
  templateUrl: './remove-hearing.component.html',
  styleUrls: ['./remove-hearing.component.scss'],
  inputs: ['hearingToRemove'],
  outputs: ['cancel', 'onValidateError', 'onRemoveHearing'],
  imports: [
    FormsModule,
    PdkResizeDirective,
    PdkGrid,
    PdkCore,
    PdkForm,
    PdkTextInput,
    PdkButton,
    DatePipe,
    NgStyle
  ]
})
export class RemoveHearingComponent {
  hearingToRemove: RemoveHearingVM;
  cancel = new EventEmitter<void>();
  onValidateError = new EventEmitter<ValidationError[]>();
  onRemoveHearing = new EventEmitter<RemoveHearingPayload>();
  hearingDetailsLabels: Record<keyof Omit<RemoveHearingVM, 'id'>, string> = {
    courtName: 'Court',
    startDate: 'Date',
    courtRoom: 'Courtroom',
    duration: 'Duration',
    hearingType: 'Hearing type',
    hearingLanguage: 'Hearing language',
    videoHearing: 'Video hearing',
    multiDayHearing: 'Multi-day hearing'
  };

  hearingDetailsKeys = Object.keys(this.hearingDetailsLabels);

  removeHearing(formValue: { reason: string }) {
    this.onRemoveHearing.emit({ ...formValue, hearingId: this.hearingToRemove.id });
  }
}
