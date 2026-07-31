import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'toArray'
})
export class ToArrayPipe implements PipeTransform {
  transform(value: unknown | unknown[]) {
    if (!!value) {
      return Array.isArray(value) ? value : [value];
    }
    return [];
  }
}
