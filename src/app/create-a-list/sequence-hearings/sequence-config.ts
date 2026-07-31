import { IActionMapping, KEYS, TREE_ACTIONS, TreeNode } from '@ali-hm/angular-tree-component';
import { TreeOptions } from '@ali-hm/angular-tree-component/lib/models/tree-options.model';

const actionMapping: IActionMapping = {
  mouse: {
    click: null,
    dblClick: null,
    contextMenu: null,
    expanderClick: null,
    checkboxClick: null,
    drop: TREE_ACTIONS.MOVE_NODE
  },
  keys: {
    [KEYS.RIGHT]: TREE_ACTIONS.DRILL_DOWN,
    [KEYS.LEFT]: TREE_ACTIONS.DRILL_UP,
    [KEYS.DOWN]: TREE_ACTIONS.NEXT_NODE,
    [KEYS.UP]: TREE_ACTIONS.PREVIOUS_NODE,
    [KEYS.SPACE]: TREE_ACTIONS.TOGGLE_ACTIVE,
    [KEYS.ENTER]: TREE_ACTIONS.TOGGLE_ACTIVE
  }
};

export const options = <TreeOptions>{
  actionMapping: actionMapping,
  childrenField: 'items',
  isExpandedField: 'id', // a property that always exists to ensure all items are always expanded.
  allowDrag: (node: TreeNode) => true,
  allowDrop: (element, to) => {
    return !(element.index === to.index || element.index === to.index - 1);
  }
};
