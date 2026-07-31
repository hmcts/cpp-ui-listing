import { Pipe, PipeTransform } from '@angular/core';
import { HearingRowVM } from '../model';

@Pipe({ name: 'hearingsAreInEligibleToSelect' })
export class HearingsAreInEligibleToSelectPipe implements PipeTransform {
  transform(hearingRows: HearingRowVM[] = []): boolean {
    return hearingRows.every(({ isMaster, isDisabled }) => isMaster && isDisabled);
  }
}
