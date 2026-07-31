import { RequiredPermission } from '@cpp/users-groups';
import { InjectionToken } from '@angular/core';

export interface ListingUserPermissions<T extends RequiredPermission = RequiredPermission> {
  downloadPrisonList: T;
  viewCpSearch: T;
  viewReorder: T;
  viewRestrictDetails: T;
  manageCourtcalendar: T;
  publicCourtList: T;
}

/**
 * An injection token to hold all expected permissions for this hearing context users. Use this token
 * by simply injecting it into a component where necessary.
 * Update this token with additional permissions as per requirement.
 */
export const EXPECTED_LISTING_USER_PERMISSIONS = new InjectionToken<ListingUserPermissions>(
  'User Permissions',
  {
    providedIn: 'root',
    factory: () => userPermissions
  }
);

export const userPermissions: ListingUserPermissions = {
  downloadPrisonList: {
    object: 'Download prison list',
    action: 'Home page link'
  },
  viewCpSearch: {
    object: 'CP Search',
    action: 'View'
  },
  viewReorder: {
    object: 'Reorder',
    action: 'View'
  },
  viewRestrictDetails: {
    object: 'Restrict Details',
    action: 'View'
  },
  manageCourtcalendar: {
    object: 'Court Calendar',
    action: 'Manage'
  },
  publicCourtList: {
    object: 'Court List',
    action: 'Publish'
  }
};
