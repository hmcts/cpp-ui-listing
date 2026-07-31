import { Component, ViewChild, ElementRef, OnInit, input, output } from '@angular/core';
import {
  TreeComponent,
  TreeModel,
  TreeNode,
  TreeNodeDropSlot,
  TreeNodeWrapperComponent,
  TreeNodeChildrenComponent
} from '@ali-hm/angular-tree-component';
import { TreeOptions } from '@ali-hm/angular-tree-component/lib/models/tree-options.model';
import { Hearing } from '../../core';
import { options as defaultOptions } from './sequence-config';

import { SequenceItemComponent } from './sequence-item.component';

const CLASSES = {
  DRAGGING: 'dragging',
  PREV_NODE: 'previous-tree-node',
  NEXT_NODE: 'next-tree-node',
  ACTIVE_DROP_ZONES: 'active-drop-zones',
  HIDE_DROP_ZONES: 'hide-drop-zones',
  ROOT_NODE: 'dragging-root-item'
};

export interface UpdateSequenceEvent {
  name: string;
  hearings: Hearing[];
}

@Component({
  selector: 'sequence-group',
  styleUrls: ['./sequence-group.scss'],
  templateUrl: './sequence-group.html',
  imports: [
    TreeComponent,
    TreeNodeDropSlot,
    TreeNodeWrapperComponent,
    TreeNodeChildrenComponent,
    SequenceItemComponent
  ]
})
export class SequenceGroupComponent implements OnInit {
  readonly updated = output<UpdateSequenceEvent>();
  readonly name = input<string>(undefined);
  readonly hearings = input<Hearing[]>(undefined);
  readonly weekCommencingSelected = input<boolean>(undefined);
  @ViewChild('dragContainer') dragContainer: ElementRef;
  @ViewChild(TreeComponent) tree: TreeComponent;

  groupDragged: HTMLElement;
  editedHearings: Hearing[];
  options = <TreeOptions>{
    ...defaultOptions,
    actionMapping: {
      ...defaultOptions.actionMapping,
      mouse: {
        ...defaultOptions.actionMapping.mouse,
        dragStart: (tree: TreeModel, node: TreeNode, $event) => {
          this.dragStart($event);
        },
        dragEnd: (tree: TreeModel, node: TreeNode, $event) => {
          this.dragEnd();
        }
      }
    }
  };

  treeUpdated({ treeModel }: { treeModel: TreeModel }) {
    this.updated.emit({
      name: this.name(),
      hearings: treeModel.nodes
    });
    this.tree.treeModel.expandAll();
  }

  ngOnInit() {
    this.editedHearings = JSON.parse(JSON.stringify(this.hearings()));
  }

  dragStart($event) {
    this.groupDragged = $event.target.parentElement.parentElement.parentElement;
    this.groupDragged.classList.add(CLASSES.HIDE_DROP_ZONES);
    $event.dataTransfer.setDragImage(
      this.groupDragged,
      $event.offsetX,
      $event.offsetY,
      $event,
      this.dragContainer.nativeElement
    );
    setTimeout(() => {
      this.dragContainer.nativeElement.classList.add(CLASSES.ACTIVE_DROP_ZONES);
      this.groupDragged.classList.add(CLASSES.DRAGGING);
      if (this.groupDragged.parentElement.previousElementSibling) {
        this.groupDragged.parentElement.previousElementSibling.classList.add(CLASSES.PREV_NODE);
      }
      if (this.groupDragged.parentElement.nextElementSibling) {
        this.groupDragged.parentElement.nextElementSibling.classList.add(CLASSES.NEXT_NODE);
      }
    }, 0);
  }

  dragEnd() {
    setTimeout(() => {
      this.dragContainer.nativeElement.classList.remove(CLASSES.ACTIVE_DROP_ZONES);
      this.groupDragged.classList.remove(CLASSES.DRAGGING);
      this.groupDragged.classList.remove(CLASSES.HIDE_DROP_ZONES);
      const prev = this.dragContainer.nativeElement.querySelector(`.${CLASSES.PREV_NODE}`);
      const next = this.dragContainer.nativeElement.querySelector(`.${CLASSES.NEXT_NODE}`);
      if (prev) {
        prev.classList.remove(CLASSES.PREV_NODE);
      }
      if (next) {
        next.classList.remove(CLASSES.NEXT_NODE);
      }
    }, 0);
  }
}
