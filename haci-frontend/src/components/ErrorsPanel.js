import React from 'react';
import { useAppState } from './AppStateContext';

import '../styles/ErrorsPanel.css';

function ErrorsPanel() {
  const { errors } = useAppState();

  return (
    <div className="errors-panel">
      {errors.map((error, index) => (
        <div key={index}>{error}</div>
      ))}
    </div>
  );
}


export default ErrorsPanel;
