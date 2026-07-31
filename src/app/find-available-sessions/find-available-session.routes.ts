import { Routes } from '@angular/router';
import { FindAvailableSessionsContainer } from './containers/find-available-sessions.container';
import { FindAvailableSessionsGuard } from './guards/find-available-sessions.guard';
import { SchedulingService } from '@cpp/scheduling';

export const routes: Routes = [
  {
    path: '',
    component: FindAvailableSessionsContainer,
    runGuardsAndResolvers: 'always',
    canActivate: [FindAvailableSessionsGuard],
    providers: [SchedulingService]
  }
];
