import React, { createContext, useContext, useState } from 'react';

const AppStateContext = createContext();

export function useAppState() {
  return useContext(AppStateContext);
}

export const AppStateProvider = ({ children }) => {
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState([]);
  const [consoleOutput, setConsoleOutput] = useState('');

  const appendConsoleOutput = (newOutput) => {
    setConsoleOutput((prevOutput) => prevOutput + '\n' + newOutput);
  };

  return (
    <AppStateContext.Provider value={{ code, setCode, errors, setErrors, consoleOutput, setConsoleOutput: appendConsoleOutput }}>
      {children}
    </AppStateContext.Provider>
  );
};
