import { TreeModel } from '@ali-hm/angular-tree-component';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  validHearingMock1,
  validHearingMock2,
  validHearingMock3
} from '../../../mock-data/test-fixtures';
import { SequenceGroupComponent } from './sequence-group.component';

describe('Sequence Group', () => {
  let fixture: ComponentFixture<TestSequenceGroupComponent>;
  let component: SequenceGroupComponent;
  let setDragImage: jest.Mock;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestSequenceGroupComponent);
    const inner: DebugElement = fixture.debugElement.query(By.css('sequence-group'));
    component = inner.componentInstance;
    fixture.detectChanges();
  });

  it('should render correctly', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should call the event with a new order', () => {
    const newOrder = [validHearingMock3, validHearingMock2, validHearingMock1];
    component.treeUpdated({ treeModel: { nodes: newOrder } as TreeModel });
    expect(fixture.componentInstance.updated).toHaveBeenCalledWith({
      name: 'test-group',
      hearings: newOrder
    });
  });

  describe('When drag Start', () => {
    beforeEach(fakeAsync(() => {
      const target = fixture.debugElement.query(By.css('.node-content-wrapper')).nativeElement;
      setDragImage = jest.fn();
      component.dragStart({
        target,
        dataTransfer: {
          setDragImage
        }
      });
      tick();
      fixture.detectChanges();
    }));

    it('drag Start', () => {
      expect(setDragImage).toHaveBeenCalled();
      expect(fixture).toMatchSnapshot();
    });

    it('drag End', fakeAsync(() => {
      component.dragEnd();
      tick();
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    }));
  });

  @Component({
    selector: 'test-sequence-group',
    template: `<sequence-group (updated)="updated($event)" [hearings]="hearings" name="test-group">
    </sequence-group>`,
    imports: [SequenceGroupComponent]
  })
  class TestSequenceGroupComponent {
    hearings = [validHearingMock1, validHearingMock2, validHearingMock3];
    updated = jest.fn();
  }
});
