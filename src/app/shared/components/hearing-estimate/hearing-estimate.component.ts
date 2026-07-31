import { Component, OnInit, ChangeDetectionStrategy, input } from '@angular/core';
import { HearingEstimate } from '../../../core/model';
import { ConvertToWeekDaysHoursMinutesPipe } from '../../pipes/convert-to-week-days-hours-minutes.pipe';
import { NgPlural, NgPluralCase } from '@angular/common';

@Component({
  selector: 'hearing-estimate',
  template: `
    @if (hearingEstimate.weeks) {
      <div [ngPlural]="hearingEstimate.weeks">
        <ng-template ngPluralCase="=1">{{ hearingEstimate.weeks }} week</ng-template>
        <ng-template ngPluralCase="other">{{ hearingEstimate.weeks }} weeks</ng-template>
      </div>
    }
    @if (hearingEstimate.days) {
      <div [ngPlural]="hearingEstimate.days">
        <ng-template ngPluralCase="=1">{{ hearingEstimate.days }} day</ng-template>
        <ng-template ngPluralCase="other">{{ hearingEstimate.days }} days</ng-template>
      </div>
    }
    @if (hearingEstimate.hours) {
      <div [ngPlural]="hearingEstimate.hours">
        <ng-template ngPluralCase="=1">{{ hearingEstimate.hours }} hour</ng-template>
        <ng-template ngPluralCase="other">{{ hearingEstimate.hours }} hours</ng-template>
      </div>
    }
    @if (hearingEstimate.minutes) {
      <div [ngPlural]="hearingEstimate.minutes">
        <ng-template ngPluralCase="=1">{{ hearingEstimate.minutes }} minute</ng-template>
        <ng-template ngPluralCase="other">{{ hearingEstimate.minutes }} minutes</ng-template>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgPlural, NgPluralCase],
  providers: [ConvertToWeekDaysHoursMinutesPipe]
})
export class HearingEstimateComponent implements OnInit {
  readonly estimate = input.required<number>();
  hearingEstimate: HearingEstimate;

  constructor(private convertToWeeksDaysHoursMinutes: ConvertToWeekDaysHoursMinutesPipe) {}

  ngOnInit() {
    this.hearingEstimate = this.convertToWeeksDaysHoursMinutes.transform(this.estimate());
  }
}
