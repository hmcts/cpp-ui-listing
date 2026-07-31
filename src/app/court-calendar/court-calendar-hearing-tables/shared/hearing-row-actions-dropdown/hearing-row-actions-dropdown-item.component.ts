import { ChangeDetectionStrategy, Component } from '@angular/core';
import { generateId, PdkButton, PdkCore } from '@cpp/pdk';
import {
  HearingRowActionDropdownComponent,
  HearingDropdownActions
} from './hearing-row-actions-dropdown.component';

@Component({
  selector: 'li [hearing-row-action-dropdown-item]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PdkButton, PdkCore],
  inputs: ['label', 'value', 'ariaDescribedBy', 'ariaLabelledBy', 'first', 'last'],
  styleUrls: ['./hearing-row-actions-dropdown.scss'],
  template: `
    <button
      pdk-button="secondary"
      pdk-margin-bottom="0"
      [attr.aria-describedby]="ariaDescribedBy"
      [attr.aria-labelledby]="ariaLabelledBy"
      [class.hearing-row-action-dropdown--first]="first"
      [class.hearing-row-action-dropdown--last]="last"
      (click)="propagateAction()"
    >
      {{ label }}
    </button>
  `
})
export class HearingRowActionDropdownItemComponent {
  label: string;
  value: HearingDropdownActions;
  first: boolean;
  last: boolean;
  ariaDescribedBy?: string;
  ariaLabelledBy?: string;
  id = generateId('hearing-row-actions-item');

  constructor(private dropDownComponent: HearingRowActionDropdownComponent) {}

  propagateAction() {
    if (!!this.dropDownComponent) {
      this.dropDownComponent.itemClicked.emit(this.value);
    }
  }
}
