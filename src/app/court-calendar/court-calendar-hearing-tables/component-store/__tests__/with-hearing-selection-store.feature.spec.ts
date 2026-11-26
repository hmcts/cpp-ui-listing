import { TestBed } from '@angular/core/testing';
import { signalStore } from '@ngrx/signals';
import {
  withHearingSelectionStore,
  SelectedHearingState
} from '../with-hearing-selection-store.feature';

describe('withHearingSelectionStore', () => {
  const TestStore = signalStore(withHearingSelectionStore());
  let store: InstanceType<typeof TestStore>;

  const createMockSelectedHearing = (
    hearingId: string,
    hearingDateTime: string,
    duration?: number
  ): SelectedHearingState => ({
    hearingId,
    hearingDateTime,
    duration,
    judiciary: []
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestStore],
      teardown: { destroyAfterEach: false }
    });

    store = TestBed.inject(TestStore);
  });

  describe('initial state', () => {
    it('should initialize with empty selectedHearings array', () => {
      expect(store.selectedHearings()).toEqual([]);
    });
  });

  describe('selectHearing method', () => {
    it('should add hearing when not present in selection', () => {
      const hearing = createMockSelectedHearing('1', '2024-01-01T10:00:00');

      store.selectHearing(hearing);

      expect(store.selectedHearings()).toHaveLength(1);
      expect(store.selectedHearings()[0]).toEqual(hearing);
    });

    it('should remove hearing when already present in selection (toggle behavior)', () => {
      const hearing = createMockSelectedHearing('1', '2024-01-01T10:00:00');

      store.selectHearing(hearing);
      expect(store.selectedHearings()).toHaveLength(1);

      store.selectHearing(hearing);
      expect(store.selectedHearings()).toHaveLength(0);
    });

    it('should match hearing by both hearingId AND hearingDateTime', () => {
      const hearing1 = createMockSelectedHearing('1', '2024-01-01T10:00:00');
      const hearing2 = createMockSelectedHearing('1', '2024-01-01T14:00:00'); // Same ID, different time

      store.selectHearing(hearing1);
      store.selectHearing(hearing2);

      expect(store.selectedHearings()).toHaveLength(2);
      expect(store.selectedHearings()).toContainEqual(hearing1);
      expect(store.selectedHearings()).toContainEqual(hearing2);
    });

    it('should toggle correctly when hearing matches both hearingId and hearingDateTime', () => {
      const hearing1 = createMockSelectedHearing('1', '2024-01-01T10:00:00');
      const hearing2 = createMockSelectedHearing('1', '2024-01-01T14:00:00');
      const hearing1Duplicate = createMockSelectedHearing('1', '2024-01-01T10:00:00', 120);

      store.selectHearing(hearing1);
      store.selectHearing(hearing2);
      expect(store.selectedHearings()).toHaveLength(2);

      // Should remove hearing1 and keep hearing2
      store.selectHearing(hearing1Duplicate);
      expect(store.selectedHearings()).toHaveLength(1);
      expect(store.selectedHearings()[0]).toEqual(hearing2);
    });

    it('should handle multiple hearings with different IDs', () => {
      const hearing1 = createMockSelectedHearing('1', '2024-01-01T10:00:00');
      const hearing2 = createMockSelectedHearing('2', '2024-01-01T10:00:00');
      const hearing3 = createMockSelectedHearing('3', '2024-01-01T14:00:00');

      store.selectHearing(hearing1);
      store.selectHearing(hearing2);
      store.selectHearing(hearing3);

      expect(store.selectedHearings()).toHaveLength(3);
      expect(store.selectedHearings()).toContainEqual(hearing1);
      expect(store.selectedHearings()).toContainEqual(hearing2);
      expect(store.selectedHearings()).toContainEqual(hearing3);
    });

    it('should preserve hearing properties when adding to selection', () => {
      const hearing = createMockSelectedHearing('1', '2024-01-01T10:00:00', 180);

      store.selectHearing(hearing);

      expect(store.selectedHearings()[0]).toEqual(hearing);
      expect(store.selectedHearings()[0].duration).toBe(180);
    });
  });

  describe('selectAllHearings method', () => {
    it('should replace entire selection with provided hearings', () => {
      const initialHearing = createMockSelectedHearing('1', '2024-01-01T10:00:00');
      const newHearings = [
        createMockSelectedHearing('2', '2024-01-01T14:00:00'),
        createMockSelectedHearing('3', '2024-01-01T16:00:00')
      ];

      store.selectHearing(initialHearing);
      expect(store.selectedHearings()).toHaveLength(1);

      store.selectAllHearings(newHearings);

      expect(store.selectedHearings()).toHaveLength(2);
      expect(store.selectedHearings()).toEqual(newHearings);
      expect(store.selectedHearings()).not.toContainEqual(initialHearing);
    });

    it('should handle empty array', () => {
      const hearing = createMockSelectedHearing('1', '2024-01-01T10:00:00');

      store.selectHearing(hearing);
      expect(store.selectedHearings()).toHaveLength(1);

      store.selectAllHearings([]);

      expect(store.selectedHearings()).toEqual([]);
    });

    it('should create a copy of the provided array', () => {
      const originalHearings = [
        createMockSelectedHearing('1', '2024-01-01T10:00:00'),
        createMockSelectedHearing('2', '2024-01-01T14:00:00')
      ];

      store.selectAllHearings(originalHearings);

      // Mutating the original array should not affect the store
      originalHearings.pop();

      expect(store.selectedHearings()).toHaveLength(2);
    });
  });

  describe('clearSelection method', () => {
    it('should clear all selected hearings', () => {
      const hearings = [
        createMockSelectedHearing('1', '2024-01-01T10:00:00'),
        createMockSelectedHearing('2', '2024-01-01T14:00:00'),
        createMockSelectedHearing('3', '2024-01-01T16:00:00')
      ];

      store.selectAllHearings(hearings);
      expect(store.selectedHearings()).toHaveLength(3);

      store.clearSelection();

      expect(store.selectedHearings()).toEqual([]);
    });

    it('should handle clearing empty selection', () => {
      expect(store.selectedHearings()).toEqual([]);

      store.clearSelection();

      expect(store.selectedHearings()).toEqual([]);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex selection workflow', () => {
      const hearing1 = createMockSelectedHearing('1', '2024-01-01T10:00:00');
      const hearing2 = createMockSelectedHearing('2', '2024-01-01T14:00:00');
      const hearing3 = createMockSelectedHearing('3', '2024-01-01T16:00:00');
      const bulkHearings = [
        createMockSelectedHearing('4', '2024-01-02T10:00:00'),
        createMockSelectedHearing('5', '2024-01-02T14:00:00')
      ];

      // Start with individual selections
      store.selectHearing(hearing1);
      store.selectHearing(hearing2);
      expect(store.selectedHearings()).toHaveLength(2);

      // Toggle off one hearing
      store.selectHearing(hearing1);
      expect(store.selectedHearings()).toHaveLength(1);
      expect(store.selectedHearings()[0]).toEqual(hearing2);

      // Add another hearing
      store.selectHearing(hearing3);
      expect(store.selectedHearings()).toHaveLength(2);

      // Replace with bulk selection
      store.selectAllHearings(bulkHearings);
      expect(store.selectedHearings()).toHaveLength(2);
      expect(store.selectedHearings()).toEqual(bulkHearings);

      // Clear everything
      store.clearSelection();
      expect(store.selectedHearings()).toEqual([]);
    });
  });

  describe('snapshot testing', () => {
    it('should match initial state snapshot', () => {
      expect(store.selectedHearings()).toMatchSnapshot();
    });

    it('should match state snapshot after selections', () => {
      const hearings = [
        createMockSelectedHearing('1', '2024-01-01T10:00:00', 120),
        createMockSelectedHearing('2', '2024-01-01T14:00:00', 240)
      ];

      store.selectAllHearings(hearings);

      expect(store.selectedHearings()).toMatchSnapshot();
    });
  });
});
