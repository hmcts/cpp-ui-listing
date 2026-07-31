import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef } from '@angular/core';
import { PdkModule } from '@cpp/pdk';
import {
  ColumnConfig,
  PickPropertyKeys,
  BaseHearingRowDataVM,
  RowGroupsConfig,
  TableContext,
  HearingTableData
} from '../../../../court-calendar/model/hearing-table-renderer.vm';
import { HearingTableActionsState } from '../../hearing-tablecomponent-store/hearing-table-actions.store';
import {
  HearingHasMovedPipe,
  IsHearingBeingMovedPipe
} from '../../pipes/move-hearing-action.pipes';

@Component({
  selector: 'tbody[row-group-body]',
  templateUrl: './row-groups-body-renderer.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: [
    'section',
    'rowGroupHeaderCellRenderer',
    'actionCellRenderer',
    'expandedDetailsRenderer',
    'moveAlertRenderer',
    'cellRenderers',
    'rowGroup',
    'columnConfig',
    'rowGroupsConfig',
    'rowIsActionable',
    'defaultCell',
    'emptyCell',
    'sectionHeaderSpan',
    'rowIsexpandable',
    'hearingMovestate',
    'sequencedHearing',
    'sectionHeaderIdentifier',
    'rowGroupsHeaderIdentifier'
  ],
  imports: [PdkModule, CommonModule, IsHearingBeingMovedPipe, HearingHasMovedPipe],
  styleUrls: ['./row-groups-body-renderer.component.scss']
})
export class RowGroupBodyRendererComponent<
  S extends HearingTableData,
  T extends BaseHearingRowDataVM
> {
  rowGroupHeaderCellRenderer?: TemplateRef<TableContext<S, T>>;
  section: S;
  defaultCell: TemplateRef<TableContext<S, T>>;
  emptyCell: TemplateRef<TableContext<S, T>>;
  actionCellRenderer?: TemplateRef<TableContext<S, T>>;
  cellRenderers: Record<keyof T, TemplateRef<TableContext<S, T>>>;
  expandedDetailsRenderer?: TemplateRef<TableContext<S, T>>;
  moveAlertRenderer: TemplateRef<TableContext<S, T>>;
  columnConfig: ColumnConfig<T>;
  rowGroupsConfig: RowGroupsConfig<S, keyof S, PickPropertyKeys<S, keyof S>>;
  rowGroup: T;
  rowIsActionable: boolean;
  sectionHeaderSpan: number;
  rowIsexpandable: boolean;
  hearingMovestate: HearingTableActionsState['moveState'];
  sequencedHearing: HearingTableActionsState['sequenceSuccessState'];
  toggleRecord: Record<string, boolean> = {};
  sectionHeaderIdentifier: string;
  rowGroupsHeaderIdentifier = '';

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
