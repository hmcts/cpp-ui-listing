import { UserGroup, UserGroupType, UsersGroupsActions } from '@cpp/users-groups';
import { combineReducers } from '@ngrx/store';
import { reducers } from '../reducers';
import {
  getIsHmctsUser,
  getUserHasCpsAccessOnly,
  getIsPrisonAdminOrHmctsUser
} from './users-groups';

describe('users-groups selectors', () => {
  const appReducer = combineReducers(reducers);

  describe('getUserHasCpsAccessOnly', () => {
    it('should return false when user does not belong to the `CPS` group', () => {
      const state = appReducer(
        undefined,
        UsersGroupsActions.setUserPermissions({
          userGroups: [
            {
              groupId: '*',
              groupName: 'Listing Officers'
            }
          ] as UserGroup[]
        })
      );
      expect(getUserHasCpsAccessOnly(state)).toEqual(false);
    });

    it('should return true when the user belongs to `CPS` group', () => {
      const state = appReducer(
        undefined,
        UsersGroupsActions.setUserPermissions({
          userGroups: [
            {
              groupId: '*',
              groupName: 'CPS'
            }
          ] as UserGroup[]
        })
      );
      expect(getUserHasCpsAccessOnly(state)).toEqual(true);
    });

    it('should return false when a CPS user belongs to another permitted group', () => {
      (
        [
          'Legal Advisers',
          'Crown Court Admin',
          'Court Clerks',
          'Listing Officers'
        ] as UserGroupType[]
      ).forEach((groupName) => {
        const state = appReducer(
          undefined,
          UsersGroupsActions.setUserPermissions({
            userGroups: [
              { groupId: '*', groupName },
              { groupId: '*', groupName: 'CPS' }
            ] as UserGroup[]
          })
        );
        const hasCpsAccessOnly = getUserHasCpsAccessOnly(state);
        if (hasCpsAccessOnly) {
          throw new Error(
            `Expected \`getUserHasCpsAccessOnly\` for ${groupName} to be false. Got true.`
          );
        }
      });
    });

    it('should return true when the user belongs to a HMCTS group', () => {
      [
        'Listing Officers',
        'Court Clerks',
        'Legal Advisers',
        'Crown Court Admin',
        'Court Administrators',
        'Court Associate'
      ].forEach((groupName) => {
        const state = appReducer(
          undefined,
          UsersGroupsActions.setUserPermissions({
            userGroups: [
              {
                groupId: '*',
                groupName: groupName
              }
            ] as UserGroup[]
          })
        );
        expect(getIsHmctsUser(state)).toEqual(true);
      });
    });

    it('should return false when the user does not belongs to a HMCTS group', () => {
      const state = appReducer(
        undefined,
        UsersGroupsActions.setUserPermissions({
          userGroups: [
            {
              groupId: '*',
              groupName: 'AnyOtherGroup'
            }
          ] as UserGroup[]
        })
      );
      expect(getIsHmctsUser(state)).toEqual(false);
    });

    it('should return true when the user belongs to a HMCTS and Prison Admin group', () => {
      [
        'Prison Admin',
        'Listing Officers',
        'Legal Advisers',
        'Court Clerks',
        'CTSC Admin',
        'Operational Delivery Admin'
      ].forEach((groupName) => {
        const state = appReducer(
          undefined,
          UsersGroupsActions.setUserPermissions({
            userGroups: [
              {
                groupId: '*',
                groupName: groupName
              }
            ] as UserGroup[]
          })
        );
        expect(getIsPrisonAdminOrHmctsUser(state)).toEqual(true);
      });
    });

    it('should return false when the user not belongs to HMCTS and Prison Admin group', () => {
      const state = appReducer(
        undefined,
        UsersGroupsActions.setUserPermissions({
          userGroups: [
            {
              groupId: '*',
              groupName: 'Crown Court Admin'
            }
          ] as UserGroup[]
        })
      );
      expect(getIsPrisonAdminOrHmctsUser(state)).toEqual(false);
    });
  });
});
