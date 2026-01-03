import { grey } from '@mui/material/colors';
import { Fragment } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import './App.css';
import DetailView from './components/Layout/DetailView';
import Header from './components/Layout/Header';
import ItemTreeView from './components/Layout/ItemTreeView';
import useEventListeners from './hooks/useEventListeners';

export const App = () => {
  useEventListeners();

  return (
    <Fragment>
      <Header />
      <PanelGroup direction='horizontal'>
        <Panel
          defaultSize={20}
          minSize={10}
          maxSize={30}
          style={{
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          <ItemTreeView />
        </Panel>
        <PanelResizeHandle style={{ width: '1px', backgroundColor: grey[300] }} />
        <Panel style={{ overflow: 'auto' }}>
          <DetailView />
        </Panel>
      </PanelGroup>
    </Fragment>
  );
};
