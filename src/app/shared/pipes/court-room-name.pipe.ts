import { Pipe, PipeTransform } from '@angular/core';
import { SelectOption } from '@cpp/pdk';

@Pipe({
  name: 'courtRoomName'
})
export class CourtRoomNamePipe implements PipeTransform {
  transform(courtRoomId: string, courtRoomOptions: SelectOption<string>[]): string {
    if (courtRoomId === null || courtRoomId === undefined) {
      return '';
    }
    return courtRoomOptions?.find((cRoom) => cRoom?.value === courtRoomId)?.label;
  }
}
