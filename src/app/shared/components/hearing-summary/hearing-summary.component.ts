import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  input
} from '@angular/core';
import { sortBy, isNil, every } from 'lodash-es';
import { Defendant, Hearing } from '../../../core/model';

import { PdkMarginDirective, PdkListDirective, PdkGrid } from '@cpp/pdk';
import { FullNamePipe } from '../../pipes/full-name.pipe';

@Component({
  selector: 'hearing-summary',
  templateUrl: './hearing-summary.html',
  changeDetection: ChangeDetectionStrategy.Default,
  styles: [
    `
      dt,
      dd {
        display: block;
        margin: 0;
      }
      dt {
        font-weight: bold;
      }
    `
  ],
  imports: [PdkGrid, PdkMarginDirective, PdkListDirective, FullNamePipe]
})
export class HearingSummaryComponent implements OnInit, OnChanges {
  readonly hearing = input<Hearing>(undefined);

  estimatedMinutes: number;
  defendants: Defendant[];
  defendantsHaveDatesToAvoid: boolean;
  defendantsHaveSpecificRequirements: boolean;
  language: string;

  ngOnInit() {
    this.initialise();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initialise();
  }

  private initialise(): void {
    this.estimatedMinutes = this.hearing().estimatedMinutes;
    this.defendants = this.allDefendants();
    this.defendantsHaveDatesToAvoid = this.doDefendantsHaveDatesToAvoid();
    this.defendantsHaveSpecificRequirements = this.doDefendantsHaveSpecificRequirements();
    this.language = this.determineLanguage();
  }

  private determineLanguage(): string {
    return this.defendants.length > 0 &&
      every(this.defendants, (defendant) => defendant.hearingLanguageNeeds === 'WELSH')
      ? 'Welsh'
      : 'English';
  }

  private allDefendants(): Defendant[] {
    const defendants = (this.hearing().listedCases || [])
      .map((listedCase) => listedCase.defendants)
      .reduce((acc, cur) => acc.concat(cur), []);

    return sortBy(defendants, ['organisationName', 'firstName', 'lastName']);
  }

  private doDefendantsHaveDatesToAvoid(): boolean {
    const foundIndex = this.defendants.findIndex((defendant) => !isNil(defendant.datesToAvoid));

    return foundIndex >= 0;
  }

  private doDefendantsHaveSpecificRequirements(): boolean {
    const foundIndex = this.allDefendants().findIndex(
      (defendant) => !isNil(defendant.specificRequirements)
    );

    return foundIndex >= 0;
  }
}
