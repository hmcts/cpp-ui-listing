import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  computed,
  input
} from '@angular/core';
import { ToArrayPipe } from '../../../../shared/pipes/to-array.pipe';
import {
  BaseHearingRowDataVM,
  BaseHearingSection,
  HearingsColumnConfig,
  HearingsTableContext,
  HearingsTableSectionConfig,
  HearingsSectionRenderData
} from '../../../model/hearing-table-renderer.interfaces';
import { buildRenderItems } from '../../../utils/hearing-table-renderer.utils';
import { HearingTableActionsState } from '../../component-store/hearing-table-actions.store';
import { RowGroupBodyRendererComponent } from '../row-groups-body-renderer/row-groups-body-renderer.component';
import { PdkCore, PdkTable } from '@cpp/pdk';
import { NgStyle, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: '[section-table-renderer], section-table-renderer',
  templateUrl: './section-table-renderer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RowGroupBodyRendererComponent,
    ToArrayPipe,
    PdkTable,
    PdkCore,
    NgStyle,
    NgTemplateOutlet
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
export class SectionTableRendererComponent {
  readonly sectionHeaderRenderer = input<TemplateRef<HearingsTableContext>>();
  readonly hearingsGroupHeaderRenderers =
    input<Record<string, TemplateRef<HearingsTableContext>>>();
  readonly actionCellRenderer = input<TemplateRef<HearingsTableContext>>();
  readonly expandedDetailsRenderer = input<TemplateRef<HearingsTableContext>>();
  readonly moveAlertRenderer = input<TemplateRef<HearingsTableContext>>();
  readonly customCellHeaderRenderers = input<Record<string, TemplateRef<HearingsTableContext>>>();
  readonly cellRenderers = input<Record<string, TemplateRef<HearingsTableContext>>>();
  readonly sections = input<BaseHearingSection[]>();
  readonly columnConfig = input<HearingsColumnConfig<BaseHearingRowDataVM>>();
  readonly sectionConfig = input<HearingsTableSectionConfig>();
  readonly hearingMovestate = input<HearingTableActionsState['moveState']>();
  readonly positionedHearingsState = input<HearingTableActionsState['positionedHearingsState']>();
  readonly failedAllocationIds = input<string[]>();

  readonly sectionHeaderSpan = computed(() => {
    const config = this.sectionConfig();
    let span = this.columnConfig()?.length ?? 0;
    if (config?.actionable && this.actionCellRenderer()) {
      span += 1;
    }
    if (config?.rowsAreExpandable) {
      span += 1;
    }
    return span;
  });

  readonly renderItems = computed((): HearingsSectionRenderData[] => {
    const config = this.sectionConfig();
    if (!config) {
      return [];
    }
    return (this.sections() ?? []).map(section => ({
      section,
      items: buildRenderItems(
        section as unknown as Record<string, unknown>,
        config.groupLevels,
        config.hasTableSectionHeader ? section.sectionIdentifier : ''
      )
    }));
  });
}
