import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectOption } from '@cpp/pdk';
import { HearingDaysSelectionFormComponent } from '../hearing-days-selection-form/hearing-days-selection-form.component';
import { mockFixtureInputs } from '../../../../../mock-data/mock-fixture-inputs';

describe('HearingDaysSelectionFormComponent', () => {
  let component: HearingDaysSelectionFormComponent;
  let fixture: ComponentFixture<HearingDaysSelectionFormComponent>;
  const mockCourtRoomOptions: SelectOption<string>[] = [
    { label: 'Room 1', value: 'room-1' },
    { label: 'Room 2', value: 'room-2' },
    { label: 'Room 3', value: 'room-3' }
  ];

  beforeEach(() => {
    fixture = TestBed.createComponent(HearingDaysSelectionFormComponent);
    component = fixture.componentInstance;
    mockFixtureInputs(fixture, {
      allUpcomingHearingDays: [
        {
          hearingDate: '2025-06-17',
          courtCentreId: 'court-1',
          courtRoomId: 'room-1',
          durationMinutes: 120,
          startTime: '09:00',
          position: 3,
          endTime: '11:00'
        },
        {
          hearingDate: '2025-06-18',
          courtCentreId: 'court-1',
          courtRoomId: 'room-1',
          durationMinutes: 120,
          startTime: '09:00',
          position: 4,
          endTime: '11:00'
        },
        {
          hearingDate: '2025-06-19',
          courtCentreId: 'court-1',
          courtRoomId: 'room-1',
          durationMinutes: 120,
          startTime: '09:00',
          position: 5,
          endTime: '11:00'
        }
      ],
      courtRoomOptions: mockCourtRoomOptions,
      totalHearingDaysCount: 10,
      courtCentreName: 'Croydon Crown Court'
    });
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(fixture).toMatchSnapshot();
  });

  it('should emit onSelectionNavigate event when handleReallocationSubmit is called', () => {
    const onNavigateToReallocatedRoomSpy = spyOn(component.onSelectionNavigate, 'emit');

    const mockForm = {
      valid: true,
      value: {
        hearingDaysSelection: ['2025-06-18'],
        courtRoomId: 'room-2'
      }
    } as any;

    component.handleReallocationSubmit(mockForm.value);

    expect(onNavigateToReallocatedRoomSpy).toHaveBeenCalledWith({
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
      courtRoomId: 'room-2'
    });
  });
});
