import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  Sparkles, 
  Globe, 
  CheckCircle2, 
  ArrowRight, 
  Bot, 
  User, 
  VolumeX,
  Briefcase,
  Tractor,
  Layers,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';

const CROPS = [
  { id: 'wheat', name: 'Wheat (गेहूं)' },
  { id: 'rice', name: 'Paddy / Rice (धान)' },
  { id: 'cotton', name: 'Cotton (कपास)' },
  { id: 'soybean', name: 'Soybean (सोयाबीन)' },
  { id: 'mustard', name: 'Mustard (सरसों)' },
  { id: 'onion', name: 'Onion (प्याज)' },
  { id: 'tomato', name: 'Tomato (टमाटर)' },
  { id: 'potato', name: 'Potato (आलू)' },
  { id: 'sugarcane', name: 'Sugarcane (गन्ना)' },
  { id: 'maize', name: 'Maize (मक्का)' }
];

const FARMER_PROMPTS_EN = [
  "What is the 15 & 30-day price target for Wheat?",
  "Should I sell my soybean now or store in WDRA warehouse for 60 days?",
  "Which APMC mandi gives the highest net profit after transport?",
  "How can I sell directly to FMCG buyers with 0% brokerage commission?",
  "What is the current government MSP and moisture ceiling for Paddy?",
  "Is there any heatwave or pest alert from Sentinel-2 satellite?"
];

const FARMER_PROMPTS_HI = [
  "गेहूं का 15 और 30 दिन का भाव क्या रहेगा?",
  "सोयाबीन अभी बेचें या 60 दिन गोदाम में रोककर रखना बेहतर है?",
  "भाड़ा काटने के बाद सबसे ज्यादा मुनाफा देने वाली मंडी कौन सी है?",
  "सीधे कंपनियों को 0% कमीशन पर अपनी फसल कैसे बेचें?",
  "धान का सरकारी समर्थन मूल्य (MSP) और नमी के क्या नियम हैं?",
  "क्या अगले 3 दिनों में गर्मी या कीट प्रकोप का कोई अलर्ट है?"
];

const BUYER_PROMPTS_EN = [
  "Where can I source 500 MT of bulk soybean at lowest landed cost?",
  "How can institutional buyers create direct farmer contracts with escrow?",
  "What are the quality grading specs and moisture limits for Basmati Rice?",
  "What is the 30-day price trajectory and seasonal supply arrival trend?",
  "How to connect with FPOs for aggregated 1000 MT lots with assay reports?",
  "Should millers buy now or wait for peak mandi arrivals?"
];

const BUYER_PROMPTS_HI = [
  "सोयाबीन की 500 टन थोक खरीद के लिए सबसे किफायती मंडी कौन सी है?",
  "एस्क्रो सुरक्षा के साथ किसानों से सीधे खरीद अनुबंध कैसे बनाएं?",
  "बासमती चावल के लिए स्वीकार्य नमी और FAQ गुणवत्ता मानक क्या हैं?",
  "अगले 30 दिनों में मंडी आवक और भाव का क्या रुख रहने वाला है?",
  "1000 टन बड़े लॉट के लिए FPO से सीधे कैसे संपर्क करें?",
  "क्या आटा/दाल मिलों को अभी स्टॉक करना चाहिए या भाव घटेंगे?"
];

