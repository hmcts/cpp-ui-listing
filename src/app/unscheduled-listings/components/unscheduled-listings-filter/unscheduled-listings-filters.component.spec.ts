import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CppHttp } from '@cpp/core';
import { OrganisationUnit } from '@cpp/reference-data';
import { provideStore } from '@ngrx/store';
import { FilterOption, reducers, SelectedFilterOptions } from '../../../core';
import { TypeOfListSummary } from '../../unscheduled-listings.interfaces';
import { UnscheduledListingsFiltersComponent } from './unscheduled-listings-filters.component';

const allSelectedFilters: SelectedFilterOptions = {
  oucodeL2Code: 'ALL',
  courtCentreId: 'ALL',
  typeOfList: 'ALL',
  caseUrn: 'test-case-urn'
};

const selectedFiltersNoCourtId: SelectedFilterOptions = {
  oucodeL2Code: 'ALL',
  courtCentreId: '',
  typeOfList: 'ALL',
  caseUrn: 'test-case-urn'
};

const mockOrganisationOptions: FilterOption[] = [
  {
    label: 'test-oucodeL3Name-01',
    value: '01'
  },
  {
    label: 'test-oucodeL3Name-02',
    value: '02'
  }
];

const mockCourtOptions: FilterOption[] = [
  {
    label: 'test-oucodeL3Name-01',
    value: '01'
  },
  {
    label: 'test-oucodeL3Name-02',
    value: '02'
  }
];

const formErrorsMock = jest.fn();

describe('UnscheduledListingsFiltersComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let component: UnscheduledListingsFiltersComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        provideStore(reducers),
        {
          provide: CppHttp,
          useValue: {
            query: jest.fn()
          }
        }
      ],
      teardown: { destroyAfterEach: false }
    }).compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.css('unscheduled-listings-filters')
    ).componentInstance;
    fixture.detectChanges();
    tick();
  }));

  it('should render correctly', () => {
    expect(fixture).toMatchSnapshot();
  });

  describe('#applyFilters', () => {
    it('should fire an applyFilters event with all default options when ApplyFilters button is clicked', fakeAsync(() => {
      spyOn(component.onApplyFilters, 'emit').and.callThrough();

      const aplyFiltersBtn: DebugElement = fixture.debugElement.query(
        By.css('[data-role="apply-filters-btn"]')
      );
      aplyFiltersBtn.nativeElement.click();
      tick();

      expect(component.onApplyFilters.emit).toHaveBeenCalledTimes(1);
      expect(hostComponent.listHearings).toHaveBeenCalledTimes(1);
      expect(hostComponent.listHearings).toHaveBeenCalledWith(allSelectedFilters);
    }));
  });

  it('should call reset forms and emit the values', () => {
    spyOn(component.onValidationError, 'emit');
    component.clearFilters();

    expect(component.onValidationError.emit).toHaveBeenCalledWith(null);
  });

  it('should call getSuggestions()', () => {
    const result = component.getSuggestions('1');
    expect(result).toEqual([mockOrganisationOptions[0]]);
  });

  it('should call getSuggestions() and return no options', () => {
    const result = component.getSuggestions('');
    expect(result).toEqual([]);
  });

  it('should call currentCourtCentreOption and return null', () => {
    hostComponent.selectedOptions = selectedFiltersNoCourtId;
    fixture.detectChanges();
    expect(component.currentCourtCentreOption).toEqual(null);
  });

  it('should call handleOrgUnitOptionChange()', () => {
    component.handleOrgUnitOptionChange('test-oucodeL2Code-01');
    const result = component.getSuggestions('1');
    expect(result).toEqual([mockCourtOptions[0]]);
  });
});

@Component({
  template: `
    <unscheduled-listings-filters
      [selectedOptions]="selectedOptions"
      [organisationUnits]="operationalUnitOptions"
      [typeOfListCodeOptions]="typeOfListCodeOptions"
      (onApplyFilters)="listHearings($event)"
      (onClearFilters)="resetUnscheduledHearingFilters()"
      (onValidationError)="validationErrors($event)"
    ></unscheduled-listings-filters>
  `,
  imports: [UnscheduledListingsFiltersComponent]
})
class TestHostComponent {
  selectedOptions: SelectedFilterOptions = allSelectedFilters;

  operationalUnitOptions: OrganisationUnit[] = [
    {
      id: '01',
      oucode: 'test-ou-code-01',
      oucodeL3Code: 'test-oucodeL3Code-01',
      oucodeL3Name: 'test-oucodeL3Name-01',
      oucodeL2Code: 'test-oucodeL2Code-01',
      oucodeL2Name: 'test-oucodeL2Name-01',
      oucodeL1Code: 'test-oucodeL1Code-01',
      oucodeL1Name: 'test-oucodeL1Name-01'
    },
    {
      id: '02',
      oucode: 'test-ou-code-02',
      oucodeL3Code: 'test-oucodeL3Code-02',
      oucodeL3Name: 'test-oucodeL3Name-02',
      oucodeL2Code: 'test-oucodeL2Code-02',
      oucodeL2Name: 'test-oucodeL2Name-02',
      oucodeL1Code: 'test-oucodeL1Code-02',
      oucodeL1Name: 'test-oucodeL1Name-02'
    }
  ];

  typeOfListCodeOptions: TypeOfListSummary[] = [
    {
      value: 'c98cb51f-8639-49c1-91f0-a7e820c34355',
      label: 'Warrant for arrest without bail'
    },
    {
      value: 'ed34136f-2a13-45a4-8d4f-27075ae3a8a9',
      label: 'Warrant for arrest for community penalty without bail'
    }
  ];

  listHearings = jest.fn();
  resetUnscheduledHearingFilters = jest.fn();
  validationErrors = formErrorsMock;
}
