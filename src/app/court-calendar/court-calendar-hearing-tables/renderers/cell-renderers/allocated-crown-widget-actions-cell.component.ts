import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  OnInit
} from '@angular/core';
import {
  HearingTableActionsState,
  MoveEvent
} from '../../component-store/hearing-table-actions.store';
import { HearingRowActionItem } from '../../shared/hearing-row-actions-dropdown/hearing-row-actions-dropdown.component';

import { BaseHearingRowDataVM } from '../../../model/hearing-table-renderer.vm';
import { ActionsCellComponent, HearingActionsEvent } from './action-cell.component';
import { MoveHearingsButtonsComponent } from './move-hearing-positions-buttons.component';

import { dateIsCurrentOrGreaterThan } from '../../../utils/court-calendar-hearings-helper';

@Component({
  selector: 'allocated-crown-widget-actions-cell, [allocated-crown-widget-actions-cell]',
  template: `
    <div data-test-id="allocated-crown-widget-actions">
      @if (!sectionInAllocateState) {
        <actions-cell
          [hearingMoveState]="hearingMoveState"
          [group]="group"
          [hearing]="hearing"
          [actionOptions]="actionOptions"
          (actionClicked)="actionClicked.emit($event)"
          (undoHearingMoveClicked)="undoHearingMoveClicked.emit($event)"
          (onMove)="onMove.emit($event)"
        ></actions-cell>
      }

      @if (displayAllocateOptions) {
        <move-hearings-position-buttons
          [group]="group"
          [hearingId]="hearing?.id"
          (insertBefore)="allocateBefore()"
          (insertAfter)="allocateAfter()"
        >
          <span insert-before>Allocate before </span>
          <span insert-after>Allocate after</span>
        </move-hearings-position-buttons>
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
  outputs: ['actionClicked', 'undoHearingMoveClicked', 'onMove', 'onAllocateAndMove'],
  imports: [ActionsCellComponent, MoveHearingsButtonsComponent]
})
export class AllocatedCrownWidgetActionsCellComponent implements OnInit {
  hearingMoveState: HearingTableActionsState['moveState'];
  group: BaseHearingRowDataVM[];
  hearing: BaseHearingRowDataVM;
  displayAllocateOptions = false;
  sectionInAllocateState = false;
  actionClicked = new EventEmitter<HearingActionsEvent>();
  undoHearingMoveClicked = new EventEmitter<void>();
  onMove = new EventEmitter<MoveEvent>();
  onAllocateAndMove = new EventEmitter<MoveEvent>();
  actionOptions: HearingRowActionItem[] = [{ label: 'Move position', value: 'move' }];

  ngOnInit(): void {
    const { hearingDayCount, startDate } = this.hearing.details;
    const hasPastHearing = hearingDayCount > 1 && !dateIsCurrentOrGreaterThan(startDate);
    if (!hasPastHearing) {
      this.actionOptions.push({ label: 'Unallocate', value: 'unallocate' });
    }
  }

  allocateBefore() {
    this.onAllocateAndMove.emit({
      insertBeforeId: this.hearing.id
    });
  }

  allocateAfter() {
    this.onAllocateAndMove.emit({
      insertafterId: this.hearing.id
    });
  }

  @HostListener('click', ['$event'])
  preventDefault(event: MouseEvent) {
    event.stopPropagation();
  }
}
