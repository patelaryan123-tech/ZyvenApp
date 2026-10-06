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
    <div className="flex flex-col md:flex-row h-[calc(100vh-7.5rem)] md:h-[calc(100vh-4.5rem)] bg-[#FDFBF7] w-full relative overflow-hidden">
      {/* Mobile History Drawer Overlay Backdrop & Desktop Sidebar */}
      {showHistory && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setShowHistory(false)}
        />
      )}
      
      <div className={`
        ${showHistory ? 'fixed inset-y-0 left-0 w-4/5 max-w-xs z-50 shadow-2xl' : 'hidden'} 
        md:block md:relative md:w-80 md:z-auto bg-white border-r border-gray-200 flex-shrink-0 h-full
      `}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#3D5A45] text-white md:bg-white md:text-gray-900">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
            <History className="w-5 h-5" /> Conversation History
          </h2>
          <button className="md:hidden p-1 rounded-lg hover:bg-white/20" onClick={() => setShowHistory(false)}>
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)] p-3 md:p-4 space-y-2.5">
          {conversations.length > 0 ? conversations.map((conv) => (
            <button
              key={conv._id}
              onClick={() => loadHistoryConversation(conv._id)}
              className={`w-full text-left p-3 rounded-xl border transition-colors ${
                currentConvId === conv._id ? 'border-[#3D5A45] bg-[#3D5A45]/5 font-bold' : 'border-gray-200 hover:border-[#3D5A45]/30'
              }`}
            >
              <p className="font-semibold text-gray-900 text-sm truncate">{conv.title || 'Conversation'}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{new Date(conv.updatedAt).toLocaleDateString()}</p>
            </button>
          )) : (
            <p className="text-gray-400 text-xs text-center pt-8">No past conversations</p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Top Bar */}
        <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-b border-gray-200 bg-white flex justify-between items-center shadow-xs z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="md:hidden p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => setShowHistory(true)}>
              <History className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-800 text-xs sm:text-sm rounded-xl focus:ring-[#3D5A45] focus:border-[#3D5A45] p-2 outline-none font-bold"
            >
              <option value="en-US">English</option>
              <option value="hi-IN">Hindi (हिन्दी)</option>
              <option value="mr-IN">Marathi (मराठी)</option>
              <option value="ta-IN">Tamil (தமிழ்)</option>
            </select>
          </div>
          <button 
            onClick={() => { setIsMuted(!isMuted); stopSpeaking(); }}
            className={`p-2 rounded-full transition-all ${isMuted ? 'bg-red-50 text-red-600' : 'bg-green-50 text-[#3D5A45]'}`}
            title={isMuted ? 'Unmute voice' : 'Mute voice'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[90%] sm:max-w-[80%] md:max-w-[70%] p-3.5 sm:p-4 rounded-2xl text-base sm:text-lg leading-relaxed font-medium
                ${msg.role === 'user' 
                  ? 'bg-[#3D5A45] text-white rounded-tr-xs shadow-xs' 
                  : 'bg-white border border-gray-200/80 text-gray-800 shadow-xs rounded-tl-xs'}
              `}>
                {msg.content}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-3.5 sm:p-4 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
                <Loader2 className="w-4 h-4 text-[#3D5A45] animate-spin" />
                <span className="text-gray-600">Thinking & processing reply...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-white border-t border-gray-200 shadow-xs">
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-2.5 sm:gap-4">
            
            {/* Mic Button */}
            <div className="relative flex justify-center items-center h-16 sm:h-20 md:h-24 w-full">
              <AnimatePresence>
                {isListening && (
                  <>
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                      className="absolute w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#3D5A45] rounded-full"
                    />
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0.4, ease: "easeOut" }}
                      className="absolute w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#3D5A45] rounded-full"
                    />
                  </>
                )}
              </AnimatePresence>
              
              <button
                onClick={toggleListen}
                disabled={!sttSupported}
                className={`
                  relative z-10 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer
                  ${isListening ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#3D5A45] hover:bg-[#2c4232] text-white'}
                  ${!sttSupported && 'opacity-50 cursor-not-allowed'}
                `}
              >
                {isListening ? <MicOff className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" /> : <Mic className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />}
              </button>
            </div>
            
            <p className="text-center font-bold text-gray-500 text-xs sm:text-base">
              {!sttSupported ? 'Speech recognition not supported' : isListening ? 'Listening...' : 'Tap mic to speak'}
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
                placeholder="Type your message..."
                className="flex-1 p-2.5 sm:p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3D5A45] focus:border-[#3D5A45] outline-none text-sm sm:text-base font-medium"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isProcessing}
                className="bg-[#E07A5F] hover:bg-[#d0674d] text-white p-2.5 sm:p-3.5 rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceCompanionPage;
