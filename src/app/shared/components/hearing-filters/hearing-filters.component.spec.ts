import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  CourtSummary,
  HearingType,
  Jurisdiction,
  Prosecutor,
  SelectedFilterOptions
} from '../../../core';
import { HearingFiltersComponent } from './hearing-filters.component';

const allSelectedFilters: SelectedFilterOptions = {
  courtCentreId: 'ALL',
  authorityId: 'ALL',
  hearingTypeId: 'ALL',
  jurisdictionType: 'ALL',
  possibleDisqualification: 'ALL'
};

describe('HearingFiltersComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let component: HearingFiltersComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.css('hearing-filters')).componentInstance;
    fixture.detectChanges();
  });

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
});

@Component({
  template: `
    <hearing-filters
      [selectedOptions]="selectedOptions"
      [courts]="courtSummaries"
      [prosecutors]="prosecutors"
      [hearingTypes]="hearingTypes"
      [jurisdictions]="jurisdictions"
      (onApplyFilters)="listHearings($event)"
      (onClearFilters)="resetHearingFilters()"
      (onValidationError)="errors = $event"
    >
    </hearing-filters>
  `,
  imports: [HearingFiltersComponent]
})
class TestHostComponent {
  selectedOptions: SelectedFilterOptions = allSelectedFilters;

  courtSummaries: CourtSummary[] = [
    { id: '1', name: 'Liverpool Crown Court' },
    { id: '2', name: 'Lavender Hill Magistrates Court' }
  ];
  prosecutors: Prosecutor[] = [
    { id: '3', name: 'DVLA' },
    { id: '4', name: 'TFL' }
  ];
  hearingTypes: HearingType[] = [
    {
      id: '5',
      name: 'Pre trial preparation'
    },
    {
      id: '6',
      name: 'Trial description'
    }
  ];
  jurisdictions: Jurisdiction[] = [
    { id: 'CROWN', name: 'Crown' },
    { id: 'MAGISTRATES', name: 'Magistrates' }
  ];

  listHearings = jest.fn();
  resetHearingFilters = jest.fn();
  validationErrors = jest.fn();
}
