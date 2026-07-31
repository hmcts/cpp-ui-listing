import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NonDefaultDaysComponent } from './non-default-days.component';
import { HearingDay } from '../../../core';
import { mockFixtureInputs } from '../../../../mock-data/mock-fixture-inputs';

describe('NonDefaultDaysComponent', () => {
  let component: NonDefaultDaysComponent;
  let fixture: ComponentFixture<NonDefaultDaysComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NonDefaultDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', async () => {
    expect(component).toBeTruthy();
    await fixture.whenStable();
    expect(fixture).toMatchSnapshot();
  });

  it('should add a non-default day assigning the parenct court room id', () => {
    mockFixtureInputs(fixture, {
      parentCourtRoomId: 'parent-court-room-id'
    });
    component.formGroup.setValue({
      date: '2025-02-03',
      startTime: '10:00'
    });

    component.submitDefaultDays();
    fixture.detectChanges();

    expect(component.copyNonDefaultDays.length).toBe(1);
    expect(component.copyNonDefaultDays[0].startTime).toContain('2025-02-03T10:00');
    expect(component.copyNonDefaultDays[0].roomId).toContain('parent-court-room-id');
  });

  it('should add a non-default day band persist the original hearing day courtroom id', () => {
    mockFixtureInputs(fixture, {
      hearingDays: [
        {
          hearingDate: '2025-02-03',
          courtRoomId: 'hearing-day-court-room-id'
        } as HearingDay
      ],
      parentCourtRoomId: 'parent-court-room-id'
    });
    component.formGroup.setValue({
      date: '2025-02-03',
      startTime: '10:00'
    });

    component.submitDefaultDays();
    fixture.detectChanges();

    expect(component.copyNonDefaultDays.length).toBe(1);
    expect(component.copyNonDefaultDays[0].startTime).toContain('2025-02-03T10:00');
    expect(component.copyNonDefaultDays[0].roomId).toContain('hearing-day-court-room-id');
  });

  it('should remove a non-default day', () => {
    component.formGroup.setValue({
      date: '2025-02-03',
      startTime: '10:00'
    });
    component.submitDefaultDays();
    fixture.detectChanges();

    component.cancelNonNonDefaultDay(0);
    fixture.detectChanges();

    expect(component.copyNonDefaultDays.length).toBe(0);
  });

  it('should handle form submission', () => {
    spyOn(component, 'propagateChange');

    component.formGroup.setValue({
      date: '2025-02-03',
      startTime: '10:00'
    });
    component.submitDefaultDays();
    fixture.detectChanges();

    component.propagateChange(component.copyNonDefaultDays);
    fixture.detectChanges();

    expect(component.propagateChange).toHaveBeenCalledWith(component.copyNonDefaultDays);
  });
});
