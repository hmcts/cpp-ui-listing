import { Pipe, PipeTransform } from '@angular/core';
import { BaseHearingRowDataVM } from '../model/hearing-table-renderer.vm';
import { HearingTableActionsState } from '../court-calendar-hearing-tables/component-store/hearing-table-actions.store';

@Pipe({ name: 'hearingRowToBeMoved' })
export class IsHearingBeingMovedPipe implements PipeTransform {
  transform(row: BaseHearingRowDataVM, moveState: HearingTableActionsState['moveState']): boolean {
    return (
      row.rowIdentifier === moveState?.rowIdentifier ||
      (row.id === moveState?.hearingId && row.isChild && row.hearingDate === moveState?.hearingDate)
    );
  }
}

@Pipe({ name: 'hearingRowPositionedSuccess' })
export class HearingHasMovedPipe implements PipeTransform {
  transform(
    row: BaseHearingRowDataVM,
    positionedHearingState: HearingTableActionsState['positionedHearingsState']
  ): boolean {
    const { positionedHearings } = positionedHearingState ?? { positionedHearings: [] };
    return (positionedHearings ?? []).some(
      ({ hearingId, hearingDate }) => row.id === hearingId && row.hearingDate === hearingDate
    );
  }
}

@Pipe({ name: 'isNonMovingMemberOfHearingsGroup' })
export class IsNonMovingMemberOfHearingsGroupPipe implements PipeTransform {
  isCurrentHearingBeingMoved = new IsHearingBeingMovedPipe();
  transform(
    hearing: BaseHearingRowDataVM,
    moveState: HearingTableActionsState['moveState']
  ): boolean {
    return (
      !this.isCurrentHearingBeingMoved.transform(hearing, moveState) &&
      moveState?.rows?.some(
        ({ rowIdentifier }) => hearing.isMaster && hearing.rowIdentifier === rowIdentifier
      )
    );
  }
}
