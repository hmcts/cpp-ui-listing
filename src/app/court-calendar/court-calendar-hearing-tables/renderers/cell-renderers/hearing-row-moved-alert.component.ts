import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Signal,
  viewChild
} from '@angular/core';
import { HearingRowVM } from '../../../model';
import { PdkAlertComponent, PdkCore } from '@cpp/pdk';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'hearing-row-moved-alert',
  template: `
    <pdk-alert #alert icon="true" type="success">
      <span
        >Hearing
        <span pdk-visually-hidden
          >for case urn {{ hearingRow.defendants.caseUrn }} holding on
          {{ hearingRow.dateTime | date: 'dd MMMM yyyy' }} at
          {{ hearingRow.dateTime | date: 'HH:mm a' }} has been</span
        >
        moved successfully</span
      >
    </pdk-alert>
  `,
  styles: `
    pdk-alert {
      scroll-margin-top: 120px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['hearingRow'],
  imports: [PdkCore, PdkAlertComponent, DatePipe]
})
export class HearingRowMovedAlertComponent {
  hearingRow: HearingRowVM;
  alert: Signal<ElementRef<HTMLElement>> = viewChild('alert', { read: ElementRef<HTMLElement> });

  constructor() {
    afterNextRender({
      read: () => {
        const alertElement = this.alert();
        if (alertElement?.nativeElement?.scrollIntoView) {
          alertElement.nativeElement.scrollIntoView({ behavior: 'auto', block: 'nearest' });
        }
      }
    });
  }
}
