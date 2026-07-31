import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  OnInit
} from '@angular/core';
import { PdkButtonModule, PdkCoreModule } from '@cpp/pdk';
import {
  HearingTableActionsState,
  MoveEvent
} from '../../hearing-tablecomponent-store/hearing-table-actions.store';
import {
  HearingDropdownActions,
  HearingRowActionDropdownComponent,
  HearingRowActionItem
} from '../../hearing-row-actions-dropdown/hearing-row-actions-dropdown.component';
import {
  IsHearingBeingMovedPipe,
  IsNonMovingMemberOfHearingsGroupPipe
} from '../../pipes/move-hearing-action.pipes';
import { BaseHearingRowDataVM } from 'src/app/court-calendar/model/hearing-table-renderer.vm';

export interface HearingActionsEvent {
  hearingId: string;
  action: HearingDropdownActions;
  rowIdentifier?: string;
  hearingDate: string;
  rows: BaseHearingRowDataVM[];
}

@Component({
  selector: 'actions-cell, [actions-cell]',
  template: `
    <div data-test-id="actions-cell">
      <hearing-row-action-dropdown
        *ngIf="!hearingMoveState"
        name="Action"
        menuAlign="right"
        [options]="actionOptions"
        (itemClicked)="onClickDropDownAction($event)"
      >
      </hearing-row-action-dropdown>

      <div class="buttons-display" *ngIf="hearingMoveState">
        <ng-container *ngIf="hearing | isNonMovingMemberOfHearingsGroup : hearingMoveState">
          <button
            pdk-button
            pdk-margin-bottom="2"
            *ngIf="shouldInsertBefore"
            (click)="insertHearingBefore()"
          >
            Insert before
          </button>
          <button
            pdk-button
            pdk-margin-bottom="0"
            *ngIf="shouldInsertAfter"
            (click)="insertHearingAfter()"
          >
            Insert after
          </button>
        </ng-container>
        <button
          pdk-button="secondary"
          *ngIf="hearing | hearingRowToBeMoved : hearingMoveState"
          (click)="canceMove()"
        >
          Cancel
        </button>
      </div>
    </div>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['hearingMoveState', 'group', 'hearing'],
  outputs: ['actionClicked', 'undoHearingMoveClicked', 'onMove'],
  imports: [
    CommonModule,
    HearingRowActionDropdownComponent,
    PdkButtonModule,
    PdkCoreModule,
    IsHearingBeingMovedPipe,
    IsNonMovingMemberOfHearingsGroupPipe
  ],
  styles: [
    `
      .buttons-display {
        display: flex;
        flex-direction: column;
        width: 132px;
      }
    `
  ]
})
export class ActionsCellComponent implements OnInit {
  hearingMoveState: HearingTableActionsState['moveState'];
  group: BaseHearingRowDataVM[];
  hearing: BaseHearingRowDataVM;
  actionClicked = new EventEmitter<HearingActionsEvent>();
  undoHearingMoveClicked = new EventEmitter<void>();
  onMove = new EventEmitter<MoveEvent>();
  actionOptions: HearingRowActionItem[] = [
    { label: 'Move position', value: 'move' },
    { label: 'Edit', value: 'edit' }
  ];

  get masterRows(): BaseHearingRowDataVM[] {
    return this.group.filter((row) => row.isMaster);
  }

  get shouldInsertBefore() {
    return this.masterRows.findIndex(({ id }) => id === this.hearing.id) === 0;
  }

  get shouldInsertAfter() {
    const hearingIndex = this.masterRows.findIndex(({ id }) => id === this.hearing.id);
    const hearingToMoveIndex = this.masterRows.findIndex(
      ({ id }) => id === this.hearingMoveState.hearingId
    );
    return hearingIndex !== hearingToMoveIndex - 1;
  }

  ngOnInit(): void {
    const hearingDays = this.hearing.details?.hearingDays ?? [];
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const hasPastHearing =
      hearingDays.length > 1 &&
      hearingDays.some(({ hearingDate }) => {
        const dateToCompare = new Date(hearingDate);
        dateToCompare.setHours(0, 0, 0, 0);
        return dateToCompare.getTime() < currentDate.getTime();
      });
    if (!hasPastHearing) {
      this.actionOptions.push({ label: 'Remove', value: 'remove' });
    }
  }

  insertHearingBefore() {
    this.onMove.emit({
      insertBeforeId: this.hearing.id,
      hearingToMoveId: this.hearingMoveState.hearingId
    });
  }

  insertHearingAfter() {
    this.onMove.emit({
      insertafterId: this.hearing.id,
      hearingToMoveId: this.hearingMoveState.hearingId
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
