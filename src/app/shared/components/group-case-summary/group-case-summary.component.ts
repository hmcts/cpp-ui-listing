import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  PdkLinkDirective,
  PdkMarginDirective,
  PdkTagComponent,
  PdkTypographyDirective,
  PdkVisuallyHiddenDirective
} from '@cpp/pdk';

@Component({
  selector: 'group-case-summary',
  template: `
    <div data-test-id="numberOfDefendants">
      <strong>{{ groupCaseCount() }} DEFENDANTS </strong>
    </div>
    <div data-test-id="numberOfCases">
      <strong>{{ groupCaseCount() }} CASES</strong>
    </div>
    <div>
      <a
        pdk-link
        pdk-margin-bottom="1"
        pdk-typography="caption-medium"
        data-test-id="hearingReference"
        target="_blank"
        href="{{ baseUrl() }}/prosecution-casefile/case-at-a-glance/{{ caseId() }}"
        ><span pdk-visually-hidden>Case reference</span> {{ caseUrn() }}</a
      >
    </div>
    <div pdk-margin-top="1">
      <pdk-tag data-test-id="bulkCasesTag" [color]="'grey'">Bulk Cases</pdk-tag>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PdkLinkDirective,
    PdkMarginDirective,
    PdkTagComponent,
    PdkTypographyDirective,
    PdkVisuallyHiddenDirective
  ]
})
export class GroupCaseSummaryComponent {
  readonly groupCaseCount = input.required<number>();
  readonly baseUrl = input.required<string>();
  readonly caseId = input.required<string>();
  readonly caseUrn = input.required<string>();
}
