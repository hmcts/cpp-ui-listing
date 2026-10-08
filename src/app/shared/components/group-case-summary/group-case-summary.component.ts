import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'group-case-summary',
  template: `
    <div data-test-id="numberOfDefendants">
      <strong>{{ groupCaseCount() }} DEFENDANTS </strong>
    </div>
    <div data-test-id="numberOfCases">
      <strong>{{ groupCaseCount() }} CASES</strong>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupCaseSummaryComponent {
  readonly groupCaseCount = input.required<number>();
}
