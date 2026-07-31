import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment';

import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { bootstrapAppConfig } from './bootstrap-app.config';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, bootstrapAppConfig);
