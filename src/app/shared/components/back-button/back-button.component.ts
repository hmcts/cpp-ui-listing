import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { PdkBackLinkComponent, PdkBackLinkDirective } from '@cpp/pdk';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'back-button',
  template: ` <a pdk-back-link [routerLink]="[linkUrl()]" (click)="onBack.emit()"> Back </a> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PdkBackLinkComponent, PdkBackLinkDirective, RouterLink]
})
export class BackButtonComponent {
  readonly linkUrl = input<string>(undefined);
  readonly onBack = output<void>();
}
