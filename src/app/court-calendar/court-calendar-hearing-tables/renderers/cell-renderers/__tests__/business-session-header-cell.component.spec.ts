import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { BusinessSessionHeaderCellComponent } from '../business-session-header-cell.component';
import { CourtRoomSessionCalendar } from '../../../../model';
import { SelectedHearingState } from '../../../../court-calendar-hearing-tables/component-store/hearing-table-actions.store';
import { CourtSession } from '@cpp/scheduling';

@Component({
  selector: 'mock-display-business-type-allocate-pipe',
  template: '',
  standalone: true
})
class MockDisplayBusinessTypeAllocatePipe {
  transform = jest.fn().mockReturnValue(true);
}

@Component({
  template: `
    <business-session-header-cell
      [slot]="slot"
      [selectedAllocationHearings]="selectedAllocationHearings"
      [hearingsDurationSummary]="hearingsDurationSummary"
      (allocate)="onAllocate($event)"
    >
    </business-session-header-cell>
  `,
  imports: [BusinessSessionHeaderCellComponent]
})
class TestWrapperComponent {
  slot: CourtRoomSessionCalendar['slot'];
  selectedAllocationHearings: SelectedHearingState[] = [];
  hearingsDurationSummary: string;
  onAllocate = jest.fn();
}

