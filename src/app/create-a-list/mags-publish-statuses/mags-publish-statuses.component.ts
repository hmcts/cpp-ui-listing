import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  viewChildren,
  afterRenderEffect
} from '@angular/core';
import { PdkContextPanelComponent, PdkMarginDirective } from '@cpp/pdk';
import { MagsPublishListVM } from '../models/mags-publish-list.vm';
import { PublishStatusTitlePipe } from '../pipes/publish-status-title.pipe';
import { PublishStatusMessagePipe } from '../pipes/publish-status-message.pipe';
import { PublishStatusPanelConfigPipe } from '../pipes/publish-status-panel-config.pipe';
import { MagsPublishStatus } from '../models';
import { asapScheduler } from 'rxjs';

@Component({
  selector: 'mags-publish-statuses',
  templateUrl: './mags-publish-statuses.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PdkContextPanelComponent,
    PublishStatusTitlePipe,
    PublishStatusMessagePipe,
    PublishStatusPanelConfigPipe,
    PdkMarginDirective
  ],
  styles: `
    .panel,
    .panel-list {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }
    .panel:focus-visible {
      outline: none;
      scroll-margin-top: 100px;
    }
    .panel-list {
      gap: 10px;
    }
  `
})
export class MagsPublishStatusesComponent {
  readonly statuses = input.required<MagsPublishListVM[]>();
  readonly magsPublishStatus = MagsPublishStatus;

  readonly panelRefs = viewChildren<unknown, ElementRef<HTMLElement>>('panel', {
    read: ElementRef
  });

  constructor() {
    afterRenderEffect({
      write: (onCleanup) => {
        const panels = this.panelRefs();
        const first = panels?.length ? panels[0] : null;
        if (first?.nativeElement) {
          const el = first.nativeElement as HTMLElement;
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const scheduled = asapScheduler.schedule(() => {
            if (el.getAttribute('tabindex') == null) {
              el.setAttribute('tabindex', '-1');
            }
            el.focus({ preventScroll: true });
          }, 500);
          onCleanup(() => scheduled.unsubscribe());
        }
      }
    });
  }
}
