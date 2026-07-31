import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngrx/store';
import { UsersGroupsActions, RolePermission, UsersGroupsService } from '@cpp/users-groups';
import { AppComponent } from './app.component';
import { BootstrapService } from './core/services/bootstrap/bootstrap.service';
import { AppConfigService } from './config';
import { AppState, reducers } from './core/reducers';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject, of } from 'rxjs';
import { provideCPPApplicationEnvironment } from '@cpp/application';
import { provideRouter } from '@angular/router';
import { provideCppCoreHttpServices } from '@cpp/core';
import { BreakpointObserver } from '@angular/cdk/layout';

describe('App page component', () => {
  const getAccountUrl = jest.fn();
  const getBaseUrl = jest.fn();
  const getLogoutUrl = jest.fn();
  const getServicesUrl = jest.fn();
  const load = jest.fn();

  let fixture: ComponentFixture<AppComponent>;
  let store: Store<AppState>;
  const mockSubject = new BehaviorSubject<{ matches: boolean }>({ matches: true });
  let observe: jest.Mock;
  beforeEach(() => {
    observe = jest.fn(() => mockSubject);
    TestBed.configureTestingModule({
      providers: [
        provideCPPApplicationEnvironment({ production: false }),
        provideStore(reducers, { runtimeChecks: {} }),
        provideRouter([]),
        provideCppCoreHttpServices(),
        {
          provide: BootstrapService,
          useValue: {
            loadReferenceData: jest.fn(),
            startConnectivityMonitor: jest.fn()
          }
        },
        { provide: Title, useValue: { getTitle: jest.fn(), setTitle: jest.fn() } },
        {
          provide: AppConfigService,
          useValue: {
            load,
            getAccountUrl,
            getBaseUrl,
            getLogoutUrl,
            getServicesUrl
          }
        },
        {
          provide: UsersGroupsService,
          useValue: {
            getUserSystemAnnouncement: jest.fn().mockReturnValue(of({ announcement: undefined }))
          }
        },
        {
          provide: BreakpointObserver,
          useValue: { observe }
        }
      ],
      teardown: { destroyAfterEach: false }
    }).configureCompiler({ preserveWhitespaces: false } as any);

    store = TestBed.inject<Store<AppState>>(Store);
    getAccountUrl.mockReturnValue('http://account-url');
    getBaseUrl.mockReturnValue('http://app-url');
    getLogoutUrl.mockReturnValue('http://logout-url');
    getServicesUrl.mockReturnValue('http://services-url');
    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  it('should compile correctly with all header urls', () => {
    expect(fixture).toMatchSnapshot();
  });

  describe('when search is available', () => {
    beforeEach(() => {
      store.dispatch(
        UsersGroupsActions.setUserPermissions({
          permissions: [
            {
              object: 'CP Search',
              action: 'View'
            }
          ] as RolePermission[]
        })
      );
    });

    it('should compile correctly ', () => {
      TestBed.inject(AppConfigService).cppHomeUrl = 'https://cpp.home';
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });
  });
});
