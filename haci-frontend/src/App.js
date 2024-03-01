import React, { useState, useEffect } from 'react';
import { AppStateProvider, useAppState } from './components/AppStateContext';
import CodeEditor from './components/CodeEditor';
import ErrorsPanel from './components/ErrorsPanel';
import ConsolePanel from './components/ConsolePanel';

import './App.css';

function App() {

  const [focusedPanel, setFocusedPanel] = useState('code'); // State to track the focused panel

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 'i':
            setFocusedPanel('errors');
            break;
          case 'j':
            setFocusedPanel('code');
            break;
          case 'k':
            setFocusedPanel('console');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Helper function to apply focused class
  const getPanelClass = (panelName) => {
    return focusedPanel === panelName ? 'focused-panel' : '';
  };

  return (
    <AppStateProvider>
      <div className="toolbar">
        <RunCodeButton /> {/* This button is now part of the toolbar */}
      </div>
      <div className="app-container">
        <div className={`panel ${getPanelClass('code')}`}>
          <CodeEditor />
        </div>
        <CodeEditor />
        <div className="side-panels">
        <div className={`panel ${getPanelClass('errors')}`}>
          <ErrorsPanel />
        </div>
        <div className={`panel ${getPanelClass('console')}`}>
          <ConsolePanel />
        </div>
        </div>
      </div>
    </AppStateProvider>
  );
}


// Separate component for the button to use the useAppState hook correctly
function RunCodeButton() {

  const { code, setConsoleOutput, setErrors } = useAppState();

  // In RunCodeButton component
  function executeCode() {
    let consoleOutput = `Run at: ${new Date().toLocaleTimeString()}\n`;

    // Clear errors at the start of each execution attempt
    setErrors([]);

    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const message = ">> " + args.join(' ') + '\n';
      consoleOutput += message;
      originalConsoleLog(...args);
    };

    try {
      const execute = new Function('console', code);
      execute({ log: console.log });
      // If execution is successful, errors state is already cleared
    } catch (error) {
      const lineMatch = error.stack.match(/<anonymous>:(\d+):\d+/);
      const lineNumber = lineMatch ? lineMatch[1] : "unknown";
      // Update the errors state with the new error
      setErrors([`Line ${lineNumber - 2}: ${error.message}`]);
      consoleOutput += `Line ${lineNumber - 2}: ${error.message}\n`;
    }

    setConsoleOutput(consoleOutput);
    console.log = originalConsoleLog;
  }

  




  return <button onClick={executeCode}>Run Code</button>;
}


export default App;

/**
function testFunction() {
  console.log('Hello, World!');
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += i;
  }
  console.log('Sum:', sum);

  // Drop and jump to markers
  // Ctrl + , to drop marker 1
  // Option + , to jump to marker 1
  // Ctrl + . to drop marker 2
  // Option + . to jump to marker 2
}

testFunction();
 */
