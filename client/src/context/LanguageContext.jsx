import React, { createContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('zyven_language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('zyven_language', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (let k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // fallback to english
        let fallbackValue = translations['en'];
        for (let fk of keys) {
          if (fallbackValue && fallbackValue[fk]) {
            fallbackValue = fallbackValue[fk];
          } else {
            return key; // return key if not found
          }
        }
        return fallbackValue;
      }
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
