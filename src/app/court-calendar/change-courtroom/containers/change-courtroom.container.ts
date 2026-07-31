import { Component, inject, OnDestroy, OnInit, Type } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

import { EMPTY, of, Subject } from 'rxjs';
import { takeUntil, filter, tap, switchMap, finalize } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ChangeCourtroomStateService } from '../component-store/change-courtroom-state.service';
import { getChangeCourtroomVm } from '../../state/selectors/court-calendar.selectors';
import { ConfirmCourtRoomChange, CourtCalendarActions } from '../../state';
import { PdkGrid } from '@cpp/pdk';

@Component({
  selector: 'change-courtroom-container',
  template: `
    <pdk-grid container>
      <pdk-grid full>
        <!-- Child route content handles everything -->
        <router-outlet
          (activate)="onComponentActivated($event)"
          (deactivate)="onComponentDeactivated($event)"
        ></router-outlet>
      </pdk-grid>
    </pdk-grid>
  `,
  imports: [PdkGrid, RouterOutlet],
  providers: [ChangeCourtroomStateService]
})
export class ChangeCourtroomContainer implements OnInit, OnDestroy {
  router = inject(Router);
  route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();
  private deactivateConfirmation$ = new Subject<void>();

  constructor(
    private changeCourtroomStateService: ChangeCourtroomStateService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.store
      .select(getChangeCourtroomVm)
      .pipe(
        takeUntil(this.destroy$),
        filter((hearingVM) => hearingVM !== null)
      )
      .subscribe((hearingVM) => {
        this.changeCourtroomStateService.setHearingVM(hearingVM);
      });
  }

  onComponentActivated(component: ConfirmCourtRoomChange | Type<any>) {
    if ('onConfirmation' in component) {
      component.onConfirmation.subscribe((event) =>
        of(event)
          .pipe(
            tap(
              ({ confirmed }) =>
                !confirmed && this.router.navigate(['.'], { relativeTo: this.route })
            ),
            switchMap(({ confirmed, clearSelection }) =>
              (confirmed ? this.changeCourtroomStateService.selectedHearingDays$ : EMPTY).pipe(
                finalize(() => {
                  if (clearSelection) {
                    this.changeCourtroomStateService.setSelectedHearingDays([]);
                  }
                })
              )
            ),
            takeUntil(this.deactivateConfirmation$)
          )
          .subscribe((updatedHearingDays) => {
            this.store.dispatch(
              CourtCalendarActions.updateSelectedHearingDays({
                updatedHearingDays
              })
            );
          })
      );
    }
  }

  onComponentDeactivated(component: ConfirmCourtRoomChange | Type<any>) {
    if ('onConfirmation' in component) {
      this.deactivateConfirmation$.next();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
