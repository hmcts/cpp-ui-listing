import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'plusMore' })
export class PlusMorePipe implements PipeTransform {
  transform(allItems: any[]): string {
    if (!allItems || allItems.length < 1) {
      return '';
    }
    return `+ ${allItems.length} more`;
  }
}
