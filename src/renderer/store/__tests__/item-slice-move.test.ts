import { configureStore } from '@reduxjs/toolkit';
import { DropPosition } from '../../models/dropPosition';
import TreeNode from '../../models/treeNode';
import { createItemSlice, ItemSliceState } from '../item-slice';

describe('item-slice moveItem', () => {
  let store: ReturnType<typeof configureStore>;
  let itemSlice: ReturnType<typeof createItemSlice>;

  beforeEach(() => {
    const testInitialState: ItemSliceState = {
      activeNode: null,
      itemCount: 1,
      itemData: {
        main: [],
        staging: []
      },
      expandedItemIds: []
    };

    itemSlice = createItemSlice(testInitialState);
    store = configureStore({
      reducer: { item: itemSlice.reducer }
    });
  });

  const setupTree = (inputItems: TreeNode[]) => {
    store.dispatch(itemSlice.actions.updateStagingData(inputItems));
  };

  type RootState = {
    item: ItemSliceState;
  };

  test('should move item after another item at root level', () => {
    const items = [
      new TreeNode({ title: 'A', credentials: [] }),
      new TreeNode({ title: 'B', credentials: [] }),
      new TreeNode({ title: 'C', credentials: [] })
    ];
    // Convert to plain objects (DeepClone happens in updateStagingData)
    const plainItems = JSON.parse(JSON.stringify(items));
    setupTree(plainItems);

    // Move A after B -> B, A, C
    store.dispatch(
      itemSlice.actions.moveItem({
        sourceId: items[0].id,
        targetId: items[1].id,
        position: DropPosition.AFTER
      })
    );

    const staging = (store.getState() as RootState).item.itemData.staging;
    expect(staging.map(n => n.data.title)).toEqual(['B', 'A', 'C']);
  });

  test('should move item inside another item', () => {
    const items = [
      new TreeNode({ title: 'Parent', credentials: [] }),
      new TreeNode({ title: 'Child', credentials: [] })
    ];
    const plainItems = JSON.parse(JSON.stringify(items));
    setupTree(plainItems);

    // Move Child inside Parent
    store.dispatch(
      itemSlice.actions.moveItem({
        sourceId: items[1].id,
        targetId: items[0].id,
        position: DropPosition.INSIDE
      })
    );

    const staging = (store.getState() as RootState).item.itemData.staging;
    expect(staging).toHaveLength(1);
    expect(staging[0].data.title).toBe('Parent');
    expect(staging[0].children).toHaveLength(1);
    expect(staging[0].children![0].data.title).toBe('Child');
  });

  test('should not move item if target is descendant of source', () => {
    const parent = new TreeNode({ title: 'Parent', credentials: [] });
    const child = new TreeNode({ title: 'Child', credentials: [] });
    parent.children = [child];

    const items = [parent];
    const plainItems = JSON.parse(JSON.stringify(items));
    setupTree(plainItems);

    // Try to move Parent inside Child (Previous impl might allow it, but we blocked it)
    store.dispatch(
      itemSlice.actions.moveItem({
        sourceId: parent.id, // Current source ID is regenerated in plainItems if not careful?
        // Wait, TreeNode constructor generates ID. JSON.parse keeps it.
        // But verify IDs match.
        targetId: child.id,
        position: DropPosition.INSIDE
      })
    );

    const staging = (store.getState() as RootState).item.itemData.staging;
    expect(staging).toHaveLength(1);
    expect(staging[0].id).toBe(parent.id); // Structure unchanged
  });

  test('should move item before another item', () => {
    const items = [
      new TreeNode({ title: 'A', credentials: [] }),
      new TreeNode({ title: 'B', credentials: [] })
    ];
    const plainItems = JSON.parse(JSON.stringify(items));
    setupTree(plainItems);

    // Move B before A -> B, A
    store.dispatch(
      itemSlice.actions.moveItem({
        sourceId: items[1].id,
        targetId: items[0].id,
        position: DropPosition.BEFORE
      })
    );
    const staging = (store.getState() as RootState).item.itemData.staging;
    expect(staging.map(n => n.data.title)).toEqual(['B', 'A']);
  });
});
