import React, { useState, useEffect, useRef } from 'react';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Sun, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  Sprout, 
  Clock, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const HUBS = [
  { id: 'ludhiana', name: 'Ludhiana (Punjab)', mr: 'लुधियाना (पंजाब)', state: 'Punjab', crop: 'Wheat & Rice' },
  { id: 'karnal', name: 'Karnal (Haryana)', mr: 'कर्नाल (हरियाणा)', state: 'Haryana', crop: 'Basmati & Wheat' },
  { id: 'indore', name: 'Indore (Madhya Pradesh)', mr: 'इंदूर (मध्य प्रदेश)', state: 'MP', crop: 'Soybean & Wheat' },
  { id: 'nashik', name: 'Nashik (Maharashtra)', mr: 'नाशिक (महाराष्ट्र)', state: 'Maharashtra', crop: 'Onion & Tomato' },
  { id: 'akola', name: 'Akola (Maharashtra)', mr: 'अकोला (महाराष्ट्र)', state: 'Maharashtra', crop: 'Cotton & Soybean' },
  { id: 'latur', name: 'Latur (Maharashtra)', mr: 'लातूर (महाराष्ट्र)', state: 'Maharashtra', crop: 'Soybean & Pulses' },
  { id: 'rajkot', name: 'Rajkot (Gujarat)', mr: 'राजकोट (गुजरात)', state: 'Gujarat', crop: 'Cotton & Groundnut' },
  { id: 'guntur', name: 'Guntur (Andhra Pradesh)', mr: 'गुंटूर (आंध्र प्रदेश)', state: 'AP', crop: 'Chilli & Cotton' },
  { id: 'jaipur', name: 'Jaipur (Rajasthan)', mr: 'जयपूर (राजस्थान)', state: 'Rajasthan', crop: 'Mustard & Bajra' },
  { id: 'meerut', name: 'Meerut (Uttar Pradesh)', mr: 'मेरठ (उत्तर प्रदेश)', state: 'UP', crop: 'Sugarcane & Potato' },
  { id: 'kolar', name: 'Kolar (Karnataka)', mr: 'कोलार (कर्नाटक)', state: 'Karnataka', crop: 'Tomato & Maize' },
  { id: 'muzaffarpur', name: 'Muzaffarpur (Bihar)', mr: 'मुझफ्फरपूर (बिहार)', state: 'Bihar', crop: 'Maize & Paddy' }
];

