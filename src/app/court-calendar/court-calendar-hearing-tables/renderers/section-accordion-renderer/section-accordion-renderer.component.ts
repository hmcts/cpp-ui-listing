import { Component, EventEmitter, OnInit, TemplateRef } from '@angular/core';
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
import { SectionTitleResolverPipe } from '../../../pipes/section-title-resolver.pipe';
import { SectionTableRendererComponent } from '../section-table-renderer/section-table-renderer.component';
import { PdkAccordion, PdkCore } from '@cpp/pdk';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: '[section-accordion-renderer], section-accordion-renderer',
  templateUrl: './section-accordion-renderer.component.html',
  imports: [
    SectionTitleResolverPipe,
    SectionTableRendererComponent,
    ToArrayPipe,
    PdkAccordion,
    PdkCore,
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
    'positionedHearingsState',
    'titleResolver',
    'sectionOpenState',
    'accordionSectionActionRenderer',
    'sectionAlertRenderer'
  ],
  outputs: ['accordionOpenChange']
})
export class SectionAccordionRendererComponent<
  S extends BaseHearingSection,
  T extends BaseHearingRowDataVM
> implements OnInit
{
  sectionHeaderRenderer?: TemplateRef<TableContext<S, T>>;
  rowGroupHeaderCellRenderer?: TemplateRef<TableContext<S, T>>;
  actionCellRenderer?: TemplateRef<TableContext<S, T>>;
  expandedDetailsRenderer?: TemplateRef<TableContext<S, T>>;
  moveAlertRenderer: TemplateRef<TableContext<S, T>>;
  sectionAlertRenderer: TemplateRef<TableContext<S, T>>;
  customCellHeaderRenderers?: Record<keyof T, TemplateRef<TableContext<S, T>>>;
  accordionSectionActionRenderer: TemplateRef<TableContext<S, T>>;
  cellRenderers?: Record<keyof T, TemplateRef<TableContext<S, T>>>;
  sections: S[];
  columnConfig: ColumnConfig<T>;
  sectionConfig: HearingTableSectionConfig<S, keyof S, PickPropertyKeys<S, keyof S>>;
  sectionHeaderSpan: number;
  hearingMovestate: HearingTableActionsState['moveState'];
  positionedHearingsState: HearingTableActionsState['positionedHearingsState'];
  sectionOpenState: number[] = [];
  accordionOpenChange = new EventEmitter<number[]>();
  titleResolver: (section: S) => string;

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
