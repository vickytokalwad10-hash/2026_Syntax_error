import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function VoiceCopilotPage() {
  const { user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState('auto'); // 'auto' by default
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [detectedLangInfo, setDetectedLangInfo] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'copilot',
      text: 'नमस्ते! मैं एग्रीपल्स किसान मित्र (AgriPulse Copilot) हूँ। आप मुझसे किसी भी भाषा में (हिन्दी, मराठी, ਪੰਜਾਬੀ, ગુજરાતી, తెలుగు, தமிழ், ಕನ್ನಡ, বাংলা, English) खेती, खाद, कीट नियंत्रण, मौसम, या मंडी भाव के बारे में पूछ सकते हैं।',
      langName: 'हिन्दी (Hindi)',
      langCode: 'hi',
      isAgri: true,
      category: 'Farming Welcoming Advisory',
      followups: [
        'गेहूं की फसल में कौन सी खाद डालनी चाहिए?',
        'कापूस पिकावर कीड आली आहे, काय करावे?',
        'ਕਣਕ ਦਾ ਅੱਜ ਦਾ ਮੰਡੀ ਭਾਅ ਕੀ ਹੈ?',
        'What fertilizer should I use for wheat?'
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const messagesEndRef = useRef(null);

  const languages = [
    { code: 'auto', label: '🌐 Auto-Detect Language (बोलें या लिखें)' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'ml', label: 'മലയാളം (Malayalam)' },
    { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
    { code: 'hi-Latn', label: 'Hinglish (Romanized)' },
    { code: 'en', label: 'English' }
  ];

  const quickPrompts = [
    { title: 'गेहूं में खाद (Hindi)', text: 'गेहूं की फसल में कौन सी खाद डालनी चाहिए?' },
    { title: 'कापूस कीड (Marathi)', text: 'कापूस पिकावर कीड आली आहे, काय करावे?' },
    { title: 'ਕਣਕ ਦਾ ਭਾਅ (Punjabi)', text: 'ਕਣਕ ਦਾ ਭਾਅ ਕੀ ਹੈ?' },
    { title: 'મગફળી ખાતર (Gujarati)', text: 'મગફળીના પાક માટે કયું ખાતર સારું છે?' },
    { title: 'వరి ఎరువులు (Telugu)', text: 'వరి పంటకు ఎరువులు ఎప్పుడు వేয়ాలి?' },
    { title: 'நெல் உரம் (Tamil)', text: 'நெல் பயிருக்கு எந்த உரம் நல்லது?' },
    { title: 'Hinglish (Wheat Khad)', text: 'wheat ki fasal me kaunsi khad daalu' },
    { title: 'Off-Topic Test (Cricket)', text: 'आज का मौसम कैसा है क्रिकेट मैच के लिए?' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (queryText) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || loading) return;

    // Add user message to chat
    const userMsgId = Date.now();
    const newUserMsg = {
      id: userMsgId,
      sender: 'user',
      text: textToSend
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          language: selectedLanguage,
          user_id: user?.uid || 'farmer_session',
          location: 'Karnal, Haryana'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDetectedLangInfo(data.language);

        const newCopilotMsg = {
          id: Date.now() + 1,
          sender: 'copilot',
          text: data.response_text,
          langName: data.language?.name || 'English',
          langCode: data.language?.code || 'en',
          script: data.language?.script || 'Latin',
          isAgri: data.domain?.is_agri ?? true,
          category: data.action_title || 'कृषि सलाह • Farm Advisory',
          actionDetails: data.action_details,
          keyStats: data.key_stats || [],
          followups: data.suggested_followups || []
        };

        setMessages((prev) => [...prev, newCopilotMsg]);

        // Auto-play speech for hands-free voice interaction
        if (isListening || isPlayingAudio) {
          speakText(data.response_text, data.language?.code);
        }
      }
    } catch (err) {
      console.warn('Copilot query error:', err);
    } finally {
      setLoading(false);
      setIsListening(false);
    }
  };

  const speakText = (text, langCode) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map ISO code to BCP 47
    const langMap = {
      'hi': 'hi-IN',
      'mr': 'mr-IN',
      'pa': 'pa-IN',
      'gu': 'gu-IN',
      'te': 'te-IN',
      'ta': 'ta-IN',
      'kn': 'kn-IN',
      'bn': 'bn-IN',
      'ml': 'ml-IN',
      'or': 'or-IN',
      'hi-Latn': 'hi-IN',
      'en': 'en-IN'
    };

    utterance.lang = langMap[langCode] || 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your question.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    // Use selected language or default to Indian English / Hindi auto
    const langMap = {
      'hi': 'hi-IN',
      'mr': 'mr-IN',
      'pa': 'pa-IN',
      'gu': 'gu-IN',
      'te': 'te-IN',
      'ta': 'ta-IN',
      'kn': 'kn-IN',
      'bn': 'bn-IN',
      'ml': 'ml-IN',
      'or': 'or-IN',
      'en': 'en-IN'
    };
    recognition.lang = selectedLanguage !== 'auto' ? (langMap[selectedLanguage] || 'hi-IN') : 'hi-IN';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcriptText = event.results[0][0].transcript;
      setInputText(transcriptText);
      handleSendMessage(transcriptText);
    };

    recognition.onerror = (e) => {
      console.warn('Speech recognition notice:', e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Editorial Masthead */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#e7e5e4]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#14532d] animate-pulse"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#14532d]">
              Domain-Restricted Multilingual Kisan Mitra
            </span>
            <span className="text-[10px] bg-[#fef3c7] text-[#92400e] font-bold px-2 py-0.2 rounded-md">
              11+ Indian Languages
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1c1917] tracking-tight font-editorial mt-0.5">
            किसान मित्र • AI Agronomy & Mandi Voice Assistant
          </h2>
        </div>

        {/* Language Mode Selector */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-[#78716c]">Language Mode:</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="p-2 bg-white border border-[#e7e5e4] rounded-xl text-xs font-bold text-[#1c1917] focus:outline-[#14532d] shadow-2xs"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Auto-Detection Indicator Banner */}
      {detectedLangInfo && (
        <div className="p-3 bg-[#f5fdf7] border border-[#bbf7d0] rounded-2xl flex items-center justify-between text-xs text-[#14532d] font-bold animate-in zoom-in-95">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">translate</span>
            <span>
              Auto-Detected Input: <strong>{detectedLangInfo.name}</strong> ({detectedLangInfo.script} Script)
            </span>
          </div>
          <span className="text-[10px] bg-[#14532d] text-white px-2 py-0.5 rounded-full font-sans">
            100% Strict Agri Scope Enforced
          </span>
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="paper-card p-4 sm:p-6 min-h-[460px] flex flex-col justify-between space-y-4">
        {/* Messages Scroll Area */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 text-xs sm:text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Sender Label & Language Tag */}
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-extrabold text-[#78716c] uppercase">
                  {msg.sender === 'user' ? '👨‍🌾 Farmer Question' : '🌱 Kisan Mitra AI'}
                </span>
                {msg.langName && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#f5f2eb] text-[#57534e] border border-[#e7e5e4]">
                    {msg.langName}
                  </span>
                )}
                {msg.sender === 'copilot' && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      msg.isAgri
                        ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                        : 'bg-amber-100 text-amber-950 border border-amber-300'
                    }`}
                  >
                    {msg.isAgri ? '🌾 Agriculture Query' : '⚠️ Off-Topic Redirect'}
                  </span>
                )}
              </div>

              {/* Chat Bubble */}
              <div
                className={`p-4 rounded-3xl max-w-2xl leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#14532d] text-white rounded-tr-xs font-semibold'
                    : msg.isAgri
                    ? 'bg-[#faf8f5] border border-[#e7e5e4] text-[#1c1917] rounded-tl-xs'
                    : 'bg-[#fffbeb] border border-[#fef3c7] text-[#92400e] rounded-tl-xs'
                }`}
              >
                {/* Category Header for Copilot Response */}
                {msg.category && msg.sender === 'copilot' && (
                  <h4 className="text-xs font-extrabold pb-1.5 mb-2 border-b border-[#e7e5e4]/80 font-editorial flex items-center justify-between">
                    <span>{msg.category}</span>
                    <button
                      onClick={() => speakText(msg.text, msg.langCode)}
                      className="text-[#14532d] hover:opacity-80 p-0.5 flex items-center gap-1 text-[11px] font-sans font-bold"
                      title="Listen Audio Readout"
                    >
                      <span className="material-symbols-outlined text-[16px]">volume_up</span>
                      Listen
                    </button>
                  </h4>
                )}

                <p className="whitespace-pre-line text-xs sm:text-sm font-medium">{msg.text}</p>

                {/* Key Stats Chips */}
                {msg.keyStats && msg.keyStats.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#e7e5e4]">
                    {msg.keyStats.map((stat, sIdx) => (
                      <div key={sIdx} className="p-2 rounded-xl bg-white border border-[#e7e5e4] text-center">
                        <span className="text-[9px] text-[#78716c] block font-bold uppercase">{stat.label}</span>
                        <span className="text-xs font-extrabold text-[#14532d]">{stat.val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggested Followups */}
              {msg.followups && msg.followups.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 max-w-xl">
                  {msg.followups.map((fText, fIdx) => (
                    <button
                      key={fIdx}
                      onClick={() => handleSendMessage(fText)}
                      className="px-2.5 py-1 bg-[#faf8f5] hover:bg-[#f5f2eb] border border-[#e7e5e4] text-[11px] font-bold text-[#44403c] rounded-xl transition text-left active:scale-98"
                    >
                      💬 {fText}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 bg-[#faf8f5] border border-[#e7e5e4] rounded-2xl max-w-xs text-xs font-bold text-[#78716c]">
              <span className="w-2 h-2 rounded-full bg-[#14532d] animate-ping"></span>
              <span>Detecting language & analyzing agronomy...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sample 1-Tap Queries */}
        <div className="pt-2 border-t border-[#f5f2eb]">
          <span className="text-[10px] font-bold text-[#a8a29e] uppercase tracking-wider block mb-1.5">
            Test Queries (Auto-Detect in Action)
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.text)}
                className="px-2.5 py-1 bg-[#faf8f5] hover:bg-[#f5f2eb] border border-[#e7e5e4] rounded-xl text-[11px] font-semibold text-[#1c1917] whitespace-nowrap transition"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-1">
          {/* Voice Mic Button */}
          <button
            onClick={handleToggleVoice}
            className={`p-3 rounded-2xl transition shadow-xs flex items-center justify-center ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                : 'bg-[#14532d] hover:bg-[#052e16] text-white'
            }`}
            title="Speak Question"
          >
            <span className="material-symbols-outlined text-[22px]">
              {isListening ? 'graphic_eq' : 'mic'}
            </span>
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
            placeholder="Type or speak in Hindi, Punjabi, Marathi, Gujarati, Telugu, Tamil, Bengali, English..."
            className="flex-1 p-3 bg-[#faf8f5] border border-[#e7e5e4] rounded-2xl text-xs sm:text-sm font-bold text-[#1c1917] focus:outline-[#14532d]"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={loading || !inputText.trim()}
            className="px-5 py-3 bg-[#14532d] hover:bg-[#052e16] disabled:opacity-50 text-white text-xs font-extrabold rounded-2xl shadow-xs transition btn-tap flex items-center gap-1"
          >
            <span>Ask</span>
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
