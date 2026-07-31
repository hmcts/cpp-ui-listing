import { patchState, signalStoreFeature, withMethods, withState } from '@ngrx/signals';
import { ExtendedJudicialRole } from '../../../core';

export interface SelectedHearingState {
  hearingId: string;
  hearingDateTime: string;
  duration?: number;
  judiciary?: ExtendedJudicialRole[];
}

interface HearingSelectionState {
  selectedHearings: SelectedHearingState[];
}

const initialState: HearingSelectionState = {
  selectedHearings: []
};

export function withHearingSelectionStore<_>() {
  return signalStoreFeature(
    withState<HearingSelectionState>(initialState),
    withMethods(store => ({
      selectHearing: (hearing: SelectedHearingState) => {
        const current = store.selectedHearings() ?? [];
        const idx = current.findIndex(
          h => h.hearingId === hearing.hearingId && h.hearingDateTime === hearing.hearingDateTime
        );
        const updated =
          idx <= -1 ? [...current, hearing] : [...current.slice(0, idx), ...current.slice(idx + 1)];
        patchState(store, { selectedHearings: updated });
      },
      selectAllHearings: (hearings: SelectedHearingState[]) => {
        patchState(store, { selectedHearings: [...hearings] });
      },
      clearSelection: () => {
        patchState(store, { selectedHearings: [] });
      }
    }))
  );
}