export default function CopilotView({ language, setLanguage }) {
  const [query, setQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [rolePersona, setRolePersona] = useState('farmer'); // 'farmer' | 'buyer' | 'all'
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: language === 'hi' 
        ? "नमस्ते! मैं एग्रीपल्स एआई ऑल-इन-वन कृषि एवं थोक व्यापार सहायक हूँ। किसान भाई भाव पूर्वानुमान, गोदाम ROI, या सीधे खरीदारों को बेचने के बारे में पूछ सकते हैं; और थोक खरीदार/मिलर सबसे सस्ती सोर्सिंग व एस्क्रो अनुबंध के बारे में पूछ सकते हैं।"
        : "Hello! I am AgriPulse AI Agritech & Procurement Copilot. Farmers can ask about price forecasts, warehouse ROI, and direct selling; institutional buyers can ask about lowest landed cost sourcing, quality specs, and direct escrow contracts.",
      key_stats: [
        { label: language === 'hi' ? "ट्रैक्ड फसलें" : "Tracked Crops", val: "10+ Commodities" },
        { label: language === 'hi' ? "मंडी कवरेज" : "Mandi APMCs", val: "2,847" },
        { label: language === 'hi' ? "सैटलाइट मॉडल" : "Satellite Radar", val: "Sentinel-2 Synced" },
        { label: language === 'hi' ? "एस्क्रो सुरक्षा" : "B2B Escrow", val: "100% Guaranteed" }
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice synthesis text-to-speech helper
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
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

  // Browser Speech-to-Text Recognition
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your query.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSubmit(transcript);
    };

    recognition.start();
  };

  const handleSubmit = async (textToSend) => {
    const userText = textToSend || query;
    if (!userText.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text: userText }];
    setMessages(newMsgs);
    setQuery('');
    setLoading(true);

    const res = await api.queryCopilot(userText, language, selectedCrop, rolePersona);
    if (res) {
      const aiMsg = {
        sender: 'ai',
        text: res.voice_response,
        action_title: res.action_title,
        action_details: res.action_details,
        key_stats: res.key_stats,
        suggested_followups: res.suggested_followups
      };
      setMessages([...newMsgs, aiMsg]);
      speakText(res.voice_response);
    }
    setLoading(false);
  };

  const activePrompts = rolePersona === 'buyer' 
    ? (language === 'hi' ? BUYER_PROMPTS_HI : BUYER_PROMPTS_EN)
    : (language === 'hi' ? FARMER_PROMPTS_HI : FARMER_PROMPTS_EN);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 170px)', minHeight: '650px' }}>
      
      {/* Top Copilot Header with Persona Switcher & Crop Selector */}
      <div className="agri-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #839958 0%, #105666 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(131, 153, 88, 0.5)'
          }}>
            <Bot size={22} color="#F7F4D5" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                AgriPulse AI Copilot
              </h2>
              <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>
                {rolePersona === 'farmer' ? (language === 'hi' ? 'किसान मोड' : 'Farmer Mode') : (language === 'hi' ? 'थोक खरीदार मोड' : 'Buyer Mode')}
              </span>
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              {language === 'hi' ? 'किसानों व खरीदारों के हर सवाल का सटीक एआई जवाब' : 'Comprehensive Decision AI for Farmers, Millers & Traders'}
            </span>
          </div>
        </div>

        {/* Persona & Crop Selection Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Persona Tabs */}
          <div style={{ display: 'flex', background: 'rgba(5, 28, 19, 0.8)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(131, 153, 88, 0.25)' }}>
            <button
              onClick={() => setRolePersona('farmer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: '600',
                background: rolePersona === 'farmer' ? 'var(--color-moss-green)' : 'transparent',
                color: rolePersona === 'farmer' ? '#0A3323' : 'var(--color-beige)'
              }}
            >
              <Tractor size={14} />
              <span>{language === 'hi' ? 'किसान' : 'Farmer'}</span>
            </button>
            <button
              onClick={() => setRolePersona('buyer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: '600',
                background: rolePersona === 'buyer' ? 'var(--color-midnight-green)' : 'transparent',
                color: rolePersona === 'buyer' ? '#F7F4D5' : 'var(--color-beige)'
              }}
            >
              <Briefcase size={14} />
              <span>{language === 'hi' ? 'थोक खरीदार' : 'Buyer/Miller'}</span>
            </button>
          </div>

          {/* Context Crop Selector */}
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', height: '34px' }}
          >
            {CROPS.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Audio Stop Button */}
          {isSpeaking && (
            <button 
              onClick={stopSpeaking} 
              className="btn-rose"
              style={{ fontSize: '0.78rem', padding: '6px 12px', height: '34px' }}
            >
              <VolumeX size={14} />
              <span>Mute</span>
            </button>
          )}

          {/* Language Toggle */}
          <button 
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px', height: '34px' }}
          >
            <Globe size={14} color="var(--color-moss-green-light)" />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Feed Area */}
      <div className="agri-card" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px', padding: '20px' }}>
        {messages.map((m, idx) => (
          <div 
            key={idx} 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start' 
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '10px', 
              maxWidth: '88%',
              flexDirection: m.sender === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{ 
                width: '34px', 
                height: '34px', 
                borderRadius: '50%', 
                background: m.sender === 'user' ? 'rgba(211, 150, 140, 0.3)' : 'rgba(131, 153, 88, 0.3)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0,
                border: `1px solid ${m.sender === 'user' ? 'var(--color-rosy-brown)' : 'var(--color-moss-green)'}`
              }}>
                {m.sender === 'user' ? <User size={16} color="var(--color-rosy-brown-light)" /> : <Bot size={16} color="var(--color-moss-green-light)" />}
              </div>

              <div style={{ 
                background: m.sender === 'user' ? 'linear-gradient(135deg, rgba(211, 150, 140, 0.25) 0%, rgba(16, 86, 102, 0.4) 100%)' : 'rgba(10, 51, 35, 0.9)',
                padding: '16px 20px', 
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${m.sender === 'user' ? 'rgba(211, 150, 140, 0.3)' : 'rgba(131, 153, 88, 0.25)'}`,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-beige)', lineHeight: '1.6' }}>
                  {m.text}
                </p>

                {/* Key Stats Badges */}
                {m.key_stats && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {m.key_stats.map((s, si) => (
                      <div key={si} style={{ padding: '5px 10px', background: 'rgba(5, 28, 19, 0.85)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(131, 153, 88, 0.25)', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{s.label}: </span>
                        <strong style={{ color: 'var(--color-moss-green-light)' }}>{s.val}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Card */}
                {m.action_title && (
                  <div style={{ marginTop: '14px', padding: '12px 16px', background: 'rgba(16, 86, 102, 0.35)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-midnight-green-glow)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-moss-green-light)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <CheckCircle2 size={15} />
                      <span>{m.action_title}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {m.action_details}
                    </div>
                  </div>
                )}

                {/* Interactive Suggested Followups */}
                {m.suggested_followups && m.suggested_followups.length > 0 && (
                  <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed rgba(131, 153, 88, 0.2)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      {language === 'hi' ? 'सुझाए गए अगले प्रश्न:' : 'Suggested follow-up questions:'}
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {m.suggested_followups.map((f, fi) => (
                        <button
                          key={fi}
                          onClick={() => handleSubmit(f)}
                          style={{
                            background: 'rgba(131, 153, 88, 0.15)',
                            border: '1px solid rgba(131, 153, 88, 0.3)',
                            borderRadius: '12px',
                            padding: '4px 10px',
                            color: 'var(--color-moss-green-light)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>{f}</span>
                          <ArrowRight size={11} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Play Audio Button for AI */}
                {m.sender === 'ai' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button 
                      onClick={() => speakText(m.text)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-moss-green-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                    >
                      <Volume2 size={14} />
                      <span>{language === 'hi' ? 'सुनें (Listen)' : 'Listen Audio'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-moss-green-light)', fontSize: '0.85rem' }}>
            <div className="pulse-dot" />
            <span>{language === 'hi' ? 'मंडी भाव व सैटलाइट मॉडल का विश्लेषण जारी है...' : 'Synthesizing agricultural intelligence & mandi pricing models...'}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {activePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSubmit(p)}
            className="btn-secondary"
            style={{ fontSize: '0.74rem', padding: '6px 12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={12} color="var(--color-moss-green-light)" />
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* Input Bar with Mic & Send */}
      <div className="agri-card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={toggleListening}
          className={isListening ? 'btn-rose' : 'btn-primary'}
          style={{ width: '42px', height: '42px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          title={isListening ? "Listening... click to stop" : "Click to speak"}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={
            rolePersona === 'farmer'
              ? (language === 'hi' ? "किसान प्रश्न पूछें (उदा. गेहूं का 15 दिन का भाव क्या रहेगा?)..." : "Ask farmer question (e.g., Should I sell wheat now or store for 60 days?)...")
              : (language === 'hi' ? "खरीदार प्रश्न पूछें (उदा. सोयाबीन की 500 टन खरीद कहाँ सबसे सस्ती पड़ेगी?)..." : "Ask buyer question (e.g., Where can I procure 500 MT of bulk soybean?)...")
          }
          className="input-field"
          style={{ border: 'none', background: 'transparent', fontSize: '0.92rem', padding: '8px 4px' }}
        />

        <button
          onClick={() => handleSubmit()}
          className="btn-primary"
          style={{ height: '40px', padding: '0 18px', flexShrink: 0 }}
        >
          <Send size={15} />
          <span>Send</span>
        </button>
      </div>

    </div>
  );
}
