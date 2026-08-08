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
  { id: 'potato', name: 'Potato (बटाटा / आलू)', mr: 'ज्योती बटाटा' },
  { id: 'sugarcane', name: 'Sugarcane (ऊस / गन्ना)', mr: 'ऊस' },
  { id: 'maize', name: 'Maize (मका / मक्का)', mr: 'मका' }
];

const PROMPTS = {
  en: {
    farmer: [
      "What is the 15 & 30-day price target for Wheat?",
      "Should I sell my soybean now or store in WDRA warehouse for 60 days?",
      "Which APMC mandi gives the highest net profit after transport?",
      "How can I sell directly to FMCG buyers with 0% brokerage commission?",
      "What is the current government MSP and moisture ceiling for Paddy?",
      "Is there any heatwave or pest alert from Sentinel-2 satellite?"
    ],
    buyer: [
      "Where can I source 500 MT of bulk soybean at lowest landed cost?",
      "How can institutional buyers create direct farmer contracts with escrow?",
      "What are the quality grading specs and moisture limits for Basmati Rice?",
      "What is the 30-day price trajectory and seasonal supply arrival trend?",
      "How to connect with FPOs for aggregated 1000 MT lots with assay reports?",
      "Should millers buy now or wait for peak mandi arrivals?"
    ]
  },
  mr: {
    farmer: [
      "गव्हाचा पुढील १५ व ३० दिवसांचा संभाव्य भाव काय असेल?",
      "सोयाबीन आता विकावे की ६० दिवस गोदामात साठवून ठेवावे?",
      "वाहतूक खर्च वजा जाता कोणत्या बाजार समितीत सर्वाधिक नफा मिळेल?",
      "दलाली शिवाय थेट खरेदीदार कंपन्यांना माल कसा विकावा?",
      "कांद्याला नाशिक किंवा लातूर बाजार समितीत काय भाव मिळेल?",
      "उपग्रह निरीक्षणानुसार पिकांवर कीड किंवा उष्णतेचा धोका आहे का?"
    ],
    buyer: [
      "५०० टन सोयाबीन खरेदीसाठी सर्वात स्वस्त बाजार समिती कोणती?",
      "शेतकऱ्यांशी थेट सुरक्षित एस्क्रो करार कसा करावा?",
      "बासमती तांदूळ खरेदीसाठी कमाल ओलावा व गुणवत्ता निकष काय आहेत?",
      "पुढील ३० दिवसांत आवक आणि दरांचा कल काय राहील?",
      "मोठ्या प्रमाणावर खरेदीसाठी शेतकरी उत्पादक कंपन्यांशी (FPO) कसे जोडावे?",
      "प्रक्रिया उद्योगांनी आत्ताच खरेदी करावी की भाव आणखी कमी होतील?"
    ]
  },
  hi: {
    farmer: [
      "गेहूं का 15 और 30 दिन का भाव क्या रहेगा?",
      "सोयाबीन अभी बेचें या 60 दिन गोदाम में रोककर रखना बेहतर है?",
      "भाड़ा काटने के बाद सबसे ज्यादा मुनाफा देने वाली मंडी कौन सी है?",
      "सीधे कंपनियों को 0% कमीशन पर अपनी फसल कैसे बेचें?",
      "धान का सरकारी समर्थन मूल्य (MSP) और नमी के क्या नियम हैं?",
      "क्या अगले 3 दिनों में गर्मी या कीट प्रकोप का कोई अलर्ट है?"
    ],
    buyer: [
      "सोयाबीन की 500 टन थोक खरीद के लिए सबसे किफायती मंडी कौन सी है?",
      "एस्क्रो सुरक्षा के साथ किसानों से सीधे खरीद अनुबंध कैसे बनाएं?",
      "बासमती चावल के लिए स्वीकार्य नमी और FAQ गुणवत्ता मानक क्या हैं?",
      "अगले 30 दिनों में मंडी आवक और भाव का क्या रुख रहने वाला है?",
      "1000 टन बड़े लॉट के लिए FPO से सीधे कैसे संपर्क करें?",
      "क्या आटा/दाल मिलों को अभी स्टॉक करना चाहिए या भाव घटेंगे?"
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
      "ਕਿਸਾਨਾਂ ਨਾਲ ਸਿੱਧਾ ਐਸਕਰੋ ਸਮਝੌਤਾ ਕਿਵੇਂ ਕਰੀਏ?",
      "ਬਾਸਮਤੀ ਚੌਲਾਂ ਲਈ ਨਮੀ ਦੇ ਕੀ ਮਾਪਦੰਡ ਹਨ?"
    ]
  },
  gu: {
    farmer: [
      "ઘઉં અને કપાસના આગામી ૧૫-૩૦ દિવસના ભાવ શું રહેશે?",
      "સોયાબીન અત્યારે વેચવું કે ગોડાઉનમાં સંગ્રહ કરવો ફાયદાકારક?",
      "ક્યા માર્કેટ યાર્ડમાં સૌથી વધુ ચોખ્ખો નફો મળશે?",
      "દલાલી વગર સીધા વેપારીઓને માલ કેવી રીતે વેચવો?"
    ],
    buyer: [
      "સૌથી ઓછા ખર્ચે જથ્થાબંધ કપાસ અને સોયાબીન ક્યાંથી મળશે?",
      "ખેડૂતો સાથે સીધો એસ્ક્રો કરાર કેવી રીતે કરવો?",
      "આગામી ૩૦ દિવસમાં બજાર આવક અને ભાવનું વલણ શું રહેશે?"
    ]
  },
  te: {
    farmer: [
      "గోధుమ మరియు పత్తి 15-30 రోజుల ధరల అంచనా ఏమిటి?",
      "సోయాబీన్ ఇప్పుడు అమ్మాలా లేదా నిల్వ చేయాలా?",
      "రవాణా ఖర్చులు పోను ఏ మార్కెట్‌లో ఎక్కువ లాభం వస్తుంది?",
      "కమీషన్ లేకుండా నేరుగా కొనుగోలుదారులకు ఎలా అమ్మాలి?"
    ],
    buyer: [
      "తక్కువ ఖర్చుతో సోయాబీన్ మరియు వరి ఎక్కడ లభిస్తుంది?",
      "రైతులతో నేరుగా ఎస్క్రో ఒప్పందం ఎలా చేసుకోవాలి?",
      "నాణ్యత ప్రమాణాలు మరియు తేమ పరిమితులు ఏమిటి?"
    ]
  },
  ta: {
    farmer: [
      "கோதுமை மற்றும் பருத்தி அடுத்த 15-30 நாள் விலை கணிப்பு என்ன?",
      "சோயாபீனை இப்போது விற்பதா அல்லது சேமிப்பதா?",
      "எந்த சந்தையில் அதிக நிகர லாபம் கிடைக்கும்?",
      "நேரடியாக வணிகர்களுக்கு 0% தரகில் விற்பது எப்படி?"
    ],
    buyer: [
      "குறைந்த விலையில் மொத்த கொள்முதல் எங்கு செய்வது?",
      "விவசாயிகளுடன் நேரடி எஸ்க்ரோ ஒப்பந்தம் செய்வது எப்படி?",
      "தரம் மற்றும் ஈரப்பத அளவு விவரங்கள் என்ன?"
    ]
  },
  kn: {
    farmer: [
      "ಗೋಧಿ ಮತ್ತು ಹತ್ತಿ ಮುಂದಿನ 15-30 ದಿನಗಳ ಬೆಲೆ ಮುನ್ಸೂಚನೆ ಏನು?",
      "ಸೋಯಾಬೀನ್ ಈಗ ಮಾರಾಟ ಮಾಡಬೇಕೆ ಅಥವಾ ಗೋದಾಮಿನಲ್ಲಿ ಇಡಬೇಕೆ?",
      "ಯಾವ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಗರಿಷ್ಠ ನಿವ್ವಳ ಲಾಭ ದೊರೆಯುತ್ತದೆ?",
      "ಕಮಿಷನ್ ಇಲ್ಲದೆ ನೇರವಾಗಿ ಕಂಪನಿಗಳಿಗೆ ಮಾರಾಟ ಮಾಡುವುದು ಹೇಗೆ?"
    ],
    buyer: [
      "ಕಡಿಮೆ ದರದಲ್ಲಿ ಸಗಟು ಖರೀದಿ ಎಲ್ಲಿ ಮಾಡಬಹುದು?",
      "ರೈತರೊಂದಿಗೆ ನೇರ ಎಸ್ಕ್ರೊ ಒಪ್ಪಂದ ಮಾಡಿಕೊಳ್ಳುವುದು ಹೇಗೆ?",
      "ಗುಣಮಟ್ಟ ಮತ್ತು ತೇವಾಂಶದ ಮಾನದಂಡಗಳು ಯಾವುವು?"
    ]
  }
};