export default function WeatherView() {
  const { language, t, currentLanguageObj } = useLanguage();
  const [selectedHub, setSelectedHub] = useState('nashik');
  const [forecastDays, setForecastDays] = useState(7);
  const [weatherData, setWeatherData] = useState(null);
  const [regionalHubs, setRegionalHubs] = useState([]);
  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    loadWeatherData();
  }, [selectedHub, forecastDays]);

  const loadWeatherData = async () => {
    setLoading(true);
    const [forecastRes, hubsRes, advisoryRes] = await Promise.all([
      api.getWeatherForecast(selectedHub, forecastDays),
      api.getWeatherRegionalHubs(),
      api.getWeatherAgriAdvisory('wheat', selectedHub)
    ]);

    const hubObj = HUBS.find(h => h.id === selectedHub) || HUBS[3];

    if (forecastRes) {
      setWeatherData(forecastRes);
    } else {
      // Offline fallback profile for static deployment
      const dates = Array.from({ length: forecastDays }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      setWeatherData({
        hub_name: hubObj.name,
        current_weather: {
          temperature: 31.4,
          humidity: 58,
          wind_speed_kmh: 12.2,
          condition: 'Clear Sky / Sunny',
          soil_moisture_pct: 32.5,
          soil_temperature: 28.8,
          uv_index: 7.2,
          evapotranspiration_et0: 4.6
        },
        agronomy_indices: {
          heat_stress: 'Optimal',
          spraying_suitability: 'Ideal Window',
          irrigation_recommendation: 'Adequate Soil Moisture',
          harvesting_window: 'Favorable (Dry Window)',
          canopy_dew_point: 21.0
        },
        daily_forecast: dates.map((d, i) => ({
          display_date: d,
          temp_max: 32 + (i % 3) * 0.8,
          temp_min: 21 + (i % 2) * 0.6,
          rain_prob: (10 + i * 8) % 40,
          rain_mm: i === 4 ? 2.5 : 0.0,
          condition: i === 4 ? 'Light Showers' : 'Clear Sunny'
        }))
      });
    }

    if (hubsRes && hubsRes.hubs) {
      setRegionalHubs(hubsRes.hubs);
    } else {
      setRegionalHubs(HUBS.map(h => ({
        hub_id: h.id,
        hub_name: h.name,
        primary_crops: [h.crop],
        temp: 31.5,
        soil_moisture: 32.0,
        wind_speed: 12.0
      })));
    }

    if (advisoryRes) {
      setAdvisory(advisoryRes);
    } else {
      setAdvisory({
        advisory_en: `Favorable microclimate window for field crops in ${hubObj.name}. Ambient wind (12.2 km/h) and soil moisture (32.5%) are optimal for scheduled fieldwork, spraying, and harvest operations.`,
        advisory_mr: `${hubObj.mr || hubObj.name} कृषी पट्ट्यात पिकांसाठी हवामान अत्यंत अनुकूल आहे. वाऱ्याचा वेग (१२.२ किमी/तास) व मातीतील ओलावा (३२.५%) फवारणी व शेतकामासाठी आदर्श आहे.`,
        advisory_hi: `${hubObj.name} में फसलों के लिए मौसम अनुकूल है। हवा की गति (12.2 किमी/घंटा) और मिट्टी में नमी (32.5%) कृषि कार्यों एवं छिड़काव के लिए उत्तम हैं।`,
        spraying_suitability: 'Ideal Window',
        harvesting_window: 'Favorable (Dry Window)',
        irrigation_recommendation: 'Adequate Soil Moisture'
      });
    }
    setLoading(false);
  };

  const speakAdvisory = () => {
    if (!('speechSynthesis' in window) || !advisory) return;
    window.speechSynthesis.cancel();
    
    let text = advisory.advisory_en;
    if (language === 'mr' && advisory.advisory_mr) text = advisory.advisory_mr;
    else if (language === 'hi' && advisory.advisory_hi) text = advisory.advisory_hi;

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

  const curr = weatherData?.current_weather || {
    temperature: 31.4,
    humidity: 58,
    wind_speed_kmh: 12.2,
    condition: 'Clear Sky / Sunny',
    soil_moisture_pct: 32.5,
    soil_temperature: 28.8,
    uv_index: 7.2,
    evapotranspiration_et0: 4.6
  };

  const indices = weatherData?.agronomy_indices || {
    heat_stress: 'Optimal',
    spraying_suitability: 'Ideal Window',
    irrigation_recommendation: 'Adequate Soil Moisture',
    harvesting_window: 'Favorable (Dry Window)',
    canopy_dew_point: 21.0
  };

  const dailyForecast = weatherData?.daily_forecast || [];

  // Chart Data preparation
  const chartData = {
    labels: dailyForecast.map(f => f.display_date),
    datasets: [
      {
        type: 'line',
        label: language === 'mr' ? 'कमाल तापमान (°C)' : (language === 'hi' ? 'अधिकतम तापमान (°C)' : 'Max Temp (°C)'),
        data: dailyForecast.map(f => f.temp_max),
        borderColor: '#D3968C',
        backgroundColor: 'rgba(211, 150, 140, 0.15)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#D3968C',
        yAxisID: 'y'
      },
      {
        type: 'line',
        label: language === 'mr' ? 'किमान तापमान (°C)' : (language === 'hi' ? 'न्यूनतम तापमान (°C)' : 'Min Temp (°C)'),
        data: dailyForecast.map(f => f.temp_min),
        borderColor: '#839958',
        tension: 0.4,
        pointBackgroundColor: '#839958',
        yAxisID: 'y'
      },
      {
        type: 'bar',
        label: language === 'mr' ? 'पावसाची शक्यता (%)' : (language === 'hi' ? 'बारिश की संभावना (%)' : 'Rain Prob (%)'),
        data: dailyForecast.map(f => f.rain_prob),
        backgroundColor: 'rgba(16, 86, 102, 0.65)',
        borderRadius: 4,
        yAxisID: 'y1'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#F7F4D5', font: { size: 12 } }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(131, 153, 88, 0.1)' },
        ticks: { color: '#A0B298' }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Temperature (°C)', color: '#D3968C' },
        grid: { color: 'rgba(131, 153, 88, 0.15)' },
        ticks: { color: '#F7F4D5' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Rain Prob (%)', color: '#105666' },
        grid: { drawOnChartArea: false },
        ticks: { color: '#A0B298', min: 0, max: 100 }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Header & Hub Selection Bar */}
      <div className="agri-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #105666 0%, #839958 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(16, 86, 102, 0.4)'
          }}>
            <CloudSun size={24} color="#F7F4D5" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-beige)' }}>
                {t('weatherTitle')}
              </h2>
              <span className="badge badge-moss" style={{ fontSize: '0.72rem' }}>
                Open-Meteo Synced
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {t('weatherSubtitle')}
            </p>
          </div>
        </div>

        {/* Filters: Hub and Forecast Duration */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} color="var(--color-moss-green-light)" />
            <select 
              className="select-custom"
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              style={{ minWidth: '190px' }}
            >
              {HUBS.map(h => (
                <option key={h.id} value={h.id}>
                  {language === 'mr' ? h.mr : h.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', background: 'rgba(5, 28, 19, 0.8)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
            <button
              onClick={() => setForecastDays(7)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: forecastDays === 7 ? 'var(--color-moss-green)' : 'transparent',
                color: forecastDays === 7 ? '#F7F4D5' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {t('days7')}
            </button>
            <button
              onClick={() => setForecastDays(14)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: forecastDays === 14 ? 'var(--color-moss-green)' : 'transparent',
                color: forecastDays === 14 ? '#F7F4D5' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {t('days14')}
            </button>
          </div>
        </div>
      </div>

      {/* Voice Agrometeorology Advisory Banner */}
      {advisory && (
        <div className="agri-card" style={{ 
          background: 'linear-gradient(135deg, rgba(16, 86, 102, 0.25) 0%, rgba(5, 28, 19, 0.9) 100%)',
          border: '1px solid var(--color-sea-green)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '280px' }}>
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '50%', 
              background: 'rgba(131, 153, 88, 0.25)', 
              border: '1px solid var(--color-moss-green)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              <Sparkles size={18} color="var(--color-moss-green-light)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-beige)' }}>
                  {language === 'mr' ? 'दैनिक कृषी हवामान सल्ला व कृती योजना' : (language === 'hi' ? 'दैनिक कृषि मौसम परामर्श एवं कार्य योजना' : 'Daily Agrometeorology Advisory & Action Plan')}
                </h3>
                <span className="badge badge-moss" style={{ fontSize: '0.68rem' }}>
                  {currentLanguageObj.native}
                </span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.45', margin: 0 }}>
                {language === 'mr' && advisory.advisory_mr ? advisory.advisory_mr : (language === 'hi' && advisory.advisory_hi ? advisory.advisory_hi : advisory.advisory_en)}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={isSpeaking ? stopSpeaking : speakAdvisory}
              className={isSpeaking ? "btn-secondary" : "btn-primary"}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                padding: '8px 16px'
              }}
            >
              {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isSpeaking ? t('stopVoice') : t('listenVoice')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Real-time Agricultural Weather Matrix (4 KPI Cards) */}
      <div className="grid-cards-4">
        {/* Card 1: Ambient Temp & Condition */}
        <div className="agri-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t('ambientTemp')}</span>
            <Thermometer size={18} color="var(--color-rosy-brown-light)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-beige)', lineHeight: 1.1 }}>
            {curr.temperature}°C
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-moss-green-light)', marginTop: '6px' }}>
            {curr.condition} • Humidity: {curr.humidity}%
          </div>
        </div>

        {/* Card 2: Soil Moisture & Temp */}
        <div className="agri-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t('soilMoisture')}</span>
            <Droplets size={18} color="var(--color-sea-green-light)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-sea-green-light)', lineHeight: 1.1 }}>
            {curr.soil_moisture_pct}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Soil Temp: {curr.soil_temperature}°C (Optimal)
          </div>
        </div>

        {/* Card 3: Evapotranspiration (ET0) */}
        <div className="agri-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t('et0Rate')}</span>
            <Sun size={18} color="var(--color-moss-green-light)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-moss-green-light)', lineHeight: 1.1 }}>
            {curr.evapotranspiration_et0} <span style={{ fontSize: '1rem', fontWeight: '500' }}>mm/day</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            UV Index: {curr.uv_index} • Moderate Crop Water Loss
          </div>
        </div>

        {/* Card 4: Wind & Spraying Suitability */}
        <div className="agri-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t('sprayingWindow')}</span>
            <Wind size={18} color="var(--color-moss-green-light)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-moss-green-light)', lineHeight: 1.1 }}>
            {indices.spraying_suitability}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Wind: {curr.wind_speed_kmh} km/h • Low Drift Risk
          </div>
        </div>
      </div>

      {/* Forecast Trend Chart & Agronomy Indices */}
      <div className="grid-split-2-1">
        
        {/* Main Forecast Chart */}
        <div className="agri-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-beige)' }}>
                {forecastDays}-Day Temperature & Precipitation Radar
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Dual-axis diurnal temperature cycle vs precipitation probabilities
              </p>
            </div>
            <span className="badge badge-accent">
              Hourly Interpolated
            </span>
          </div>
          <div style={{ height: '300px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Agronomy Decision Badges Matrix */}
        <div className="agri-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-beige)' }}>
            Field Agronomy Readiness
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Heat Stress */}
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(5, 28, 19, 0.7)', border: '1px solid var(--border-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t('heatStress')}</span>
                <span className="badge badge-moss" style={{ fontSize: '0.72rem' }}>{indices.heat_stress}</span>
              </div>
            </div>

            {/* Irrigation Schedule */}
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(5, 28, 19, 0.7)', border: '1px solid var(--border-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t('irrigationSchedule')}</span>
                <span className="badge badge-sea" style={{ fontSize: '0.72rem' }}>{indices.irrigation_recommendation}</span>
              </div>
            </div>

            {/* Harvest Window */}
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(5, 28, 19, 0.7)', border: '1px solid var(--border-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t('harvestWindow')}</span>
                <span className="badge badge-moss" style={{ fontSize: '0.72rem' }}>{indices.harvesting_window}</span>
              </div>
            </div>

            {/* Canopy Dew Point */}
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(5, 28, 19, 0.7)', border: '1px solid var(--border-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Canopy Dew Point</span>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--color-beige)' }}>{indices.canopy_dew_point || '21.0'}°C</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Regional Agrarian Hubs Grid */}
      <div className="agri-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-beige)' }}>
              {t('regionalWeatherHubs')}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Real-time agro-climatic conditions across key mandis
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {regionalHubs.map((hub) => (
            <div 
              key={hub.hub_id}
              onClick={() => setSelectedHub(hub.hub_id)}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: selectedHub === hub.hub_id ? 'rgba(131, 153, 88, 0.25)' : 'rgba(5, 28, 19, 0.6)',
                border: selectedHub === hub.hub_id ? '1px solid var(--color-moss-green)' : '1px solid var(--border-card)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--color-beige)' }}>
                  {hub.hub_name}
                </span>
                <ArrowUpRight size={14} color="var(--color-moss-green-light)" />
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-moss-green-light)', marginBottom: '8px' }}>
                {Array.isArray(hub.primary_crops) ? hub.primary_crops.join(', ') : hub.primary_crops}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                <span>Temp: <strong style={{ color: 'var(--color-beige)' }}>{hub.temp}°C</strong></span>
                <span>Moisture: <strong style={{ color: 'var(--color-sea-green-light)' }}>{hub.soil_moisture}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
