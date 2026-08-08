import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, X, Send, Mic, MicOff, Volume2, VolumeX,
  Sparkles, Bot, User, Globe, AlertCircle, RefreshCw, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const PROMPT_SUGGESTIONS = {
  English: [
    "What is the recommended NPK fertilizer schedule for Wheat?",
    "How to manage pest attacks in Soybean crop?",
    "What are current onion market price trends in Nashik?",
    "How does the 2FA buyer-seller escrow payment work?"
  ],
  Hindi: [
    "गेहूं की फसल में यूरिया और डीएपी डालने का सही समय क्या है?",
    "सोयाबीन में कीट नियंत्रण के लिए कौन सी कीटनाशक दवा अच्छी है?",
    "नासिक और इंदौर मंडी में प्याज के भाव क्या चल रहे हैं?",
    "किसान और व्यापारी के बीच 2FA पेमेंट एस्क्रो कैसे काम करता है?"
  ],
  Marathi: [
    "गहू पिकासाठी खत व्यवस्थापन आणि ठिबक सिंचन कसे करावे?",
    "सोयाबीनवरील खोडमाशी नियंत्रणासाठी कोणते औषध वापरावे?",
    "नाशिक बाजार समितीमध्ये कांद्याचे चालू बाजारभाव काय आहेत?",
    "शेतकरी व खरेदीदार यांच्यातील सुरक्षित पेमेंट कसे होते?"
  ]
};

export default function ChatbotWidget() {
  const { user, role, API_BASE } = useAuth();
  const { language: appLang } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Namaste! I am AgriPulse AI — your dedicated agricultural assistant. Ask me anything about crop cultivation, mandi prices, soil health, weather, or escrow payments.",
      is_agri_related: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Sync initial language with app context
  useEffect(() => {
    if (appLang === 'hi') setSelectedLang('Hindi');
    else if (appLang === 'mr') setSelectedLang('Marathi');
    else setSelectedLang('English');
  }, [appLang]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Initialize Speech Recognition (STT)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (selectedLang === 'Hindi') recognitionRef.current.lang = 'hi-IN';
      else if (selectedLang === 'Marathi') recognitionRef.current.lang = 'mr-IN';
      else recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Text to Speech (TTS)
  const speakResponse = (text) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    if (selectedLang === 'Hindi') utterance.lang = 'hi-IN';
    else if (selectedLang === 'Marathi') utterance.lang = 'mr-IN';
    else utterance.lang = 'en-IN';

    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const msg = (textToSend || inputValue).trim();
    if (!msg || isLoading) return;

    const userMsg = {
      role: 'user',
      content: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          language: selectedLang,
          role: role || 'farmer',
          session_id: sessionId
        })
      });

      const data = await res.json();
      const assistantMsg = {
        role: 'assistant',
        content: data.reply || "I apologize, could not process your query right now.",
        is_agri_related: data.is_agri_related,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
      speakResponse(assistantMsg.content);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Connection error with agricultural assistant. Please try again.",
          is_agri_related: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = PROMPT_SUGGESTIONS[selectedLang] || PROMPT_SUGGESTIONS.English;

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
            color: '#FFFFFF',
            border: 'none',
            boxShadow: '0 8px 24px rgba(217, 119, 6, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9000,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Open AgriPulse AI Agricultural Copilot"
        >
          <Sparkles size={28} />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '380px',
          maxWidth: 'calc(100vw - 30px)',
          height: '580px',
          maxHeight: 'calc(100vh - 40px)',
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          border: '1px solid #FCD34D',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          overflow: 'hidden'
        }}>
          {/* Chat Header */}
          <div style={{
            background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
            color: '#FFFFFF',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, lineHeight: 1.2 }}>AgriPulse AI</h3>
                <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>Agriculture & Mandi Advisor</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Language Selector */}
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  padding: '4px 6px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="English" style={{ color: '#000' }}>English</option>
                <option value="Hindi" style={{ color: '#000' }}>हिंदी</option>
                <option value="Marathi" style={{ color: '#000' }}>मराठी</option>
              </select>

              {/* TTS Toggle */}
              <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                title={ttsEnabled ? "Disable Voice Output" : "Enable Voice Output"}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} opacity={0.6} />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Domain Restriction Notice */}
          <div style={{
            background: '#FEF3C7',
            padding: '6px 12px',
            fontSize: '0.72rem',
            color: '#92400E',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderBottom: '1px solid #FDE68A'
          }}>
            <Sparkles size={12} color="#D97706" />
            <span>Exclusively trained on agricultural advisory & mandi trade</span>
          </div>

          {/* Message Stream */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: '#F8FAFC'
          }}>
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: isUser ? '#D97706' : '#FFFFFF',
                    color: isUser ? '#FFFFFF' : '#0F172A',
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    border: isUser ? 'none' : (msg.is_agri_related === false ? '1px solid #FECACA' : '1px solid #E2E8F0')
                  }}>
                    {msg.is_agri_related === false && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DC2626', fontSize: '0.72rem', fontWeight: '700', marginBottom: '4px' }}>
                        <AlertCircle size={12} /> Domain Guardrail: Non-Agri Query
                      </div>
                    )}
                    <div style={{ whiteSpace: 'pre-line' }}>{msg.content}</div>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px', padding: '0 4px' }}>
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', color: '#64748B', fontSize: '0.8rem' }}>
                <RefreshCw size={14} className="animate-spin" /> AgriPulse AI is consulting agronomy database...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div style={{
            padding: '6px 10px',
            background: '#FFFFFF',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            {suggestions.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                style={{
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  color: '#92400E',
                  borderRadius: '999px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {prompt.length > 28 ? prompt.slice(0, 28) + '...' : prompt}
              </button>
            ))}
          </div>

          {/* Input & Voice Controls */}
          <div style={{
            padding: '10px',
            background: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {/* Mic STT Button */}
            <button
              onClick={toggleListening}
              title={isListening ? "Listening... Click to stop" : "Speak voice query"}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: isListening ? '#DC2626' : '#FEF3C7',
                color: isListening ? '#FFFFFF' : '#D97706',
                border: isListening ? '2px solid #EF4444' : '1px solid #FDE68A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                animation: isListening ? 'pulse 1.5s infinite' : 'none'
              }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isListening ? "Listening to your voice..." : `Ask in ${selectedLang}...`}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: '#D97706',
                color: '#FFFFFF',
                border: 'none',
                cursor: (!inputValue.trim() || isLoading) ? 'not-allowed' : 'pointer',
                opacity: (!inputValue.trim() || isLoading) ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
