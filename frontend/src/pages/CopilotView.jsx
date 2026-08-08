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
import { useLanguage } from '../context/LanguageContext';

const CROPS = [
  { id: 'wheat', name: 'Wheat (गहू / गेहूं)', mr: 'शरबती गहू' },
  { id: 'rice', name: 'Paddy / Rice (तांदूळ / धान)', mr: 'बासमती तांदूळ' },
  { id: 'cotton', name: 'Cotton (कापूस / कपास)', mr: 'शंकर-६ कापूस' },
  { id: 'soybean', name: 'Soybean (सोयाबीन)', mr: 'पिवळा सोयाबीन' },
  { id: 'mustard', name: 'Mustard (मोहरी / सरसों)', mr: 'मोहरी/राई' },
  { id: 'onion', name: 'Onion (कांदा / प्याज)', mr: 'नाशिक कांदा' },
  { id: 'tomato', name: 'Tomato (टोमॅटो / टमाटर)', mr: 'टोमॅटो' },
  { id: 'potato', name: 'Potato (बटाटा / आलू)', mr: 'ज्योती बटाटा' }
];

const PROMPTS = {
  en: {
    farmer: [
      "What is the 15 & 30-day price target for Wheat?",
      "Should I sell my soybean now or store in WDRA warehouse for 60 days?",
      "Which APMC mandi gives the highest net profit after transport?",
      "How can I sell directly to FMCG buyers with 0% brokerage commission?",
      "What is the current government MSP and moisture ceiling for Paddy?"
    ],
    buyer: [
      "Where can I source 500 MT of bulk soybean at lowest landed cost?",
      "How can institutional buyers create direct farmer contracts with escrow?",
      "What are the quality grading specs and moisture limits for Basmati Rice?",
      "What is the 30-day price trajectory and seasonal supply arrival trend?"
    ]
  },
  mr: {
    farmer: [
      "गव्हाचा पुढील १५ व ३० दिवसांचा संभाव्य भाव काय असेल?",
      "सोयाबीन आता विकावे की ६० दिवस गोदामात साठवून ठेवावे?",
      "वाहतूक खर्च वजा जाता कोणत्या बाजार समितीत सर्वाधिक नफा मिळेल?",
      "दलाली शिवाय थेट खरेदीदार कंपन्यांना माल कसा विकावा?",
      "कांद्याला नाशिक किंवा लातूर बाजार समितीत काय भाव मिळेल?"
    ],
    buyer: [
      "५०० टन सोयाबीन खरेदीसाठी सर्वात स्वस्त बाजार समिती कोणती?",
      "शेतकऱ्यांशी थेट सुरक्षित एस्क्रो करार कसा करावा?",
      "बासमती तांदूळ खरेदीसाठी कमाल ओलावा व गुणवत्ता निकष काय आहेत?",
      "पुढील ३० दिवसांत आवक आणि दरांचा कल काय राहील?"
    ]
  },
  hi: {
    farmer: [
      "गेहूं का 15 और 30 दिन का भाव क्या रहेगा?",
      "सोयाबीन अभी बेचें या 60 दिन गोदाम में रोककर रखना बेहतर है?",
      "भाड़ा काटने के बाद सबसे ज्यादा मुनाफा देने वाली मंडी कौन सी है?",
      "सीधे कंपनियों को 0% कमीशन पर अपनी फसल कैसे बेचें?"
    ],
    buyer: [
      "सोयाबीन की 500 टन थोक खरीद के लिए सबसे किफायती मंडी कौन सी है?",
      "एस्क्रो सुरक्षा के साथ किसानों से सीधे खरीद अनुबंध कैसे बनाएं?",
      "बासमती चावल के लिए स्वीकार्य नमी और मानक क्या हैं?"
    ]
  },
  pa: {
    farmer: [
      "ਕਣਕ ਦਾ ਅਗਲੇ 15 ਅਤੇ 30 ਦਿਨਾਂ ਦਾ ਭਾਅ ਕੀ ਰਹੇਗਾ?",
      "ਸੋਇਆਬੀਨ ਹੁਣ ਵੇਚਣੀ ਚਾਹੀਦੀ ਹੈ ਜਾਂ ਗੋਦਾਮ ਵਿੱਚ ਰੱਖਣੀ ਚਾਹੀਦੀ ਹੈ?",
      "ਕਿਹੜੀ ਮੰਡੀ ਵਿੱਚ ਸਭ ਤੋਂ ਵੱਧ ਮੁਨਾਫਾ ਮਿਲੇਗਾ?",
      "ਸਿੱਧਾ ਖਰੀਦਦਾਰਾਂ ਨੂੰ ਬਿਨਾਂ ਕਮੀਸ਼ਨ ਫਸਲ ਕਿਵੇਂ ਵੇਚੀਏ?"
    ],
    buyer: [
      "ਸਭ ਤੋਂ ਸਸਤੀ ਸੋਇਆਬੀਨ ਖਰੀਦ ਕਿੱਥੋਂ ਹੋ ਸਕਦੀ ਹੈ?",
      "ਕਿਸਾਨਾਂ ਨਾਲ ਸਿੱਧਾ ਐਸਕਰੋ ਸਮਝੌਤਾ ਕਿਵੇਂ ਕਰੀਏ?"
    ]
  },
  gu: {
    farmer: [
      "ઘઉંનો આગામી 15 અને 30 દિવસનો ભાવ શું રહેશે?",
      "સોયાબીન અત્યારે વેચવું કે ગોડાઉનમાં સાચવવું?",
      "ક્યા માર્કેટ યાર્ડમાં સૌથી વધુ ચોખ્ખો નફો મળશે?"
    ],
    buyer: [
      "500 ટન સોયાબીન ખરીદવા માટે શ્રેષ્ઠ યાર્ડ કયું?",
      "ખેડૂતો સાથે સીધો એસ્ક્રો કરાર કેવી રીતે કરવો?"
    ]
  },
  te: {
    farmer: [
      "గోధుమలకు రాబోయే 15 & 30 రోజుల ధర ఎంత ఉంటుంది?",
      "సోయాబీన్‌ను ఇప్పుడే అమ్మాలా లేదా గిడ్డంగిలో నిల్వ ఉంచాలా?",
      "రవాణా ఖర్చులు పోను ఏ మార్కెట్‌లో ఎక్కువ లాభం వస్తుంది?"
    ],
    buyer: [
      "సోయాబీన్ భారీ కొనుగోలుకు ఏ మార్కెట్ ఉత్తమమైనది?",
      "రైతులతో నేరుగా ఎస్క్రో ఒప్పందం ఎలా చేసుకోవాలి?"
    ]
  },
  ta: {
    farmer: [
      "கோதுமையின் அடுத்த 15 & 30 நாள் விலை இலக்கு என்ன?",
      "சோயாபீனை இப்போது விற்கலாமா அல்லது சேமித்து வைக்கலாமா?",
      "போக்குவரத்து செலவு போக எந்த சந்தையில் அதிக லாபம் கிடைக்கும்?"
    ],
    buyer: [
      "சோயாபீன் மொத்தமாக வாங்க சிறந்த சந்தை எது?",
      "விவசாயிகளுடன் நேரடி ஒப்பந்தம் செய்வது எப்படி?"
    ]
  },
  kn: {
    farmer: [
      "ಗೋಧಿಯ ಮುಂದಿನ 15 ಮತ್ತು 30 ದಿನಗಳ ಬೆಲೆ ಗುರಿ ಏನು?",
      "ಸೋಯಾಬೀನ್ ಅನ್ನು ಈಗಲೇ ಮಾರಾಟ ಮಾಡಬೇಕೇ ಅಥವಾ ಗೋದಾಮಿನಲ್ಲಿಡಬೇಕೇ?",
      "ಯಾವ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಹೆಚ್ಚು ನಿವ್ವಳ ಲಾಭ ಸಿಗುತ್ತದೆ?"
    ],
    buyer: [
      "ಸೋಯಾಬೀನ್ ಬೃಹತ್ ಖರೀದಿಗೆ ಉತ್ತಮ ಮಾರುಕಟ್ಟೆ ಯಾವುದು?",
      "ರೈತರೊಂದಿಗೆ ನೇರ ಎಸ್ಕ್ರೋ ಒಪ್ಪಂದ ಮಾಡಿಕೊಳ್ಳುವುದು ಹೇಗೆ?"
    ]
  }
};

