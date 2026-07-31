import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CppHttpConfig } from '@cpp/core';
import { tap } from 'rxjs/operators';
import { AppConfig } from './interfaces';

// AppConfigService can be used as the provider for all configuration
// dependencies required by submodules, so long as it implements their
// interfaces

@Injectable({ providedIn: 'root' })
export class AppConfigService implements CppHttpConfig {
  accountUrl: string;
  appUrl: string;
  notificationEmailTemplateId: string;
  notificationEmailTemplateIdRecorder: string;
  baseUrl: string;
  cppHomeUrl?: string;
  logoutUrl: string;
  servicesUrl: string;

  constructor(private http: HttpClient) {}

  load() {
    return new Promise((resolve, reject) => {
      this.http
        .get('./app.override.config.json')
        .pipe(
          tap((config: AppConfig) => {
            this.appUrl = config.appUrl;
            this.accountUrl = config.idamProfilePage;
            this.baseUrl = config.apiRoot;
            this.cppHomeUrl = config.cppHomeUrl;
            this.logoutUrl = config.idamLogoutPage;
            this.servicesUrl = config.idamServicesPage;
            this.notificationEmailTemplateId = config.notificationEmailTemplateId;
            this.notificationEmailTemplateIdRecorder = config.notificationEmailTemplateIdRecorder;
          })
        )
        .subscribe(resolve, reject);
    });
  }

  getAccountUrl(): string {
    return this.accountUrl;
  }

  getBaseUrl(): string {
    return this.appUrl;
  }

  getLogoutUrl(): string {
    return this.logoutUrl;
  }

  getServicesUrl(): string {
    return this.servicesUrl;
  }

  getNotificationEmailTemplateId(): string {
    return this.notificationEmailTemplateId;
  }

  getNotificationEmailTemplateIdRecorder(): string {
    return this.notificationEmailTemplateIdRecorder;
  }
}
