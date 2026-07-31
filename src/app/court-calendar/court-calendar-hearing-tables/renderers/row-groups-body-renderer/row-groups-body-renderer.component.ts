import { ChangeDetectionStrategy, Component, TemplateRef, input } from '@angular/core';
import {
  BaseHearingRowDataVM,
  HearingsColumnConfig,
  HearingsTableContext
} from '../../../model/hearing-table-renderer.interfaces';
import { HearingTableActionsState } from '../../component-store/hearing-table-actions.store';
import {
  HearingHasMovedPipe,
  IsHearingBeingMovedPipe
} from '../../../pipes/move-hearing-action.pipes';
import { PdkCore, PdkTable } from '@cpp/pdk';
import { NgStyle, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'tbody[row-group-body]',
  templateUrl: './row-groups-body-renderer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IsHearingBeingMovedPipe,
    HearingHasMovedPipe,
    PdkTable,
    PdkCore,
    NgTemplateOutlet,
    NgStyle
  ],
  styleUrls: ['./row-groups-body-renderer.component.scss']
})
export class RowGroupBodyRendererComponent {
  readonly section = input<Record<string, unknown>>();
  readonly actionCellRenderer = input<TemplateRef<HearingsTableContext>>();
  readonly expandedDetailsRenderer = input<TemplateRef<HearingsTableContext>>();
  readonly moveAlertRenderer = input<TemplateRef<HearingsTableContext>>();
  readonly defaultCell = input<TemplateRef<HearingsTableContext>>();
  readonly cellRenderers = input<Record<string, TemplateRef<HearingsTableContext>>>();
  readonly rowGroup = input<Record<string, unknown>>();
  readonly columnConfig = input<HearingsColumnConfig<BaseHearingRowDataVM>>();
  readonly rowsPath = input<string>();
  readonly ariaLevel = input<number>(1);
  readonly rowIsActionable = input<boolean>();
  readonly sectionHeaderSpan = input<number>();
  readonly rowIsexpandable = input<boolean>();
  readonly hearingMovestate = input<HearingTableActionsState['moveState']>();
  readonly positionedHearingsState = input<HearingTableActionsState['positionedHearingsState']>();
  readonly failedAllocationIds = input<string[]>();
  readonly levelHeaderIds = input<string>('');

  toggleRecord: Record<string, boolean> = {};

  toggleRow(rowId: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (this.toggleRecord[rowId] !== undefined) {
      this.toggleRecord[rowId] = !this.toggleRecord[rowId];
    } else {
      this.toggleRecord[rowId] = true;
    }
  }
}
