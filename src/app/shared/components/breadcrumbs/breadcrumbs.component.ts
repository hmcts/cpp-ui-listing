import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { Breadcrumb } from './../../../core/model/shared/breadcrumb';

import {
  PdkBreadcrumbListComponent,
  PdkBreadcrumbListItemDirective,
  PdkBreadcrumbDirective
} from '@cpp/pdk';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'breadcrumbs',
  template: `
    @if (breadcrumbs().length) {
      <ol pdk-breadcrumb-list>
        @for (crumb of breadcrumbs(); track crumb.title; let last = $last) {
          <li pdk-breadcrumb-list-item>
            @if (!last && crumb.routerLink) {
              <a [title]="crumb.title" [routerLink]="crumb.routerLink" pdk-breadcrumb>
                {{ crumb.title }}
              </a>
            }
            @if (!last && crumb.href) {
              <a [title]="crumb.title" [href]="crumb.href" pdk-breadcrumb>
                {{ crumb.title }}
              </a>
            }
            @if (last) {
              <span>{{ crumb.title }}</span>
            }
          </li>
        }
      </ol>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PdkBreadcrumbListComponent,
    PdkBreadcrumbListItemDirective,
    PdkBreadcrumbDirective,
    RouterLink
  ]
})
export class BreadcrumbsComponent {
  readonly breadcrumbs = input<Breadcrumb[]>(undefined);
}
