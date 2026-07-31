import { Component, input } from '@angular/core';
import { PdkCore, PdkGrid, PdkTagComponent } from '@cpp/pdk';
import { ChangeCourtroomVM } from '../../../model';
import { DatePipe, LowerCasePipe } from '@angular/common';

@Component({
  selector: 'hearing-details-section',
  templateUrl: './hearing-details-section.component.html',
  styles: [
    `
      dl > div {
        border-bottom: 1px solid;
      }
    `
  ],
  imports: [PdkCore, PdkGrid, PdkTagComponent, DatePipe, LowerCasePipe]
})
export class HearingDetailsSectionComponent {
  readonly hearingVM = input<ChangeCourtroomVM | null>(null);
  readonly baseUrl = input<string>(undefined);
}
