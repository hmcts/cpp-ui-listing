import { ChangeDetectionStrategy, Component, Input, output } from '@angular/core';
import {
  ValidationError,
  PdkGridComponent,
  PdkGridDirective,
  PdkFillColorDirective,
  PdkMarginDirective,
  PdkFormComponent,
  PdkFormFieldComponent,
  PdkInsetTextComponent,
  PdkPaddingDirective,
  PdkDatePickerInputComponent,
  PdkFutureDateValidatorDirective,
  PdkButtonComponent,
  PdkButtonDirective
} from '@cpp/pdk';
import {
  PublicHoliday,
  OrganisationUnit,
  OrganisationUnitAutosuggestComponent
} from '@cpp/reference-data';
import { CreateListFilterOptions, FilterOption } from '../../core';
import { CPPDate, getCPPDate } from '../../core/util';
import { FormsModule } from '@angular/forms';

interface CreateCrownListFilterValues {
  organisationUnit: OrganisationUnit;
  date: string;
}

interface CreateMagistratesListFilterValues {
  organisationUnit: OrganisationUnit;
  date: string;
  courtroomId?: string;
}

type CreateListFilterValues = CreateCrownListFilterValues | CreateMagistratesListFilterValues;

@Component({
  selector: 'create-prison-list-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-prison-list-filter.html',
  styleUrls: ['./create-prison-list-filter.scss'],
  imports: [
    PdkGridComponent,
    PdkGridDirective,
    PdkFillColorDirective,
    PdkMarginDirective,
    FormsModule,
    PdkFormComponent,
    PdkFormFieldComponent,
    OrganisationUnitAutosuggestComponent,
    PdkInsetTextComponent,
    PdkPaddingDirective,
    PdkDatePickerInputComponent,
    PdkFutureDateValidatorDirective,
    PdkButtonComponent,
    PdkButtonDirective
  ]
})
export class CreatePrisonListFilterComponent {
  @Input() set publicHolidays(publicHolidays: PublicHoliday[]) {
    const todaysDate = this.cppDate.getCurrentDate();
    (publicHolidays || []).forEach((publicHoliday) => {
      const publicHolidayDate = new Date(publicHoliday.date);

      // We are only interested in future public holidays
      if (this.cppDate.isBefore(publicHolidayDate, todaysDate)) {
        return false;
      }

      // We are only interested in public holidays that start on Monday
      if (publicHolidayDate.getDay() !== 1 && this.futurePublicHolidays.length > 0) {
        // We need to check if the previous day
        // is already in our list of bank holidays to grey out. This is to cater for scenarios where we have
        // consecutive bank holidays. i.e Monday, Tuesday, Wednesday etc..
        const previousBankHolidayDate = new Date(
          this.futurePublicHolidays[this.futurePublicHolidays.length - 1].date
        );
        if (
          !this.cppDate.isSame(previousBankHolidayDate, this.cppDate.subtract(publicHolidayDate, 1))
        ) {
          return false;
        }
      }

      this.futurePublicHolidays.push(publicHoliday);
    });
  }
  readonly formErrors = output<ValidationError[]>();
  readonly onSubmit = output<CreateListFilterOptions>();
  readonly selectCourtCentre = output<FilterOption>();

  cppDate: CPPDate;

  constructor() {
    this.cppDate = getCPPDate();
  }
  futurePublicHolidays: PublicHoliday[] = [];

  handleOrganisationUnitChange(organisationUnit?: OrganisationUnit) {
    this.selectCourtCentre.emit(
      organisationUnit
        ? {
            label: organisationUnit.oucodeL3Name,
            value: organisationUnit.id
          }
        : null
    );
  }

  handleFormSubmit({ organisationUnit, date, ...variant }: CreateListFilterValues) {
    let startDate = date;
    let endDate = date;

    this.formErrors.emit(null);
    this.onSubmit.emit({
      courtCentre: organisationUnit.oucodeL3Name,
      courtCentreId: organisationUnit.id,
      startDate,
      endDate,
      isCrownCourt: organisationUnit.oucodeL1Code === 'C'
    });
  }
}
