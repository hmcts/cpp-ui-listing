import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { VideoHearingComponent } from './video-hearing.component';

describe('VideoHearingComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let testHostComponent: TestHostComponent;
  let component: VideoHearingComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(VideoHearingComponent)).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display video hearing form for crown jurisdiction type if `hasVideoLink` is true', () => {
    testHostComponent.hasVideoLink = true;
    testHostComponent.publicListNote = 'test-public-list-note';
    testHostComponent.jurisdictionType = 'CROWN';
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should display video hearing form for crown jurisdiction type if `hasVideoLink` is false', () => {
    testHostComponent.hasVideoLink = false;
    testHostComponent.publicListNote = 'test-public-list-note';
    testHostComponent.jurisdictionType = 'CROWN';
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should not display video hearing form for magistrates jurisdiction type', () => {
    testHostComponent.hasVideoLink = true;
    testHostComponent.publicListNote = 'test-public-list-note';
    testHostComponent.jurisdictionType = 'MAGISTRATES';
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should toggle Public list note', () => {
    expect(component.hasVideoLink()).toBeFalsy();
    component.togglepublicListNote();
    expect(component.hasVideoLink()).toBeTruthy();
  });

  it('should set the jurisdiction type', () => {
    testHostComponent.jurisdictionType = 'test-jurisdiction-type';
    fixture.detectChanges();
    expect(component.jurisdictionType()).toBe('test-jurisdiction-type');
  });

  it('should set has video link', () => {
    testHostComponent.hasVideoLink = true;
    fixture.detectChanges();
    expect(component.hasVideoLink()).toBeTruthy();
  });

  it('should set Public list note', () => {
    testHostComponent.publicListNote = 'test-public-list-note';
    fixture.detectChanges();
    expect(component.publicListNote()).toBe('test-public-list-note');
  });

  @Component({
    template: `
      <video-hearing
        [hasVideoLink]="hasVideoLink"
        [jurisdictionType]="jurisdictionType"
        [publicListNote]="publicListNote"
      >
      </video-hearing>
    `,
    imports: [VideoHearingComponent]
  })
  class TestHostComponent {
    hasVideoLink: boolean;
    jurisdictionType: string;
    publicListNote: string;
  }
});
