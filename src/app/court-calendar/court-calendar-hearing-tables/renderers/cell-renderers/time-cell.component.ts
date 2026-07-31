import { DatePipe, LowerCasePipe, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'time-cell',
  template: `
    <b [ngStyle]="{ 'white-space': 'nowrap' }">{{ dateTime | date: 'hh:mma' | lowercase }} </b>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['dateTime'],
  imports: [DatePipe, NgStyle, LowerCasePipe]
})
export class TimeCellComponent {
  dateTime: string;
}
