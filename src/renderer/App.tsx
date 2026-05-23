import { grey } from '@mui/material/colors';
import { Group, Panel, Separator } from 'react-resizable-panels';

import './App.css';
import DetailView from './components/Layout/DetailView';
import Header from './components/Layout/Header';
import ItemTreeView from './components/Layout/ItemTreeView';
import useEventListeners from './hooks/useEventListeners';

export const App = () => {
  useEventListeners();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <div style={{ flexGrow: 1, minHeight: 0 }}>
        <Group orientation='horizontal'>
          <Panel
            defaultSize='20%'
            minSize='10%'
            maxSize='30%'
            style={{
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            <ItemTreeView />
          </Panel>
          <Separator style={{ width: '1px', backgroundColor: grey[300] }} />
          <Panel style={{ overflow: 'auto' }}>
            <DetailView />
          </Panel>
        </Group>
      </div>
    </div>
  );
};
