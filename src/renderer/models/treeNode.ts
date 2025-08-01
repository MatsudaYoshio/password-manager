import { uuidv7 } from 'uuidv7';

import TreeNodeData from './treeNodeData';

class TreeNode {
  public readonly id: string = uuidv7();
  public data: TreeNodeData;
  public children?: TreeNode[];

  constructor(data: TreeNodeData) {
    this.data = data;
  }
}

export default TreeNode;
