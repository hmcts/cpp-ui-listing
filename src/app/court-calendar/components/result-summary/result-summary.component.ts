import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CourtCalendarFilters } from '../../model';
import { PdkCore } from '@cpp/pdk';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'court-result-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let filterValues = filterOptions();
    @if (totalNumber() > 0 && resultsDisplayed() > 0) {
      <ng-container aria-describedby="resultSummary">
        <p class="d-flex" id="resultSummary" data-test-id="result-summary">
          Showing
          <span pdk-margin-right="1" pdk-margin-left="1" pdk-typography="heading-small">
            {{ resultsDisplayed() }} of
            {{ totalNumber() }}
          </span>
          {{ totalNumber() > 1 ? 'hearings' : 'hearing' }}
          <span pdk-margin-right="1" pdk-margin-left="1" pdk-typography="heading-small">
            {{ filterValues.endDate ? 'between' : 'on' }}
            {{ filterValues.startDate | date: 'dd/MM/yyyy' }}
            @if (filterOptions().endDate) {
              and {{ filterValues.endDate | date: 'dd/MM/yyyy' }}
            }
          </span>
          at
          <span pdk-margin-right="1" pdk-margin-left="1" pdk-typography="heading-small">
            {{ filterValues.courtCentre.oucodeL3Name }}
          </span>
        </p>
      </ng-container>
    } @else {
      <p>No hearings found for selected filters.</p>
    }
  `,
  styles: [
    `
      .d-flex {
        display: flex;
      }
    `
  ],
  imports: [PdkCore, DatePipe]
})
export class CourtResultSummaryComponent {
  readonly resultsDisplayed = input<number>(undefined);
  readonly totalNumber = input<number>(undefined);
  readonly filterOptions = input<CourtCalendarFilters>(undefined);
}
