import { Component, OnInit, Inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import {
  AppState,
  getHearingById,
  Hearing,
  ScheduledAllocateHearingAction,
  getHearingByDefendantsGroup,
  HearingByDefendants,
  SplittedHearingIds,
  ListedCase,
  Defendant,
  Offence
} from '../core';
import { cloneDeep } from 'lodash-es';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { setSelectedHearingData } from '../court-calendar/state/actions/court-calendar.actions';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';
import { SplitHearingFormComponent } from './split-hearing-form/split-hearing-form.component';
import { PdkLinkDirective } from '@cpp/pdk';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'split-hearing',
  template: `
    <back-button [linkUrl]="linkUrl"></back-button>
    <split-hearing-form
      [hearing]="hearingByDefendants$ | async"
      (onSubmit)="allocateHearing($event)"
    >
    </split-hearing-form>
    <div>
      <a pdk-link [routerLink]="linkUrl" data-role="cancel-btn">Cancel</a>
    </div>
  `,
  imports: [BackButtonComponent, SplitHearingFormComponent, PdkLinkDirective, RouterLink, AsyncPipe]
})
export class SplitHearingContainer implements OnInit {
  hearingByDefendants$: Observable<HearingByDefendants>;
  selectedHearing: Hearing;

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    @Inject('Window') private window: Window
  ) {}

  ngOnInit() {
    const { id } = this.route.snapshot.params;
    this.hearingByDefendants$ = this.store.pipe(select(getHearingByDefendantsGroup(id)));
    this.store.pipe(select(getHearingById(id)), take(1)).subscribe((selectedHearing: Hearing) => {
      this.selectedHearing = selectedHearing;
    });
  }

  allocateHearing(hearing: SplittedHearingIds | undefined): void {
    const unallocatedHearing: Hearing = cloneDeep(this.selectedHearing);

    if (!!hearing) {
      const filteredCases: ListedCase[] = unallocatedHearing.listedCases.filter(
        (listedCase: ListedCase) => hearing.caseIds.includes(listedCase.id)
      );

      filteredCases.forEach((listedCase: ListedCase) => {
        listedCase.defendants = listedCase.defendants.filter((defendant: Defendant) =>
          hearing.defendantIds.includes(defendant.id)
        );

        listedCase.defendants.forEach((defendant: Defendant) => {
          defendant.offences = defendant.offences.filter((offence: Offence) =>
            hearing.offenceIds.includes(offence.id)
          );
        });
      });

      unallocatedHearing.listedCases = filteredCases;
    }

    if (!this.referrer) {
      this.store.dispatch(new ScheduledAllocateHearingAction(unallocatedHearing));
    } else {
      this.store.dispatch(setSelectedHearingData({ selectedHearing: unallocatedHearing }));
    }

    unallocatedHearing.allocated ? 'allocated' : 'unallocated';
    let queryParams = {
      ...this.route.snapshot?.queryParams,
      allocated: unallocatedHearing?.allocated,
      split: true
    };

    this.router
      .navigate([`/unallocated/${unallocatedHearing.id}`], {
        queryParams
      })
      .then(() => {
        this.window.scroll(0, 0);
      });
  }

  get linkUrl(): string {
    if (this.referrer) {
      return '/court-calendar';
    }
    return this.selectedHearing?.allocated ? '/allocated' : '/unallocated';
  }

  get referrer(): boolean {
    return this.route.snapshot?.queryParams?.referrer === 'CALENDAR';
  }
}
