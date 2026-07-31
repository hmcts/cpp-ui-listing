import { Component, OnInit, input, output } from '@angular/core';
import { flatten } from 'lodash-es';
import {
  HearingByDefendants,
  SplittedHearingIds,
  DefendantByCases,
  ProsecutionCaseDetails,
  OffenceForSplit
} from '../../core/model';

import { uniq } from 'lodash-es';
import {
  PdkTypographyDirective,
  PdkMarginDirective,
  PdkFormComponent,
  PdkFormFieldComponent,
  PdkCheckboxGroupComponent,
  PdkCheckboxComponent,
  PdkTextColorDirective,
  PdkFoldableTextComponent,
  PdkFormGroupComponent,
  PdkFormGroupDirective,
  PdkButtonComponent,
  PdkButtonDirective
} from '@cpp/pdk';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'split-hearing-form',
  templateUrl: './split-hearing-form.component.html',
  imports: [
    PdkTypographyDirective,
    PdkMarginDirective,
    FormsModule,
    PdkFormComponent,
    PdkFormFieldComponent,
    PdkCheckboxGroupComponent,
    PdkCheckboxComponent,
    PdkTextColorDirective,
    PdkFoldableTextComponent,
    PdkFormGroupComponent,
    PdkFormGroupDirective,
    PdkButtonComponent,
    PdkButtonDirective
  ]
})
export class SplitHearingFormComponent implements OnInit {
  readonly hearing = input<HearingByDefendants>(undefined);
  readonly onSubmit = output<SplittedHearingIds | undefined>();

  defendantByCases: DefendantByCases[];
  wholeHearing = false;

  ngOnInit() {
    this.defendantByCases = this.hearing().defendantByCases;
  }

  toggleWholeHearing(checked: boolean): void {
    this.defendantByCases.forEach((defendant) => {
      this.toggleDefendant(defendant, checked, false);
    });
  }

  toggleDefendant(
    defendant: DefendantByCases,
    checked: boolean,
    updateWhole: boolean = true
  ): void {
    defendant.checked = checked;
    defendant.prosecutionCases.forEach((prosecutionCase: ProsecutionCaseDetails) => {
      prosecutionCase.offences.forEach((offence: OffenceForSplit) => {
        offence.checked = checked;
      });
    });

    if (updateWhole) {
      this.updateTheWholeHearingCheckbox();
    }
  }

  toggleOffence(defendant: DefendantByCases): void {
    const allDefendantOffences = flatten(
      defendant.prosecutionCases.map(
        (prosecutionCase: ProsecutionCaseDetails) => prosecutionCase.offences
      )
    );

    setTimeout(() => {
      defendant.checked = allDefendantOffences.every((offence: OffenceForSplit) => offence.checked);
      this.updateTheWholeHearingCheckbox();
    }, 0);
  }

  updateTheWholeHearingCheckbox(): void {
    this.wholeHearing = this.allCaseoffences.every((offence: OffenceForSplit) => offence.checked);
  }

  get isAllocateHearingButtonEnabled(): boolean {
    return this.allCaseoffences.some((offence: OffenceForSplit) => offence.checked);
  }

  get allCaseoffences(): OffenceForSplit[] {
    return flatten(
      flatten(this.defendantByCases.map((d) => d.prosecutionCases)).map(
        (prosecutionCase: ProsecutionCaseDetails) => prosecutionCase.offences
      )
    );
  }

  allocateHearing(): void {
    if (this.wholeHearing) {
      this.onSubmit.emit(undefined);
    } else {
      const caseIds = [];
      const defendantIds = [];
      const offenceIds = [];

      this.defendantByCases.forEach((defendant: DefendantByCases) => {
        defendant.prosecutionCases.forEach((prosecutionCase: ProsecutionCaseDetails) => {
          prosecutionCase.offences.forEach((offence: OffenceForSplit) => {
            if (offence.checked) {
              caseIds.push(prosecutionCase.id);
              defendantIds.push(prosecutionCase.defendantId);
              offenceIds.push(offence.id);
            }
          });
        });
      });

      const uniqDefendantIds = uniq<string>(defendantIds);

      this.onSubmit.emit({ caseIds, defendantIds: uniqDefendantIds, offenceIds });
    }
  }
}
