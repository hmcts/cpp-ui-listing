import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef } from '@angular/core';
import { PdkModule } from '@cpp/pdk';
import {
  ColumnConfig,
  BaseHearingRowDataVM,
  TableContext
} from 'src/app/court-calendar/model/hearing-table-renderer.vm';

@Component({
  selector: 'tbody[rows-body]',
  templateUrl: './rows-body-renderer.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: [
    'actionCellRenderer',
    'cellRenderers',
    'rows',
    'columnConfig',
    'rowIsActionable',
    'defaultCell',
    'emptyCell'
  ],
  imports: [PdkModule, CommonModule]
})
export class RowsBodyRendererComponent<S, T extends BaseHearingRowDataVM> {
  actionCellRenderer?: TemplateRef<TableContext<S, T>>;
  cellRenderers: Record<keyof T, TemplateRef<TableContext<S, T>>>;
  columnConfig: ColumnConfig<T>;
  rows: T;
  rowIsActionable: boolean;
  defaultCell: TemplateRef<TableContext<S, T>>;
  emptyCell: TemplateRef<TableContext<S, T>>;
}
