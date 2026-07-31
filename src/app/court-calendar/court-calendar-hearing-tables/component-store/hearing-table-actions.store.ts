import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { withErrorHandlerAdapter } from '../../../shared/signal-store/with-error-handler-adapter.feature';
import {
  withHearingSelectionStore,
  SelectedHearingState
} from './with-hearing-selection-store.feature';
import {
  withHearingMoveStore,
  MoveState,
  MoveEvent,
  SequenceEvent,
  PositionedHearingsState
} from './with-hearing-move-store.feature';
import {
  withAllocationStore,
  SectionAllocatedToState,
  BulkOperationResult,
  OnSuccessCallback
} from './with-allocation-store.feature';
import { withHearingScheduleStore } from './with-hearing-schedule-store.feature';

export type {
  SelectedHearingState,
  MoveState,
  MoveEvent,
  SequenceEvent,
  PositionedHearingsState,
  SectionAllocatedToState,
  BulkOperationResult,
  OnSuccessCallback
};

export interface HearingTableActionsState {
  selectedHearings?: SelectedHearingState[];
  moveState?: MoveState;
  sectionAllocatedTo?: SectionAllocatedToState;
  positionedHearingsState?: PositionedHearingsState;
  eligibleScheduleIds?: string[] | null;
  failedAllocationIds?: string[];
}

export const HearingTableActionsStore = signalStore(
  withErrorHandlerAdapter(),
  withHearingSelectionStore(),
  withHearingMoveStore(),
  withHearingScheduleStore(),
  withAllocationStore(),
  withMethods(store => ({
    resetState: () => {
      patchState(store, {
        selectedHearings: [],
        moveState: undefined,
        action: undefined,
        sequencedHearings: undefined,
        positionedHearingsState: undefined,
        sectionAllocatedTo: undefined,
        failedAllocationIds: []
      });
    }
  }))
);
