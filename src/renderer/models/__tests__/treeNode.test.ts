import TreeNode from '../treeNode';
import TreeNodeData from '../treeNodeData';

describe('TreeNode', () => {
  test('creates a TreeNode with valid data', () => {
    const data: TreeNodeData = {
      title: 'Test Node',
      credentials: []
    };

    const node = new TreeNode(data);

    expect(node.id).toBeDefined();
    expect(typeof node.id).toBe('string');
    expect(node.data).toEqual(data);
    expect(node.children).toBeUndefined();
  });

  test('generates unique IDs for different nodes', () => {
    const data: TreeNodeData = {
      title: 'Test Node',
      credentials: []
    };

    const node1 = new TreeNode(data);
    const node2 = new TreeNode(data);

    expect(node1.id).not.toBe(node2.id);
  });

  test('can have children', () => {
    const parentData: TreeNodeData = {
      title: 'Parent Node',
      credentials: []
    };

    const childData: TreeNodeData = {
      title: 'Child Node',
      credentials: []
    };

    const parentNode = new TreeNode(parentData);
    const childNode = new TreeNode(childData);

    parentNode.children = [childNode];

    expect(parentNode.children).toHaveLength(1);
    expect(parentNode.children[0]).toBe(childNode);
  });

  test('data can be updated', () => {
    const initialData: TreeNodeData = {
      title: 'Initial Title',
      credentials: []
    };

    const node = new TreeNode(initialData);

    const updatedData: TreeNodeData = {
      title: 'Updated Title',
      credentials: []
    };

    node.data = updatedData;

    expect(node.data.title).toBe('Updated Title');
  });
});
