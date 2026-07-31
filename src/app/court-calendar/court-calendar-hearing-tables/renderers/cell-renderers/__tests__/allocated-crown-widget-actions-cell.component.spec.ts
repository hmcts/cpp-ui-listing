import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { By } from '@angular/platform-browser';

import { AllocatedCrownWidgetActionsCellComponent } from '../allocated-crown-widget-actions-cell.component';
import { HearingActionsEvent } from '../action-cell.component';
import { MoveHearingsButtonsComponent } from '../move-hearing-positions-buttons.component';
import {
  HearingTableActionsState,
  MoveEvent
} from '../../../../court-calendar-hearing-tables/component-store/hearing-table-actions.store';
import { BaseHearingRowDataVM } from '../../../../model/hearing-table-renderer.vm';
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

  const mockGroup: BaseHearingRowDataVM[] = [
    mockHearing,
    {
      id: 'hearing-456',
      rowIdentifier: 'row-456',
      hearingDate: '2024-01-16',
      sequence: 1,
      isMaster: true,
      isChild: false,
      isLastChild: false,
      isDisabled: false,
      checkSplit: false,
      instances: 1,
      details: {
        hearingDayCount: 1,
        startDate: '2024-01-16'
      } as any
    }
  ];

  const mockMoveState: HearingTableActionsState['moveState'] = {
    rowIdentifier: 'row-999',
    hearingId: 'hearing-999',
    hearingDate: '2024-01-17',
    rows: mockGroup
  };

  beforeEach(async () => {
    mockDateIsCurrentOrGreaterThan =
      courtCalendarHelper.dateIsCurrentOrGreaterThan as jest.MockedFunction<
        typeof courtCalendarHelper.dateIsCurrentOrGreaterThan
      >;

    fixture = TestBed.createComponent(AllocatedCrownWidgetActionsCellComponent);
    component = fixture.componentInstance;

    component.hearing = mockHearing;
    component.group = mockGroup;
    component.hearingMoveState = null;
    component.displayAllocateOptions = false;
    component.sectionInAllocateState = false;

    component.actionOptions = [{ label: 'Move position', value: 'move' }];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.displayAllocateOptions).toBe(false);
      expect(component.sectionInAllocateState).toBe(false);
      expect(component.hearingMoveState).toBeNull();
      expect(component.actionOptions).toEqual([{ label: 'Move position', value: 'move' }]);
    });

    it('should have EventEmitter outputs', () => {
      expect(component.actionClicked).toBeInstanceOf(EventEmitter);
      expect(component.undoHearingMoveClicked).toBeInstanceOf(EventEmitter);
      expect(component.onMove).toBeInstanceOf(EventEmitter);
      expect(component.onAllocateAndMove).toBeInstanceOf(EventEmitter);
    });
  });

  describe('ngOnInit', () => {
    describe('when hearing has single day and is current or future', () => {
      beforeEach(() => {
        component.hearing = {
          ...mockHearing,
          details: {
            hearingDayCount: 1,
            startDate: '2024-01-15'
          } as any
        };
        mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      });

      it('should add unallocate option to actionOptions', () => {
        component.ngOnInit();

        expect(component.actionOptions).toEqual([
          { label: 'Move position', value: 'move' },
          { label: 'Unallocate', value: 'unallocate' }
        ]);
      });

      it('should call dateIsCurrentOrGreaterThan with correct date', () => {
        component.ngOnInit();

        expect(mockDateIsCurrentOrGreaterThan).not.toHaveBeenCalled();
      });
    });

    describe('when hearing has multiple days and is current or future', () => {
      beforeEach(() => {
        component.hearing = {
          ...mockHearing,
          details: {
            hearingDayCount: 3,
            startDate: '2024-01-15'
          } as any
        };
        mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      });

      it('should add unallocate option to actionOptions', () => {
        component.ngOnInit();

        expect(component.actionOptions).toEqual([
          { label: 'Move position', value: 'move' },
          { label: 'Unallocate', value: 'unallocate' }
        ]);
      });
    });

    describe('when hearing has multiple days and is in the past', () => {
      beforeEach(() => {
        component.hearing = {
          ...mockHearing,
          details: {
            hearingDayCount: 3,
            startDate: '2024-01-10'
          } as any
        };
        mockDateIsCurrentOrGreaterThan.mockReturnValue(false);
      });

      it('should not add unallocate option to actionOptions', () => {
        component.ngOnInit();

        expect(component.actionOptions).toEqual([{ label: 'Move position', value: 'move' }]);
      });

      it('should call dateIsCurrentOrGreaterThan with correct date', () => {
        component.ngOnInit();

        expect(mockDateIsCurrentOrGreaterThan).toHaveBeenCalledWith('2024-01-10');
      });
    });

    describe('when hearing has single day and is in the past', () => {
      beforeEach(() => {
        component.hearing = {
          ...mockHearing,
          details: {
            hearingDayCount: 1,
            startDate: '2024-01-10'
          } as any
        };
        mockDateIsCurrentOrGreaterThan.mockReturnValue(false);
      });

      it('should add unallocate option because single day hearings are not considered past hearings', () => {
        component.ngOnInit();

        expect(component.actionOptions).toEqual([
          { label: 'Move position', value: 'move' },
          { label: 'Unallocate', value: 'unallocate' }
        ]);
      });
    });

    describe('edge cases', () => {
      it('should handle hearing with no details gracefully', () => {
        component.hearing = {
          ...mockHearing,
          details: undefined as any
        };

        expect(() => component.ngOnInit()).toThrow();
      });

      it('should handle hearing with missing hearingDayCount', () => {
        component.hearing = {
          ...mockHearing,
          details: {
            startDate: '2024-01-15'
          } as any
        };

        expect(() => component.ngOnInit()).not.toThrow();

        expect(component.actionOptions).toContainEqual({
          label: 'Unallocate',
          value: 'unallocate'
        });
      });

      it('should handle hearing with missing startDate', () => {
        component.hearing = {
          ...mockHearing,
          details: {
            hearingDayCount: 1
          } as any
        };

        mockDateIsCurrentOrGreaterThan.mockReturnValue(true);

        expect(() => component.ngOnInit()).not.toThrow();
        expect(component.actionOptions).toContainEqual({
          label: 'Unallocate',
          value: 'unallocate'
        });
      });
    });
  });

  describe('Template Rendering - Actions Cell Logic', () => {
    it('should show actions-cell when not in allocate state', () => {
      component.sectionInAllocateState = false;
      fixture.detectChanges();

      const actionsCell = fixture.debugElement.query(By.css('actions-cell'));
      expect(actionsCell).toBeTruthy();
    });

    it('should hide actions-cell when section is in allocate state', () => {
      component.sectionInAllocateState = true;
      fixture.detectChanges();

      const actionsCell = fixture.debugElement.query(By.css('actions-cell'));
      expect(actionsCell).toBeNull();
    });

    it('should pass correct properties to actions-cell', () => {
      component.sectionInAllocateState = false;
      component.hearingMoveState = mockMoveState;
      mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      component.ngOnInit();
      fixture.detectChanges();

      const actionsCell = fixture.debugElement.query(By.css('actions-cell'));
      const actionsCellInstance = actionsCell.componentInstance;

      expect(actionsCellInstance.hearingMoveState).toEqual(mockMoveState);
      expect(actionsCellInstance.group).toEqual(mockGroup);
      expect(actionsCellInstance.hearing).toEqual(mockHearing);
    });
  });

  describe('Template Rendering - Move Hearings Buttons Logic', () => {
    it('should show move-hearings-position-buttons when displayAllocateOptions is true', () => {
      component.displayAllocateOptions = true;
      fixture.detectChanges();

      const moveButtons = fixture.debugElement.query(By.css('move-hearings-position-buttons'));
      expect(moveButtons).toBeTruthy();
    });

    it('should hide move-hearings-position-buttons when displayAllocateOptions is false', () => {
      component.displayAllocateOptions = false;
      fixture.detectChanges();

      const moveButtons = fixture.debugElement.query(By.css('move-hearings-position-buttons'));
      expect(moveButtons).toBeNull();
    });

    it('should pass correct properties to move-hearings-position-buttons', () => {
      component.displayAllocateOptions = true;
      fixture.detectChanges();

      const moveButtons = fixture.debugElement.query(By.css('move-hearings-position-buttons'));
      const moveButtonsInstance = moveButtons.componentInstance;

      expect(moveButtonsInstance.group).toEqual(mockGroup);
      expect(moveButtonsInstance.hearingId).toBe(mockHearing.id);
    });

    it('should display correct button text content', () => {
      component.displayAllocateOptions = true;
      fixture.detectChanges();

      const moveButtons = fixture.debugElement.query(By.css('move-hearings-position-buttons'));
      const insertBeforeSpan = moveButtons.query(By.css('[insert-before]'));
      const insertAfterSpan = moveButtons.query(By.css('[insert-after]'));

      expect(insertBeforeSpan?.nativeElement.textContent.trim()).toBe('Allocate before');
      expect(insertAfterSpan?.nativeElement.textContent.trim()).toBe('Allocate after');
    });
  });

  describe('Component Methods', () => {
    describe('allocateBefore()', () => {
      it('should emit onAllocateAndMove event with insertBeforeId', () => {
        const emitSpy = jest.spyOn(component.onAllocateAndMove, 'emit');

        component.allocateBefore();

        const expectedEvent: MoveEvent = {
          insertBeforeId: mockHearing.id
        };

        expect(emitSpy).toHaveBeenCalledWith(expectedEvent);
      });

      it('should handle null hearing by throwing error', () => {
        component.hearing = null as any;

        expect(() => component.allocateBefore()).toThrow();
      });
    });

    describe('allocateAfter()', () => {
      it('should emit onAllocateAndMove event with insertafterId', () => {
        const emitSpy = jest.spyOn(component.onAllocateAndMove, 'emit');

        component.allocateAfter();

        const expectedEvent: MoveEvent = {
          insertafterId: mockHearing.id
        };

        expect(emitSpy).toHaveBeenCalledWith(expectedEvent);
      });

      it('should handle null hearing by throwing error', () => {
        component.hearing = null as any;

        expect(() => component.allocateAfter()).toThrow();
      });
    });

    describe('preventDefault() - HostListener', () => {
      it('should stop event propagation', () => {
        const mockEvent = {
          stopPropagation: jest.fn()
        } as any;

        component.preventDefault(mockEvent);

        expect(mockEvent.stopPropagation).toHaveBeenCalled();
      });
    });
  });

  describe('Event Handling', () => {
    describe('actions-cell events', () => {
      beforeEach(() => {
        component.sectionInAllocateState = false;
        fixture.detectChanges();
      });

      it('should emit actionClicked when actions-cell emits actionClicked', () => {
        const emitSpy = jest.spyOn(component.actionClicked, 'emit');
        const testEvent: HearingActionsEvent = {
          action: 'move',
          hearingId: 'test-id',
          hearingDate: '2024-01-15',
          rows: mockGroup
        };

        const actionsCell = fixture.debugElement.query(By.css('actions-cell'));
        actionsCell.triggerEventHandler('actionClicked', testEvent);

        expect(emitSpy).toHaveBeenCalledWith(testEvent);
      });

      it('should emit undoHearingMoveClicked when actions-cell emits undoHearingMoveClicked', () => {
        const emitSpy = jest.spyOn(component.undoHearingMoveClicked, 'emit');

        const actionsCell = fixture.debugElement.query(By.css('actions-cell'));
        actionsCell.triggerEventHandler('undoHearingMoveClicked', undefined);

        expect(emitSpy).toHaveBeenCalledWith(undefined);
      });

      it('should emit onMove when actions-cell emits onMove', () => {
        const emitSpy = jest.spyOn(component.onMove, 'emit');
        const testEvent: MoveEvent = {
          insertBeforeId: 'test-id'
        };

        const actionsCell = fixture.debugElement.query(By.css('actions-cell'));
        actionsCell.triggerEventHandler('onMove', testEvent);

        expect(emitSpy).toHaveBeenCalledWith(testEvent);
      });
    });

    describe('move-hearings-position-buttons events', () => {
      beforeEach(() => {
        component.displayAllocateOptions = true;
        fixture.detectChanges();
      });

      it('should call allocateBefore when insertBefore event is triggered', () => {
        const allocateBeforeSpy = jest.spyOn(component, 'allocateBefore');

        const moveButtons = fixture.debugElement.query(By.css('move-hearings-position-buttons'));
        moveButtons.triggerEventHandler('insertBefore', null);

        expect(allocateBeforeSpy).toHaveBeenCalled();
      });

      it('should call allocateAfter when insertAfter event is triggered', () => {
        const allocateAfterSpy = jest.spyOn(component, 'allocateAfter');

        const moveButtons = fixture.debugElement.query(By.css('move-hearings-position-buttons'));
        moveButtons.triggerEventHandler('insertAfter', null);

        expect(allocateAfterSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility and User Experience', () => {
    it('should have proper data-test-id for testing', () => {
      fixture.detectChanges();
      const testContainer = fixture.debugElement.query(
        By.css('[data-test-id="allocated-crown-widget-actions"]')
      );
      expect(testContainer).toBeTruthy();
    });

    it('should show meaningful button text for allocate actions', () => {
      component.displayAllocateOptions = true;
      fixture.detectChanges();

      const moveButtons = fixture.debugElement.query(By.css('move-hearings-position-buttons'));
      const insertBeforeSpan = moveButtons.query(By.css('[insert-before]'));
      const insertAfterSpan = moveButtons.query(By.css('[insert-after]'));

      expect(insertBeforeSpan?.nativeElement.textContent.trim()).toBe('Allocate before');
      expect(insertAfterSpan?.nativeElement.textContent.trim()).toBe('Allocate after');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null hearing by throwing error during ngOnInit', () => {
      component.hearing = null as any;
      expect(() => component.ngOnInit()).toThrow();
    });

    it('should handle undefined hearing by throwing error during ngOnInit', () => {
      component.hearing = undefined as any;
      expect(() => component.ngOnInit()).toThrow();
    });

    it('should handle empty group gracefully', () => {
      component.group = [];
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle null moveState gracefully', () => {
      component.hearingMoveState = null;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle both components being hidden', () => {
      component.sectionInAllocateState = true;
      component.displayAllocateOptions = false;
      fixture.detectChanges();

      const actionsCell = fixture.debugElement.query(By.css('actions-cell'));
      const moveButtons = fixture.debugElement.query(By.css('move-hearings-position-buttons'));

      expect(actionsCell).toBeNull();
      expect(moveButtons).toBeNull();
    });

    it('should handle both components being visible', () => {
      component.sectionInAllocateState = false;
      component.displayAllocateOptions = true;
      fixture.detectChanges();

      const actionsCell = fixture.debugElement.query(By.css('actions-cell'));
      const moveButtons = fixture.debugElement.query(By.css('move-hearings-position-buttons'));

      expect(actionsCell).toBeTruthy();
      expect(moveButtons).toBeTruthy();
    });
  });

  describe('Integration Tests', () => {
    it('should properly integrate with MoveHearingsButtonsComponent', () => {
      component.displayAllocateOptions = true;
      fixture.detectChanges();

      const moveButtonsComponent = fixture.debugElement.query(
        By.css('move-hearings-position-buttons')
      );
      const componentInstance =
        moveButtonsComponent.componentInstance as MoveHearingsButtonsComponent;

      expect(componentInstance.group).toEqual(mockGroup);
      expect(componentInstance.hearingId).toBe(mockHearing.id);
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should handle allocate workflow: display options -> user clicks allocate', () => {
      component.displayAllocateOptions = true;
      fixture.detectChanges();

      const moveButtons = fixture.debugElement.query(By.css('move-hearings-position-buttons'));
      expect(moveButtons).toBeTruthy();

      const onAllocateAndMoveSpy = jest.spyOn(component.onAllocateAndMove, 'emit');
      component.allocateBefore();
      expect(onAllocateAndMoveSpy).toHaveBeenCalledWith({
        insertBeforeId: mockHearing.id
      });

      component.allocateAfter();
      expect(onAllocateAndMoveSpy).toHaveBeenCalledWith({
        insertafterId: mockHearing.id
      });
    });
  });

  describe('Component State Management', () => {
    it('should maintain actionOptions state after ngOnInit', () => {
      mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      const initialOptions = [...component.actionOptions];

      component.ngOnInit();

      expect(component.actionOptions).toHaveLength(initialOptions.length + 1);
      expect(component.actionOptions).toContainEqual({ label: 'Unallocate', value: 'unallocate' });
    });

    it('should not modify actionOptions multiple times when ngOnInit called repeatedly', () => {
      mockDateIsCurrentOrGreaterThan.mockReturnValue(true);

      component.ngOnInit();
      const afterFirstInit = [...component.actionOptions];

      component.actionOptions = [{ label: 'Move position', value: 'move' }];
      component.ngOnInit();

      expect(component.actionOptions).toHaveLength(afterFirstInit.length);
      expect(component.actionOptions).toContainEqual({ label: 'Unallocate', value: 'unallocate' });
    });

    it('should handle rapid property changes without affecting other properties', () => {
      const originalHearing = component.hearing;
      const originalGroup = component.group;

      component.sectionInAllocateState = true;
      component.displayAllocateOptions = true;
      component.sectionInAllocateState = false;
      component.displayAllocateOptions = false;
      fixture.detectChanges();

      expect(component.hearing).toBe(originalHearing);
      expect(component.group).toBe(originalGroup);
    });
  });

  describe('Performance Considerations', () => {
    it('should handle large groups efficiently', () => {
      const largeGroup: BaseHearingRowDataVM[] = Array.from({ length: 1000 }, (_, i) => ({
        ...mockHearing,
        id: `hearing-${i}`,
        rowIdentifier: `row-${i}`
      }));

      component.group = largeGroup;

      expect(() => {
        component.sectionInAllocateState = false;
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should not recreate action options unnecessarily during change detection', () => {
      mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      component.ngOnInit();
      const actionOptionsReference = component.actionOptions;

      component.sectionInAllocateState = !component.sectionInAllocateState;
      fixture.detectChanges();

      expect(component.actionOptions).toBe(actionOptionsReference);
    });
  });
});
