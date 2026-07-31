import { ChangeDetectionStrategy, Component, EventEmitter, HostListener } from '@angular/core';
import {
  HearingTableActionsState,
  MoveEvent
} from '../../component-store/hearing-table-actions.store';
//import { HearingRowActionItem } from '../../hearing-row-actions-dropdown/hearing-row-actions-dropdown.component';

import { BaseHearingRowDataVM } from '../../../model/hearing-table-renderer.vm';
import { HearingActionsEvent } from './action-cell.component';
import { MoveHearingsButtonsComponent } from './move-hearing-positions-buttons.component';

import {
  IsNonMovingMemberOfHearingsGroupPipe,
  IsHearingBeingMovedPipe
} from '../../../pipes/move-hearing-action.pipes';
import { PdkButton } from '@cpp/pdk';

@Component({
  selector: 'allocated-magistrates-move-action-cell, [allocated-magistrates-move-action-cell]',
  template: `
    <div data-test-id="allocated-magistrates-widget-move-action">
      @if (!sectionInAllocateState && !hearingMoveState) {
        <button class="move-button" pdk-button="secondary" (click)="movePosition()">
          Move position
        </button>
      }
      @if (hearingMoveState) {
        <div>
          @if (hearing | isNonMovingMemberOfHearingsGroup: hearingMoveState) {
            <move-hearings-position-buttons
              [hearingMoveState]="hearingMoveState"
              [group]="group"
              [hearingId]="hearing?.id"
              (insertBefore)="insertHearingBefore()"
              (insertAfter)="insertHearingAfter()"
            >
              <span insert-before>Insert before </span>
              <span insert-after>Insert after</span>
            </move-hearings-position-buttons>
          }
          @if (hearing | hearingRowToBeMoved: hearingMoveState) {
            <button class="cancel-button" pdk-button="secondary" (click)="canceMove()">
              Cancel
            </button>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: [
    'hearingMoveState',
    'group',
    'hearing',
    'displayAllocateOptions',
    'sectionInAllocateState'
  ],
  outputs: ['actionClicked', 'undoHearingMoveClicked', 'onMove'],
  imports: [
    MoveHearingsButtonsComponent,
    IsNonMovingMemberOfHearingsGroupPipe,
    IsHearingBeingMovedPipe,
    PdkButton
  ],
  styles: [
    `
      .cancel-button,
      .move-button {
        min-width: 142px;
        max-width: 160px;
      }
    `
  ]
})
export class AllocatedMagistratesMoveActionsCellComponent {
  hearingMoveState: HearingTableActionsState['moveState'];
  group: BaseHearingRowDataVM[];
  hearing: BaseHearingRowDataVM;
  displayAllocateOptions = false;
  sectionInAllocateState = false;
  actionClicked = new EventEmitter<HearingActionsEvent>();
  undoHearingMoveClicked = new EventEmitter<void>();
  onMove = new EventEmitter<MoveEvent>();

  insertHearingBefore() {
    this.onMove.emit({
      insertBeforeId: this.hearing.id,
      hearingToMoveIds: this.hearingMoveState?.hearingId
        ? [this.hearingMoveState.hearingId]
        : undefined
    });
  }

  insertHearingAfter() {
    this.onMove.emit({
      insertafterId: this.hearing.id,
      hearingToMoveIds: this.hearingMoveState?.hearingId
        ? [this.hearingMoveState.hearingId]
        : undefined
    });
  }

  movePosition() {
    this.actionClicked.emit({
      action: 'move',
      hearingId: this.hearing.id,
      rowIdentifier: this.hearing.rowIdentifier,
      hearingDate: this.hearing.hearingDate,
      rows: this.group
    });
  }

  canceMove() {
    this.undoHearingMoveClicked.emit();
  }

  @HostListener('click', ['$event'])
  preventDefault(event: MouseEvent) {
    event.stopPropagation();
  }
}
