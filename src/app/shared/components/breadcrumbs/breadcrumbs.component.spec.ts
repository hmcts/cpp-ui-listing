import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BreadcrumbsComponent } from './breadcrumbs.component';
import { Breadcrumb } from './../../../core/model/shared/breadcrumb';
import { provideRouter } from '@angular/router';

describe('BreadcrumbsComponent', () => {
  let fixture: ComponentFixture<BreadcrumbsComponent>;

  const mockBreadcrumbs: Breadcrumb[] = [
    { title: 'test-title-1', href: 'test-href-1' },
    { title: 'test-title-2' }
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
      teardown: { destroyAfterEach: false }
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadcrumbsComponent);
    fixture.componentRef.setInput('breadcrumbs', mockBreadcrumbs);
    fixture.detectChanges();
  });

  it('should match the snapshot', () => {
    expect(fixture).toMatchSnapshot();
  });
});
