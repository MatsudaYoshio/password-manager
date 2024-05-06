import { Fragment } from "react";
import "./App.css";
import Header from "./components/Layout/Header";
import DetailView from "./components/Layout/DetailView";
import Box from "@mui/material/Box";
import ItemTreeView from "./components/Layout/ItemTreeView";

// Windowサイズ変えるレイアウト
// https://www.npmjs.com/package/react-splitter-layout

export const App = () => {
  return (
    <Fragment>
      <Header />
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" sx={{ height: "100%" }}>
        <Box gridColumn="span 4">
          <ItemTreeView />
        </Box>
        <Box gridColumn="span 8">
          <DetailView />
        </Box>
      </Box>
    </Fragment>
  );
};
