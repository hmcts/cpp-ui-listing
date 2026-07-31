import { UserGroup, getUserDetails, getUserGroups } from '@cpp/users-groups';
import { createSelector } from '@ngrx/store';

export const getUserHasCpsAccessOnly = createSelector(getUserGroups, (userGroups) => {
  const cpsUser = (userGroups || []).find((userGroup) => userGroup.groupName === 'CPS');

  if (cpsUser) {
    return !(userGroups || []).some((userGroup) =>
      ['Crown Court Admin', 'Court Clerks', 'Legal Advisers', 'Listing Officers'].includes(
        userGroup.groupName
      )
    );
  }
  return false;
});

export const getUserId = createSelector(getUserDetails, (user) => user.userId);

export const getIsHmctsUser = createSelector(getUserGroups, (userGroups: UserGroup[]) => {
  return (userGroups || []).some((userGroup) =>
    [
      'Listing Officers',
      'Court Clerks',
      'Legal Advisers',
      'Crown Court Admin',
      'Court Administrators',
      'Court Associate'
    ].includes(userGroup.groupName)
  );
});

export const getIsPrisonAdminOrHmctsUser = createSelector(
  getUserGroups,
  (userGroups: UserGroup[]) => {
    return (userGroups || []).some((userGroup) =>
      [
        'Prison Admin',
        'Listing Officers',
        'Legal Advisers',
        'Court Clerks',
        'CTSC Admin',
        'Operational Delivery Admin'
      ].includes(userGroup.groupName)
    );
  }
);
