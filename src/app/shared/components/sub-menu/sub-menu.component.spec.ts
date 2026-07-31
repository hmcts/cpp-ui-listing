import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersGroupsActions } from '@cpp/users-groups';
import { provideStore, Store } from '@ngrx/store';
import { AppState, reducers } from '../../../core/reducers';
import { SubMenuComponent } from './sub-menu.component';
import { provideRouter } from '@angular/router';

describe('SubMenuComponent', () => {
  let fixture: ComponentFixture<SubMenuComponent>;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore(reducers), provideRouter([])],
      teardown: { destroyAfterEach: false }
    });
    fixture = TestBed.createComponent(SubMenuComponent);
    fixture.detectChanges();
    store = TestBed.inject(Store as Type<Store<AppState>>);
  });

  it('should render', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should render when the user has CPS access only', () => {
    store.dispatch(
      UsersGroupsActions.setUserGroups({
        userGroups: [
          {
            groupId: '*',
            groupName: 'CPS',
            description: 'test-description'
          }
        ]
      })
    );
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should render when the user has Court Calendar access', () => {
    store.dispatch(
      UsersGroupsActions.setUserPermissions({
        permissions: [
          {
            object: 'Court Calendar',
            action: 'Manage',
            permissionId: 'permission-id',
            description: 'court calendar access permission'
          }
        ]
      })
    );
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should not render when the user does not have Court Calendar access', () => {
    store.dispatch(
      UsersGroupsActions.setUserPermissions({
        permissions: [
          {
            object: 'some object',
            action: 'view',
            permissionId: 'permission-id-2',
            description: 'some other permission'
          }
        ]
      })
    );
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
