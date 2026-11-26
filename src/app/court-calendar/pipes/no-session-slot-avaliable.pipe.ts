import { Pipe, PipeTransform } from '@angular/core';
import { SelectedHearingState } from '../court-calendar-hearing-tables/component-store/hearing-table-actions.store';
import { AllocatedWidgetCourtroomCalendarVm, CourtRoomSessionCalendar } from '../model';
import { DisplayBusinessTypeAllocatePipe } from './display-business-type-allocate.pipe';

@Pipe({ name: 'noSessionSlotAvaliable' })
export class NoSessionSlotAvaliablePipe implements PipeTransform {
  private displayBusinessTypeAllocatePipe = new DisplayBusinessTypeAllocatePipe();
  transform(
    selectedHearings: SelectedHearingState[],
    sections: AllocatedWidgetCourtroomCalendarVm[],
    eligibleScheduleIds?: string[] | null
  ): boolean {
    if (!selectedHearings.length || !sections.length || eligibleScheduleIds === undefined) {
      return false;
    }

    const slots = sections.flatMap(({ businessTypeCalendar }) =>
      businessTypeCalendar.flatMap(({ sessions }) => sessions.map(({ slot }) => slot))
    ) as CourtRoomSessionCalendar['slot'][];

    return slots.every(
      slot =>
        !this.displayBusinessTypeAllocatePipe.transform(selectedHearings, slot, eligibleScheduleIds)
    );
  }
}
