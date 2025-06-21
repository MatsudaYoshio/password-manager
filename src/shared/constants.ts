import { app } from "electron";
import path from "path";

export const ICON_PATH = path.join(app.getAppPath(), "src", "electron", "assets", "Aegis.ico");

export const STORE_KEY_TREE_VIEW_EXPANDED_ITEMS = "treeViewExpandedItems";
export const STORE_KEY_TREE_VIEW_SELECTED_ITEM_ID = "treeViewSelectedItemId";
