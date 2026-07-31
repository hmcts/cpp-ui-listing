import { Component, OnInit, ChangeDetectionStrategy, input } from '@angular/core';
import { Hearing } from '../../../core/model';

import { PdkTextColorDirective, PdkDetailsSummary } from '@cpp/pdk';

@Component({
  selector: 'case-markers',
  templateUrl: './case-markers.component.html',
  styleUrls: ['./case-markers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PdkTextColorDirective, PdkDetailsSummary]
})
export class CaseMarkersComponent implements OnInit {
  readonly hearing = input<Hearing>(undefined);
  readonly indexListedCase = input(0);
  readonly allListedCases = input(false);

  title: string;
  casemarkers: string[] = [];

  constructor() {}

  ngOnInit() {
    const hearing = this.hearing();
    if (hearing) {
      this.casemarkers = this.getCaseMarkers(hearing);
    }

    if (this.casemarkers.length > 1) {
      this.title = this.casemarkers.length + ' markers';
    }
  }

  getCaseMarkers(hearing: Hearing) {
    const caseMarkersArray = [];
    const { listedCases } = hearing;

    if (this.allListedCases()) {
      listedCases.forEach((listedCase) => {
        if (listedCase.markers) {
          listedCase.markers.forEach((m) => caseMarkersArray.push(m.markerTypeDescription));
        }
      });
      return caseMarkersArray;
    }

    if (
      listedCases &&
      listedCases[this.indexListedCase()] &&
      listedCases[this.indexListedCase()].markers
    ) {
      listedCases[this.indexListedCase()].markers.forEach((m) =>
        caseMarkersArray.push(m.markerTypeDescription)
      );
    }

    return caseMarkersArray;
  }
}