export default function CopilotView() {
  const { language, setLanguage, t, currentLanguageObj } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [rolePersona, setRolePersona] = useState('farmer'); // 'farmer' | 'buyer' | 'all'
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const getGreeting = () => {
    switch (language) {
      case 'mr':
        return "नमस्कार! मी ॲग्रीपल्स एआय कृषी व थेट व्यापार सल्लागार आहे. शेतकरी बांधव बाजारभाव अंदाज, गोदाम साठवणूक नफा किंवा थेट विक्रीबाबत विचारू शकतात; तसेच व्यापारी व मिलर्स थेट खरेदी व सुरक्षित एस्क्रो कराराबाबत विचारू शकतात. बोला किंवा प्रश्न टाइप करा!";
      case 'hi':
        return "नमस्ते! मैं एग्रीपल्स एआई कृषि एवं थोक व्यापार सहायक हूँ। किसान भाई भाव पूर्वानुमान, गोदाम ROI, या सीधे खरीदारों को बेचने के बारे में पूछ सकते हैं; और थोक खरीदार/मिलर सबसे सस्ती सोर्सिंग व एस्क्रो अनुबंध के बारे में पूछ सकते हैं।";
      case 'pa':
        return "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਏਗਰੀਪਲਸ ਏਆਈ ਖੇਤੀ ਸਲਾਹਕਾਰ ਹਾਂ। ਕਿਸਾਨ ਭਾਅ ਅਨੁਮਾਨ ਅਤੇ ਸਿੱਧੀ ਵਿਕਰੀ ਬਾਰੇ ਪੁੱਛ ਸਕਦੇ ਹਨ।";
      case 'gu':
        return "નમસ્તે! હું એગ્રીપલ્સ એઆઈ કૃષિ સલાહકાર છું. ખેડૂતો અને વેપારીઓ ભાવ અનુમાન અને સીધા વેચાણ અંગે પૂછી શકે છે.";
      case 'te':
        return "నమస్కారం! నేను అగ్రిపల్స్ ఏఐ వ్యవసాయ సలహాదారుని. రైతులు మరియు కొనుగోలుదారులు ధరల అంచనా మరియు ప్రత్యక్ష అమ్మకాల గురించి అడగవచ్చు.";
      case 'ta':
        return "வணக்கம்! நான் அக்ரிபல்ஸ் ஏஐ வேளாண் ஆலோசகர். உழவர்கள் மற்றும் வணிகர்கள் விலை கணிப்பு மற்றும் நேரடி விற்பனை பற்றி கேட்கலாம்.";
      case 'kn':
        return "ನಮಸ್ಕಾರ! ನಾನು ಅಗ್ರಿಪಲ್ಸ್ ಎಐ ಕೃಷಿ ಸಲಹೆಗಾರ. ರೈತರು ಮತ್ತು ವ್ಯಾಪಾರಿಗಳು ಬೆಲೆ ಮುನ್ಸೂಚನೆ ಮತ್ತು ನೇರ ಮಾರಾಟದ ಬಗ್ಗೆ ಕೇಳಬಹುದು.";
      default:
        return "Hello! I am AgriPulse AI Agritech & Procurement Copilot. Farmers can ask about price forecasts, warehouse ROI, and direct selling; institutional buyers can ask about lowest landed cost sourcing, quality specs, and direct escrow contracts.";
    }
  };

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: getGreeting(),
      key_stats: [
        { label: language === 'mr' ? "ट्रॅक केलेली पिके" : (language === 'hi' ? "ट्रैक्ड फसलें" : "Tracked Crops"), val: "10+ Commodities" },
        { label: language === 'mr' ? "बाजार समित्या" : (language === 'hi' ? "मंडी कवरेज" : "Mandi APMCs"), val: "2,847 Live" },
        { label: language === 'mr' ? "उपग्रह मॉडेल" : (language === 'hi' ? "सैटलाइट मॉडल" : "Satellite Radar"), val: "Sentinel-2 MSI" },
        { label: language === 'mr' ? "सुरक्षित एस्क्रो" : (language === 'hi' ? "एस्क्रो सुरक्षा" : "B2B Escrow"), val: "100% Guaranteed" }
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

  // Offline intelligent response fallback generator
  const getOfflineResponse = (userText) => {
    const txt = userText.toLowerCase();
    const isMr = language === 'mr' || /[\u0900-\u097F]/.test(txt);
    
    if (language === 'mr') {
      if (txt.includes('गहू') || txt.includes('wheat')) {
        return {
          voice: "शरबती गव्हाचा सध्याचा हाजिर भाव ₹२,८४० प्रति क्विंटल आहे. एआय मॉडेलनुसार पुढील १५ दिवसांत हा भाव ₹२,९८५ आणि ३० दिवसांत ₹३,१४० पर्यंत वाढण्याचा अंदाज आहे. आटा मिलकडून जोरदार मागणी असल्याने ६० दिवस गोदामात साठवणूक केल्यास प्रति क्विंटल ₹२८० अतिरिक्त नफा मिळू शकेल.",
          title: "गहू भाव अंदाज व साठवणूक शिफारस",
          details: "सध्याचा भाव: ₹२,८४०/क्विंटल | ३०-दिवसीय संभाव्य भाव: ₹३,१४० (+१०.५% वाढ). खन्ना व आझादपूर बाजार समितीत सर्वाधिक दर नोंदवले गेले आहेत.",
          stats: [
            { label: "हाजिर भाव", val: "₹2,840/Q" },
            { label: "30-दिवसीय लक्ष्य", val: "₹3,140/Q" },
            { label: "गोदाम ROI", val: "+₹280/Q शुद्ध" }
          ]
        };
      }
      if (txt.includes('कांदा') || txt.includes('onion') || txt.includes('नाशिक')) {
        return {
          voice: "नाशिक कांद्याचा सध्याचा बाजारभाव ₹२,१५० प्रति क्विंटल आहे. लासलगाव व पिंपळगाव बाजार समितीत आवक संतुलित असून पुढील १५ दिवसांत भाव ₹२,३०० पर्यंत सुधारण्याची शक्यता आहे. दर्जेदार उन्हाळी कांदा कोरड्या वातावरणात साठवण्याचा सल्ला आहे.",
          title: "नाशिक कांदा बाजार समिती विश्लेषण",
          details: "लासलगाव भाव: ₹२,१५० | अपेक्षित १५-दिवसीय दर: ₹२,३००/क्विंटल | निर्यातीसाठी मध्य पूर्वेकडून मागणी सुरू आहे.",
          stats: [
            { label: "नाशिक हाजिर", val: "₹2,150/Q" },
            { label: "15-दिवसीय अंदाज", val: "₹2,300/Q" },
            { label: "साठवणूक दर्जा", val: "उत्तम" }
          ]
        };
      }
      if (txt.includes('सोयाबीन') || txt.includes('soybean')) {
        return {
          voice: "पिवळा सोयाबीनचा सध्याचा दर ₹४,८९० प्रति क्विंटल आहे. आंतरराष्ट्रीय खाद्यतेल बाजारातील तेजीमुळे पुढील ३० दिवसांत भाव ₹५,२२० पर्यंत जाण्याची शक्यता आहे. लातूर व अकोला बाजार समितीत मागणी उच्च आहे.",
          title: "सोयाबीन भाव वाढ व बाजार कल",
          details: "हाजिर दर: ₹४,८९० | ३० दिवसांचे लक्ष्य: ₹५,२२० (+६.७%). ६० दिवस साठवणूक केल्यास ₹३१० प्रति क्विंटल निव्वळ नफा अपेक्षित आहे.",
          stats: [
            { label: "सध्याचा भाव", val: "₹4,890/Q" },
            { label: "लक्ष्य भाव", val: "₹5,220/Q" },
            { label: "नफा वाढ", val: "+6.7%" }
          ]
        };
      }
      return {
        voice: `आपल्या प्रश्नाचे विश्लेषण पूर्ण झाले आहे. एआय मॉडेलनुसार निवडक कृषी मालात पुढील १५ ते ३० दिवसांत ५ ते ८% भाववाढीचा कल दिसून येत आहे. थेट खरेदीदारांशी एस्क्रो करार करून दलालीची बचत करण्याचा सल्ला आहे.`,
        title: "एग्रीपल्स एआय बहुभाषिक कृषी विश्लेषण",
        details: "थेट B2B बाजारपेठेत ०% दलालीसह माल विकण्यासाठी 'थेट शेतकरी-खरेदीदार बाजार' पर्यायाचा वापर करा.",
        stats: [
          { label: "एआय विश्वासार्हता", val: "94.2%" },
          { label: "सल्ला", val: "थेट विक्री / साठवणूक" }
        ]
      };
    }

    // Default English / Hindi fallback
    return {
      voice: "According to AgriPulse AI forecasting models, strong market fundamentals support a 5-8% price appreciation over the next 15-30 days. Direct farmgate sales through verified B2B escrow contracts eliminate middleman commission.",
      title: "AgriPulse AI Market Recommendation",
      details: "Spot markets show strong support above MSP. Consider leveraging WDRA registered warehousing for 60-day storage optimization.",
      stats: [
        { label: "AI Confidence", val: "94.2%" },
        { label: "Strategy", val: "Direct B2B Escrow" }
      ]
    };
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
      const fallback = getOfflineResponse(userText);
      const aiMsg = {
        sender: 'ai',
        text: fallback.voice,
        action_title: fallback.title,
        action_details: fallback.details,
        key_stats: fallback.stats
      };
      setMessages([...newMsgs, aiMsg]);
      speakText(fallback.voice);
    }
    setLoading(false);
  };

  const activeLangPrompts = PROMPTS[language] || PROMPTS.en;
  const activePrompts = rolePersona === 'buyer' ? activeLangPrompts.buyer : activeLangPrompts.farmer;

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
                {t('copilotTitle')}
              </h2>
              <span className="badge badge-moss" style={{ fontSize: '0.72rem' }}>
                {currentLanguageObj.native} ({currentLanguageObj.speechLang})
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {t('copilotSubtitle')}
            </p>
          </div>
        </div>

        {/* Persona & Crop Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Persona Switcher */}
          <div style={{ display: 'flex', background: 'rgba(5, 28, 19, 0.8)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
            <button
              onClick={() => setRolePersona('farmer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: rolePersona === 'farmer' ? 'var(--color-moss-green)' : 'transparent',
                color: rolePersona === 'farmer' ? '#F7F4D5' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <Tractor size={14} />
              <span>{t('farmerMode')}</span>
            </button>
            <button
              onClick={() => setRolePersona('buyer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: rolePersona === 'buyer' ? 'var(--color-sea-green)' : 'transparent',
                color: rolePersona === 'buyer' ? '#F7F4D5' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <Briefcase size={14} />
              <span>{t('buyerMode')}</span>
            </button>
          </div>

          {/* Commodity Focus Dropdown */}
          <select 
            className="select-custom"
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            style={{ padding: '7px 12px', fontSize: '0.82rem' }}
          >
            {CROPS.map(c => (
              <option key={c.id} value={c.id}>
                {language === 'mr' ? c.mr : c.name}
              </option>
            ))}
          </select>

          {/* Audio Stop Button if speaking */}
          {isSpeaking && (
            <button 
              className="btn-secondary"
              onClick={stopSpeaking}
              style={{ padding: '6px 10px', fontSize: '0.78rem', background: 'rgba(211, 150, 140, 0.2)', borderColor: 'var(--color-rosy-brown)' }}
            >
              <VolumeX size={14} color="var(--color-rosy-brown-light)" />
              <span>{t('stopVoice')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Dialogue History */}
      <div className="agri-card" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px' 
      }}>
        {messages.map((msg, index) => {
          const isAI = msg.sender === 'ai';
          return (
            <div 
              key={index}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                justifyContent: isAI ? 'flex-start' : 'flex-end'
              }}
            >
              {isAI && (
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  background: 'rgba(131, 153, 88, 0.25)', 
                  border: '1px solid var(--color-moss-green)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={18} color="var(--color-moss-green-light)" />
                </div>
              )}

              <div style={{ 
                maxWidth: '78%', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px' 
              }}>
                <div style={{
                  padding: '14px 18px',
                  borderRadius: isAI ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                  background: isAI ? 'rgba(5, 28, 19, 0.85)' : 'linear-gradient(135deg, rgba(16, 86, 102, 0.9) 0%, rgba(131, 153, 88, 0.8) 100%)',
                  border: isAI ? '1px solid rgba(131, 153, 88, 0.3)' : '1px solid var(--color-moss-green)',
                  color: 'var(--color-beige)',
                  fontSize: '0.92rem',
                  lineHeight: '1.55',
                  boxShadow: isAI ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(16, 86, 102, 0.4)'
                }}>
                  <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{msg.text}</p>

                  {/* Audio trigger inside message bubble */}
                  {isAI && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button
                        onClick={() => speakText(msg.text)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-moss-green-light)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        <Volume2 size={13} />
                        <span>{t('listenVoice')}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* AI Executive Action Card if present */}
                {isAI && msg.action_title && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(16, 86, 102, 0.25)',
                    border: '1px solid var(--color-sea-green)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-moss-green-light)', fontWeight: '700', fontSize: '0.88rem' }}>
                      <Sparkles size={15} />
                      <span>{msg.action_title}</span>
                    </div>
                    {msg.action_details && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {msg.action_details}
                      </p>
                    )}
                  </div>
                )}

                {/* Key Metrics Chips */}
                {isAI && msg.key_stats && msg.key_stats.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {msg.key_stats.map((st, sidx) => (
                      <div 
                        key={sidx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          background: 'rgba(5, 28, 19, 0.7)',
                          border: '1px solid rgba(131, 153, 88, 0.25)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.76rem'
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)' }}>{st.label}:</span>
                        <span style={{ color: 'var(--color-beige)', fontWeight: '700' }}>{st.val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!isAI && (
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  background: 'rgba(211, 150, 140, 0.25)', 
                  border: '1px solid var(--color-rosy-brown)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={18} color="var(--color-rosy-brown-light)" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              background: 'rgba(131, 153, 88, 0.25)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Bot size={18} color="var(--color-moss-green-light)" />
            </div>
            <div style={{ 
              padding: '12px 18px', 
              borderRadius: 'var(--radius-md)', 
              background: 'rgba(5, 28, 19, 0.8)', 
              border: '1px solid rgba(131, 153, 88, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div className="pulse-dot" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {language === 'mr' ? 'एआय उत्तर तयार करत आहे...' : (language === 'hi' ? 'एआई विश्लेषण कर रहा है...' : 'AgriPulse AI is calculating market response...')}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <HelpCircle size={13} />
          {t('sampleQuestions')}
        </span>
        {activePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(p);
              handleSubmit(p);
            }}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 86, 102, 0.25)',
              border: '1px solid rgba(16, 86, 102, 0.6)',
              color: 'var(--color-beige)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(131, 153, 88, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16, 86, 102, 0.25)'}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar with Mic & Send */}
      <div className="agri-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Voice Dictation Button */}
        <button
          onClick={toggleListening}
          className={isListening ? "btn-danger" : "btn-secondary"}
          style={{ 
            width: '44px', 
            height: '44px', 
            padding: 0, 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0,
            background: isListening ? 'rgba(211, 150, 140, 0.4)' : 'rgba(131, 153, 88, 0.25)',
            borderColor: isListening ? 'var(--color-rosy-brown)' : 'var(--color-moss-green)'
          }}
          title={isListening ? "Stop Listening" : "Tap to Speak"}
        >
          {isListening ? (
            <MicOff size={20} color="var(--color-rosy-brown-light)" className="pulse-dot-rose" />
          ) : (
            <Mic size={20} color="var(--color-moss-green-light)" />
          )}
        </button>

        {/* Text Input */}
        <input 
          type="text"
          className="input-custom"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={isListening ? t('listening') : t('typeQuestion')}
          style={{ flex: 1, padding: '11px 16px', fontSize: '0.92rem' }}
        />

        {/* Send Button */}
        <button
          onClick={() => handleSubmit()}
          disabled={!query.trim() || loading}
          className="btn-primary"
          style={{ 
            width: '44px', 
            height: '44px', 
            padding: 0, 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0,
            opacity: !query.trim() || loading ? 0.6 : 1
          }}
        >
          <Send size={18} />
        </button>
      </div>

    </div>
  );
}
