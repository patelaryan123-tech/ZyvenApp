import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, History, ChevronLeft, Loader2, Volume2, VolumeX } from 'lucide-react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useTextToSpeech from '../hooks/useTextToSpeech';
import { aiService } from '../services/aiService';

const VoiceCompanionPage = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([{ role: 'ai', content: 'Hello! I am your ZYVEN health companion. How can I help you today?' }]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const { transcript, isListening, startListening, stopListening, resetTranscript, supported: sttSupported } = useSpeechRecognition();
  const { speak, stop: stopSpeaking, supported: ttsSupported } = useTextToSpeech();
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await aiService.getConversations();
      // Backend: { success, data: [...conversations] }
      const convs = res?.data || [];
      setConversations(Array.isArray(convs) ? convs : []);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    stopListening();
    resetTranscript();
    setInputText('');
    
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsProcessing(true);

    try {
      const res = await aiService.chat(text, currentConvId);
      // Backend returns: { success, data: { conversationId, response } }
      const aiData = res?.data || res;
      const aiReply = aiData?.response || aiData?.message || 'Sorry, I could not generate a response.';
      const convId = aiData?.conversationId;
      setMessages([...newMessages, { role: 'ai', content: aiReply }]);
      if (convId && !currentConvId) {
        setCurrentConvId(convId);
        loadConversations();
      }
      if (!isMuted && ttsSupported) {
        speak(aiReply, language);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      stopListening();
      if (transcript) handleSendMessage(transcript);
    } else {
      stopSpeaking();
      startListening(language);
    }
  };

  const loadHistoryConversation = async (id) => {
    try {
      setIsProcessing(true);
      const res = await aiService.getConversationById(id);
      if (res.data) {
        setMessages(res.data.messages || []);
        setCurrentConvId(id);
        setShowHistory(false);
      }
    } catch (err) {
      console.error('Failed to load conversation', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-[#FDFBF7] w-full">
      {/* Mobile History Toggle & Desktop Sidebar */}
      <div className={`
        ${showHistory ? 'block' : 'hidden'} 
        md:block w-full md:w-80 bg-white border-r border-gray-200 flex-shrink-0 absolute md:relative z-20 h-full
      `}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#3D5A45] text-white md:bg-white md:text-gray-900">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <History className="w-5 h-5" /> History
          </h2>
          <button className="md:hidden" onClick={() => setShowHistory(false)}>
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)] p-4 space-y-3">
          {conversations.length > 0 ? conversations.map((conv) => (
            <button
              key={conv._id}
              onClick={() => loadHistoryConversation(conv._id)}
              className={`w-full text-left p-3 rounded-xl border transition-colors ${
                currentConvId === conv._id ? 'border-[#3D5A45] bg-[#3D5A45]/5' : 'border-gray-200 hover:border-[#3D5A45]/30'
              }`}
            >
              <p className="font-medium text-gray-900 truncate">{conv.title || 'Conversation'}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(conv.updatedAt).toLocaleDateString()}</p>
            </button>
          )) : (
            <p className="text-gray-500 text-sm text-center pt-8">No past conversations</p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Top Bar */}
        <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-lg bg-gray-100 text-gray-600" onClick={() => setShowHistory(true)}>
              <History className="w-5 h-5" />
            </button>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#3D5A45] focus:border-[#3D5A45] p-2 outline-none font-medium"
            >
              <option value="en-US">English</option>
              <option value="hi-IN">Hindi (हिन्दी)</option>
              <option value="mr-IN">Marathi (मराठी)</option>
              <option value="ta-IN">Tamil (தமிழ்)</option>
            </select>
          </div>
          <button 
            onClick={() => { setIsMuted(!isMuted); stopSpeaking(); }}
            className={`p-2 rounded-full ${isMuted ? 'bg-red-50 text-red-600' : 'bg-green-50 text-[#3D5A45]'}`}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-lg md:text-xl leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-[#3D5A45] text-white rounded-tr-sm' 
                  : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-tl-sm'}
              `}>
                {msg.content}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-[#3D5A45] animate-spin" />
                <span className="text-gray-600">Processing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
            
            {/* Big Mic Button */}
            <div className="relative flex justify-center items-center h-24 w-full">
              <AnimatePresence>
                {isListening && (
                  <>
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                      className="absolute w-20 h-20 bg-[#3D5A45] rounded-full"
                    />
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      className="absolute w-20 h-20 bg-[#3D5A45] rounded-full"
                    />
                  </>
                )}
              </AnimatePresence>
              
              <button
                onClick={toggleListen}
                disabled={!sttSupported}
                className={`
                  relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-lg transition-colors
                  ${isListening ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#3D5A45] hover:bg-[#2c4232] text-white'}
                  ${!sttSupported && 'opacity-50 cursor-not-allowed'}
                `}
              >
                {isListening ? <MicOff className="w-10 h-10 md:w-12 md:h-12" /> : <Mic className="w-10 h-10 md:w-12 md:h-12" />}
              </button>
            </div>
            
            <p className="text-center font-medium text-gray-500 text-lg">
              {!sttSupported ? 'Speech recognition not supported' : isListening ? 'Listening...' : 'Tap to speak'}
            </p>

            {/* Text Input Fallback */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }} 
              className="w-full flex gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Or type your message here..."
                className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3D5A45] focus:border-[#3D5A45] outline-none text-lg"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isProcessing}
                className="bg-[#E07A5F] hover:bg-[#d0674d] text-white p-4 rounded-xl disabled:opacity-50 transition-colors"
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceCompanionPage;
