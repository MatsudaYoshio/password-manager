import { ComponentProps, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Panel } from 'react-resizable-panels';

const DEFAULT_SIZE = 20;

const LeftPanel = ({ children }: { children: ReactNode }) => {
  const [initialSize, setInitialSize] = useState<number | null>(null);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchSize = async () => {
      const size = await window.api.getLeftPanelSize();
      setInitialSize(size ?? DEFAULT_SIZE);
    };
    fetchSize();

    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  const handleResize = useCallback<NonNullable<ComponentProps<typeof Panel>['onResize']>>(size => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      window.api.saveLeftPanelSize(size.asPercentage).catch(console.error);
    }, 500);
  }, []);

  if (initialSize === null) {
    return null;
  }

  return (
    <Panel
      defaultSize={`${initialSize}%`}
      minSize='10%'
      maxSize='30%'
      onResize={handleResize}
      style={{
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      {children}
    </Panel>
  );
};

export default LeftPanel;
