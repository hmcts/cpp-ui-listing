import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganisationUnit, PublicHoliday } from '@cpp/reference-data';
import { provideStore } from '@ngrx/store';
import { reducers } from '../../core/reducers';
import { CreateListFilterComponent } from './create-list-filter.component';

@Component({
  template: `
    <create-list-filter
      [hasCpsAccessOnly]="hasCpsAccessOnly"
      (formErrors)="formErrors($event)"
      (onSubmit)="onSubmit($event)"
      (selectCourtCentre)="onSelectCourtCentre($event)"
    >
    </create-list-filter>
  `,
  imports: [CreateListFilterComponent]
})
class TestHostComponent {
  formErrors = jest.fn();
  hasCpsAccessOnly = false;
  onSelectCourtCentre = jest.fn();
  onSubmit = jest.fn();
}

describe('CreateListFilterComponent', () => {
  let component: CreateListFilterComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore(reducers)],
      teardown: { destroyAfterEach: false }
    }).configureCompiler({ preserveWhitespaces: false } as any);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.children[0].componentInstance;
    fixture.detectChanges();
  });

  it('should render', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should format week commencing values', () => {
    expect(component.formatWeekCommencingDisplayText('2020-01-01')).toEqual(
      'Week commencing 30 Dec 2019'
    );
  });

  it('should set the courtroomOptions when an organisation unit is selected', () => {
    component.handleOrganisationUnitChange({
      courtrooms: [
        {
          id: 'courtroomId1',
          courtroomName: 'A'
        },
        {
          id: 'courtroomId2',
          courtroomName: 'B'
        }
      ]
    } as OrganisationUnit);

    expect(component.courtroomOptions).toEqual([
      { label: 'All Courtrooms', value: '', selected: true },
      { label: 'A', value: 'courtroomId1' },
      { label: 'B', value: 'courtroomId2' }
    ]);

    component.handleOrganisationUnitChange(null);

    expect(component.courtroomOptions).toEqual([]);
  });

  it('should submit a Magistrates search', () => {
    component.handleFormSubmit({
      organisationUnit: {
        id: 'A',
        oucodeL1Name: "Magistrates' Courts",
        oucodeL3Name: 'Court centre',
        oucodeL1Code: 'B'
      } as OrganisationUnit,
      courtroomId: 'B',
      date: '2020-01-01'
    });

    expect(fixture.componentInstance.formErrors).toHaveBeenCalledWith(null);
    expect(fixture.componentInstance.onSubmit).toHaveBeenCalledWith({
      courtCentreId: 'A',
      courtCentre: 'Court centre',
      courtRoomId: 'B',
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
      dateType: 'FIXED',
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

  it('should submit a Crown Court search with week commencing date values', () => {
    component.handleFormSubmit({
      organisationUnit: {
        id: 'A',
        oucodeL1Name: 'Crown Courts',
        oucodeL3Name: 'Court centre',
        oucodeL1Code: 'C'
      } as OrganisationUnit,
      dateType: 'WEEK_COMMENCING',
      date: '2020-01-10'
    });

    expect(fixture.componentInstance.formErrors).toHaveBeenCalledWith(null);
    expect(fixture.componentInstance.onSubmit).toHaveBeenCalledWith({
      courtCentreId: 'A',
      courtCentre: 'Court centre',
      courtRoomId: undefined,
      startDate: '2020-01-06',
      endDate: '2020-01-12',
      isCrownCourt: true
    });
  });

  it('should submit a Crown Court search with week commencing date falling on bank holiday', () => {
    component.futurePublicHolidays = [{ date: '2023-08-28' } as PublicHoliday];
    component.handleFormSubmit({
      organisationUnit: {
        id: 'A',
        oucodeL1Name: 'Crown Courts',
        oucodeL3Name: 'Court centre',
        oucodeL1Code: 'C'
      } as OrganisationUnit,
      dateType: 'WEEK_COMMENCING',
      date: '2023-08-28'
    });

    expect(fixture.componentInstance.formErrors).toHaveBeenCalledWith(null);
    expect(fixture.componentInstance.onSubmit).toHaveBeenCalledWith({
      courtCentreId: 'A',
      courtCentre: 'Court centre',
      courtRoomId: undefined,
      startDate: '2023-08-29',
      endDate: '2023-09-03',
      isCrownCourt: true
    });
  });

  it('should submit a Crown Court search with week commencing date falling on consecutive bank holidays', () => {
    component.futurePublicHolidays = [
      { date: '2023-12-25' },
      { date: '2023-12-26' },
      { date: '2023-12-27' }
    ] as PublicHoliday[];
    component.handleFormSubmit({
      organisationUnit: {
        id: 'A',
        oucodeL1Name: 'Crown Courts',
        oucodeL3Name: 'Court centre',
        oucodeL1Code: 'C'
      } as OrganisationUnit,
      dateType: 'WEEK_COMMENCING',
      date: '2023-12-26'
    });

    expect(fixture.componentInstance.formErrors).toHaveBeenCalledWith(null);
    expect(fixture.componentInstance.onSubmit).toHaveBeenCalledWith({
      courtCentreId: 'A',
      courtCentre: 'Court centre',
      courtRoomId: undefined,
      startDate: '2023-12-28',
      endDate: '2023-12-31',
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

  it('should restrict organistion units to magistrate courts when `hasCpsAccessOnly` input is applied', () => {
    const ouForCrownCourt = { oucodeL1Code: 'C' } as OrganisationUnit;
    const ouForMagistratesCourt = { oucodeL1Code: 'B' } as OrganisationUnit;

    expect(component.filterOrganisationUnit(ouForCrownCourt)).toBe(true);
    expect(component.filterOrganisationUnit(ouForMagistratesCourt)).toBe(true);
    fixture.componentInstance.hasCpsAccessOnly = true;
    fixture.detectChanges();
    expect(component.filterOrganisationUnit(ouForCrownCourt)).toBe(false);
    expect(component.filterOrganisationUnit(ouForMagistratesCourt)).toBe(true);
  });
});
