import { AfterViewInit, Component, ElementRef, ViewChild, input } from '@angular/core';
import {
  ContextPanelType,
  ContextPanelIconType,
  PdkContextPanelComponent,
  PdkCore
} from '@cpp/pdk';

@Component({
  selector: 'court-calendar-alert-panel',
  template: `
    @if (message) {
      <pdk-context-panel
        #alert
        class="flex-column-display"
        pdk-margin-top="2"
        [icon]="icon"
        [type]="alertType"
        [title]="title"
      >
        <span data-test-id="success-alert-message"> {{ message }} </span>
      </pdk-context-panel>
    }
  `,
  imports: [PdkContextPanelComponent, PdkCore],
  styles: [
    `
      .flex-column-display {
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }
    `
  ]
})
export class CourtCalendarAlertComponent implements AfterViewInit {
  readonly alertEntity = input<{
    successAlert?: string;
    failureAlert?: string;
  }>(undefined);

  readonly shouldFocus = input(false);

  @ViewChild('alert', { read: ElementRef<HTMLElement> }) alert: ElementRef<HTMLElement>;

  get alertType(): ContextPanelType {
    return this.alertEntity().successAlert ? 'success' : 'invalid';
  }

  get title(): string {
    return this.alertEntity().successAlert ? 'Success' : 'There is a problem';
  }

  get message() {
    const alertEntity = this.alertEntity();
    return alertEntity?.successAlert || alertEntity?.failureAlert;
  }

  get icon(): ContextPanelIconType {
    return this.alertEntity()?.successAlert ? 'tick' : 'warn';
  }

  ngAfterViewInit() {
    if (this.shouldFocus()) {
      this.scrollIntoView();
    }
  }

  scrollIntoView() {
    if (this.alert && this.alert?.nativeElement?.scrollIntoView) {
      // after a quarter of a second we set the scroll to view to help accessibility
      // if we do inmediately the interface will scroll erratically
      setTimeout(
        () => this.alert.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        250
      );
    }
  }
}
