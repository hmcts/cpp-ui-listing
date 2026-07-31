import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganisationUnit } from '@cpp/reference-data';
import { provideStore } from '@ngrx/store';
import { reducers } from '../../core/reducers';
import { CreatePrisonListFilterComponent } from './create-prison-list-filter.component';
import { provideRouter } from '@angular/router';

@Component({
  template: `
    <create-prison-list-filter
      (formErrors)="formErrors($event)"
      (onSubmit)="onSubmit($event)"
      (selectCourtCentre)="onSelectCourtCentre($event)"
    >
    </create-prison-list-filter>
  `,
  imports: [CreatePrisonListFilterComponent]
})
class TestHostComponent {
  formErrors = jest.fn();
  onSelectCourtCentre = jest.fn();
  onSubmit = jest.fn();
}

describe('CreatePrisonListFilterComponent', () => {
  let component: CreatePrisonListFilterComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore(reducers, { runtimeChecks: {} }), provideRouter([])],
      teardown: { destroyAfterEach: false }
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.children[0].componentInstance;
    fixture.detectChanges();
  });

  it('should render', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should submit a Magistrates search', () => {
    component.handleFormSubmit({
      organisationUnit: {
        id: 'A',
        oucodeL1Name: "Magistrates' Courts",
        oucodeL3Name: 'Court centre',
        oucodeL1Code: 'B'
      } as OrganisationUnit,
      date: '2020-01-01'
    });

    expect(fixture.componentInstance.formErrors).toHaveBeenCalledWith(null);
    expect(fixture.componentInstance.onSubmit).toHaveBeenCalledWith({
      courtCentreId: 'A',
      courtCentre: 'Court centre',
      startDate: '2020-01-01',
      endDate: '2020-01-01',
      isCrownCourt: false
    });
  });

  it('should submit a Crown Court search with fixed date values', () => {
    component.handleFormSubmit({
      organisationUnit: {
        id: 'A',
        oucodeL1Name: 'Crown Courts',
        oucodeL3Name: 'Court centre',
        oucodeL1Code: 'C'
      } as OrganisationUnit,
      date: '2020-01-10'
    });

    expect(fixture.componentInstance.formErrors).toHaveBeenCalledWith(null);
    expect(fixture.componentInstance.onSubmit).toHaveBeenCalledWith({
      courtCentreId: 'A',
      courtCentre: 'Court centre',
      courtRoomId: undefined,
      startDate: '2020-01-10',
      endDate: '2020-01-10',
      isCrownCourt: true
    });
  });

  it('should emit an event when an organisation unit is selected', () => {
    const organisationUnit = {
      oucodeL3Name: 'Lavander',
      id: '9b583616-049b-30f9-a14f-028a53b7cfe8',
      courtrooms: []
    } as OrganisationUnit;

    component.handleOrganisationUnitChange(organisationUnit);

    expect(fixture.componentInstance.onSelectCourtCentre).toHaveBeenCalledWith({
      label: organisationUnit.oucodeL3Name,
      value: organisationUnit.id
    });

    component.handleOrganisationUnitChange(null);

    expect(fixture.componentInstance.onSelectCourtCentre).toHaveBeenCalledWith(null);
  });
});
