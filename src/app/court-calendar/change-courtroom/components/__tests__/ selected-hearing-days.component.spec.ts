import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectedHearingDaysComponent } from '../selected-hearing-days/selected-hearing-days.component';
import { mockFixtureInputs } from '../../../../../mock-data/mock-fixture-inputs';

describe('SelectedHearingDaysComponent', () => {
  let component: SelectedHearingDaysComponent;
  let fixture: ComponentFixture<SelectedHearingDaysComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedHearingDaysComponent);
    component = fixture.componentInstance;
    mockFixtureInputs(fixture, {
      selectedHearingDays: [
        {
          hearingDate: '2025-06-18',
          courtCentreId: 'court-1',
          courtRoomId: 'room-1',
          durationMinutes: 120,
          startTime: '09:00',
          position: 4,
          endTime: '11:00'
        }
      ],
      hearingVM: {
        cases: [
          {
            caseId: '6c9d74c1-f8ad-43df-af8e-34c621e5fece',
            caseUrn: '59GD9249725'
          }
        ],
        courtCentre: 'Croydon Crown Court',
        hasReportingRestriction: false,
        hearingType: 'Trial',
        time: '2025-07-24T09:00:00.000Z',
        totalHearingDaysCount: 6,
        upComingHearingDays: [
          {
            courtCentreId: '07e45c88-9e5d-3e44-b664-d5345bb13be2',
            courtRoomId: '731816c1-5ee4-373a-9bda-840e13a5bcb0',
            durationMinutes: 360,
            endTime: '2025-07-24T15:00:00.000Z',
            hearingDate: '2025-07-24',
            position: 1,
            sequence: 0,
            startTime: '2025-07-24T09:00:00.000Z'
          }
        ]
      }
    });
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(fixture).toMatchSnapshot();
  });
});
