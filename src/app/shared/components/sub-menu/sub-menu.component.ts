import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { getUserHasPermission } from '@cpp/users-groups';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EXPECTED_LISTING_USER_PERMISSIONS, ListingUserPermissions } from '../../../config';
import { AppState, getUserHasCpsAccessOnly } from '../../../core';
import {
  PdkServiceNavigationComponent,
  PdkMarginDirective,
  PdkServiceNavigationListDirective,
  PdkServiceNavigationListItemDirective
} from '@cpp/pdk';
import { AsyncPipe } from '@angular/common';
import { RouterLinkActive, RouterLink } from '@angular/router';

export interface MenuItem {
  routerLink: string | string[];
  linkText: string;
}

@Component({
  selector: 'sub-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav pdk-service-nav clear pdk-margin-top="-1" pdk-margin-bottom="6">
      <ul pdk-service-nav-list role="presentation">
        @for (menuItem of menuItems$ | async; track menuItem.linkText; let i = $index) {
          <li
            pdk-service-nav-list-item
            routerLinkActive
            #linkActive="routerLinkActive"
            [selected]="linkActive.isActive"
          >
            <a [routerLink]="menuItem.routerLink">{{ menuItem.linkText }}</a>
          </li>
        }
      </ul>
    </nav>
  `,
  imports: [
    PdkServiceNavigationComponent,
    PdkMarginDirective,
    PdkServiceNavigationListDirective,
    PdkServiceNavigationListItemDirective,
    RouterLinkActive,
    RouterLink,
    AsyncPipe
  ]
})
export class SubMenuComponent {
  menuItems$: Observable<MenuItem[]>;

  constructor(
    private store: Store<AppState>,
    @Inject(EXPECTED_LISTING_USER_PERMISSIONS) private userPermissions: ListingUserPermissions
  ) {
    this.menuItems$ = combineLatest([
      this.store.pipe(select(getUserHasCpsAccessOnly)),
      this.store.pipe(select(getUserHasPermission([this.userPermissions.manageCourtcalendar])))
    ]).pipe(
      map(([hasCpsAccessOnly, hasCourtCalendarAccess]) => {
        const menuItems = [
          {
            routerLink: '/unallocated',
            linkText: 'Unallocated Hearings'
          },
          {
            routerLink: '/create-a-list',
            linkText: hasCpsAccessOnly
              ? `Download Magistrates' hearing lists`
              : 'Publish and download hearing lists'
          },
          {
            routerLink: '/unscheduled',
            linkText: 'Unscheduled list'
          }
        ];

        if (hasCourtCalendarAccess) {
          menuItems.push({
            routerLink: '/court-calendar',
            linkText: 'Court calendar'
          });
        }

        return menuItems;
      })
    );
  }
}
