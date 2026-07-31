import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormArray } from '@angular/forms';
import { FindAvailableHearingComponent } from './find-available-hearing.component';
import { validHearingMock1 } from '../../../mock-data/test-fixtures';
import { CheckboxChangeEvent, PdkCheckboxComponent } from '@cpp/pdk';
import { mockFixtureInputs } from '../../../mock-data/mock-fixture-inputs';

describe('FindAvailableHearingComponent', () => {
  let component: FindAvailableHearingComponent;
  let fixture: ComponentFixture<FindAvailableHearingComponent>;
  let specificCaseUrns: UntypedFormArray;

  beforeEach(async () => {
    fixture = TestBed.createComponent(FindAvailableHearingComponent);
    component = fixture.componentInstance;
    mockFixtureInputs(fixture, { hearing: validHearingMock1 });
    fixture.detectChanges();
    await fixture.whenStable();
    specificCaseUrns = component.relatedHearingsForm.get('specificCaseUrns') as UntypedFormArray;
  });

  it('should match the snapshot', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('#addAnotherSpecificCase', () => {
    expect(specificCaseUrns.length).toBe(1);

    component.addAnotherSpecificCase();

    expect(specificCaseUrns.length).toBe(2);
  });

  it('#handleResetFilters', () => {
    specificCaseUrns.at(0).setValue('test specific case');

    component.handleResetFilters();

    expect(specificCaseUrns.at(0).value).toBeNull();
  });

  it('#onSubmit', () => {
    spyOn(component.onFindAvailableHearings, 'emit');

    const caseTypes = component.relatedHearingsForm.get('caseTypes');

    caseTypes.setValue(['SAME_CASE', 'LINKED_CASE']);

    component.onSubmit();

    expect(component.onFindAvailableHearings.emit).toHaveBeenCalledWith({
      caseUrns: null,
      hearingId: 'b1bfe644-15d3-46aa-bdeb-fe8d18c16a42',
      jurisdictionType: 'MAGISTRATES',
      searchCriterias: ['CASE_IN_HEARING', 'MATCHED_DEFENDANTS']
    });
  });

  it('#onSubmit with Case urns', () => {
    spyOn(component.onFindAvailableHearings, 'emit');

    const caseTypes = component.relatedHearingsForm.get('caseTypes');

    caseTypes.setValue(['SAME_CASE', 'LINKED_CASE', 'SPECIFIC_CASE']);

    specificCaseUrns.at(0).setValue('test specific case');

    component.onSubmit();

    expect(component.onFindAvailableHearings.emit).toHaveBeenCalledWith({
      caseUrns: ['test specific case'],
      hearingId: 'b1bfe644-15d3-46aa-bdeb-fe8d18c16a42',
      jurisdictionType: 'MAGISTRATES',
      searchCriterias: ['CASE_IN_HEARING', 'MATCHED_DEFENDANTS']
    });
  });

  it('#checkSpecificCases, should reset specific cases if specific case checkbox is unchecked ', () => {
    const specificCheckbox = {} as PdkCheckboxComponent;
    const checkBoxEvent = { source: specificCheckbox, checked: false } as CheckboxChangeEvent;
    component.addAnotherSpecificCase();
    specificCaseUrns.at(0).setValue('test specific case');

    component.checkSpecificCases(checkBoxEvent, specificCheckbox);

    expect(specificCaseUrns.length).toBe(1);
    expect(specificCaseUrns.at(0).value).toBeNull();
  });

  it('#checkSpecificCases, should do nothing if specific case checkbox is checked ', () => {
    const specificCheckbox = {} as PdkCheckboxComponent;
    const checkBoxEvent = { source: specificCheckbox, checked: true } as CheckboxChangeEvent;
    component.addAnotherSpecificCase();
    specificCaseUrns.at(0).setValue('test specific case');

    component.checkSpecificCases(checkBoxEvent, specificCheckbox);

    expect(specificCaseUrns.length).toBe(2);
    expect(specificCaseUrns.at(0).value).toEqual('test specific case');
  });
});
