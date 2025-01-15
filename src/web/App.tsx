import { grey } from "@mui/material/colors";
import { Fragment, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import "./App.css";
import DetailView from "./components/Layout/DetailView";
import Header from "./components/Layout/Header";
import ItemTreeView from "./components/Layout/ItemTreeView";
import useAddNewSubItem from "./hooks/useAddNewSubItem";
import useAddNewTopItem from "./hooks/useAddNewTopItem";
import useRemoveSubtree from "./hooks/useRemoveSubtree";
import useSaveItems from "./hooks/useSaveItems";

export const App = () => {
  const saveHandler = useSaveItems();
  const addTopItemHandler = useAddNewTopItem();
  const addSubItemHandler = useAddNewSubItem();
  const removeSubtreeHandler = useRemoveSubtree();

  useEffect(() => {
    const handler = () => saveHandler();
    (window as any).api.onSaveData(handler);
    return () => (window as any).api.offSaveData(handler);
  }, [saveHandler]);

  useEffect(() => {
    const handler = () => addTopItemHandler();
    (window as any).api.onAddTopItem(handler);
    return () => (window as any).api.offAddTopItem(handler);
  }, [addTopItemHandler]);

  useEffect(() => {
    const handler = () => addSubItemHandler();
    (window as any).api.onAddSubItem(handler);
    return () => (window as any).api.offAddSubItem(handler);
  }, [addSubItemHandler]);

  useEffect(() => {
    const handler = () => removeSubtreeHandler();
    (window as any).api.onRemoveSubtree(handler);
    return () => (window as any).api.offRemoveSubtree(handler);
  }, [removeSubtreeHandler]);

  return (
    <Fragment>
      <Header />
      <PanelGroup direction="horizontal">
        <Panel
          defaultSize={20}
          minSize={10}
          maxSize={30}
          style={{
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <ItemTreeView />
        </Panel>
        <PanelResizeHandle style={{ width: "1px", backgroundColor: grey[300] }} />
        <Panel style={{ overflow: "auto" }}>
          <DetailView />
        </Panel>
      </PanelGroup>
    </Fragment>
  );
};
