import { Component, input } from '@angular/core';
import { Defendant, Hearing } from '../../core';
import { FindFirstDefendantAlphabeticallyPipe } from '../../shared/pipes';
import { first, sortBy, map, flatten } from 'lodash-es';
import { ApplicantRespondent } from '../../core/model';
import { PdkVisuallyHiddenDirective, PdkTextColorDirective } from '@cpp/pdk';

import { HearingEstimateComponent } from '../../shared/components/hearing-estimate/hearing-estimate.component';
import { CapitalizeFirstLetterPipe } from '../../shared/pipes/capitalize-first-letter.pipe';
import { FindFirstDefendantAlphabeticallyPipe as FindFirstDefendantAlphabeticallyPipe_1 } from '../../shared/pipes/find-first-defendant-alphabetically.pipe';
import { FindFirstApplicantRespondantAlphabeticallyPipe } from '../../shared/pipes/find-first-respondant-alphabetically.pipe';
import { FullNamePipe } from '../../shared/pipes/full-name.pipe';
import { ApplicantRespondentFullNamePipe } from '../../shared/pipes/applicant-respondent-full-name.pipe';

@Component({
  selector: 'sequence-item',
  styleUrls: ['./sequence-item.scss'],
  templateUrl: './sequence-item.html',
  imports: [
    PdkVisuallyHiddenDirective,
    HearingEstimateComponent,
    PdkTextColorDirective,
    CapitalizeFirstLetterPipe,
    FindFirstDefendantAlphabeticallyPipe_1,
    FindFirstApplicantRespondantAlphabeticallyPipe,
    FullNamePipe,
    ApplicantRespondentFullNamePipe
  ],
  providers: [FindFirstDefendantAlphabeticallyPipe]
})
export class SequenceItemComponent {
  readonly hearing = input<Hearing>(undefined);
  readonly startTime = input<string>(undefined);

  constructor(private findFirstDefendantAlphabetically: FindFirstDefendantAlphabeticallyPipe) {}

  // todo : move to pipe as shared......
  getAllDefendants(hearing: Hearing): Defendant[] {
    return flatten(map(hearing.listedCases, 'defendants'));
  }

  getAllApplicants(hearing: Hearing): ApplicantRespondent[] {
    return map(hearing.courtApplications, 'applicant');
  }

  isStandaloneApplicationHearing(hearing: Hearing) {
    return (
      (hearing.listedCases === undefined || hearing.listedCases.length === 0) &&
      hearing.courtApplications.length > 0
    );
  }

  // todo : move to pipe as shared......
  plusOtherDefendants(hearing: Hearing): string {
    let result = '';
    const defendants = this.getAllDefendants(hearing);
    if (defendants.length > 1) {
      result = `+ ${defendants.length - 1} other`;
      if (defendants.length > 2) {
        result += 's';
      }
    }
    return result;
  }

  plusOtherApplicants(hearing: Hearing): string {
    let result = '';
    const applicants = this.getAllApplicants(hearing);
    if (applicants.length > 1) {
      result = `+ ${applicants.length - 1} other`;
      if (applicants.length > 2) {
        result += 's';
      }
    }
    return result;
  }

  firstApplicationType(hearing: Hearing): string {
    return hearing.courtApplications[0].applicationType;
  }

  // todo : move to pipe as shared......
  firstDefendantOffence(hearing: Hearing): string {
    const firstDefendant = this.findFirstDefendantAlphabetically.transform(
      this.getAllDefendants(hearing)
    );
    return first(sortBy(firstDefendant.offences, 'statementOfOffence.title')).statementOfOffence
      .title;
  }
}
