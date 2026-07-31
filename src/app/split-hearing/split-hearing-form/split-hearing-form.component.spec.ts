import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HearingByDefendants } from '../../core';
import { SplitHearingFormComponent } from './split-hearing-form.component';
import { mockFixtureInputs } from '../../../mock-data/mock-fixture-inputs';

describe('SplitHearingFormComponent', () => {
  let component: SplitHearingFormComponent;
  let fixture: ComponentFixture<SplitHearingFormComponent>;

  const hearingByDefendants = {
    hearingId: 'hearing-Id-001',
    defendantByCases: [
      {
        id: 'test-defendant-id-002',
        checked: false,
        prosecutionCases: [
          {
            id: 'test-case-id-001',
            caseIdentifier: {
              authorityId: 'cf73207f-3ced-488a-82a0-3fba79c2ce85',
              authorityCode: 'TFL',
              caseReference: 'TFL12345'
            },
            defendantId: 'test-defendant-id-002',
            offences: [
              {
                id: 'test-offence-id-004',
                offenceWording: 'some offence wording',
                statementOfOffence: {
                  title: 'offence title'
                },
                visible: false,
                checked: false
              }
            ]
          }
        ]
      }
    ]
  } as HearingByDefendants;

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitHearingFormComponent);
    component = fixture.componentInstance;
    mockFixtureInputs(fixture, {
      hearing: hearingByDefendants
    });
    fixture.detectChanges();
  });

  it('should match the snapshot', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should checked and unchecked all defendants and offences', () => {
    component.toggleWholeHearing(true);
    expect(component.isAllocateHearingButtonEnabled).toBeTruthy();

    component.toggleWholeHearing(false);
    expect(component.isAllocateHearingButtonEnabled).toBeFalsy();
  });

  it('should toggle defendant checkbox when and all offences are checked or unchecked', () => {
    hearingByDefendants.defendantByCases[0].prosecutionCases[0].offences[0].checked = true;
    component.toggleOffence(hearingByDefendants.defendantByCases[0]);
    expect(component.isAllocateHearingButtonEnabled).toBeTruthy();

    hearingByDefendants.defendantByCases[0].prosecutionCases[0].offences[0].checked = false;
    component.toggleOffence(hearingByDefendants.defendantByCases[0]);
    expect(component.isAllocateHearingButtonEnabled).toBeFalsy();
  });

  it('should continue with defendant and offences selected', () => {
    component.toggleWholeHearing(true);
    spyOn(component.onSubmit, 'emit');
    component.allocateHearing();

    expect(component.onSubmit.emit).toHaveBeenCalledWith({
      caseIds: ['test-case-id-001'],
      defendantIds: ['test-defendant-id-002'],
      offenceIds: ['test-offence-id-004']
    });
  });

  it('should continue with whole hearing option', () => {
    component.wholeHearing = true;

    spyOn(component.onSubmit, 'emit');
    component.allocateHearing();

    expect(component.onSubmit.emit).toHaveBeenCalled();
  });
});
