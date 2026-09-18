import { useState, useEffect, useCallback } from 'react';

const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSupported(true);
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        
        rec.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };
        
        rec.onerror = (event) => {
          setError(event.error);
          setIsListening(false);
        };
        
        rec.onend = () => {
          setIsListening(false);
        };
        
        setRecognition(rec);
      }
    }
  }, []);

  const startListening = useCallback((lang = 'en-US') => {
    if (recognition) {
      recognition.lang = lang;
      try {
        recognition.start();
        setIsListening(true);
        setError(null);
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return { transcript, isListening, startListening, stopListening, resetTranscript, supported, error };
};

export default useSpeechRecognition;
