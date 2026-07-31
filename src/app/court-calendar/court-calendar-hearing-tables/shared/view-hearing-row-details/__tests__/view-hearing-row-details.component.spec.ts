import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewHearingRowDetailsComponent } from '../view-hearing-row-details.component';
import { By } from '@angular/platform-browser';
import { mockFixtureInputs } from '../../../../../../mock-data/mock-fixture-inputs';

describe('ViewHearingRowDetailsComponent', () => {
  let component: ViewHearingRowDetailsComponent;
  let fixture: ComponentFixture<ViewHearingRowDetailsComponent>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(ViewHearingRowDetailsComponent);
    component = fixture.componentInstance;
    mockFixtureInputs(fixture, {
      caseId: '*',
      applicationId: '*',
      hearing: {
        allocated: false,
        jurisdictionType: 'CROWN',
        hearingLanguage: 'ENGLISH',
        hasVideoLink: true,
        startDate: '2025-03-21T00:00:00Z',
        endDate: '2025-03-22T00:00:00Z',
        courtApplications: [
          {
            id: '*',
            applicant: {
              firstName: 'Grant',
              lastName: 'Boehm'
            },
            respondents: [
              {
                firstName: 'John',
                lastName: 'Smith'
              }
            ]
          }
        ],
        listedCases: [
          {
            id: '*',
            defendants: [
              {
                id: 'defendant-id-1',
                firstName: 'John',
                lastName: 'Dee',
                isYouth: true,
                bailStatus: { code: 'C' },
                custodyTimeLimit: '2024-01-20'
              },
              {
                id: 'defendant-id-2',
                firstName: 'Scott',
                lastName: 'Smith',
                isYouth: true,
                bailStatus: { code: 'C' },
                custodyTimeLimit: '2024-01-18'
              }
            ]
          }
        ]
      },
      caseNotes: [
        { note: 'Case note 1', isPinned: true },
        { note: 'Case note 2', isPinned: false }
      ],
      offences: [
        {
          id: '0cd40616-bfbf-11e7-b622-cfe11895a613',
          offenceWording: 'Wounding with intent'
        },
        {
          id: 'd28e9a5c-861f-4456-a5f1-19cffacbeba9',
          offenceWording: 'Wounding with intent'
        }
      ]
    });

    fixture.detectChanges();
  });

  it('should create the component', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture).toMatchSnapshot();
  });

  it('should display the public list note form when hearing is unallocated and jurisdiction type is CROWN', async () => {
    mockFixtureInputs(fixture, {
      hearing: { allocated: false, jurisdictionType: 'CROWN' }
    });
    fixture.detectChanges();
    const form = fixture.debugElement.query(By.css('form'));
    expect(form).toBeTruthy();
  });

  it('should not display the public list note form when hearing is allocated', () => {
    mockFixtureInputs(fixture, {
      hearing: { allocated: true, jurisdictionType: 'CROWN' }
    });
    fixture.detectChanges();
    const form = fixture.debugElement.query(By.css('form'));
    expect(form).toBeFalsy();
  });

  it('should emit updated hearing object when public list note is submitted', () => {
    mockFixtureInputs(fixture, {
      hearing: { allocated: false, jurisdictionType: 'CROWN' }
    });
    fixture.detectChanges();

    const emitSpy = jest.spyOn(component.updateHearingPublicListNote, 'emit');
    component.onSubmitPublicListNote({ publicListNote: 'New note' });

    expect(emitSpy).toHaveBeenCalledWith({
      allocated: false,
      jurisdictionType: 'CROWN',
      publicListNote: 'New note'
    });
  });
});
