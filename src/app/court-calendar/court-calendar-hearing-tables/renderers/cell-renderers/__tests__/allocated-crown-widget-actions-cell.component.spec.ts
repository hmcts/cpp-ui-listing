import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AllocatedCrownWidgetActionsCellComponent } from '../allocated-crown-widget-actions-cell.component';
import { BaseHearingRowDataVM } from '../../../../model/hearing-table-renderer.interfaces';
import * as courtCalendarHelper from '../../../../../court-calendar/utils/court-calendar-hearings-helper';

jest.mock('../../../../utils/court-calendar-hearings-helper', () => ({
  dateIsCurrentOrGreaterThan: jest.fn()
}));

describe('AllocatedCrownWidgetActionsCellComponent', () => {
  let component: AllocatedCrownWidgetActionsCellComponent;
  let fixture: ComponentFixture<AllocatedCrownWidgetActionsCellComponent>;
  let mockDateIsCurrentOrGreaterThan: jest.MockedFunction<
    typeof courtCalendarHelper.dateIsCurrentOrGreaterThan
  >;

  const mockHearing: BaseHearingRowDataVM = {
    id: 'hearing-123',
    rowIdentifier: 'row-123',
    hearingDate: '2024-01-15',
    sequence: 1,
    isMaster: true,
    isChild: false,
    isLastChild: false,
    isDisabled: false,
    checkSplit: false,
    instances: 1,
    details: {
      hearingDayCount: 1,
      startDate: '2024-01-15'
    } as any
  };

  beforeEach(async () => {
    mockDateIsCurrentOrGreaterThan =
      courtCalendarHelper.dateIsCurrentOrGreaterThan as jest.MockedFunction<
        typeof courtCalendarHelper.dateIsCurrentOrGreaterThan
      >;
    mockDateIsCurrentOrGreaterThan.mockReturnValue(true);

    fixture = TestBed.createComponent(AllocatedCrownWidgetActionsCellComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('hearing', mockHearing);
    fixture.componentRef.setInput('sectionInAllocateState', false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should have unallocate output', () => {
      expect(component.unallocate).toBeDefined();
      expect(component.unallocate.emit).toBeDefined();
    });
  });

  describe('canUnallocate getter', () => {
    it('should return true for a single-day hearing regardless of date', () => {
      mockDateIsCurrentOrGreaterThan.mockReturnValue(false);
      fixture.componentRef.setInput('hearing', {
        ...mockHearing,
        details: { hearingDayCount: 1, startDate: '2024-01-10' } as any
      });
      expect(component.canUnallocate()).toBe(true);
    });

    it('should return true for a multi-day current or future hearing', () => {
      mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      fixture.componentRef.setInput('hearing', {
        ...mockHearing,
        details: { hearingDayCount: 3, startDate: '2024-01-15' } as any
      });
      expect(component.canUnallocate()).toBe(true);
    });

    it('should return false for a multi-day past hearing', () => {
      mockDateIsCurrentOrGreaterThan.mockReturnValue(false);
      fixture.componentRef.setInput('hearing', {
        ...mockHearing,
        details: { hearingDayCount: 3, startDate: '2024-01-10' } as any
      });
      expect(component.canUnallocate()).toBe(false);
    });

    it('should return false when hearing has no details', () => {
      fixture.componentRef.setInput('hearing', { ...mockHearing, details: undefined });
      expect(component.canUnallocate()).toBe(false);
    });
  });

  describe('Template Rendering', () => {
    it('should show unallocate button when not in allocate state and can unallocate', () => {
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('[data-test-id="unallocate-button"]'));
      expect(button).toBeTruthy();
      expect(button.nativeElement.textContent.trim()).toBe('Unallocate');
    });

    it('should hide unallocate button when section is in allocate state', () => {
      fixture.componentRef.setInput('sectionInAllocateState', true);
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('[data-test-id="unallocate-button"]'));
      expect(button).toBeNull();
    });

    it('should hide unallocate button when hearing is a past multi-day hearing', () => {
      mockDateIsCurrentOrGreaterThan.mockReturnValue(false);
      fixture.componentRef.setInput('hearing', {
        ...mockHearing,
        details: { hearingDayCount: 3, startDate: '2024-01-10' } as any
      });
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('[data-test-id="unallocate-button"]'));
      expect(button).toBeNull();
    });

    it('should have the data-test-id container', () => {
      fixture.detectChanges();
      const container = fixture.debugElement.query(
        By.css('[data-test-id="allocated-crown-widget-actions"]')
      );
      expect(container).toBeTruthy();
    });
  });

  describe('Event Handling', () => {
    it('should emit hearing details when unallocate button is clicked', () => {
      fixture.detectChanges();

      const emitSpy = jest.spyOn(component.unallocate, 'emit');
      const button = fixture.debugElement.query(By.css('[data-test-id="unallocate-button"]'));
      button.nativeElement.click();

      expect(emitSpy).toHaveBeenCalledWith(mockHearing.details);
    });
  });

  describe('HostListener', () => {
    it('should stop event propagation on click', () => {
      const mockEvent = { stopPropagation: jest.fn() } as any;
      component.preventDefault(mockEvent);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });
});
