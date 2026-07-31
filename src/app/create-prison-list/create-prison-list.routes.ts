import { UserGroupsGuard } from '@cpp/users-groups';
import { CreatePrisonListContainer } from './create-prison-list.container';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    canActivate: [UserGroupsGuard],
    component: CreatePrisonListContainer
  }
];
