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
import {
  dateIsCurrentOrGreaterThan,
  isEligibleForEndDateChange
} from '../../../utils/court-calendar-hearings-helper';

const MAGISTRATE_EXTRA_OPTIONS: HearingRowActionItem[] = [
  { label: 'Reallocate', value: 'reallocate' },
  { label: 'Remove', value: 'remove' }
];

const CROWN_EXTRA_OPTIONS: HearingRowActionItem[] = [
  { label: 'Reallocate', value: 'reallocate' },
  { label: 'Unallocate', value: 'unallocate' },
  { label: 'Remove', value: 'remove' }
];

@Component({
  selector: 'allocated-hearings-actions-cell, [allocated-hearings-actions-cell]',
  template: `
    <div data-test-id="allocated-hearings-actions">
      <actions-cell
        [hearingMoveState]="hearingMoveState"
        [group]="group"
        [hearing]="hearing"
        [actionOptions]="actionOptions"
        (actionClicked)="actionClicked.emit($event)"
        (undoHearingMoveClicked)="undoHearingMoveClicked.emit($event)"
        (onMove)="onMove.emit($event)"
      ></actions-cell>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['hearingMoveState', 'group', 'hearing'],
  outputs: ['actionClicked', 'undoHearingMoveClicked', 'onMove'],
  imports: [ActionsCellComponent]
})
export class AllocatedHearingsActionsCellComponent implements OnInit {
  hearingMoveState: HearingTableActionsState['moveState'];
  group: BaseHearingRowDataVM[];
  hearing: BaseHearingRowDataVM;
  actionClicked = new EventEmitter<HearingActionsEvent>();
  undoHearingMoveClicked = new EventEmitter<void>();
  onMove = new EventEmitter<MoveEvent>();
  actionOptions: HearingRowActionItem[] = [
    { label: 'Edit', value: 'edit' },
    { label: 'Move position', value: 'move' }
  ];

  ngOnInit(): void {
    if (isEligibleForEndDateChange(this.hearing.details)) {
      this.actionOptions = [{ label: 'Change end date', value: 'change-end-date' }];
      return;
    }

    const { hearingDayCount, startDate, endDate } = this.hearing.details;
    const { jurisdictionType } = this.hearing.details;
    const hasPastHearing = hearingDayCount > 1 && !dateIsCurrentOrGreaterThan(startDate);
    const isMultidayMag = jurisdictionType !== 'CROWN' && hearingDayCount > 1;
    if (!hasPastHearing) {
      const baseOptions =
        jurisdictionType === 'CROWN' ? CROWN_EXTRA_OPTIONS : MAGISTRATE_EXTRA_OPTIONS;

      const extraOptions = baseOptions.filter(({ value }) => {
        if (value === 'remove' && this.hearing.details?.resulted === true) {
          return false;
        }
        if (value === 'reallocate' && isMultidayMag) {
          return false;
        }
        return true;
      });
      this.actionOptions.push(...extraOptions);
    }

    const canChangeCourtroom =
      jurisdictionType === 'CROWN' && hearingDayCount > 1 && dateIsCurrentOrGreaterThan(endDate);

    if (canChangeCourtroom) {
      this.actionOptions.push({ label: 'Change courtroom', value: 'change' });
    }

    if (this.hearing.checkSplit) {
      this.actionOptions.push({ label: 'Split', value: 'split' });
    }
  }

  @HostListener('click', ['$event'])
  preventDefault(event: MouseEvent) {
    event.stopPropagation();
  }
}
