import React, { createContext, useContext, useState, useEffect } from 'react';

const SeniorModeContext = createContext();

export const SeniorModeProvider = ({ children }) => {
  const [isSeniorMode, setIsSeniorMode] = useState(() => {
    return localStorage.getItem('zyven_senior_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('zyven_senior_mode', isSeniorMode);
    if (isSeniorMode) {
      document.documentElement.classList.add('senior-mode-active');
    } else {
      document.documentElement.classList.remove('senior-mode-active');
    }
  }, [isSeniorMode]);

  const toggleSeniorMode = () => {
    setIsSeniorMode((prev) => !prev);
  };

  return (
    <SeniorModeContext.Provider value={{ isSeniorMode, toggleSeniorMode }}>
      {children}
    </SeniorModeContext.Provider>
  );
};

export const useSeniorMode = () => useContext(SeniorModeContext);
export default SeniorModeContext;
