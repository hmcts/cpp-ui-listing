import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { Observable } from 'rxjs';

import { map } from 'rxjs/internal/operators/map';
import { ChangeCourtroomVM, HearingDayVM } from '../../model';

export interface ChangeCourtroomState {
  hearingVM: ChangeCourtroomVM | null;
  selectedCourtroom: string;
  selectedHearingDays: HearingDayVM[];
}

@Injectable({
  providedIn: 'root'
})
export class ChangeCourtroomStateService extends ComponentStore<ChangeCourtroomState> {
  constructor() {
    super({
      hearingVM: null,
      selectedCourtroom: '',
      selectedHearingDays: []
    });
  }

  readonly hearingVM$ = this.select((state) => state.hearingVM);

  readonly selectedCourtroom$ = this.select((state) => state.selectedCourtroom);

  readonly selectedHearingDays$ = this.select((state) => state.selectedHearingDays);

  readonly getCourtRooms = this.select(this.hearingVM$, (hearingVm) => hearingVm.courtRooms).pipe(
    map((courtRooms) => {
      if (courtRooms?.length) {
        return courtRooms.map((courtroom) => ({
          label: courtroom.courtroomName,
          value: courtroom.id
        }));
      }
    })
  );

  readonly setHearingVM = this.updater((state, hearingVM: ChangeCourtroomVM) => ({
    ...state,
    hearingVM
  }));

  readonly setConfirmCourtroomChange = this.updater(
    (state, confirmCourtroomChange: boolean | undefined) => {
      return {
        ...state,
        confirmCourtroomChange
      };
    }
  );

  readonly setSelectedHearingDays = this.updater<HearingDayVM[]>((state, hearingDays) => ({
    ...state,
    selectedHearingDays: [...hearingDays]
  }));

  updateSelectedHearingDays = this.effect(
    (selectedHearingData$: Observable<{ hearingDays: HearingDayVM[]; courtRoomId: string }>) => {
      return selectedHearingData$.pipe(
        map(({ hearingDays, courtRoomId }) =>
          hearingDays.map((hearingDay) => ({
            ...hearingDay,
            courtRoomId
          }))
        ),
        tapResponse(
          (selectedHearingDays: HearingDayVM[]) => {
            this.patchState({
              selectedHearingDays,
              selectedCourtroom: selectedHearingDays[0].courtRoomId
            });
          },
          (error) => console.log(error)
        )
      );
    }
  );

  readonly reset = this.patchState({
    hearingVM: null,
    selectedCourtroom: '',
    selectedHearingDays: []
  });
}
