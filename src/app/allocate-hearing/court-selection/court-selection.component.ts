import { Component, ViewEncapsulation, input, output } from '@angular/core';
import { CourtCentre } from '../../core/model';
import {
  ErrorMessageConfig,
  ValidationError,
  PdkGrid,
  PdkCore,
  PdkForm,
  PdkRadio,
  PdkButton,
  PdkBackLink
} from '@cpp/pdk';
import { OrganisationUnit, OrganisationUnitAutosuggestComponent } from '@cpp/reference-data';
import { FormsModule } from '@angular/forms';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'court-selection',
  templateUrl: './court-selection.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    PdkGrid,
    PdkCore,
    FormsModule,
    PdkForm,
    PdkRadio,
    OrganisationUnitAutosuggestComponent,
    PdkButton,
    PdkBackLink,
    RouterLink
  ]
})
export class CourtSelectionComponent {
  readonly backUrl = input<string>(undefined);
  readonly courts = input<CourtCentre[]>(undefined);
  readonly queryParams = input<Record<string, string>>(undefined);
  readonly organisationUnits = input<OrganisationUnit[]>(undefined);
  readonly continue = output<OrganisationUnit>();
  readonly errors = output<ValidationError[]>();
  courtType: 'CROWN' | 'MAGISTRATES';
  selectedCourtCentre: OrganisationUnit;

  get errorMessages(): ErrorMessageConfig[] {
    return [
      {
        rule: 'required',
        message: `Enter the Court name where you'd like to allocate the case`
      }
    ];
  }

  onContinue() {
    if (this.selectedCourtCentre) {
      this.continue.emit(this.selectedCourtCentre);
    }
  }
}
