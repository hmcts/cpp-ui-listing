import { ChangeDetectionStrategy, Component, EventEmitter, HostListener } from '@angular/core';
import { PdkButton, PdkCore } from '@cpp/pdk';
import {
  HearingTableActionsState,
  MoveEvent
} from '../../component-store/hearing-table-actions.store';
import {
  HearingDropdownActions,
  HearingRowActionDropdownComponent,
  HearingRowActionItem
} from '../../shared/hearing-row-actions-dropdown/hearing-row-actions-dropdown.component';
import {
  IsHearingBeingMovedPipe,
  IsNonMovingMemberOfHearingsGroupPipe
} from '../../../pipes/move-hearing-action.pipes';
import { BaseHearingRowDataVM } from '../../../model/hearing-table-renderer.vm';
import { MoveHearingsButtonsComponent } from './move-hearing-positions-buttons.component';

export interface HearingActionsEvent {
  hearingId: string;
  action: HearingDropdownActions;
  rowIdentifier?: string;
  hearingDate: string;
  rows: BaseHearingRowDataVM[];
  hearingDateTime?: string;
}

@Component({
  selector: 'actions-cell, [actions-cell]',
  template: `
    <div data-test-id="actions-cell">
      @if (!hearingMoveState) {
        <hearing-row-action-dropdown
          name="Action"
          menuAlign="right"
          [options]="actionOptions"
          (itemClicked)="onClickDropDownAction($event)"
        >
        </hearing-row-action-dropdown>
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
  inputs: ['hearingMoveState', 'group', 'hearing', 'actionOptions'],
  outputs: ['actionClicked', 'undoHearingMoveClicked', 'onMove'],
  imports: [
    HearingRowActionDropdownComponent,
    PdkButton,
    PdkCore,
    IsHearingBeingMovedPipe,
    IsNonMovingMemberOfHearingsGroupPipe,
    MoveHearingsButtonsComponent
  ],
  styles: [
    `
      .cancel-button {
        min-width: 132px;
        max-width: 160px;
      }
    `
  ]
})
export class ActionsCellComponent {
  hearingMoveState: HearingTableActionsState['moveState'];
  group: BaseHearingRowDataVM[];
  hearing: BaseHearingRowDataVM;
  actionClicked = new EventEmitter<HearingActionsEvent>();
  undoHearingMoveClicked = new EventEmitter<void>();
  onMove = new EventEmitter<MoveEvent>();
  actionOptions: HearingRowActionItem[] = [];

  get masterRows(): BaseHearingRowDataVM[] {
    return this.group.filter((row) => row.isMaster);
  }

  get shouldInsertBefore() {
    return this.masterRows.findIndex(({ id }) => id === this.hearing.id) === 0;
  }

  get shouldInsertAfter() {
    const hearingIndex = this.masterRows.findIndex(({ id }) => id === this.hearing.id);
    if (this.hearingMoveState?.hearingId) {
      const hearingToMoveIndex = this.masterRows.findIndex(
        ({ id }) => id === this.hearingMoveState?.hearingId
      );
      return hearingIndex !== hearingToMoveIndex - 1;
    }
    return hearingIndex >= 0;
  }

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

  canceMove() {
    this.undoHearingMoveClicked.emit();
  }

  onClickDropDownAction(action: HearingDropdownActions) {
    this.actionClicked.emit({
      action,
      hearingId: this.hearing.id,
      rowIdentifier: this.hearing.rowIdentifier,
      hearingDate: this.hearing.hearingDate,
      rows: this.group
    });
  }

  @HostListener('click', ['$event'])
  preventDefault(event: MouseEvent) {
    event.stopPropagation();
  }
}