describe('BusinessSessionHeaderCellComponent', () => {
  let wrapperComponent: TestWrapperComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;
  let component: BusinessSessionHeaderCellComponent;

  beforeEach(async () => {
    jest.doMock('../../../../pipes/display-business-type-allocate.pipe', () => ({
      DisplayBusinessTypeAllocatePipe: MockDisplayBusinessTypeAllocatePipe
    }));

    fixture = TestBed.createComponent(TestWrapperComponent);
    wrapperComponent = fixture.componentInstance;

    const businessHeaderCellDebugElement = fixture.debugElement.query(
      By.directive(BusinessSessionHeaderCellComponent)
    );
    component = businessHeaderCellDebugElement.componentInstance;

    jest.clearAllMocks();
  });

  const createMockSlot = (
    courtScheduleId: string = 'schedule-1',
    startTime: string = '2024-01-01T09:00:00',
    endTime: string = '2024-01-01T17:00:00',
    sessionType: CourtSession = 'AM'
  ): CourtRoomSessionCalendar['slot'] => ({
    courtScheduleId,
    session: {
      startTime,
      endTime,
      type: sessionType
    }
  });

  const createMockSelectedHearing = (id: string, dateTime: string): SelectedHearingState => ({
    hearingId: id,
    hearingDateTime: dateTime,
    judiciary: []
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
      expect(wrapperComponent).toBeTruthy();
    });

    it('should have default values for inputs', () => {
      expect(component.selectedAllocationHearings()).toEqual([]);
      expect(component.slot()).toBeUndefined();
      expect(component.hearingsDurationSummary()).toBeUndefined();
    });

    it('should have allocate EventEmitter', () => {
      expect(component.allocate).toBeDefined();
      expect(component.allocate.emit).toBeDefined();
    });
  });

  describe('Template Rendering', () => {
    it('should not render anything when slot is null', () => {
      wrapperComponent.slot = null as any;

      fixture.detectChanges();

      const containerDiv = fixture.debugElement.query(By.css('.flex-display.flex-align-baseline'));
      expect(containerDiv).toBeNull();
    });

    it('should not render anything when slot is undefined', () => {
      wrapperComponent.slot = undefined as any;

      fixture.detectChanges();

      const containerDiv = fixture.debugElement.query(By.css('.flex-display.flex-align-baseline'));
      expect(containerDiv).toBeNull();
    });

    it('should render session time when slot is provided', () => {
      wrapperComponent.slot = createMockSlot();

      fixture.detectChanges();

      const sessionElement = fixture.debugElement.query(
        By.css('[data-test-id="business-type-session"]')
      );
      expect(sessionElement).toBeTruthy();
    });

    it('should render allocate button when conditions are met', () => {
      wrapperComponent.slot = createMockSlot();
      wrapperComponent.selectedAllocationHearings = [
        createMockSelectedHearing('1', '2024-01-01T10:00:00')
      ];

      fixture.detectChanges();

      const allocateButton = fixture.debugElement.query(By.css('[data-test-id="allocate-button"]'));
      expect(allocateButton).toBeTruthy();
      expect(allocateButton.nativeElement.textContent.trim()).toBe('Allocate here');
    });
  });

  describe('Getter Methods', () => {
    describe('startTime getter', () => {
      it('should return startTime from slot session', () => {
        const mockSlot = createMockSlot('schedule-1', '2024-01-01T10:30:00');
        fixture.componentInstance.slot = mockSlot;
        fixture.detectChanges();
        expect(component.startTime).toBe('2024-01-01T10:30:00');
      });

      it('should return empty string when slot is null', () => {
        fixture.componentInstance.slot = null as any;
        fixture.detectChanges();
        expect(component.startTime).toBe('');
      });

      it('should return empty string when session is null', () => {
        fixture.componentInstance.slot = {
          courtScheduleId: 'schedule-1',
          session: null as any
        };
        fixture.detectChanges();
        expect(component.startTime).toBe('');
      });
    });

    describe('endTime getter', () => {
      it('should return endTime from slot session', () => {
        const mockSlot = createMockSlot('schedule-1', '2024-01-01T09:00:00', '2024-01-01T16:30:00');
        fixture.componentInstance.slot = mockSlot;
        fixture.detectChanges();
        expect(component.endTime).toBe('2024-01-01T16:30:00');
      });

      it('should return empty string when slot is null', () => {
        fixture.componentInstance.slot = null as any;
        fixture.detectChanges();
        expect(component.endTime).toBe('');
      });

      it('should return empty string when session is null', () => {
        fixture.componentInstance.slot = {
          courtScheduleId: 'schedule-1',
          session: null as any
        };

        expect(component.endTime).toBe('');
      });
    });
  });

  describe('Event Handling', () => {
    it('should emit allocate event when allocate button is clicked', () => {
      const mockSlot = createMockSlot(
        'test-schedule-id',
        '2024-01-01T09:00:00',
        '2024-01-01T17:00:00',
        'PM'
      );
      wrapperComponent.slot = mockSlot;
      wrapperComponent.selectedAllocationHearings = [
        createMockSelectedHearing('1', '2024-01-01T10:00:00')
      ];

      const emitSpy = jest.spyOn(component.allocate, 'emit');

      fixture.detectChanges();
      const allocateButton = fixture.debugElement.query(By.css('[data-test-id="allocate-button"]'));
      allocateButton.nativeElement.click();

      expect(emitSpy).toHaveBeenCalledWith({
        courtScheduleId: 'test-schedule-id',
        session: 'PM'
      });
    });
  });

  describe('Input Changes', () => {
    it('should update display when slot changes', () => {
      const initialSlot = createMockSlot();
      wrapperComponent.slot = initialSlot;

      fixture.detectChanges();

      const sessionElement = fixture.debugElement.query(
        By.css('[data-test-id="business-type-session"]')
      );
      expect(sessionElement).toBeTruthy();

      const newSlot = createMockSlot('schedule-2', '2024-01-01T14:00:00', '2024-01-01T18:00:00');
      wrapperComponent.slot = newSlot;
      fixture.detectChanges();

      expect(sessionElement).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty selectedAllocationHearings array', () => {
      wrapperComponent.slot = createMockSlot();
      wrapperComponent.selectedAllocationHearings = [];

      fixture.detectChanges();

      const businessHeaderCell = fixture.debugElement.query(
        By.directive(BusinessSessionHeaderCellComponent)
      );
      expect(businessHeaderCell).toBeTruthy();
    });
  });
});
