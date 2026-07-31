import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BackButtonComponent } from './back-button.component';

describe('BackButtonComponent', () => {
  let fixture: ComponentFixture<BackButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });
    fixture = TestBed.createComponent(BackButtonComponent);
    fixture.componentRef.setInput('linkUrl', 'test-link-url');
    fixture.detectChanges();
  });

  it('should match the snapshot', () => {
    expect(fixture).toMatchSnapshot();
  });
});
