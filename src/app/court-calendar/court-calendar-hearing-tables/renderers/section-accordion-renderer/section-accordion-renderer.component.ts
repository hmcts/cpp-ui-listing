import { ChangeDetectionStrategy, Component, TemplateRef, input, output } from '@angular/core';
import { ToArrayPipe } from '../../../../shared/pipes/to-array.pipe';
import {
  BaseHearingSection,
  HearingsColumnConfig,
  HearingsTableContext,
  HearingsTableSectionConfig,
  BaseHearingRowDataVM
} from '../../../model/hearing-table-renderer.interfaces';
import { HearingTableActionsState } from '../../component-store/hearing-table-actions.store';
import { SectionTitleResolverPipe } from '../../../pipes/section-title-resolver.pipe';
import { SectionTableRendererComponent } from '../section-table-renderer/section-table-renderer.component';
import { PdkAccordion, PdkCore } from '@cpp/pdk';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: '[section-accordion-renderer], section-accordion-renderer',
  templateUrl: './section-accordion-renderer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SectionTitleResolverPipe,
    SectionTableRendererComponent,
    ToArrayPipe,
    PdkAccordion,
    PdkCore,
    NgTemplateOutlet
  ]
})
export class SectionAccordionRendererComponent {
  readonly sectionHeaderRenderer = input<TemplateRef<HearingsTableContext>>();
  readonly hearingsGroupHeaderRenderers =
    input<Record<string, TemplateRef<HearingsTableContext>>>();
  readonly actionCellRenderer = input<TemplateRef<HearingsTableContext>>();
  readonly expandedDetailsRenderer = input<TemplateRef<HearingsTableContext>>();
  readonly moveAlertRenderer = input<TemplateRef<HearingsTableContext>>();
  readonly sectionAlertRenderer = input<TemplateRef<HearingsTableContext>>();
  readonly customCellHeaderRenderers = input<Record<string, TemplateRef<HearingsTableContext>>>();
  readonly accordionSectionActionRenderer = input<TemplateRef<HearingsTableContext>>();
  readonly cellRenderers = input<Record<string, TemplateRef<HearingsTableContext>>>();
  readonly sections = input<BaseHearingSection[]>();
  readonly columnConfig = input<HearingsColumnConfig<BaseHearingRowDataVM>>();
  readonly sectionConfig = input<HearingsTableSectionConfig>();
  readonly hearingMovestate = input<HearingTableActionsState['moveState']>();
  readonly positionedHearingsState = input<HearingTableActionsState['positionedHearingsState']>();
  readonly failedAllocationIds = input<string[]>();
  readonly sectionOpenState = input<number[]>([]);
  readonly titleResolver = input<(section: BaseHearingSection) => string>();

  readonly accordionOpenChange = output<number[]>();
}
