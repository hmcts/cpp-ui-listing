import { Component, OnChanges, OnInit, input } from '@angular/core';

import { Hearing, CourtroomsFilter } from '../../core';
import moment from 'moment';
import { NgPlural, NgPluralCase, DatePipe } from '@angular/common';
import { PdkTypographyDirective, PdkMarginDirective, PdkWarningTextComponent } from '@cpp/pdk';

interface Time {
  hours: number;
  minutes: number;
}
@Component({
  selector: 'total-listing-hours',
  styleUrls: ['./total-listing-hours.scss'],
  template: `
    <div class="total-listing-hours">
      @if (hearings().length) {
        <div>
          @if (totalTime.hours) {
            <span pdk-typography="heading-small" pdk-margin-right="1" pdk-margin-bottom="1"
              >{{ totalTime.hours }}
              <span [ngPlural]="totalTime.hours">
                <ng-template ngPluralCase="=1">hour</ng-template>
                <ng-template ngPluralCase="other">hours</ng-template>
              </span>
            </span>
          }
          @if (totalTime.hours && totalTime.minutes) {
            <span pdk-margin-right="1">and</span>
          }
          @if (totalTime.minutes) {
            <span pdk-typography="heading-small" pdk-margin-right="1" pdk-margin-bottom="1"
              >{{ totalTime.minutes }}
              <span [ngPlural]="totalTime.minutes">
                <ng-template ngPluralCase="=1">minute</ng-template>
                <ng-template ngPluralCase="other">minutes</ng-template>
              </span>
            </span>
          }
          <span pdk-margin-right="1">listed between</span>
          <span pdk-typography="heading-small" pdk-margin-right="1" pdk-margin-bottom="1">{{
            filterOptions().startTime || '00:00'
          }}</span>
          <span pdk-margin-right="1">to</span>
          <span pdk-typography="heading-small" pdk-margin-right="1" pdk-margin-bottom="1">{{
            filterOptions().endTime || '23:59'
          }}</span>
          <span pdk-margin-right="1">on</span>
          <span pdk-typography="heading-small" pdk-margin-right="1" pdk-margin-bottom="1">{{
            filterOptions().searchDate | date: 'dd MMM yyyy'
          }}</span>
        </div>
      }
      @if (!hearings().length) {
        <div>
          <pdk-warning-text>
            <div role="alert">
              No cases listed currently for the
              {{ filterOptions().searchDate | date: 'dd MMM yyyy' }}
            </div>
          </pdk-warning-text>
        </div>
      }
    </div>
  `,
  imports: [
    PdkTypographyDirective,
    PdkMarginDirective,
    NgPlural,
    NgPluralCase,
    PdkWarningTextComponent,
    DatePipe
  ]
})
export class TotalListingHoursComponent implements OnInit, OnChanges {
  readonly hearings = input<Hearing[]>(undefined);
  readonly filterOptions = input<CourtroomsFilter>(undefined);

  // TODO: This actually needs to be converted to hours/minutes for output
  totalTime: Time;

  constructor() {}

  ngOnInit() {
    this.totalTime = this.calculateListingTime();
  }

  ngOnChanges() {
    this.totalTime = this.calculateListingTime();
  }

  calculateListingTime(): Time {
    const initialMinutes = this.hearings()
      .map((hearing) =>
        hearing.hearingDays.filter((day) =>
          moment(day.startTime).isSame(this.filterOptions().searchDate, 'day')
        )
      )
      .map((hearingDays) => (hearingDays.length ? hearingDays[0].durationMinutes : 0))
      .reduce((total, value) => total + value, 0);

    return {
      hours: Math.floor(initialMinutes / 60),
      minutes: initialMinutes % 60
    };
  }
}
