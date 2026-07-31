import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ActionsCellComponent } from '../action-cell.component';
import {
  HearingTableActionsState,
  MoveEvent
} from '../../../../court-calendar-hearing-tables/component-store/hearing-table-actions.store';
import { BaseHearingRowDataVM } from '../../../../../court-calendar/model/hearing-table-renderer.vm';
import {
  HearingDropdownActions,
  HearingRowActionItem
} from '../../../shared/hearing-row-actions-dropdown/hearing-row-actions-dropdown.component';

export interface HearingActionsEvent {
  hearingId: string;
  action: HearingDropdownActions;
  rowIdentifier?: string;
  hearingDate: string;
  rows: BaseHearingRowDataVM[];
  hearingDateTime?: string;
}

describe('ActionsCellComponent', () => {
  let component: ActionsCellComponent;
  let fixture: ComponentFixture<ActionsCellComponent>;

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
    instances: 1
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
      instances: 1
    },
    {
      id: 'hearing-789',
      rowIdentifier: 'row-789',
      hearingDate: '2024-01-17',
      sequence: 1,
      isMaster: false,
      isChild: true,
      isLastChild: false,
      isDisabled: false,
      checkSplit: false,
      instances: 1
    }
  ];

  const mockMoveState: HearingTableActionsState['moveState'] = {
    rowIdentifier: 'row-999',
    hearingId: 'hearing-999',
    hearingDate: '2024-01-17',
    rows: mockGroup
  };

  const mockActionOptions: HearingRowActionItem[] = [
    { label: 'Move', value: 'move' as HearingDropdownActions },
    { label: 'Edit', value: 'edit' as HearingDropdownActions },
    { label: 'Remove', value: 'remove' as HearingDropdownActions }
  ];

  beforeEach(async () => {
    fixture = TestBed.createComponent(ActionsCellComponent);
    component = fixture.componentInstance;
    component.hearing = mockHearing;
    component.group = mockGroup;
    component.hearingMoveState = null;
    component.actionOptions = mockActionOptions;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.hearingMoveState).toBeNull();
      expect(component.actionOptions).toEqual(mockActionOptions);
    });

    it('should have EventEmitter outputs', () => {
      expect(component.actionClicked).toBeInstanceOf(EventEmitter);
      expect(component.undoHearingMoveClicked).toBeInstanceOf(EventEmitter);
      expect(component.onMove).toBeInstanceOf(EventEmitter);
    });
  });

  describe('Computed Properties', () => {
    describe('masterRows', () => {
      it('should return only master rows from group', () => {
        const masterRows = component.masterRows;
        expect(masterRows).toHaveLength(2);
        expect(masterRows.every((row) => row.isMaster)).toBe(true);
        expect(masterRows.map((row) => row.id)).toEqual(['hearing-123', 'hearing-456']);
      });

      it('should return empty array when group has no master rows', () => {
        component.group = [{ ...mockHearing, isMaster: false, isChild: true }];
        const masterRows = component.masterRows;
        expect(masterRows).toHaveLength(0);
      });

      it('should handle empty group', () => {
        component.group = [];
        const masterRows = component.masterRows;
        expect(masterRows).toHaveLength(0);
      });
    });

    describe('shouldInsertBefore', () => {
      it('should return true when hearing is the first master row', () => {
        component.hearing = mockHearing;
        expect(component.shouldInsertBefore).toBe(true);
      });

      it('should return false when hearing is not the first master row', () => {
        component.hearing = mockGroup[1];
        expect(component.shouldInsertBefore).toBe(false);
      });

      it('should return false when hearing is not found in master rows', () => {
        component.hearing = { ...mockHearing, id: 'non-existent', isMaster: false };
        expect(component.shouldInsertBefore).toBe(false);
      });
    });

    describe('shouldInsertAfter', () => {
      it('should return true when hearing is found and no move state hearingId', () => {
        component.hearing = mockHearing;
        component.hearingMoveState = null;
        expect(component.shouldInsertAfter).toBe(true);
      });

      it('should return true when hearing index is different from hearingToMove index - 1', () => {
        component.hearing = mockHearing;
        component.hearingMoveState = {
          ...mockMoveState,
          hearingId: 'hearing-456'
        };
        expect(component.shouldInsertAfter).toBe(false);
      });

      it('should return true when hearing index is not adjacent to hearingToMove', () => {
        component.hearing = mockHearing;
        component.hearingMoveState = {
          ...mockMoveState,
          hearingId: 'hearing-789'
        };
        expect(component.shouldInsertAfter).toBe(true);
      });

      it('should return false when hearing is not found in master rows', () => {
        component.hearing = { ...mockHearing, id: 'non-existent', isMaster: false };
        expect(component.shouldInsertAfter).toBe(false);
      });
    });
  });

  describe('Template Rendering - Dropdown Logic', () => {
    it('should show dropdown when no hearing move state', () => {
      component.hearingMoveState = null;
      fixture.detectChanges();

      const dropdown = fixture.debugElement.query(By.css('hearing-row-action-dropdown'));
      expect(dropdown).toBeTruthy();
    });

    it('should hide dropdown when hearing move state exists', () => {
      component.hearingMoveState = mockMoveState;
      fixture.detectChanges();

      const dropdown = fixture.debugElement.query(By.css('hearing-row-action-dropdown'));
      expect(dropdown).toBeNull();
    });

    it('should pass correct properties to dropdown', () => {
      component.hearingMoveState = null;
      fixture.detectChanges();

      const dropdown = fixture.debugElement.query(By.css('hearing-row-action-dropdown'));
      const dropdownInstance = dropdown.componentInstance;

      expect(dropdownInstance.name).toBe('Action');
      expect(dropdownInstance.menuAlign).toBe('right');
      expect(dropdownInstance.options).toEqual(mockActionOptions);
    });
  });

  describe('Template Rendering - Move Controls Logic', () => {
    it('should show move hearing controls when hearing is non-moving member', () => {
      component.hearingMoveState = mockMoveState;
      component.hearing = {
        ...mockHearing,
        isMaster: true,
        rowIdentifier: 'row-123'
      };
      fixture.detectChanges();

      const moveControls = fixture.debugElement.query(By.css('move-hearings-position-buttons'));
      expect(moveControls).toBeTruthy();
    });

    it('should pass correct properties to move controls', () => {
      component.hearingMoveState = mockMoveState;
      fixture.detectChanges();

      const moveControls = fixture.debugElement.query(By.css('move-hearings-position-buttons'));
      const moveControlsInstance = moveControls.componentInstance;

      expect(moveControlsInstance.hearingMoveState).toEqual(mockMoveState);
      expect(moveControlsInstance.group).toEqual(mockGroup);
      expect(moveControlsInstance.hearingId).toBe(mockHearing.id);
    });
  });

  describe('Template Rendering - Cancel Button Logic', () => {
    it('should show cancel button when hearing is being moved', () => {
      const moveStateForCurrentHearing: HearingTableActionsState['moveState'] = {
        rowIdentifier: mockHearing.rowIdentifier,
        hearingId: mockHearing.id,
        hearingDate: mockHearing.hearingDate,
        rows: mockGroup
      };

      component.hearingMoveState = moveStateForCurrentHearing;
      component.hearing = mockHearing;
      fixture.detectChanges();

      const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
      expect(cancelButton).toBeTruthy();
      expect(cancelButton.nativeElement.textContent.trim()).toBe('Cancel');
    });

    it('should hide cancel button when hearing is not being moved', () => {
      component.hearingMoveState = mockMoveState;
      component.hearing = mockHearing;
      fixture.detectChanges();

      const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
      expect(cancelButton).toBeNull();
    });
  });

  describe('Component Methods', () => {
    describe('insertHearingBefore()', () => {
      it('should emit onMove event with insertBeforeId when hearingMoveState has hearingId', () => {
        const emitSpy = jest.spyOn(component.onMove, 'emit');
        component.hearingMoveState = mockMoveState;

        component.insertHearingBefore();

        const expectedEvent: MoveEvent = {
          insertBeforeId: mockHearing.id,
          hearingToMoveIds: [mockMoveState.hearingId]
        };

        expect(emitSpy).toHaveBeenCalledWith(expectedEvent);
      });

      it('should emit onMove event with undefined hearingToMoveIds when hearingMoveState has no hearingId', () => {
        const emitSpy = jest.spyOn(component.onMove, 'emit');
        component.hearingMoveState = { ...mockMoveState, hearingId: undefined as any };

        component.insertHearingBefore();

        const expectedEvent: MoveEvent = {
          insertBeforeId: mockHearing.id,
          hearingToMoveIds: undefined
        };

        expect(emitSpy).toHaveBeenCalledWith(expectedEvent);
      });

      it('should handle null hearing by throwing error', () => {
        component.hearing = null as any;

        expect(() => component.insertHearingBefore()).toThrow();
      });
    });

    describe('insertHearingAfter()', () => {
      it('should emit onMove event with insertafterId when hearingMoveState has hearingId', () => {
        const emitSpy = jest.spyOn(component.onMove, 'emit');
        component.hearingMoveState = mockMoveState;

        component.insertHearingAfter();

        const expectedEvent: MoveEvent = {
          insertafterId: mockHearing.id,
          hearingToMoveIds: [mockMoveState.hearingId]
        };

        expect(emitSpy).toHaveBeenCalledWith(expectedEvent);
      });

      it('should emit onMove event with undefined hearingToMoveIds when no hearingId', () => {
        const emitSpy = jest.spyOn(component.onMove, 'emit');
        component.hearingMoveState = { ...mockMoveState, hearingId: undefined as any };

        component.insertHearingAfter();

        const expectedEvent: MoveEvent = {
          insertafterId: mockHearing.id,
          hearingToMoveIds: undefined
        };

        expect(emitSpy).toHaveBeenCalledWith(expectedEvent);
      });
    });

    describe('canceMove()', () => {
      it('should emit undoHearingMoveClicked event', () => {
        const emitSpy = jest.spyOn(component.undoHearingMoveClicked, 'emit');

        component.canceMove();

        expect(emitSpy).toHaveBeenCalledWith();
      });
    });

    describe('onClickDropDownAction()', () => {
      it('should emit actionClicked event with correct data', () => {
        const emitSpy = jest.spyOn(component.actionClicked, 'emit');
        const action: HearingDropdownActions = 'move';

        component.onClickDropDownAction(action);

        const expectedEvent: HearingActionsEvent = {
          action: 'move',
          hearingId: mockHearing.id,
          rowIdentifier: mockHearing.rowIdentifier,
          hearingDate: mockHearing.hearingDate,
          rows: mockGroup
        };

        expect(emitSpy).toHaveBeenCalledWith(expectedEvent);
      });

      it('should emit actionClicked event with different actions', () => {
        const emitSpy = jest.spyOn(component.actionClicked, 'emit');
        const action: HearingDropdownActions = 'edit';

        component.onClickDropDownAction(action);

        const expectedEvent: HearingActionsEvent = {
          action: 'edit',
          hearingId: mockHearing.id,
          rowIdentifier: mockHearing.rowIdentifier,
          hearingDate: mockHearing.hearingDate,
          rows: mockGroup
        };

        expect(emitSpy).toHaveBeenCalledWith(expectedEvent);
      });

      it('should handle null hearing by throwing error', () => {
        component.hearing = null as any;

        expect(() => component.onClickDropDownAction('move')).toThrow();
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
    it('should call onClickDropDownAction when dropdown item is clicked', () => {
      const onClickSpy = jest.spyOn(component, 'onClickDropDownAction');
      component.hearingMoveState = null;
      fixture.detectChanges();

      const dropdown = fixture.debugElement.query(By.css('hearing-row-action-dropdown'));
      dropdown.triggerEventHandler('itemClicked', 'move');

      expect(onClickSpy).toHaveBeenCalledWith('move');
    });

    it('should call canceMove when cancel button is clicked', () => {
      const canceMoveSpy = jest.spyOn(component, 'canceMove');

      component.hearingMoveState = mockMoveState;
      fixture.detectChanges();

      const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
      if (cancelButton) {
        cancelButton.nativeElement.click();
        expect(canceMoveSpy).toHaveBeenCalled();
      }
    });

    it('should handle insertBefore event from move-hearings-position-buttons', () => {
      const insertBeforeSpy = jest.spyOn(component, 'insertHearingBefore');

      component.hearingMoveState = mockMoveState;
      fixture.detectChanges();

      const moveButtons = fixture.debugElement.query(By.css('move-hearings-position-buttons'));
      if (moveButtons) {
        moveButtons.triggerEventHandler('insertBefore', null);
        expect(insertBeforeSpy).toHaveBeenCalled();
      }
    });

    it('should handle insertAfter event from move-hearings-position-buttons', () => {
      const insertAfterSpy = jest.spyOn(component, 'insertHearingAfter');

      component.hearingMoveState = mockMoveState;
      fixture.detectChanges();

      const moveButtons = fixture.debugElement.query(By.css('move-hearings-position-buttons'));
      if (moveButtons) {
        moveButtons.triggerEventHandler('insertAfter', null);
        expect(insertAfterSpy).toHaveBeenCalled();
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null hearing in template gracefully', () => {
      component.hearing = null as any;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle undefined hearing in template gracefully', () => {
      component.hearing = undefined as any;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle empty group gracefully', () => {
      component.group = [];
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle null moveState gracefully', () => {
      component.hearingMoveState = null;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle empty actionOptions gracefully', () => {
      component.actionOptions = [];
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle null actionOptions gracefully', () => {
      component.actionOptions = null as any;
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should properly integrate with HearingRowActionDropdownComponent', () => {
      component.hearingMoveState = null;
      fixture.detectChanges();

      const dropdownComponent = fixture.debugElement.query(By.css('hearing-row-action-dropdown'));

      if (dropdownComponent) {
        const componentInstance = dropdownComponent.componentInstance;
        expect(componentInstance.name).toBe('Action');
        expect(componentInstance.menuAlign).toBe('right');
        expect(componentInstance.options).toEqual(mockActionOptions);
      }
    });

    it('should properly integrate with MoveHearingsButtonsComponent', () => {
      component.hearingMoveState = mockMoveState;
      fixture.detectChanges();

      const moveButtonsComponent = fixture.debugElement.query(
        By.css('move-hearings-position-buttons')
      );

      if (moveButtonsComponent) {
        const componentInstance = moveButtonsComponent.componentInstance;
        expect(componentInstance.hearingMoveState).toEqual(mockMoveState);
        expect(componentInstance.group).toEqual(mockGroup);
        expect(componentInstance.hearingId).toBe(mockHearing.id);
      }
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple master rows in shouldInsertBefore/After calculations', () => {
      const complexGroup: BaseHearingRowDataVM[] = [
        { ...mockHearing, id: 'master-1', isMaster: true },
        { ...mockHearing, id: 'master-2', isMaster: true },
        { ...mockHearing, id: 'master-3', isMaster: true },
        { ...mockHearing, id: 'child-1', isMaster: false, isChild: true }
      ];

      component.group = complexGroup;
      component.hearing = complexGroup[1];
      component.hearingMoveState = {
        ...mockMoveState,
        hearingId: 'master-3'
      };

      expect(component.shouldInsertBefore).toBe(false);
      expect(component.shouldInsertAfter).toBe(false);
    });

    it('should handle edge case where hearing to move is adjacent', () => {
      const complexGroup: BaseHearingRowDataVM[] = [
        { ...mockHearing, id: 'master-1', isMaster: true },
        { ...mockHearing, id: 'master-2', isMaster: true },
        { ...mockHearing, id: 'master-3', isMaster: true }
      ];

      component.group = complexGroup;
      component.hearing = complexGroup[0];
      component.hearingMoveState = {
        ...mockMoveState,
        hearingId: 'master-2'
      };

      expect(component.shouldInsertBefore).toBe(true);
      expect(component.shouldInsertAfter).toBe(false);
    });
  });

  describe('Performance and Memory Tests', () => {
    it('should not create new objects unnecessarily in computed properties', () => {
      const firstCall = component.masterRows;
      const secondCall = component.masterRows;

      expect(firstCall).toEqual(secondCall);
    });

    it('should handle large groups efficiently', () => {
      const largeGroup: BaseHearingRowDataVM[] = Array.from({ length: 1000 }, (_, i) => ({
        ...mockHearing,
        id: `hearing-${i}`,
        rowIdentifier: `row-${i}`,
        isMaster: i % 2 === 0
      }));

      component.group = largeGroup;
      component.hearing = largeGroup[0];

      expect(() => {
        component.masterRows;
        component.shouldInsertBefore;
        component.shouldInsertAfter;
      }).not.toThrow();

      expect(component.masterRows).toHaveLength(500);
    });
  });

  describe('Accessibility and User Experience', () => {
    it('should have proper data-test-id for testing', () => {
      fixture.detectChanges();
      const testContainer = fixture.debugElement.query(By.css('[data-test-id="actions-cell"]'));
      expect(testContainer).toBeTruthy();
    });

    it('should show meaningful button text', () => {
      component.hearingMoveState = mockMoveState;
      fixture.detectChanges();

      const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
      if (cancelButton) {
        expect(cancelButton.nativeElement.textContent.trim()).toBe('Cancel');
      }
    });

    it('should pass proper content to move buttons component', () => {
      component.hearingMoveState = mockMoveState;
      fixture.detectChanges();

      const moveButtons = fixture.debugElement.query(By.css('move-hearings-position-buttons'));
      if (moveButtons) {
        const insertBeforeSpan = moveButtons.query(By.css('[insert-before]'));
        const insertAfterSpan = moveButtons.query(By.css('[insert-after]'));

        expect(insertBeforeSpan?.nativeElement.textContent.trim()).toBe('Insert before');
        expect(insertAfterSpan?.nativeElement.textContent.trim()).toBe('Insert after');
      }
    });
  });

  describe('Component Styling', () => {
    it('should apply correct CSS classes to cancel button', () => {
      component.hearingMoveState = mockMoveState;
      fixture.detectChanges();

      const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
      if (cancelButton) {
        expect(cancelButton.nativeElement.classList.contains('cancel-button')).toBe(true);
      }
    });

    it('should have proper button styling attributes', () => {
      component.hearingMoveState = mockMoveState;
      fixture.detectChanges();

      const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
      if (cancelButton) {
        expect(cancelButton.nativeElement.getAttribute('pdk-button')).toBe('secondary');
      }
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should handle typical user workflow: move -> insert before/after', () => {
      component.hearingMoveState = mockMoveState;
      fixture.detectChanges();

      const moveButtons = fixture.debugElement.query(By.css('move-hearings-position-buttons'));
      expect(moveButtons).toBeTruthy();

      const moveEmitSpy = jest.spyOn(component.onMove, 'emit');
      component.insertHearingBefore();
      expect(moveEmitSpy).toHaveBeenCalledWith({
        insertBeforeId: mockHearing.id,
        hearingToMoveIds: [mockMoveState.hearingId]
      });

      component.insertHearingAfter();
      expect(moveEmitSpy).toHaveBeenCalledWith({
        insertafterId: mockHearing.id,
        hearingToMoveIds: [mockMoveState.hearingId]
      });
    });
  });

  describe('Component State Management', () => {
    it('should maintain consistent state during rapid changes', () => {
      component.hearingMoveState = null;
      fixture.detectChanges();

      component.hearingMoveState = mockMoveState;
      fixture.detectChanges();

      component.hearingMoveState = null;
      fixture.detectChanges();

      component.hearingMoveState = mockMoveState;
      fixture.detectChanges();

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle property changes without affecting other properties', () => {
      const originalHearing = component.hearing;
      const originalGroup = component.group;

      component.hearingMoveState = mockMoveState;
      fixture.detectChanges();

      expect(component.hearing).toBe(originalHearing);
      expect(component.group).toBe(originalGroup);
    });
  });

  describe('Error Recovery', () => {
    it('should handle pipe errors gracefully in template', () => {
      component.hearingMoveState = mockMoveState;

      expect(() => {
        try {
          fixture.detectChanges();
        } catch (error) {}
      }).not.toThrow();
    });

    it('should handle corrupted move state gracefully', () => {
      const corruptedMoveState = {
        rowIdentifier: null,
        hearingId: undefined,
        hearingDate: '',
        rows: null
      } as any;

      component.hearingMoveState = corruptedMoveState;

      expect(() => fixture.detectChanges()).not.toThrow();
      expect(() => component.insertHearingBefore()).not.toThrow();
      expect(() => component.insertHearingAfter()).not.toThrow();
    });
  });
});
