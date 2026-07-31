import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'bailStatus' })
export class BailStatusPipe implements PipeTransform {
  bailStatusMap = {
    CONDITIONAL: 'Conditional',
    UNCONDITIONAL: 'Unconditional',
    IN_CUSTODY: 'In custody'
  };

  transform(value: string): string {
    return this.bailStatusMap[value] || '';
  }
}
