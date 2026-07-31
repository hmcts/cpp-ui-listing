import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  ViewEncapsulation
} from '@angular/core';
import { generateId, PdkInteractionContainerComponent, PdkButton, PdkCore } from '@cpp/pdk';
import { HearingRowActionDropdownItemComponent } from './hearing-row-actions-dropdown-item.component';

export type HearingDropdownActions =
  | 'move'
  | 'reallocate'
  | 'unallocate'
  | 'edit'
  | 'remove'
  | 'split'
  | 'change'
  | 'change-end-date';
export type HearingBulkActions = Extract<HearingDropdownActions, 'reallocate' | 'unallocate'>;
export interface HearingRowActionItem {
  label: string;
  value: HearingDropdownActions;
  ariaDescribedBy?: string;
  ariaLabelledBy?: string;
}

@Component({
  selector: 'hearing-row-action-dropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HearingRowActionDropdownItemComponent,
    PdkInteractionContainerComponent,
    PdkButton,
    PdkCore
  ],
  inputs: ['options', 'name', 'ariaDescribedBy', 'menuAlign'],
  outputs: ['itemClicked'],
  styleUrls: ['./hearing-row-actions-dropdown.scss'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <pdk-interaction-container (blur)="toggle = false">
      <div id="instructions" pdk-visually-hidden>
        Use the dropdown menu to switch between multiple actions
      </div>
      <button
        pdk-button="secondary"
        class="hearing-row-action-dropdown__toggle"
        pdk-margin-bottom="1"
        pdk-padding-right="4"
        [attr.aria-describedby]="ariaDescribedBy || 'instructions'"
        [attr.aria-expanded]="toggle"
        [id]="id + 'toggle'"
        aria-haspopup="menu"
        (click)="toggle = !toggle"
      >
        {{ name }}
      </button>

      <ul
        pdk-margin-vertical="0"
        pdk-padding-left="0"
        class="hearing-row-action-dropdown__menu"
        [class.hearing-row-action-dropdown__menu--right]="menuAlign === 'right'"
        [attr.aria-labelledby]="id + 'toggle'"
        (click)="handleClickEvent($event)"
        [hidden]="!toggle"
      >
        @for (item of options; track item.label; let first = $first; let last = $last) {
          <li
            hearing-row-action-dropdown-item
            [label]="item.label"
            [value]="item.value"
            [first]="first"
            [last]="last"
            [ariaDescribedBy]="item.ariaDescribedBy"
            [ariaLabelledBy]="item.ariaLabelledBy"
          ></li>
        }
      </ul>
    </pdk-interaction-container>
  `
})
export class HearingRowActionDropdownComponent {
  options: HearingRowActionItem[];
  name: string = 'Action';
  menuAlign: 'left' | 'right' = 'left';
  ariaDescribedBy?: string;
  itemClicked = new EventEmitter<HearingDropdownActions>();
  toggle = false;
  id = generateId('hearing-row-actions');

  handleClickEvent(event: MouseEvent) {
    if ((event.target as Element).tagName === 'BUTTON') {
      this.toggle = false;
    }
  }

  @HostListener('click', ['$event'])
  preventDefault(event: MouseEvent) {
    event.stopPropagation();
  }
}
