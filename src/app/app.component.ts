import { Component, OnInit, Inject } from '@angular/core';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  ActivatedRoute,
  RouterOutlet
} from '@angular/router';
import { HeaderNavItem } from '@cpp/application/layout/layout.component';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import {
  AppConfigService,
  EXPECTED_LISTING_USER_PERMISSIONS,
  ListingUserPermissions
} from './config';
import { BootstrapService, getOnlineStatus } from './core';
import { AppState } from './core/reducers';
import { Title } from '@angular/platform-browser';
import { getUserHasPermission } from '@cpp/users-groups';
import { getHasApiActivity } from './core/selectors/api';
import { CppApplicationLayoutComponent } from '@cpp/application';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [CppApplicationLayoutComponent, RouterOutlet, AsyncPipe]
})
export class AppComponent implements OnInit {
  loading$: Observable<boolean>;
  online$: Observable<boolean>;
  headerNavItems$: Observable<HeaderNavItem[]>;
  hasSearchEnabled$: Observable<boolean>;

  accessibilityUrl: string;
  accountUrl: string;
  homePageUrl: string;
  logoutUrl: string;
  yourServicesUrl: string;

  constructor(
    private store: Store<AppState>,
    private bootstrap: BootstrapService,
    private appConfigService: AppConfigService,
    private router: Router,
    @Inject(EXPECTED_LISTING_USER_PERMISSIONS) public expectedPermissions: ListingUserPermissions,
    private titleService: Title,
    private activatedRoute: ActivatedRoute
  ) {
    this.bootstrap.startConnectivityMonitor();

    this.loading$ = combineLatest([
      this.store.select(getHasApiActivity),
      router.events.pipe(
        filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd),
        map((event) => event instanceof NavigationStart)
      )
    ]).pipe(map(([hasApiActivity, hasRouterActivity]) => hasApiActivity || hasRouterActivity));
    this.online$ = this.store.select(getOnlineStatus);

    this.accountUrl = this.appConfigService.getAccountUrl();
    this.homePageUrl = this.appConfigService.getBaseUrl();
    this.accessibilityUrl = `${this.homePageUrl}/accessibility`;
    this.logoutUrl = this.appConfigService.getLogoutUrl();
    this.yourServicesUrl = appConfigService.getServicesUrl();

    this.headerNavItems$ = this.store.pipe(
      select(getUserHasPermission([expectedPermissions.viewCpSearch])),
      map((hasSearchPermission) => {
        let navItems: HeaderNavItem[] = [];

        if (hasSearchPermission) {
          navItems = [...navItems, { title: 'Detailed Search', href: this.searchUrl }];
        }

        navItems = [...navItems, { title: 'Home', href: this.homePageUrl }];

        if (this.yourServicesUrl) {
          navItems = [...navItems, { title: 'Your Services', href: this.yourServicesUrl }];
        }

        if (this.accountUrl) {
          navItems = [...navItems, { title: 'Your Account', href: this.accountUrl }];
        }

        if (this.logoutUrl) {
          navItems = [...navItems, { title: 'Sign out', href: this.logoutUrl }];
        }

        return navItems;
      })
    );

    this.hasSearchEnabled$ = this.store.pipe(
      select(getUserHasPermission([expectedPermissions.viewCpSearch]))
    );
  }

  ngOnInit(): void {
    const appTitle = this.titleService.getTitle();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let child = this.activatedRoute.firstChild;
          while (child.firstChild) {
            child = child.firstChild;
          }
          if (child.snapshot.data['title']) {
            return child.snapshot.data['title'];
          }
          return appTitle;
        })
      )
      .subscribe((ttl: string) => {
        this.titleService.setTitle(ttl);
      });
  }

  get searchUrl(): string {
    return `${this.appConfigService.cppHomeUrl}/search?referrer=${encodeURIComponent(
      document.baseURI
    )}`;
  }

  handleSearch(caseReference: string | null) {
    window.location.href = `${this.searchUrl}&caseReference=${caseReference}`;
  }
}
