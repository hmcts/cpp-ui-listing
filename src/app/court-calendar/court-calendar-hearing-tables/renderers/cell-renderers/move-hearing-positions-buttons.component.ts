import { ChangeDetectionStrategy, Component, EventEmitter, HostListener } from '@angular/core';
import { HearingTableActionsState } from '../../component-store/hearing-table-actions.store';

import { BaseHearingRowDataVM } from '../../../model/hearing-table-renderer.interfaces';

import { PdkButton, PdkCore } from '@cpp/pdk';

@Component({
  selector: 'move-hearings-position-buttons',
  template: `
    <div data-test-id="move-hearings-position" class="buttons-display">
      @if (shouldInsertBefore) {
        <button pdk-button pdk-margin-bottom="2" (click)="insertBefore.emit()">
          <ng-content select="[insert-before]"></ng-content>
        </button>
      }
      @if (shouldInsertAfter) {
        <button pdk-button pdk-margin-bottom="0" (click)="insertAfter.emit()">
          <ng-content select="[insert-after]"></ng-content>
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['hearingMoveState', 'group', 'hearingId'],
  outputs: ['insertBefore', 'insertAfter'],
  imports: [PdkButton, PdkCore],
  styles: [
    `
      :host {
        display: flex;
        justify-content: flex-end;
      }
      .buttons-display {
        display: flex;
        flex-direction: column;
        min-width: 132px;
        max-width: 160px;
        white-space: nowrap;
      }
    `
  ]
})
export class MoveHearingsButtonsComponent {
  hearingMoveState?: HearingTableActionsState['moveState'];
  group: BaseHearingRowDataVM[];
  hearingId: string;

  insertBefore = new EventEmitter<void>();
  insertAfter = new EventEmitter<void>();
  get masterRows(): BaseHearingRowDataVM[] {
    return this.group.filter(row => row.isMaster);
  }

  get shouldInsertBefore() {
    return this.masterRows.findIndex(({ id }) => id === this.hearingId) === 0;
  }

  get shouldInsertAfter() {
    const hearingIndex = this.masterRows.findIndex(({ id }) => id === this.hearingId);
    if (this.hearingMoveState?.hearingId) {
      const hearingToMoveIndex = this.masterRows.findIndex(
        ({ id }) => id === this.hearingMoveState?.hearingId
      );
      return hearingIndex !== hearingToMoveIndex - 1;
    }
    return hearingIndex >= 0;
  }

  @HostListener('click', ['$event'])
  preventDefault(event: MouseEvent) {
    event.stopPropagation();
  }
}
