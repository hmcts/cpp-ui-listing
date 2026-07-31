import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, input, output } from '@angular/core';
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
  PdkRadioGroupComponent,
  PdkRadioButtonComponent,
  PdkDatePickerInputComponent,
  PdkDateInputComponent,
  PdkFutureDateValidatorDirective,
  PdkSelectComponent,
  PdkButtonComponent,
  PdkButtonDirective,
  PdkDateInput
} from '@cpp/pdk';
import {
  PublicHoliday,
  OrganisationUnit,
  OrganisationUnitAutosuggestComponent
} from '@cpp/reference-data';
import moment from 'moment';
import { CreateListFilterOptions, FilterOption } from '../../core';
import { CPPDate, getCPPDate } from '../../core/util';
import { FormsModule } from '@angular/forms';

interface CreateCrownListFilterValues {
  organisationUnit: OrganisationUnit;
  dateType: 'FIXED' | 'WEEK_COMMENCING';
  date: string;
}

interface CreateMagistratesListFilterValues {
  organisationUnit: OrganisationUnit;
  date: string;
  courtroomId?: string;
}

type CreateListFilterValues = CreateCrownListFilterValues | CreateMagistratesListFilterValues;

@Component({
  selector: 'create-list-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-list-filter.html',
  styleUrls: ['./create-list-filter.scss'],
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
    PdkRadioGroupComponent,
    PdkRadioButtonComponent,
    PdkDatePickerInputComponent,
    PdkDateInputComponent,
    PdkFutureDateValidatorDirective,
    PdkSelectComponent,
    PdkButtonComponent,
    PdkButtonDirective,
    PdkDateInput
  ]
})
export class CreateListFilterComponent {
  readonly hasCpsAccessOnly = input(false);
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
  courtroomOptions: FilterOption[] = [];
  futurePublicHolidays: PublicHoliday[] = [];
  filterOrganisationUnit = (organisationUnit: OrganisationUnit) => {
    return !this.hasCpsAccessOnly() || organisationUnit.oucodeL1Code === 'B';
  };

  formatWeekCommencingDisplayText = (date: string) => {
    let weekCommencingDate = moment(date).startOf('isoWeek').toDate();

    const nextWorkingDay = this.getNextAvailableWorkingDayFromBankHolidays(weekCommencingDate);

    if (nextWorkingDay) {
      weekCommencingDate = nextWorkingDay;
    }
    return `Week commencing ${formatDate(weekCommencingDate, 'd MMM yyyy', 'en-GB')}`;
  };

  isWeekCommencingDateDisabled = (date: Date) => {
    if (this.futurePublicHolidays.some((b) => this.cppDate.isSame(b.date, date, 'day'))) {
      return true;
    }

    return moment(date).isSame(new Date(), 'isoWeek');
  };

  isWeekCommencingDateHighlighted = (date: Date, hoveredDate: Date) => {
    return moment(date).isSame(hoveredDate, 'isoWeek');
  };

  isWeekCommencingDateSelected = (date: Date, selectedDate?: string) => {
    return selectedDate ? moment(date).isSame(selectedDate, 'isoWeek') : false;
  };

  handleOrganisationUnitChange(organisationUnit?: OrganisationUnit) {
    if (organisationUnit) {
      this.courtroomOptions = [
        { label: 'All Courtrooms', value: '', selected: true },
        ...organisationUnit.courtrooms.map((item) => ({
          label: item.courtroomName,
          value: item.id
        }))
      ];
    } else {
      this.courtroomOptions = [];
    }
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
    const courtRoomId = (variant as CreateMagistratesListFilterValues).courtroomId;
    const weekCommencing = (variant as CreateCrownListFilterValues).dateType === 'WEEK_COMMENCING';

    let startDate = date;
    let endDate = date;
    if (weekCommencing) {
      const beginningOfWeekDate = moment(date).startOf('isoWeek').toDate();
      startDate = moment(beginningOfWeekDate).format('YYYY-MM-DD');
      const nextWorkingDay = this.getNextAvailableWorkingDayFromBankHolidays(beginningOfWeekDate);

      if (nextWorkingDay) {
        startDate = moment(nextWorkingDay).format('YYYY-MM-DD');
      }

      endDate = moment(beginningOfWeekDate).add(6, 'days').format('YYYY-MM-DD');
    }
    this.formErrors.emit(null);
    this.onSubmit.emit({
      courtCentre: organisationUnit.oucodeL3Name,
      courtCentreId: organisationUnit.id,
      courtRoomId,
      startDate,
      endDate,
      isCrownCourt: organisationUnit.oucodeL1Code === 'C'
    });
  }

  getNextAvailableWorkingDayFromBankHolidays(startDate: Date): Date | undefined {
    // Check whether we have a bankholiday matching the selected start date
    // and keep track of the index
    const startIndex = this.futurePublicHolidays.findIndex((b) => {
      return this.cppDate.isSame(b.date, startDate, 'day');
    });

    if (startIndex !== -1) {
      // We have a bank holiday matching the selected start date
      // Work out the next available WORKING date for that week
      let dayCount = 1;
      for (let i = startIndex + 1; i <= startIndex + 6; i++) {
        const nextConsecutiveBankHoliday = this.cppDate.add(startDate, dayCount);
        if (i >= this.futurePublicHolidays.length) {
          return nextConsecutiveBankHoliday;
        }

        const nextbankHolidayDate = new Date(this.futurePublicHolidays[i].date);
        if (!this.cppDate.isSame(nextbankHolidayDate, nextConsecutiveBankHoliday, 'day')) {
          return nextConsecutiveBankHoliday;
        }
        dayCount++;
      }
    }

    return undefined;
  }
}
