import { Component, OnInit, input } from '@angular/core';
import { sortBy, uniqBy } from 'lodash-es';

import { Offence, CourtApplication } from '../../../core/model';
import { uniq } from 'lodash-es';

import { PdkMarginDirective, PdkDetailsSummary } from '@cpp/pdk';

@Component({
  selector: 'hearing-offences',
  templateUrl: './hearing-offences.html',
  styles: [
    `
      ul {
        margin: 0;
        padding: 0;
      }

      ul li {
        list-style: none;
        padding: 0;
      }
    `
  ],
  imports: [PdkDetailsSummary, PdkMarginDirective]
})
export class HearingOffencesComponent implements OnInit {
  readonly offences = input<Offence[], Offence[]>(undefined, {
    transform: (value: Offence[]) => this.sortUniqueOffences(value ?? [])
  });
  readonly applications = input<CourtApplication[]>(undefined);
  readonly hearingType = input<string>(undefined);

  applicationTypes: string[] = [];

  constructor() {}

  ngOnInit(): void {
    const applications = this.applications();
    if (applications) {
      applications.forEach((application) =>
        this.applicationTypes.push(application.applicationType)
      );
      this.applicationTypes = uniq(this.applicationTypes);
    }
  }

  sortUniqueOffences(offences: Offence[]): Offence[] {
    const uniqueOffences = this.uniqueOffences(offences);
    return this.sortOffences(uniqueOffences);
  }

  uniqueOffences(offences: Offence[]): Offence[] {
    return uniqBy(offences, (offence) => offence.statementOfOffence.title);
  }

  sortOffences(offences: Offence[]): Offence[] {
    return sortBy(offences, ['statementOfOffence.title']);
  }

  greaterThanOne(offences: Offence[]): boolean {
    return offences.length >= 2;
  }
}
