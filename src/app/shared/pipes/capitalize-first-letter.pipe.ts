import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'capitalizeFirstLetter' })
export class CapitalizeFirstLetterPipe implements PipeTransform {
  transform(value: string) {
    if (typeof value !== 'string') {
      throw new Error('Requires a string as input');
    }
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}