export default function CopilotView() {
  const { t, language, currentLanguageObj } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [rolePersona, setRolePersona] = useState('farmer'); // 'farmer' or 'buyer'
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: language === 'mr' 
        ? "नमस्कार! मी आपला अ‍ॅग्रीपल्स एआय कृषी सल्लागार आहे. शेतमाल भाव अंदाज, थेट B2B खरेदी-विक्री आणि बाजार समिती निवडीबद्दल विचारा."
        : (language === 'hi' 
          ? "नमस्ते! मैं आपका एग्रीपल्स एआई कृषि सलाहकार हूँ। मंडी भाव, मूल्य भविष्यवाणी और सीधी खरीद-बिक्री के बारे में पूछें।"
          : "Welcome to AgriPulse Multilingual AI Voice Copilot. Ask about price trajectories, direct farmgate B2B escrow, or inter-mandi spatial arbitrage.")
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguageObj.speechLang || 'en-IN';
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
    recognition.lang = currentLanguageObj.speechLang || 'en-IN';
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
    } else {
      const fallbackText = language === 'mr' 
        ? "एआय विश्लेषणाद्वारे निवडक कृषी मालात पुढील १५ ते ३० दिवसांत ५ ते ८% तेजीचा अंदाज आहे. थेट B2B बाजारात ०% दलालीसह माल विका."
        : "According to AgriPulse AI models, strong demand fundamentals support a 5-8% price appreciation over the next 15-30 days.";
      const aiMsg = {
        sender: 'ai',
        text: fallbackText,
        action_title: t('executiveOverview'),
        action_details: t('realTimePulse'),
        key_stats: [{ label: t('aiForecastingAccuracy'), val: "94.8%" }]
      };
      setMessages([...newMsgs, aiMsg]);
      speakText(fallbackText);
    }
    setLoading(false);
  };

  const activeLangPrompts = PROMPTS[language] || PROMPTS.en;
  const activePrompts = rolePersona === 'buyer' ? (activeLangPrompts.buyer || PROMPTS.en.buyer) : (activeLangPrompts.farmer || PROMPTS.en.farmer);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: 'calc(100vh - 170px)', minHeight: '600px' }}>
      
      {/* Top Copilot Header with Persona Switcher & Crop Selector */}
      <div className="agri-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '4px', 
            background: '#FACC15', 
            color: '#000000',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            <Bot size={20} color="#000000" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
                {t('copilotTitle')}
              </h2>
              <span className="badge badge-yellow" style={{ fontSize: '0.7rem' }}>
                {currentLanguageObj.native}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
              {t('copilotSubtitle')}
            </p>
          </div>
        </div>

        {/* Persona & Crop Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Persona Switcher */}
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '2px', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
            <button
              onClick={() => setRolePersona('farmer')}
              className={rolePersona === 'farmer' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            >
              <Tractor size={13} />
              <span>{t('farmerMode')}</span>
            </button>
            <button
              onClick={() => setRolePersona('buyer')}
              className={rolePersona === 'buyer' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            >
              <Briefcase size={13} />
              <span>{t('buyerMode')}</span>
            </button>
          </div>

          {/* Commodity Focus Dropdown */}
          <select 
            className="input-field"
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
          >
            {CROPS.map(c => (
              <option key={c.id} value={c.id}>
                {t(c.id) || c.name}
              </option>
            ))}
          </select>

          {/* Audio Stop Button if speaking */}
          {isSpeaking && (
            <button 
              className="btn-secondary"
              onClick={stopSpeaking}
              style={{ padding: '5px 10px', fontSize: '0.75rem', borderColor: '#EF4444', color: '#DC2626' }}
            >
              <VolumeX size={13} color="#DC2626" />
              <span>{t('stopVoice')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Dialogue History */}
      <div className="agri-card" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px' 
      }}>
        {messages.map((msg, index) => {
          const isAI = msg.sender === 'ai';
          return (
            <div 
              key={index}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                justifyContent: isAI ? 'flex-start' : 'flex-end'
              }}
            >
              {isAI && (
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '6px', 
                  background: '#FEF3C7', 
                  color: '#D97706',
                  border: '1px solid #FCD34D',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={16} />
                </div>
              )}

              <div style={{ 
                maxWidth: '78%', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px' 
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  background: isAI ? '#F8FAFC' : '#D97706',
                  border: isAI ? '1px solid #E2E8F0' : 'none',
                  color: isAI ? '#0F172A' : '#FFFFFF',
                  fontSize: '0.88rem',
                  fontWeight: isAI ? 'normal' : '600',
                  lineHeight: '1.5'
                }}>
                  <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{msg.text}</p>

                  {/* Audio trigger inside message bubble */}
                  {isAI && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <button
                        onClick={() => speakText(msg.text)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#D97706',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          padding: '2px 4px',
                          fontWeight: '600'
                        }}
                      >
                        <Volume2 size={12} />
                        <span>{t('listenVoice')}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* AI Executive Action Card if present */}
                {isAI && msg.action_title && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: '#FFFBEB',
                    border: '1px solid #FCD34D',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400E', fontWeight: '700', fontSize: '0.82rem' }}>
                      <Sparkles size={14} />
                      <span>{msg.action_title}</span>
                    </div>
                    {msg.action_details && (
                      <p style={{ fontSize: '0.78rem', color: '#78350F', margin: 0 }}>
                        {msg.action_details}
                      </p>
                    )}
                  </div>
                )}

                {/* Key Metrics Chips */}
                {isAI && msg.key_stats && msg.key_stats.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {msg.key_stats.map((st, sidx) => (
                      <div 
                        key={sidx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '4px',
                          fontSize: '0.72rem'
                        }}
                      >
                        <span style={{ color: '#64748B' }}>{st.label}:</span>
                        <span style={{ color: '#0F172A', fontWeight: '700' }}>{st.val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!isAI && (
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '6px', 
                  background: '#F1F5F9', 
                  border: '1px solid #CBD5E1',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={16} color="#0F172A" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '6px', 
              background: '#FEF3C7', 
              border: '1px solid #FCD34D',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Bot size={16} color="#D97706" />
            </div>
            <div style={{ 
              padding: '10px 14px', 
              borderRadius: '6px', 
              background: '#F8FAFC', 
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <div className="pulse-dot" />
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                {t('loading')}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
        <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <HelpCircle size={12} />
          {t('sampleQuestions')}
        </span>
        {activePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(p);
              handleSubmit(p);
            }}
            className="btn-secondary"
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar with Mic & Send */}
      <div className="agri-card" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Voice Dictation Button */}
        <button
          onClick={toggleListening}
          className={isListening ? "btn-primary" : "btn-secondary"}
          style={{ 
            width: '38px', 
            height: '38px', 
            padding: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}
          title={isListening ? "Stop Listening" : "Tap to Speak"}
        >
          {isListening ? (
            <MicOff size={18} color="#FFFFFF" />
          ) : (
            <Mic size={18} color="#0F172A" />
          )}
        </button>

        {/* Text Input */}
        <input 
          type="text"
          className="input-field"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={isListening ? t('listening') : t('typeQuestion')}
          style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
        />

        {/* Send Button */}
        <button
          onClick={() => handleSubmit()}
          disabled={!query.trim() || loading}
          className="btn-primary"
          style={{ 
            width: '38px', 
            height: '38px', 
            padding: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0,
            opacity: !query.trim() || loading ? 0.6 : 1
          }}
        >
          <Send size={16} />
        </button>
      </div>

    </div>
  );
}
