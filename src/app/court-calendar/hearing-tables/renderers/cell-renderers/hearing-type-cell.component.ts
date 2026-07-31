import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { PdkCoreModule, PdkDetailsModule, PdkTagModule } from '@cpp/pdk';
import { CourtRoomHearingTimeCalendar, HearingTypeVM } from '../../../../court-calendar/model';
import { HearingDropdownActions } from '../../hearing-row-actions-dropdown/hearing-row-actions-dropdown.component';

export interface HearingActionsEvent {
  hearingId: string;
  action: HearingDropdownActions;
  group?: CourtRoomHearingTimeCalendar;
}

@Component({
  selector: 'hearing-type-cell, [hearing-type-cell]',
  template: `
    <div data-test-id="hearing-type-cell">
      <span *ngIf="isMaster">{{ hearingType.description }}</span>
      <div pdk-margin-vertical="2">
        <pdk-tag
          condensed
          [color]="'blue'"
          *ngIf="hearingType.markers?.length === 1; else markersList"
          >{{ hearingType.markers[0].markerTypeDescription }}</pdk-tag
        >

        <ng-template #markersList>
          <details *ngIf="hearingType.markers?.length > 1" pdk-details pdk-margin-bottom="0">
            <summary>{{ hearingType.markers.length }} case markers</summary>
            <pdk-details-text>
              <div pdk-margin-vertical="2" *ngFor="let marker of hearingType.markers">
                <pdk-tag condensed [color]="'blue'">
                  {{ marker.markerTypeDescription }}
                </pdk-tag>
              </div>
            </pdk-details-text>
          </details>
        </ng-template>
      </div>
      <div pdk-margin-top="2">
        <pdk-tag condensed [color]="'red'" *ngIf="hearingType.hasReportingRestriction">RR</pdk-tag>
      </div>
    </div>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['hearingType', 'isMaster'],
  imports: [CommonModule, PdkTagModule, PdkCoreModule, PdkDetailsModule]
})
export class HearingTypeCellComponent {
  hearingType: HearingTypeVM;
  isMaster: boolean;

  @HostListener('click', ['$event'])
  preventDefault(event: MouseEvent) {
    event.stopPropagation();
  }
}
