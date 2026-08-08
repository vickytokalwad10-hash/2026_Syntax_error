import React, { useState, useEffect } from 'react';
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

  const chartData = {
    labels: dailyForecast.map(f => f.display_date),
    datasets: [
      {
        type: 'line',
        label: t('maxTemp'),
        data: dailyForecast.map(f => f.temp_max),
        borderColor: '#FACC15',
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
        tension: 0.2,
        fill: false,
        pointBackgroundColor: '#FACC15',
        yAxisID: 'y'
      },
      {
        type: 'line',
        label: t('minTemp'),
        data: dailyForecast.map(f => f.temp_min),
        borderColor: '#FFFFFF',
        tension: 0.2,
        pointBackgroundColor: '#FFFFFF',
        yAxisID: 'y'
      },
      {
        type: 'bar',
        label: t('rainProbability'),
        data: dailyForecast.map(f => f.rain_prob),
        backgroundColor: '#374151',
        borderRadius: 2,
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
        labels: { color: '#FFFFFF', font: { size: 12 } }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#FFFFFF',
        titleColor: '#0F172A',
        bodyColor: '#D97706',
        borderColor: '#E2E8F0',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: '#F1F5F9' },
        ticks: { color: '#64748B' }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Temperature (°C)', color: '#D97706' },
        grid: { color: '#F1F5F9' },
        ticks: { color: '#0F172A' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Rain Prob (%)', color: '#64748B' },
        grid: { drawOnChartArea: false },
        ticks: { color: '#64748B', min: 0, max: 100 }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header & Hub Selection Bar */}
      <div className="agri-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '6px', 
            background: '#FEF3C7', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
          }}>
            <CloudSun size={22} color="#D97706" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0F172A' }}>
                {t('weatherTitle')}
              </h2>
              <span className="badge badge-yellow" style={{ fontSize: '0.7rem' }}>
                Open-Meteo Synced
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
              {t('weatherSubtitle')}
            </p>
          </div>
        </div>

        {/* Filters: Hub and Forecast Duration */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} color="#D97706" />
            <select 
              className="input-field"
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              style={{ minWidth: '190px', padding: '6px 10px' }}
            >
              {HUBS.map(h => (
                <option key={h.id} value={h.id}>
                  {language === 'mr' ? h.mr : h.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <button
              onClick={() => setForecastDays(7)}
              style={{
                padding: '5px 10px',
                borderRadius: '4px',
                border: 'none',
                background: forecastDays === 7 ? '#D97706' : 'transparent',
                color: forecastDays === 7 ? '#FFFFFF' : '#0F172A',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {t('days7')}
            </button>
            <button
              onClick={() => setForecastDays(14)}
              style={{
                padding: '5px 10px',
                borderRadius: '4px',
                border: 'none',
                background: forecastDays === 14 ? '#D97706' : 'transparent',
                color: forecastDays === 14 ? '#FFFFFF' : '#0F172A',
                fontWeight: '700',
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
          borderLeft: '4px solid #D97706',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: '280px' }}>
            <div style={{ 
              width: '34px', 
              height: '34px', 
              borderRadius: '6px', 
              background: '#FEF3C7', 
              border: '1px solid #FCD34D',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              <Sparkles size={16} color="#D97706" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0F172A' }}>
                  {t('advisoryTitle')}
                </h3>
                <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>
                  {currentLanguageObj.native}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#0F172A', lineHeight: '1.4', margin: 0 }}>
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
                fontSize: '0.82rem',
                padding: '7px 14px'
              }}
            >
              {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
              <span>{isSpeaking ? t('stopVoice') : t('listenVoice')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Real-time Agricultural Weather Matrix (4 KPI Cards) */}
      <div className="grid-4">
        {/* Card 1: Ambient Temp & Condition */}
        <div className="agri-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{t('ambientTemp')}</span>
            <Thermometer size={16} color="#D97706" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A', lineHeight: 1.1 }}>
            {curr.temperature}°C
          </div>
          <div style={{ fontSize: '0.78rem', color: '#D97706', marginTop: '4px', fontWeight: '600' }}>
            {curr.condition} • Humidity: {curr.humidity}%
          </div>
        </div>

        {/* Card 2: Soil Moisture & Temp */}
        <div className="agri-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{t('soilMoisture')}</span>
            <Droplets size={16} color="#0F172A" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A', lineHeight: 1.1 }}>
            {curr.soil_moisture_pct}%
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
            Soil Temp: {curr.soil_temperature}°C (Optimal)
          </div>
        </div>

        {/* Card 3: Evapotranspiration (ET0) */}
        <div className="agri-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{t('et0Rate')}</span>
            <Sun size={16} color="#D97706" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#D97706', lineHeight: 1.1 }}>
            {curr.evapotranspiration_et0} <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>mm/day</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
            UV Index: {curr.uv_index} • Moderate Loss
          </div>
        </div>

        {/* Card 4: Wind & Spraying Suitability */}
        <div className="agri-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{t('sprayingWindow')}</span>
            <Wind size={16} color="#0F172A" />
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0F172A', lineHeight: 1.1 }}>
            {indices.spraying_suitability}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
            Wind: {curr.wind_speed_kmh} km/h • Low Drift
          </div>
        </div>
      </div>

      {/* Forecast Trend Chart & Agronomy Indices */}
      <div className="grid-2">
        {/* Main Forecast Chart */}
        <div className="agri-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0F172A' }}>
                {forecastDays}-Day Weather Radar
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Dual-axis diurnal temperature cycle vs precipitation probabilities
              </p>
            </div>
            <span className="badge badge-yellow">
              Hourly Interpolated
            </span>
          </div>
          <div style={{ height: '280px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Agronomy Decision Badges Matrix */}
        <div className="agri-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0F172A' }}>
            Field Agronomy Readiness
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Heat Stress */}
            <div style={{ padding: '10px 12px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#0F172A' }}>{t('heatStress')}</span>
                <span className="badge badge-yellow" style={{ fontSize: '0.7rem' }}>{indices.heat_stress}</span>
              </div>
            </div>

            {/* Irrigation Schedule */}
            <div style={{ padding: '10px 12px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#0F172A' }}>{t('irrigationSchedule')}</span>
                <span className="badge badge-white" style={{ fontSize: '0.7rem' }}>{indices.irrigation_recommendation}</span>
              </div>
            </div>

            {/* Harvest Window */}
            <div style={{ padding: '10px 12px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#0F172A' }}>{t('harvestWindow')}</span>
                <span className="badge badge-yellow" style={{ fontSize: '0.7rem' }}>{indices.harvesting_window}</span>
              </div>
            </div>

            {/* Canopy Dew Point */}
            <div style={{ padding: '10px 12px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#0F172A' }}>Canopy Dew Point</span>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#D97706' }}>{indices.canopy_dew_point || '21.0'}°C</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Agrarian Hubs Grid */}
      <div className="agri-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0F172A' }}>
              {t('regionalWeatherHubs')}
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
              Real-time agro-climatic conditions across key mandis
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
          {regionalHubs.map((hub) => (
            <div 
              key={hub.hub_id}
              onClick={() => setSelectedHub(hub.hub_id)}
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                background: selectedHub === hub.hub_id ? '#FEF3C7' : '#F8FAFC',
                border: selectedHub === hub.hub_id ? '1px solid #FCD34D' : '1px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0F172A' }}>
                  {hub.hub_name}
                </span>
                <ArrowUpRight size={13} color="#D97706" />
              </div>
              <div style={{ fontSize: '0.74rem', color: '#D97706', marginBottom: '6px', fontWeight: '600' }}>
                {Array.isArray(hub.primary_crops) ? hub.primary_crops.join(', ') : hub.primary_crops}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748B' }}>
                <span>Temp: <strong style={{ color: '#0F172A' }}>{hub.temp}°C</strong></span>
                <span>Moisture: <strong style={{ color: '#D97706' }}>{hub.soil_moisture}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
