import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'allHearingDaysSelected'
})
export class AllHearingDaysSelectedPipe implements PipeTransform {
  transform(currentPageDates: string[] = [], selectedDates: string[] = []): boolean {
    return currentPageDates.every((date) => selectedDates?.includes(date));
  }
}
