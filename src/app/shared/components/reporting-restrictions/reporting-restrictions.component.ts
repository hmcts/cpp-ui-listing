import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { Defendant } from '../../../core/model';
import { AppConfigService } from '../../../config';
import { NgTemplateOutlet } from '@angular/common';
import {
  PdkLinkDirective,
  PdkTypographyDirective,
  PdkBorderColorDirective,
  PdkTextColorDirective
} from '@cpp/pdk';

@Component({
  selector: 'reporting-restrictions',
  templateUrl: './reporting-restrictions.component.html',
  styleUrls: ['./reporting-restrictions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PdkLinkDirective,
    PdkTypographyDirective,
    NgTemplateOutlet,
    PdkBorderColorDirective,
    PdkTextColorDirective
  ]
})
export class ReportingRestrictionsComponent {
  readonly caseId = input<string>(undefined);
  readonly isActive = input<boolean>(undefined);
  readonly isWarning = input<boolean>(undefined);
  readonly defendants = input<Defendant[]>(undefined);

  public appUrl: string;

  constructor(private appConfigService: AppConfigService) {
    this.appUrl = this.appConfigService.appUrl;
  }

  get colour(): string {
    return this.isActive() ? 'white' : this.isWarning() ? 'red' : 'black';
  }

  get hasReportingRestrictions(): boolean {
    return (this.defendants() || []).some((defendant) =>
      defendant.offences.some(
        (offence) => offence.reportingRestrictions && offence.reportingRestrictions.length
      )
    );
  }

  get href(): string {
    const caseId = this.caseId();
    return this.appUrl && caseId
      ? `${this.appUrl}/prosecution-casefile/edit-case/${caseId}#hearings-and-decisions`
      : '';
  }
}
