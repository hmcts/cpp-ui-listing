import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { BusinessHeaderCellComponent } from '../business-header-cell.component';
import { CourtRoomBusinessTypeCalendar } from '../../../../model';
import { SelectedHearingState } from '../../../../court-calendar-hearing-tables/component-store/hearing-table-actions.store';
import { RotaBusinessTypeCode, RotaBusinessType } from '@cpp/reference-data';
import { CourtSession } from '@cpp/scheduling';

@Component({
  selector: 'mock-business-type-description-pipe',
  template: '',
  standalone: true
})
class MockBusinessTypeDescriptionByCodePipe {
  transform = jest.fn().mockReturnValue('Mag Court');
}

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
    <business-header-cell
      [businessTypeAndSlot]="businessTypeAndSlot"
      [selectedAllocationHearings]="selectedAllocationHearings"
      [hearingsDurationSummary]="hearingsDurationSummary"
      [rotaBusinessTypes]="rotaBusinessTypes"
      (allocate)="onAllocate($event)"
    >
    </business-header-cell>
  `,
  imports: [BusinessHeaderCellComponent]
})
class TestWrapperComponent {
  businessTypeAndSlot: CourtRoomBusinessTypeCalendar['businessTypeAndSlot'];
  selectedAllocationHearings: SelectedHearingState[] = [];
  hearingsDurationSummary: string;
  rotaBusinessTypes: RotaBusinessType[] = [];
  onAllocate = jest.fn();
}

describe('BusinessHeaderCellComponent', () => {
  let wrapperComponent: TestWrapperComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;
  let component: BusinessHeaderCellComponent;

  beforeEach(async () => {
    jest.doMock('../../../../pipes/business-type-description.pipe', () => ({
      BusinessTypeDescriptionByCodePipe: MockBusinessTypeDescriptionByCodePipe
    }));

    jest.doMock('../../../../pipes/display-business-type-allocate.pipe', () => ({
      DisplayBusinessTypeAllocatePipe: MockDisplayBusinessTypeAllocatePipe
    }));

    fixture = TestBed.createComponent(TestWrapperComponent);
    wrapperComponent = fixture.componentInstance;

    const businessHeaderCellDebugElement = fixture.debugElement.query(
      By.directive(BusinessHeaderCellComponent)
    );
    component = businessHeaderCellDebugElement.componentInstance;

    jest.clearAllMocks();
  });

  const createMockBusinessTypeAndSlot = (
    businessTypeCode: RotaBusinessTypeCode = RotaBusinessTypeCode.councilTax,
    courtScheduleId: string = 'schedule-1',
    startTime: string = '2024-01-01T09:00:00',
    endTime: string = '2024-01-01T17:00:00',
    sessionType: CourtSession = 'AM'
  ): CourtRoomBusinessTypeCalendar['businessTypeAndSlot'] => ({
    businessTypeCode,
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

  const createMockRotaBusinessTypes = (): RotaBusinessType[] => [
    {
      id: '1',
      seqNum: 1,
      typeCode: RotaBusinessTypeCode.bailCase,
      typeDescription: 'Bail case',
      slot: true,
      duration: true
    },
    {
      id: '2',
      seqNum: 2,
      typeCode: RotaBusinessTypeCode.dvla,
      typeDescription: 'DVLA',
      slot: false,
      duration: false
    }
  ];

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
      expect(wrapperComponent).toBeTruthy();
    });

    it('should have default values for inputs', () => {
      expect(component.selectedAllocationHearings()).toEqual([]);
      expect(component.rotaBusinessTypes()).toEqual([]);
      expect(component.businessTypeAndSlot()).toBeUndefined();
      expect(component.hearingsDurationSummary()).toBeUndefined();
    });

    it('should have allocate EventEmitter', () => {
      expect(component.allocate).toBeDefined();
      expect(component.allocate.emit).toBeDefined();
    });
  });

  describe('Template Rendering', () => {
    it('should not render anything when businessTypeAndSlot is null', () => {
      wrapperComponent.businessTypeAndSlot = null as any;

      fixture.detectChanges();

      const containerDiv = fixture.debugElement.query(By.css('.flex-display.flex-display-column'));
      expect(containerDiv).toBeNull();
    });

    it('should not render anything when businessTypeAndSlot is undefined', () => {
      wrapperComponent.businessTypeAndSlot = undefined as any;

      fixture.detectChanges();

      const containerDiv = fixture.debugElement.query(By.css('.flex-display.flex-display-column'));
      expect(containerDiv).toBeNull();
    });

    it('should render business type header when businessTypeAndSlot is provided', () => {
      wrapperComponent.businessTypeAndSlot = createMockBusinessTypeAndSlot();
      wrapperComponent.rotaBusinessTypes = createMockRotaBusinessTypes();

      fixture.detectChanges();

      const businessTypeElement = fixture.debugElement.query(
        By.css('[data-test-id="businessType"]')
      );
      expect(businessTypeElement).toBeTruthy();
    });

    it('should render allocate button when conditions are met', () => {
      wrapperComponent.businessTypeAndSlot = createMockBusinessTypeAndSlot();
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
      it('should return startTime from businessTypeAndSlot session', () => {
        const mockSlot = createMockBusinessTypeAndSlot(
          RotaBusinessTypeCode.councilTax,
          'schedule-1',
          '2024-01-01T10:30:00'
        );
        fixture.componentInstance.businessTypeAndSlot = mockSlot;
        fixture.detectChanges();
        expect(component.startTime).toBe('2024-01-01T10:30:00');
      });

      it('should return empty string when businessTypeAndSlot is null', () => {
        fixture.componentInstance.businessTypeAndSlot = null as any;
        fixture.detectChanges();
        expect(component.startTime).toBe('');
      });

      it('should return empty string when session is null', () => {
        fixture.componentInstance.businessTypeAndSlot = {
          businessTypeCode: RotaBusinessTypeCode.councilTax,
          courtScheduleId: 'schedule-1',
          session: null as any
        };
        fixture.detectChanges();
        expect(component.startTime).toBe('');
      });
    });

    describe('endTime getter', () => {
      it('should return endTime from businessTypeAndSlot session', () => {
        const mockSlot = createMockBusinessTypeAndSlot(
          RotaBusinessTypeCode.councilTax,
          'schedule-1',
          '2024-01-01T09:00:00',
          '2024-01-01T16:30:00'
        );
        fixture.componentInstance.businessTypeAndSlot = mockSlot;
        fixture.detectChanges();
        expect(component.endTime).toBe('2024-01-01T16:30:00');
      });

      it('should return empty string when businessTypeAndSlot is null', () => {
        fixture.componentInstance.businessTypeAndSlot = null as any;
        fixture.detectChanges();
        expect(component.endTime).toBe('');
      });

      it('should return empty string when session is null', () => {
        fixture.componentInstance.businessTypeAndSlot = {
          businessTypeCode: RotaBusinessTypeCode.councilTax,
          courtScheduleId: 'schedule-1',
          session: null as any
        };

        expect(component.endTime).toBe('');
      });
    });
  });

  describe('Event Handling', () => {
    it('should emit allocate event when allocate button is clicked', () => {
      const mockSlot = createMockBusinessTypeAndSlot(
        RotaBusinessTypeCode.councilTax,
        'test-schedule-id',
        '2024-01-01T09:00:00',
        '2024-01-01T17:00:00',
        'PM'
      );
      wrapperComponent.businessTypeAndSlot = mockSlot;
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
    it('should update display when businessTypeAndSlot changes', () => {
      const initialSlot = createMockBusinessTypeAndSlot(RotaBusinessTypeCode.remands);
      wrapperComponent.businessTypeAndSlot = initialSlot;
      wrapperComponent.rotaBusinessTypes = createMockRotaBusinessTypes();

      fixture.detectChanges();

      const businessTypeElement = fixture.debugElement.query(
        By.css('[data-test-id="businessType"]')
      );
      expect(businessTypeElement).toBeTruthy();

      const newSlot = createMockBusinessTypeAndSlot(RotaBusinessTypeCode.breaches);
      wrapperComponent.businessTypeAndSlot = newSlot;
      fixture.detectChanges();

      expect(businessTypeElement).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty rotaBusinessTypes array', () => {
      wrapperComponent.businessTypeAndSlot = createMockBusinessTypeAndSlot();
      wrapperComponent.rotaBusinessTypes = [];

      fixture.detectChanges();

      const businessTypeElement = fixture.debugElement.query(
        By.css('[data-test-id="businessType"]')
      );
      expect(businessTypeElement).toBeTruthy();
    });

    it('should handle empty selectedAllocationHearings array', () => {
      wrapperComponent.businessTypeAndSlot = createMockBusinessTypeAndSlot();
      wrapperComponent.selectedAllocationHearings = [];

      fixture.detectChanges();

      const businessHeaderCell = fixture.debugElement.query(
        By.directive(BusinessHeaderCellComponent)
      );
      expect(businessHeaderCell).toBeTruthy();
    });
  });
});
