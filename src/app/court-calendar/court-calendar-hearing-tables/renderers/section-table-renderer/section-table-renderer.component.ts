import { Component, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { ToArrayPipe } from '../../../../shared/pipes/to-array.pipe';
import {
  ColumnConfig,
  HearingTableSectionConfig,
  PickPropertyKeys,
  BaseHearingRowDataVM,
  TableContext,
  BaseHearingSection
} from '../../../model/hearing-table-renderer.vm';
import { HearingTableActionsState } from '../../component-store/hearing-table-actions.store';
import { RowGroupBodyRendererComponent } from '../row-groups-body-renderer/row-groups-body-renderer.component';
import { PdkCore, PdkTable } from '@cpp/pdk';
import { NgStyle, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: '[section-table-renderer], section-table-renderer',
  templateUrl: './section-table-renderer.component.html',
  imports: [
    RowGroupBodyRendererComponent,
    ToArrayPipe,
    PdkTable,
    PdkCore,
    NgStyle,
    NgTemplateOutlet
  ],
  inputs: [
    'sectionHeaderRenderer',
    'rowGroupHeaderCellRenderer',
    'actionCellRenderer',
    'customCellHeaderRenderers',
    'expandedDetailsRenderer',
    'moveAlertRenderer',
    'cellRenderers',
    'sections',
    'columnConfig',
    'sectionConfig',
    'hearingMovestate',
    'positionedHearingsState'
  ],
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      section-table-renderer .govuk-checkboxes__item,
      *[section-table-renderer] .govuk-checkboxes__item {
        top: -6px !important;
      }
    `
  ]
})
export class SectionTableRendererComponent<
  S extends BaseHearingSection,
  T extends BaseHearingRowDataVM
> implements OnInit
{
  sectionHeaderRenderer?: TemplateRef<TableContext<S, T>>;
  rowGroupHeaderCellRenderer?: TemplateRef<TableContext<S, T>>;
  actionCellRenderer?: TemplateRef<TableContext<S, T>>;
  expandedDetailsRenderer?: TemplateRef<TableContext<S, T>>;
  moveAlertRenderer: TemplateRef<TableContext<S, T>>;
  customCellHeaderRenderers?: Record<keyof T, TemplateRef<TableContext<S, T>>>;
  cellRenderers?: Record<keyof T, TemplateRef<TableContext<S, T>>>;
  sections: S[];
  columnConfig: ColumnConfig<T>;
  sectionConfig: HearingTableSectionConfig<S, keyof S, PickPropertyKeys<S, keyof S>>;
  sectionHeaderSpan: number;
  hearingMovestate: HearingTableActionsState['moveState'];
  positionedHearingsState: HearingTableActionsState['positionedHearingsState'];

  ngOnInit(): void {
    this.sectionHeaderSpan = this.columnConfig.length;
    if (this.sectionConfig.actionable && this.actionCellRenderer) {
      this.sectionHeaderSpan += 1;
    }
    if (this.sectionConfig.rowsAreExpandable) {
      this.sectionHeaderSpan += 1;
    }
  }
}
