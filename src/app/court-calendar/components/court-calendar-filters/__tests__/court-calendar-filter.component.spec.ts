import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourtCalendarFiltersComponent } from '../court-calendar-filters.component';
import { reducers } from '../../../../core/reducers';
import { CourtCalendarFilters } from '../../../model/court-calendar.model';
import { mockSearchFormValues, mockOrganisationUnits } from '../../../utils/mocks';
import { HearingType, OrganisationUnit } from '@cpp/reference-data';
import { provideStore } from '@ngrx/store';

describe('CourtCalendarFiltersComponent', () => {
  let component: CourtCalendarFiltersComponent;
  let fixture: ComponentFixture<CourtCalendarFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideStore(reducers, { runtimeChecks: {} })]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CourtCalendarFiltersComponent);
    component = fixture.componentInstance;

    const mockInitialValues: CourtCalendarFilters = mockSearchFormValues;
    fixture.componentRef.setInput('organisationUnits', mockOrganisationUnits);
    component.initialValues.set(mockInitialValues);
  });

  it('should create the component and initialize inputs', () => {
    component.initialValues.set({ ...mockSearchFormValues, courtType: 'MAGISTRATES' });
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should set startDate to the value provided when startDate is available', () => {
    const inputValues: CourtCalendarFilters = {
      courtType: 'MAGISTRATES',
      courtCentre: null,
      businessType: null,
      courtRoomId: null,
      startDate: '2025-02-03',
      endDate: null,
      courtSession: null
    };
    component.initialValues.set(inputValues);

    expect(component.initialValues()).toMatchInlineSnapshot(`
      {
        "businessType": null,
        "courtCentre": null,
        "courtRoomId": null,
        "courtSession": null,
        "courtType": "MAGISTRATES",
        "endDate": null,
        "startDate": "2025-02-03",
      }
    `);
  });

  it('should reset form values and emit jurisdictionTypeChange', () => {
    spyOn(component.jurisdictionTypeChange, 'emit');

    component.onJurisdictionChange();

    expect(component.initialValues().courtCentre).toBeNull();
    expect(component.initialValues().businessType).toBeNull();
    expect(component.initialValues().courtRoomId).toBeNull();
    expect(component.jurisdictionTypeChange.emit).toHaveBeenCalled();
  });

  it('should set hasCrownCourt to true if courtCentre is of Crown Court type', () => {
    const courtCentreMock = {
      oucodeL1Code: 'C',
      courtrooms: [{ id: '1', courtroomName: 'Courtroom 1' }]
    };

    component.handleCourtCentreChange(courtCentreMock as any);

    expect(component.hasCrownCourt).toBeTruthy();
    expect(component.courtroomOptions.length).toBe(1);
    expect(component.courtroomOptions[0].value).toBe('1');
  });

  it('should set hasCrownCourt to false if courtCentre is not of Crown Court type', () => {
    const courtCentreMock = {
      oucodeL1Code: 'B',
      courtrooms: [{ id: '2', courtroomName: 'Courtroom 2' }]
    };

    component.handleCourtCentreChange(courtCentreMock as any);

    expect(component.hasCrownCourt).toBeFalsy();
    expect(component.courtroomOptions.length).toBe(1);
    expect(component.courtroomOptions[0].value).toBe('2');
  });

  it('should submit the form with values selected', () => {
    spyOn(component.submitForm, 'emit');
    const params: CourtCalendarFilters = {
      courtCentre: mockOrganisationUnits[0],
      businessType: 'TypeA',
      courtRoomId: 'mockCourtRoomId-B',
      startDate: '2023-01-01',
      endDate: '2023-01-31',
      courtSession: 'AM',
      pageNumber: 1
    };
    component.handleSubmitForm(params);

    expect(component.submitForm.emit).toHaveBeenCalledWith(params);
  });

  it('should set the hearingType when a value is selected for CROWN COURT', () => {
    const inputValues: CourtCalendarFilters = {
      courtType: 'CROWN',
      courtCentre: null,
      businessType: null,
      courtRoomId: null,
      startDate: '2025-02-03',
      endDate: null,
      courtSession: null,
      hearingType: {
        id: '*',
        hearingDescription: 'name',
        defaultDurationMin: 30
      } as HearingType
    };
    component.initialValues.set(inputValues);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should emit the form submission event with hearing type values selected for CROWN COURT', () => {
    spyOn(component.submitForm, 'emit');

    const mockCourtCentre = {
      oucodeL1Code: 'C',
      courtrooms: [{ id: '1', courtroomName: 'Courtroom 1' }]
    } as OrganisationUnit;

    const mockHearingType = {
      id: '*',
      hearingDescription: 'name',
      defaultDurationMin: 30
    } as HearingType;

    const params: CourtCalendarFilters = {
      courtType: 'CROWN',
      courtCentre: mockCourtCentre,
      businessType: null,
      courtRoomId: null,
      startDate: '2025-02-03',
      endDate: null,
      courtSession: null,
      hearingType: mockHearingType,
      pageNumber: 1
    };
    component.handleSubmitForm(params);

    expect(component.submitForm.emit).toHaveBeenCalledWith(params);
  });
});
