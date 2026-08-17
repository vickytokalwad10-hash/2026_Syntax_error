# AgriPulse AI — Multilingual Architecture & Development Guidelines

> **CRITICAL ARCHITECTURAL DIRECTIVE: SINGLE SOURCE OF TRUTH (PERMANENT SYSTEM)**
> The multilingual feature previously broke/regressed when language logic was implemented independently in different parts of the application. 
> To prevent future regressions, **NEVER** create local language states (`useState('en')`, etc.) or hardcode divergent translation dictionaries.

---

## 🏛️ 1. Global Language Store (`LanguageContext.jsx`)

All language state in the entire application is governed **ONLY** by [`LanguageContext.jsx`](frontend/src/context/LanguageContext.jsx) backed by `react-i18next`.

### Resolution Priority Order:
1. **Explicit User Override** (Manual selection via the global header language switcher) — *Highest Priority*
2. **Saved User Profile** (`preferredLanguage` stored in Supabase / Firestore)
3. **Persisted LocalStorage** (`agripulse_lang` loaded before auth to eliminate flash of English)
4. **Per-Message Chatbot Detection** (Temporary single-turn reply in detected language; prompts user with a 1-tap chip to switch global app language)
5. **Browser / Device Locale** (`navigator.language`) — *Default Fallback*

---

## 🌐 2. Supported Languages & Canonical ISO Codes

All features, APIs, and components must use standard ISO 639-1 / BCP-47 identifiers:

| ISO Code | Display Name | Native Name | Script | TTS & STT Locale |
|---|---|---|---|---|
| `en` | English | English | Latin | `en-IN` |
| `hi` | Hindi | हिन्दी | Devanagari | `hi-IN` |
| `mr` | Marathi | मराठी | Devanagari | `mr-IN` |
| `pa` | Punjabi | ਪੰਜਾਬੀ | Gurmukhi | `pa-IN` |
| `gu` | Gujarati | ગુજરાતી | Gujarati | `gu-IN` |
| `te` | Telugu | తెలుగు | Telugu | `te-IN` |
| `ta` | Tamil | தமிழ் | Tamil | `ta-IN` |
| `kn` | Kannada | ಕನ್ನಡ | Kannada | `kn-IN` |
| `bn` | Bengali | বাংলা | Bengali | `bn-IN` |
| `ml` | Malayalam | മലയാളം | Malayalam | `ml-IN` |
| `or` | Odia | ଓଡ଼ିଆ | Odia | `or-IN` |

---

## 📝 3. Rule for Adding New Screens or Features

When adding any new page, modal, or UI component:
1. **Never Hardcode Text Strings in JSX**:
   ```javascript
   // ❌ BAD: Hardcoded text in component
   <h3>Marketplace Overview</h3>
   
   // ✅ GOOD: Use useLanguage or useTranslation
   const { t } = useLanguage();
   <h3>{t('marketplace.title')}</h3>
   ```
2. **Always Add Keys to All 11 Locale Files**:
   Add the corresponding key under the proper namespace in [`frontend/src/locales/{lang}/translation.json`](frontend/src/locales/en/translation.json).
3. **Verify Translation Parity**:
   Run the automated parity checker before committing:
   ```bash
   python scripts/generate_and_verify_locales.py
   ```

---

## 🤖 4. Rule for Backend Gemini AI Call Sites

When invoking Google Gemini models for any feature:
1. **Always Use the Centralized Instruction Builder**:
   ```python
   # ❌ BAD: Custom ad-hoc prompt string
   prompt = f"Answer in {language} language..."

   # ✅ GOOD: Single source of truth helper
   from services.language_utils import build_language_instruction
   lang_instruction = build_language_instruction(language_code)
   ```
2. **Always Require Language ISO Code Parameter**:
   Backend endpoints must receive `language` (ISO code) passed explicitly from the frontend's global `LanguageContext`.

---

## 🎙️ 5. Voice Input & Speech Synthesis Rule

1. `SpeechRecognition.lang` and `SpeechSynthesisUtterance.lang` must be assigned **dynamically per utterance** based on active `currentLanguageObj.speechLang` or detected message language.
2. **Never** bind `recognition.lang` at component mount in `useEffect`.

---

## 🧪 6. Automated Regression Tests

Run the backend test suite before every release:
```bash
python -m unittest backend.test_multilingual_unified
```
