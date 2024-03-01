import React, { useEffect, useRef } from 'react';
import { useAppState } from './AppStateContext';

import '../styles/ConsolePanel.css';

function ConsolePanel() {
  const { consoleOutput } = useAppState();
  const panelRef = useRef(null);

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight;
    }
  }, [consoleOutput]);

  return (
    <div className="console-panel" ref={panelRef}>
      <pre>{consoleOutput}</pre>
    </div>
  );
}
export default ConsolePanel;
