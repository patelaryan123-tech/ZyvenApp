import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import LanguageContext from '../context/LanguageContext';

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
];

const WelcomePage = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();

  const handleLanguageSelect = (code) => {
    setLanguage(code);
    navigate('/login');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100"
    >
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome to ZYVEN</h1>
        <p className="text-sm text-gray-600">Select your preferred language</p>
      </div>

      <div className="w-full space-y-3">
        {languages.map((lang) => (
          <motion.button
            key={lang.code}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleLanguageSelect(lang.code)}
            className={`w-full p-4 rounded-xl flex items-center justify-between border-2 transition-all cursor-pointer ${
              language === lang.code 
                ? 'border-[#3D5A45] bg-[#3D5A45] text-white shadow-xs' 
                : 'border-gray-200 text-gray-700 hover:border-[#3D5A45] hover:text-[#3D5A45] bg-gray-50/50 hover:bg-white'
            }`}
          >
            <div className="flex flex-col items-start">
              <span className="text-lg font-semibold">{lang.native}</span>
              {lang.code !== 'en' && <span className="text-xs opacity-75">{lang.name}</span>}
            </div>
            <Volume2 className={`w-5 h-5 ${language === lang.code ? 'text-white' : 'text-gray-400'}`} />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default WelcomePage;
