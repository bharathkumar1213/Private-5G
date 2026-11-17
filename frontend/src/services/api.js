const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
      },
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`[API Error] Failed to fetch ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  getOverview: () => fetchJson('/overview'),
  getLiveMetrics: () => fetchJson('/metrics/live'),
  getAlerts: () => fetchJson('/alerts'),
  getSelfHealing: () => fetchJson('/self-healing'),
  getJenkins: () => fetchJson('/jenkins'),
  getSystemDiagnostics: () => fetchJson('/system'),
  getRecoveryHistory: () => fetchJson('/recovery/history'),
  getHealth: () => fetchJson('/health'),
};

