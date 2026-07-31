import { Pipe, PipeTransform } from '@angular/core';
import { SelectedHearingState } from '../court-calendar-hearing-tables/component-store/hearing-table-actions.store';
import { CourtRoomBusinessTypeCalendar, MagsWidgetCourtroomCalendarVm } from '../model';
import { DisplayBusinessTypeAllocatePipe } from './display-business-type-allocate.pipe';

@Pipe({ name: 'noSessionSlotAvaliable' })
export class NoSessionSlotAvaliablePipe implements PipeTransform {
  private displayBusinessTypeAllocatePipe = new DisplayBusinessTypeAllocatePipe();
  transform(
    selectedHearings: SelectedHearingState[],
    sections: MagsWidgetCourtroomCalendarVm[]
  ): boolean {
    if (!selectedHearings.length || !sections.length) {
      return false;
    }

    const businessSlots = sections.reduce(
      (businessTypeAndSlots, { businessTypeCalendar }) => {
        return [
          ...businessTypeAndSlots,
          ...businessTypeCalendar.map(({ businessTypeAndSlot }) => businessTypeAndSlot)
        ];
      },
      [] as CourtRoomBusinessTypeCalendar['businessTypeAndSlot'][]
    );

    return businessSlots.every(
      (slot) => !this.displayBusinessTypeAllocatePipe.transform(selectedHearings, slot)
    );
  }
}
