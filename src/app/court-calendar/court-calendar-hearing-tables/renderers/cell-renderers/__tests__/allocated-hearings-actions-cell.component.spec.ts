import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { By } from '@angular/platform-browser';

import { AllocatedHearingsActionsCellComponent } from '../allocated-hearings-actions-cell.component';
import { ActionsCellComponent, HearingActionsEvent } from '../action-cell.component';
import {
  HearingTableActionsState,
  MoveEvent
} from '../../../../court-calendar-hearing-tables/component-store/hearing-table-actions.store';
import { BaseHearingRowDataVM } from '../../../../../court-calendar/model/hearing-table-renderer.interfaces';
import { HearingRowActionItem } from '../../../shared/hearing-row-actions-dropdown/hearing-row-actions-dropdown.component';
import * as courtCalendarHelper from '../../../../../court-calendar/utils/court-calendar-hearings-helper';

jest.mock('../../../../utils/court-calendar-hearings-helper', () => ({
  dateIsCurrentOrGreaterThan: jest.fn(),
  dateIsWithinLastSevenDays: jest.fn(),
  isEligibleForEndDateChange: jest.fn()
}));

describe('AllocatedHearingsActionsCellComponent', () => {
  let component: AllocatedHearingsActionsCellComponent;
  let fixture: ComponentFixture<AllocatedHearingsActionsCellComponent>;
  let mockDateIsCurrentOrGreaterThan: jest.MockedFunction<
    typeof courtCalendarHelper.dateIsCurrentOrGreaterThan
  >;
  let mockIsEligibleForEndDateChange: jest.MockedFunction<
    typeof courtCalendarHelper.isEligibleForEndDateChange
  >;

  const mockCrownHearing: BaseHearingRowDataVM = {
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
      startDate: '2024-01-15',
      jurisdictionType: 'CROWN'
    } as any
  };

  const mockMagistrateHearing: BaseHearingRowDataVM = {
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
      startDate: '2024-01-16',
      jurisdictionType: 'MAGISTRATE'
    } as any
  };

  const mockGroup: BaseHearingRowDataVM[] = [mockCrownHearing, mockMagistrateHearing];

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
    mockIsEligibleForEndDateChange =
      courtCalendarHelper.isEligibleForEndDateChange as jest.MockedFunction<
        typeof courtCalendarHelper.isEligibleForEndDateChange
      >;

    fixture = TestBed.createComponent(AllocatedHearingsActionsCellComponent);
    component = fixture.componentInstance;

    component.hearing = mockCrownHearing;
    component.group = mockGroup;
    component.hearingMoveState = null;

    component.actionOptions = [
      { label: 'Edit', value: 'edit' },
      { label: 'Move position', value: 'move' }
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.hearingMoveState).toBeNull();
      expect(component.actionOptions).toEqual([
        { label: 'Edit', value: 'edit' },
        { label: 'Move position', value: 'move' }
      ]);
    });

    it('should have EventEmitter outputs', () => {
      expect(component.actionClicked).toBeInstanceOf(EventEmitter);
      expect(component.undoHearingMoveClicked).toBeInstanceOf(EventEmitter);
      expect(component.onMove).toBeInstanceOf(EventEmitter);
    });
  });

  describe('ngOnInit', () => {
    describe('Crown jurisdiction', () => {
      beforeEach(() => {
        component.hearing = {
          ...mockCrownHearing,
          details: {
            hearingDayCount: 1,
            startDate: '2024-01-15',
            jurisdictionType: 'CROWN'
          } as any
        };
        mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      });

      it('should add Crown extra options for current/future single day hearing', () => {
        component.ngOnInit();

        expect(component.actionOptions).toEqual([
          { label: 'Edit', value: 'edit' },
          { label: 'Move position', value: 'move' },
          { label: 'Reallocate', value: 'reallocate' },
          { label: 'Unallocate', value: 'unallocate' },
          { label: 'Remove', value: 'remove' }
        ]);
      });

      it('should not add extra options for past multi-day hearing', () => {
        component.hearing.details.hearingDayCount = 3;
        component.hearing.details.startDate = '2024-01-01';
        mockDateIsCurrentOrGreaterThan.mockReturnValue(false);

        component.ngOnInit();

        expect(component.actionOptions).toEqual([
          { label: 'Edit', value: 'edit' },
          { label: 'Move position', value: 'move' }
        ]);
      });

      it('should add split option when checkSplit is true', () => {
        component.hearing.checkSplit = true;
        component.ngOnInit();

        expect(component.actionOptions).toEqual([
          { label: 'Edit', value: 'edit' },
          { label: 'Move position', value: 'move' },
          { label: 'Reallocate', value: 'reallocate' },
          { label: 'Unallocate', value: 'unallocate' },
          { label: 'Remove', value: 'remove' },
          { label: 'Split', value: 'split' }
        ]);
      });

      it('should call dateIsCurrentOrGreaterThan for multi-day hearings', () => {
        component.hearing.details.hearingDayCount = 3;
        component.ngOnInit();

        expect(mockDateIsCurrentOrGreaterThan).toHaveBeenCalledWith('2024-01-15');
      });

      it('should not call dateIsCurrentOrGreaterThan for single day hearings', () => {
        component.hearing.details.hearingDayCount = 1;
        component.ngOnInit();

        expect(mockDateIsCurrentOrGreaterThan).not.toHaveBeenCalled();
      });

      it('should remove Remove option when hearing resulted is true', () => {
        component.hearing.details.resulted = true;
        component.ngOnInit();

        expect(component.actionOptions).toEqual([
          { label: 'Edit', value: 'edit' },
          { label: 'Move position', value: 'move' },
          { label: 'Reallocate', value: 'reallocate' },
          { label: 'Unallocate', value: 'unallocate' }
        ]);
        expect(component.actionOptions).not.toContainEqual({ label: 'Remove', value: 'remove' });
      });

      it('should include Remove option when hearing resulted is false', () => {
        component.hearing.details.resulted = false;
        component.ngOnInit();

        expect(component.actionOptions).toEqual([
          { label: 'Edit', value: 'edit' },
          { label: 'Move position', value: 'move' },
          { label: 'Reallocate', value: 'reallocate' },
          { label: 'Unallocate', value: 'unallocate' },
          { label: 'Remove', value: 'remove' }
        ]);
      });
    });

    describe('Magistrate jurisdiction', () => {
      beforeEach(() => {
        component.hearing = {
          ...mockMagistrateHearing,
          details: {
            hearingDayCount: 1,
            startDate: '2024-01-16',
            jurisdictionType: 'MAGISTRATE'
          } as any
        };
        mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      });

      it('should add Magistrate extra options for current/future single day hearing', () => {
        component.ngOnInit();

        expect(component.actionOptions).toEqual([
          { label: 'Edit', value: 'edit' },
          { label: 'Move position', value: 'move' },
          { label: 'Reallocate', value: 'reallocate' },
          { label: 'Remove', value: 'remove' }
        ]);
      });

      it('should add Magistrate extra options for current/future multi-day hearing', () => {
        component.hearing.details.hearingDayCount = 2;
        component.ngOnInit();

        expect(component.actionOptions).toEqual([
          { label: 'Edit', value: 'edit' },
          { label: 'Move position', value: 'move' },
          { label: 'Remove', value: 'remove' }
        ]);
      });

      it('should not add extra options for past multi-day hearing', () => {
        component.hearing.details.hearingDayCount = 2;
        component.hearing.details.startDate = '2024-01-01';
        mockDateIsCurrentOrGreaterThan.mockReturnValue(false);

        component.ngOnInit();

        expect(component.actionOptions).toEqual([
          { label: 'Edit', value: 'edit' },
          { label: 'Move position', value: 'move' }
        ]);
      });

      it('should add split option when checkSplit is true', () => {
        component.hearing.checkSplit = true;
        component.ngOnInit();

        expect(component.actionOptions).toEqual([
          { label: 'Edit', value: 'edit' },
          { label: 'Move position', value: 'move' },
          { label: 'Reallocate', value: 'reallocate' },
          { label: 'Remove', value: 'remove' },
          { label: 'Split', value: 'split' }
        ]);
      });

      it('should remove Remove option when hearing resulted is true', () => {
        component.hearing.details.resulted = true;
        component.ngOnInit();

        expect(component.actionOptions).toEqual([
          { label: 'Edit', value: 'edit' },
          { label: 'Move position', value: 'move' },
          { label: 'Reallocate', value: 'reallocate' }
        ]);
        expect(component.actionOptions).not.toContainEqual({ label: 'Remove', value: 'remove' });
      });

      it('should include Remove option when hearing resulted is false', () => {
        component.hearing.details.resulted = false;
        component.ngOnInit();

        expect(component.actionOptions).toEqual([
          { label: 'Edit', value: 'edit' },
          { label: 'Move position', value: 'move' },
          { label: 'Reallocate', value: 'reallocate' },
          { label: 'Remove', value: 'remove' }
        ]);
      });
    });

    describe('Unknown jurisdiction', () => {
      beforeEach(() => {
        component.hearing = {
          ...mockCrownHearing,
          details: {
            hearingDayCount: 1,
            startDate: '2024-01-15',
            jurisdictionType: 'UNKNOWN'
          } as any
        };
        mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      });

      it('should default to Magistrate options for unknown jurisdiction', () => {
        component.ngOnInit();

        expect(component.actionOptions).toEqual([
          { label: 'Edit', value: 'edit' },
          { label: 'Move position', value: 'move' },
          { label: 'Reallocate', value: 'reallocate' },
          { label: 'Remove', value: 'remove' }
        ]);
      });
    });

    describe('Edge cases', () => {
      it('should handle hearing with no details gracefully', () => {
        component.hearing = {
          ...mockCrownHearing,
          details: undefined as any
        };

        expect(() => component.ngOnInit()).toThrow();
      });

      it('should handle hearing with missing hearingDayCount', () => {
        component.hearing = {
          ...mockCrownHearing,
          details: {
            startDate: '2024-01-15',
            jurisdictionType: 'CROWN'
          } as any
        };

        expect(() => component.ngOnInit()).not.toThrow();
        expect(component.actionOptions).toContainEqual({
          label: 'Reallocate',
          value: 'reallocate'
        });
        expect(component.actionOptions).toContainEqual({
          label: 'Unallocate',
          value: 'unallocate'
        });
        expect(component.actionOptions).toContainEqual({ label: 'Remove', value: 'remove' });
      });

      it('should handle hearing with missing startDate', () => {
        component.hearing = {
          ...mockCrownHearing,
          details: {
            hearingDayCount: 3,
            jurisdictionType: 'CROWN'
          } as any
        };

        mockDateIsCurrentOrGreaterThan.mockReturnValue(true);

        expect(() => component.ngOnInit()).not.toThrow();
        expect(component.actionOptions).toContainEqual({
          label: 'Reallocate',
          value: 'reallocate'
        });
      });

      it('should handle hearing with missing jurisdictionType', () => {
        component.hearing = {
          ...mockCrownHearing,
          details: {
            hearingDayCount: 1,
            startDate: '2024-01-15'
          } as any
        };

        expect(() => component.ngOnInit()).not.toThrow();
        expect(component.actionOptions).toContainEqual({
          label: 'Reallocate',
          value: 'reallocate'
        });
        expect(component.actionOptions).toContainEqual({ label: 'Remove', value: 'remove' });
        expect(component.actionOptions).not.toContainEqual({
          label: 'Unallocate',
          value: 'unallocate'
        });
      });
    });
  });

  describe('Change end date eligibility', () => {
    it('should set only the Change end date option and return early when the hearing is eligible', () => {
      mockIsEligibleForEndDateChange.mockReturnValue(true);

      component.ngOnInit();

      expect(component.actionOptions).toEqual([
        { label: 'Change end date', value: 'change-end-date' }
      ]);
      expect(mockIsEligibleForEndDateChange).toHaveBeenCalledWith(component.hearing.details);
      // early return means the jurisdiction/date logic never runs
      expect(mockDateIsCurrentOrGreaterThan).not.toHaveBeenCalled();
    });

    it('should fall through to the normal options when the hearing is not eligible', () => {
      mockIsEligibleForEndDateChange.mockReturnValue(false);
      mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      component.hearing = {
        ...mockCrownHearing,
        details: { hearingDayCount: 1, startDate: '2024-01-15', jurisdictionType: 'CROWN' } as any
      };

      component.ngOnInit();

      expect(component.actionOptions).not.toContainEqual({
        label: 'Change end date',
        value: 'change-end-date'
      });
      expect(component.actionOptions).toContainEqual({ label: 'Reallocate', value: 'reallocate' });
    });
  });

  describe('Template Rendering', () => {
    it('should render actions-cell component', () => {
      fixture.detectChanges();

      const actionsCell = fixture.debugElement.query(By.css('actions-cell'));
      expect(actionsCell).toBeTruthy();
    });

    it('should pass correct properties to actions-cell', () => {
      const freshFixture = TestBed.createComponent(AllocatedHearingsActionsCellComponent);
      const freshComponent = freshFixture.componentInstance;

      freshComponent.hearing = mockCrownHearing;
      freshComponent.group = mockGroup;
      freshComponent.hearingMoveState = mockMoveState;
      freshComponent.actionOptions = [
        { label: 'Edit', value: 'edit' },
        { label: 'Move position', value: 'move' }
      ];

      mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      freshComponent.ngOnInit();
      freshFixture.detectChanges();

      const actionsCell = freshFixture.debugElement.query(By.css('actions-cell'));
      const actionsCellInstance = actionsCell.componentInstance;

      expect(actionsCellInstance.hearingMoveState).toEqual(mockMoveState);
      expect(actionsCellInstance.group).toEqual(mockGroup);
      expect(actionsCellInstance.hearing).toEqual(mockCrownHearing);
    });
  });

  describe('Component Methods', () => {
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
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should emit actionClicked when actions-cell emits actionClicked', () => {
      const emitSpy = jest.spyOn(component.actionClicked, 'emit');
      const testEvent: HearingActionsEvent = {
        action: 'edit',
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
  });

  describe('Integration Tests', () => {
    it('should properly integrate with ActionsCellComponent', () => {
      const freshFixture = TestBed.createComponent(AllocatedHearingsActionsCellComponent);
      const freshComponent = freshFixture.componentInstance;

      freshComponent.hearing = mockCrownHearing;
      freshComponent.group = mockGroup;
      freshComponent.hearingMoveState = null;
      freshComponent.actionOptions = [
        { label: 'Edit', value: 'edit' },
        { label: 'Move position', value: 'move' }
      ];

      mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      freshComponent.ngOnInit();
      freshFixture.detectChanges();

      const actionsCellComponent = freshFixture.debugElement.query(By.css('actions-cell'));
      const componentInstance = actionsCellComponent.componentInstance as ActionsCellComponent;

      expect(componentInstance.hearing).toEqual(mockCrownHearing);
      expect(componentInstance.group).toEqual(mockGroup);
      expect(componentInstance.hearingMoveState).toBeNull();
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should handle Crown court workflow with split option', () => {
      const freshFixture = TestBed.createComponent(AllocatedHearingsActionsCellComponent);
      const freshComponent = freshFixture.componentInstance;

      freshComponent.hearing = {
        ...mockCrownHearing,
        checkSplit: true,
        details: {
          hearingDayCount: 1,
          startDate: '2024-01-15',
          jurisdictionType: 'CROWN'
        } as any
      };
      freshComponent.group = mockGroup;
      freshComponent.actionOptions = [
        { label: 'Edit', value: 'edit' },
        { label: 'Move position', value: 'move' }
      ];

      mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      freshComponent.ngOnInit();
      freshFixture.detectChanges();

      const actionClickedSpy = jest.spyOn(freshComponent.actionClicked, 'emit');
      const testEvent: HearingActionsEvent = {
        action: 'split',
        hearingId: mockCrownHearing.id,
        hearingDate: mockCrownHearing.hearingDate,
        rows: mockGroup
      };

      const actionsCell = freshFixture.debugElement.query(By.css('actions-cell'));
      actionsCell.triggerEventHandler('actionClicked', testEvent);
      expect(actionClickedSpy).toHaveBeenCalledWith(testEvent);
    });

    it('should handle Magistrate court workflow', () => {
      const freshFixture = TestBed.createComponent(AllocatedHearingsActionsCellComponent);
      const freshComponent = freshFixture.componentInstance;

      freshComponent.hearing = {
        ...mockMagistrateHearing,
        details: {
          hearingDayCount: 1,
          startDate: '2024-01-16',
          jurisdictionType: 'MAGISTRATE'
        } as any
      };
      freshComponent.group = mockGroup;
      freshComponent.actionOptions = [
        { label: 'Edit', value: 'edit' },
        { label: 'Move position', value: 'move' }
      ];

      mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      freshComponent.ngOnInit();
      freshFixture.detectChanges();

      const actionClickedSpy = jest.spyOn(freshComponent.actionClicked, 'emit');
      const testEvent: HearingActionsEvent = {
        action: 'reallocate',
        hearingId: mockMagistrateHearing.id,
        hearingDate: mockMagistrateHearing.hearingDate,
        rows: mockGroup
      };

      const actionsCell = freshFixture.debugElement.query(By.css('actions-cell'));
      actionsCell.triggerEventHandler('actionClicked', testEvent);
      expect(actionClickedSpy).toHaveBeenCalledWith(testEvent);
    });

    it('should handle past multi-day hearing workflow', () => {
      const freshFixture = TestBed.createComponent(AllocatedHearingsActionsCellComponent);
      const freshComponent = freshFixture.componentInstance;

      freshComponent.hearing = {
        ...mockCrownHearing,
        details: {
          hearingDayCount: 3,
          startDate: '2024-01-01',
          jurisdictionType: 'CROWN'
        } as any
      };
      freshComponent.group = mockGroup;
      freshComponent.actionOptions = [
        { label: 'Edit', value: 'edit' },
        { label: 'Move position', value: 'move' }
      ];

      mockDateIsCurrentOrGreaterThan.mockReturnValue(false);
      freshComponent.ngOnInit();
      freshFixture.detectChanges();

      expect(freshComponent.actionOptions).toEqual([
        { label: 'Edit', value: 'edit' },
        { label: 'Move position', value: 'move' }
      ]);

      const actionClickedSpy = jest.spyOn(freshComponent.actionClicked, 'emit');
      const testEvent: HearingActionsEvent = {
        action: 'edit',
        hearingId: mockCrownHearing.id,
        hearingDate: mockCrownHearing.hearingDate,
        rows: mockGroup
      };

      const actionsCell = freshFixture.debugElement.query(By.css('actions-cell'));
      actionsCell.triggerEventHandler('actionClicked', testEvent);
      expect(actionClickedSpy).toHaveBeenCalledWith(testEvent);
    });
  });

  describe('Component State Management', () => {
    it('should maintain actionOptions state after ngOnInit', () => {
      mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      const initialOptionsLength = component.actionOptions.length;

      component.ngOnInit();

      expect(component.actionOptions.length).toBeGreaterThan(initialOptionsLength);
      expect(component.actionOptions).toContainEqual({ label: 'Reallocate', value: 'reallocate' });
      expect(component.actionOptions).toContainEqual({ label: 'Unallocate', value: 'unallocate' });
      expect(component.actionOptions).toContainEqual({ label: 'Remove', value: 'remove' });
    });

    it('should not modify actionOptions multiple times when ngOnInit called repeatedly', () => {
      mockDateIsCurrentOrGreaterThan.mockReturnValue(true);

      component.ngOnInit();
      const afterFirstInit = [...component.actionOptions];

      component.actionOptions = [
        { label: 'Edit', value: 'edit' },
        { label: 'Move position', value: 'move' }
      ];
      component.ngOnInit();

      expect(component.actionOptions).toHaveLength(afterFirstInit.length);
      expect(component.actionOptions).toContainEqual({ label: 'Unallocate', value: 'unallocate' });
    });

    it('should handle rapid property changes without affecting other properties', () => {
      const originalHearing = component.hearing;
      const originalGroup = component.group;

      component.hearingMoveState = mockMoveState;
      component.hearingMoveState = null;
      fixture.detectChanges();

      expect(component.hearing).toBe(originalHearing);
      expect(component.group).toBe(originalGroup);
    });
  });

  describe('Performance Considerations', () => {
    it('should handle large groups efficiently', () => {
      const largeGroup: BaseHearingRowDataVM[] = Array.from({ length: 1000 }, (_, i) => ({
        ...mockCrownHearing,
        id: `hearing-${i}`,
        rowIdentifier: `row-${i}`
      }));

      component.group = largeGroup;

      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should not recreate action options unnecessarily during change detection', () => {
      mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      component.ngOnInit();
      const actionOptionsReference = component.actionOptions;

      component.hearingMoveState = mockMoveState;
      component.hearingMoveState = null;
      fixture.detectChanges();

      expect(component.actionOptions).toBe(actionOptionsReference);
    });
  });

  describe('Comprehensive Action Options Tests', () => {
    it('should have correct order of options for Crown with split', () => {
      const freshFixture = TestBed.createComponent(AllocatedHearingsActionsCellComponent);
      const freshComponent = freshFixture.componentInstance;

      freshComponent.hearing = {
        ...mockCrownHearing,
        checkSplit: true,
        details: {
          hearingDayCount: 1,
          startDate: '2024-01-15',
          jurisdictionType: 'CROWN'
        } as any
      };
      freshComponent.actionOptions = [
        { label: 'Edit', value: 'edit' },
        { label: 'Move position', value: 'move' }
      ];

      mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      freshComponent.ngOnInit();

      const expectedOrder = ['edit', 'move', 'reallocate', 'unallocate', 'remove', 'split'];

      const actualOrder = freshComponent.actionOptions.map(option => option.value);
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('should have correct order of options for Magistrate with split', () => {
      const freshFixture = TestBed.createComponent(AllocatedHearingsActionsCellComponent);
      const freshComponent = freshFixture.componentInstance;

      freshComponent.hearing = {
        ...mockMagistrateHearing,
        checkSplit: true,
        details: {
          hearingDayCount: 1,
          startDate: '2024-01-16',
          jurisdictionType: 'MAGISTRATE'
        } as any
      };
      freshComponent.actionOptions = [
        { label: 'Edit', value: 'edit' },
        { label: 'Move position', value: 'move' }
      ];

      mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      freshComponent.ngOnInit();

      const expectedOrder = ['edit', 'move', 'reallocate', 'remove', 'split'];

      const actualOrder = freshComponent.actionOptions.map(option => option.value);
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('should have correct action labels and values', () => {
      component.hearing = {
        ...mockCrownHearing,
        checkSplit: true,
        details: {
          hearingDayCount: 1,
          startDate: '2024-01-15',
          jurisdictionType: 'CROWN'
        } as any
      };

      mockDateIsCurrentOrGreaterThan.mockReturnValue(true);
      component.ngOnInit();

      const expectedOptions: HearingRowActionItem[] = [
        { label: 'Edit', value: 'edit' },
        { label: 'Move position', value: 'move' },
        { label: 'Reallocate', value: 'reallocate' },
        { label: 'Unallocate', value: 'unallocate' },
        { label: 'Remove', value: 'remove' },
        { label: 'Split', value: 'split' }
      ];

      expect(component.actionOptions).toEqual(expectedOptions);
    });
  });
});
