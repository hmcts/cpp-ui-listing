import { ChangeDetectionStrategy, Component, TemplateRef } from '@angular/core';
import {
  ColumnConfig,
  PickPropertyKeys,
  BaseHearingRowDataVM,
  RowGroupsConfig,
  TableContext,
  CourtCalendarGenericRecord,
  RowGroupDataConfig
} from '../../../model/hearing-table-renderer.vm';
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
    'sectionHeaderSpan',
    'rowIsexpandable',
    'hearingMovestate',
    'positionedHearingsState',
    'sectionHeaderIdentifier',
    'rowGroupsHeaderIdentifier'
  ],
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
export class RowGroupBodyRendererComponent<
  S extends CourtCalendarGenericRecord,
  T extends BaseHearingRowDataVM
> {
  rowGroupHeaderCellRenderer?: TemplateRef<TableContext<S, T>>;
  section: S;
  defaultCell: TemplateRef<TableContext<S, T>>;
  actionCellRenderer?: TemplateRef<TableContext<S, T>>;
  cellRenderers: Record<keyof T, TemplateRef<TableContext<S, T>>>;
  expandedDetailsRenderer?: TemplateRef<TableContext<S, T>>;
  moveAlertRenderer: TemplateRef<TableContext<S, T>>;
  columnConfig: ColumnConfig<T>;
  rowGroupsConfig: RowGroupsConfig<S, keyof S, PickPropertyKeys<S, keyof S>>;
  rowGroup: Record<
    RowGroupDataConfig<S, keyof S, PickPropertyKeys<S, keyof S>>['rowsDataPath'],
    T[]
  >;
  rowIsActionable: boolean;
  sectionHeaderSpan: number;
  rowIsexpandable: boolean;
  hearingMovestate: HearingTableActionsState['moveState'];
  positionedHearingsState: HearingTableActionsState['positionedHearingsState'];
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
