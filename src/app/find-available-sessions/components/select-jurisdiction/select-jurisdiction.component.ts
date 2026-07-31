import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ErrorMessageConfig,
  PdkButton,
  PdkForm,
  PdkMarginDirective,
  PdkRadio,
  ValidationError
} from '@cpp/pdk';
import { OrganisationUnit, OrganisationUnitAutosuggestComponent } from '@cpp/reference-data';
import type { JurisdictionType } from '../../../core/model/hearing';

@Component({
  selector: 'select-jurisdiction',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-jurisdiction.component.html',
  styleUrl: './select-jurisdiction.component.scss',
  imports: [
    FormsModule,
    NgTemplateOutlet,
    PdkForm,
    PdkRadio,
    PdkMarginDirective,
    PdkButton,
    OrganisationUnitAutosuggestComponent
  ]
})
/**
 * GOOD candidate for migration to cpp-ui-core; cpp-ui-courtscheduler has a similar component.
 */
export class SelectJurisdictionComponent {
  readonly continue = output<OrganisationUnit>();
  readonly errors = output<ValidationError[]>();

  readonly jurisdiction = signal<JurisdictionType | null>(null);
  readonly courtCentre = signal<OrganisationUnit | undefined>(undefined);

  readonly courtErrorMessages: ErrorMessageConfig[] = [
    { rule: 'required', message: 'Select a court from the list' }
  ];

  onJurisdictionChange(value: JurisdictionType | null): void {
    this.jurisdiction.set(value);
    this.courtCentre.set(undefined);
  }

  onContinue(): void {
    const courtCentre = this.courtCentre();
    if (!courtCentre) {
      return;
    }
    this.continue.emit(courtCentre);
  }
}
