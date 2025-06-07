import itemSlice, { itemActions } from "./item-slice";
import TreeNode from "../models/treeNode";
import TreeNodeData from "../models/treeNodeData";

// Helper to create TreeNode instances for tests
const createNode = (title: string, children: TreeNode[] = []): TreeNode => {
  const data: TreeNodeData = { title, credentials: [] };
  const node = new TreeNode(data);
  if (children.length > 0) {
    node.children = children;
  }
  return node;
};

// Helper to create a fresh initial state for each test
const getInitialState = (stagingNodes: TreeNode[], activeNodeId?: string) => {
  let activeNode: TreeNode | undefined = undefined;

  const findNodeRecursive = (nodes: TreeNode[], id: string): TreeNode | undefined => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const foundInChild = findNodeRecursive(node.children, id);
        if (foundInChild) return foundInChild;
      }
    }
    return undefined;
  };

  if (activeNodeId) {
    activeNode = findNodeRecursive(stagingNodes, activeNodeId);
  } else if (stagingNodes.length > 0 && !activeNodeId) { // Default to first node if no activeNodeId specified
    activeNode = stagingNodes[0];
  }

  // If activeNode is still undefined (e.g. activeNodeId not found, or stagingNodes is empty), set to {} as TreeNode
  if (!activeNode) {
    activeNode = {} as TreeNode;
  }

  // Deep clone nodes for main and staging to ensure test isolation
  const deepCloneNodes = (nodes: TreeNode[]): TreeNode[] => {
    return JSON.parse(JSON.stringify(nodes.map(node => ({...node}))));
  };

  const clonedStagingNodes = deepCloneNodes(stagingNodes);

  return {
    activeNode: activeNode,
    itemCount: stagingNodes.reduce((count, node) => {
        const countChildren = (n: TreeNode): number => {
            return 1 + (n.children ? n.children.reduce((c, child) => c + countChildren(child), 0) : 0);
        };
        return count + countChildren(node);
    }, 0) + 1,
    itemData: {
      main: deepCloneNodes(stagingNodes),
      staging: clonedStagingNodes,
    },
  };
};


describe("itemSlice Reducers - RemoveItemAndChildById", () => {
  // Test Scenario 1: Deleting a nested item
  it("should update activeNode to parent when deleting a nested item", () => {
    const childNode = createNode("Child 1");
    const parentNode = createNode("Parent 1", [childNode]);
    const otherNode = createNode("Other Node");

    const initialState = getInitialState([parentNode, otherNode], parentNode.id); // Active node can be parent initially

    const action = itemActions.RemoveItemAndChildById(childNode.id);
    const nextState = itemSlice.reducer(initialState, action);

    expect(nextState.activeNode.id).toBe(parentNode.id);
    const updatedParentNode = nextState.itemData.staging.find(node => node.id === parentNode.id);
    expect(updatedParentNode?.children?.find(child => child.id === childNode.id)).toBeUndefined();
    expect(updatedParentNode?.children?.length).toBe(0);
  });

  // Test Scenario 2: Deleting a top-level item (when other top-level items exist)
  it("should update activeNode to the new first item when deleting a top-level item", () => {
    const itemToDelete = createNode("Item 1");
    const itemToBecomeActive = createNode("Item 2");
    const item3 = createNode("Item 3");

    const initialState = getInitialState([itemToDelete, itemToBecomeActive, item3], itemToDelete.id);

    const action = itemActions.RemoveItemAndChildById(itemToDelete.id);
    const nextState = itemSlice.reducer(initialState, action);

    expect(nextState.activeNode.id).toBe(itemToBecomeActive.id);
    expect(nextState.itemData.staging.find(node => node.id === itemToDelete.id)).toBeUndefined();
    expect(nextState.itemData.staging.length).toBe(2);
    expect(nextState.itemData.staging[0].id).toBe(itemToBecomeActive.id);
  });

  // Test Scenario 3: Deleting a top-level item (when it's the only item)
  it("should update activeNode to empty TreeNode when deleting the only top-level item", () => {
    const itemToDelete = createNode("Item 1");
    const initialState = getInitialState([itemToDelete], itemToDelete.id);

    const action = itemActions.RemoveItemAndChildById(itemToDelete.id);
    const nextState = itemSlice.reducer(initialState, action);

    expect(nextState.activeNode).toEqual({} as TreeNode); // Or check for specific properties if {} is not the exact shape
    expect(Object.keys(nextState.activeNode).length).toBe(0); // A more robust check for an "empty" TreeNode
    expect(nextState.itemData.staging.length).toBe(0);
  });

  // Test Scenario 4: Deleting an item that is currently the activeNode
  it("should update activeNode to its parent when deleting the active nested item", () => {
    const childActiveNode = createNode("Active Child");
    const parentOfActive = createNode("Parent of Active", [childActiveNode]);
    const otherTopNode = createNode("Other Top");

    const initialState = getInitialState([parentOfActive, otherTopNode], childActiveNode.id);

    expect(initialState.activeNode.id).toBe(childActiveNode.id); // Verify initial active node

    const action = itemActions.RemoveItemAndChildById(childActiveNode.id);
    const nextState = itemSlice.reducer(initialState, action);

    expect(nextState.activeNode.id).toBe(parentOfActive.id);
    const updatedParent = nextState.itemData.staging.find(node => node.id === parentOfActive.id);
    expect(updatedParent?.children?.find(child => child.id === childActiveNode.id)).toBeUndefined();
  });

  it("should update activeNode to the new first item when deleting an active top-level item that is not the first", () => {
    const firstItem = createNode("First Item");
    const itemToDeleteActive = createNode("Active Item To Delete");
    const nextItem = createNode("Next Item");

    const initialState = getInitialState([firstItem, itemToDeleteActive, nextItem], itemToDeleteActive.id);

    expect(initialState.activeNode.id).toBe(itemToDeleteActive.id); // Verify initial active node

    const action = itemActions.RemoveItemAndChildById(itemToDeleteActive.id);
    const nextState = itemSlice.reducer(initialState, action);

    expect(nextState.activeNode.id).toBe(firstItem.id);
    expect(nextState.itemData.staging.find(node => node.id === itemToDeleteActive.id)).toBeUndefined();
    expect(nextState.itemData.staging.length).toBe(2);
    expect(nextState.itemData.staging[0].id).toBe(firstItem.id);
    expect(nextState.itemData.staging[1].id).toBe(nextItem.id);
  });

   it("should update activeNode to the new first item (second original) when deleting an active top-level item that IS the first", () => {
    const itemToDeleteActive = createNode("Active Item To Delete (First)");
    const nextItem = createNode("Next Item (Becomes First)");
    const anotherItem = createNode("Another Item");

    const initialState = getInitialState([itemToDeleteActive, nextItem, anotherItem], itemToDeleteActive.id);

    expect(initialState.activeNode.id).toBe(itemToDeleteActive.id); // Verify initial active node

    const action = itemActions.RemoveItemAndChildById(itemToDeleteActive.id);
    const nextState = itemSlice.reducer(initialState, action);

    expect(nextState.activeNode.id).toBe(nextItem.id);
    expect(nextState.itemData.staging.find(node => node.id === itemToDeleteActive.id)).toBeUndefined();
    expect(nextState.itemData.staging.length).toBe(2);
    expect(nextState.itemData.staging[0].id).toBe(nextItem.id);
    expect(nextState.itemData.staging[1].id).toBe(anotherItem.id);
  });
});
