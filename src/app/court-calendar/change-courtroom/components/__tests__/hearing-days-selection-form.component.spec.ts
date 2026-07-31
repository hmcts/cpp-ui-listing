import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectOption } from '@cpp/pdk';
import { HearingDaysSelectionFormComponent } from '../hearing-days-selection-form/hearing-days-selection-form.component';
import { ChangeCourtroomStore } from '../../component-store/change-courtroom.store';
import { mockFixtureInputs } from '../../../../../mock-data/mock-fixture-inputs';
import { SchedulingService } from '@cpp/scheduling';
import { Store } from '@ngrx/store';
import { Location } from '@angular/common';

describe('HearingDaysSelectionFormComponent', () => {
  let component: HearingDaysSelectionFormComponent;
  let fixture: ComponentFixture<HearingDaysSelectionFormComponent>;
  const mockCourtRoomOptions: SelectOption<string>[] = [
    { label: 'Room 1', value: 'room-1' },
    { label: 'Room 2', value: 'room-2' },
    { label: 'Room 3', value: 'room-3' }
  ];

  const allUpcomingHearingDays = [
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
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        ChangeCourtroomStore,
        { provide: SchedulingService, useValue: { searchHearingSlots: jest.fn() } },
        { provide: Store, useValue: { dispatch: jest.fn() } },
        { provide: Location, useValue: { back: jest.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HearingDaysSelectionFormComponent);
    component = fixture.componentInstance;
    mockFixtureInputs(fixture, {
      allUpcomingHearingDays,
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

    mockFixtureInputs(fixture, { selectedHearingDays: [allUpcomingHearingDays[1]] });
    fixture.detectChanges();

    component.handleReallocationSubmit({
      hearingDaysSelection: ['2025-06-18'],
      courtRoomId: 'room-2'
    });

    expect(onNavigateToReallocatedRoomSpy).toHaveBeenCalledWith({
      selectedHearingDays: [allUpcomingHearingDays[1]],
      courtRoomId: 'room-2'
    });
  });
});
