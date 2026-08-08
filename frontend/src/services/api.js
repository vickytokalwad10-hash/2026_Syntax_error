const BASE_URL = 'http://127.0.0.1:8000/api';

export const api = {
  async getOverview(cropId = 'wheat') {
    try {
      const res = await fetch(`${BASE_URL}/overview?crop_id=${cropId}`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, using local fallback for overview');
      return null;
    }
  },

  async getHeatmap() {
    try {
      const res = await fetch(`${BASE_URL}/heatmap`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, using local fallback for heatmap');
      return null;
    }
  },

  async getSimulationPresets() {
    try {
      const res = await fetch(`${BASE_URL}/what-if/presets`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, using local fallback for presets');
      return null;
    }
  },

  async runSimulation(params) {
    try {
      const res = await fetch(`${BASE_URL}/what-if/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, fallback simulation');
      return null;
    }
  },

  async getMarketsOverview() {
    try {
      const res = await fetch(`${BASE_URL}/markets/overview`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, using local fallback for markets');
      return null;
    }
  },

  async optimizeMarkets(params) {
    try {
      const res = await fetch(`${BASE_URL}/markets/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, fallback market optimization');
      return null;
    }
  },

  async getTrends(cropId = 'wheat') {
    try {
      const res = await fetch(`${BASE_URL}/trends?crop_id=${cropId}`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, using local fallback for trends');
      return null;
    }
  },

  async getAlerts() {
    try {
      const res = await fetch(`${BASE_URL}/alerts`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, using local fallback for alerts');
      return null;
    }
  },

  async queryCopilot(query, language = 'en', contextCrop = 'wheat', role = 'all') {
    try {
      const res = await fetch(`${BASE_URL}/copilot/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language, context_crop: contextCrop, role }),
      });
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, fallback copilot response');
      return null;
    }
  },

  async getCropHealth(parcelId = 'parcel-north-ludhiana-01') {
    try {
      const res = await fetch(`${BASE_URL}/crop-health?parcel_id=${parcelId}`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, using local fallback for crop health');
      return null;
    }
  },

  async getDirectListings() {
    try {
      const res = await fetch(`${BASE_URL}/direct-trade/listings`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, fallback direct listings');
      return null;
    }
  },

  async getBuyerDemands() {
    try {
      const res = await fetch(`${BASE_URL}/direct-trade/buyers`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, fallback buyer demands');
      return null;
    }
  },

  async createDirectListing(listingData) {
    try {
      const res = await fetch(`${BASE_URL}/direct-trade/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData),
      });
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, fallback direct list');
      return null;
    }
  },

  async calculateDirectMargin(cropId = 'wheat', lotSize = 100, directPrice = 2880) {
    try {
      const res = await fetch(`${BASE_URL}/direct-trade/margin-calculator?crop_id=${cropId}&lot_size=${lotSize}&direct_price=${directPrice}`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, fallback margin calculation');
      return null;
    }
  },

  async createDealContract(dealData) {
    try {
      const res = await fetch(`${BASE_URL}/direct-trade/deal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealData),
      });
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, fallback deal creation');
      return null;
    }
  },

  async getWeatherForecast(hub = 'ludhiana', days = 7) {
    try {
      const res = await fetch(`${BASE_URL}/weather/forecast?hub=${hub}&days=${days}`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, fallback weather forecast');
      return null;
    }
  },

  async getWeatherRegionalHubs() {
    try {
      const res = await fetch(`${BASE_URL}/weather/regional-hubs`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, fallback regional hubs');
      return null;
    }
  },

  async getWeatherAgriAdvisory(crop = 'wheat', hub = 'ludhiana') {
    try {
      const res = await fetch(`${BASE_URL}/weather/agri-advisory?crop=${crop}&hub=${hub}`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, fallback agri advisory');
      return null;
    }
  },

  async checkHealth() {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }
};
