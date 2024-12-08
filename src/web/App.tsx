import { grey } from "@mui/material/colors";
import { Fragment } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import "./App.css";
import DetailView from "./components/Layout/DetailView";
import Header from "./components/Layout/Header";
import ItemTreeView from "./components/Layout/ItemTreeView";

export const App = () => {
  return (
    <Fragment>
      <Header />
      <PanelGroup direction="horizontal">
        <Panel defaultSize={20} minSize={10} maxSize={30}>
          <ItemTreeView />
        </Panel>
        <PanelResizeHandle style={{ width: "1px", backgroundColor: grey[300] }} />
        <Panel>
          <DetailView />
        </Panel>
      </PanelGroup>
    </Fragment>
  );
};
