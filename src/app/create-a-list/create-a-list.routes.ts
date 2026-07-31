import { UserGroupsGuard } from '@cpp/users-groups';
import { CreateAListContainer } from './create-a-list.container';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    canActivate: [UserGroupsGuard],
    component: CreateAListContainer
  }
];
