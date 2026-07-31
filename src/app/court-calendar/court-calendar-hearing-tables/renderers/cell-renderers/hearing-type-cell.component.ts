import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { PdkCore, PdkDetailsSummary, PdkTagComponent } from '@cpp/pdk';
import { HearingTypeVM } from '../../../model';

@Component({
  selector: 'hearing-type-cell, [hearing-type-cell]',
  template: `
    <div data-test-id="hearing-type-cell">
      @if (isMaster) {
        <span>{{ hearingType.description }}</span>
      }
      <div pdk-margin-vertical="2">
        @if (hearingType.markers?.length === 1) {
          <pdk-tag condensed [color]="'blue'">{{
            hearingType.markers[0].markerTypeDescription
          }}</pdk-tag>
        } @else {
          @if (hearingType.markers?.length > 1) {
            <details pdk-details pdk-margin-bottom="0">
              <summary>{{ hearingType.markers.length }} case markers</summary>
              <pdk-details-text>
                @for (marker of hearingType.markers; track marker.markerTypeid) {
                  <div pdk-margin-vertical="2">
                    <pdk-tag condensed [color]="'blue'">
                      {{ marker.markerTypeDescription }}
                    </pdk-tag>
                  </div>
                }
              </pdk-details-text>
            </details>
          }
        }
      </div>
      <div pdk-margin-top="2">
        @if (hearingType.hasReportingRestriction) {
          <pdk-tag condensed [color]="'red'">RR</pdk-tag>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['hearingType', 'isMaster'],
  imports: [PdkTagComponent, PdkCore, PdkDetailsSummary]
})
export class HearingTypeCellComponent {
  hearingType: HearingTypeVM;
  isMaster: boolean;

  @HostListener('click', ['$event'])
  preventDefault(event: MouseEvent) {
    event.stopPropagation();
  }
}
