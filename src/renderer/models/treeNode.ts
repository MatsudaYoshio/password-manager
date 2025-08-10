import { uuidv7 } from 'uuidv7';

import TreeNodeData, { TreeNodeDataPlain } from './treeNodeData';

// TreeNodeのプレーンオブジェクト型
export interface TreeNodePlain {
  id: string;
  data: TreeNodeDataPlain;
  children?: TreeNodePlain[];
}

class TreeNode {
  public readonly id: string = uuidv7();
  public data: TreeNodeData;
  public children?: TreeNode[];

  constructor(data: TreeNodeData) {
    this.data = data;
  }
}

export default TreeNode;
