/**
 * REST API Client for CCTV Backend
 *
 * This module provides a clean interface to the FastAPI backend.
 * All API calls follow the OpenAPI specification in api-schema/openapi.yaml
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Make HTTP request to backend API
 * @param {string} endpoint - API endpoint (e.g., '/cameras')
 * @param {object} options - Fetch options
 * @returns {Promise<object>} Response data
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API Request failed [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Camera API Client
 */
const cameraAPI = {
  /**
   * Get all cameras
   * @returns {Promise<{success: boolean, data: Array}>}
   */
  async getAll() {
    return apiRequest('/cameras');
  },

  /**
   * Get camera by ID
   * @param {number} id - Camera ID
   */
  async getById(id) {
    return apiRequest(`/cameras/${id}`);
  },

  /**
   * Create new camera
   * @param {object} camera - Camera data
   */
  async create(camera) {
    return apiRequest('/cameras', {
      method: 'POST',
      body: JSON.stringify(camera),
    });
  },

  /**
   * Update camera
   * @param {number} id - Camera ID
   * @param {object} camera - Updated camera data
   */
  async update(id, camera) {
    return apiRequest(`/cameras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(camera),
    });
  },

  /**
   * Delete camera
   * @param {number} id - Camera ID
   */
  async delete(id) {
    return apiRequest(`/cameras/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Update camera status
   * @param {number} id - Camera ID
   * @param {string} status - New status (active, inactive, error, connecting)
   */
  async updateStatus(id, status) {
    return apiRequest(`/cameras/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Reorder cameras (for drag-and-drop)
   * @param {number[]} cameraIds - Ordered array of camera IDs
   */
  async reorder(cameraIds) {
    return apiRequest('/cameras/reorder', {
      method: 'POST',
      body: JSON.stringify({ cameraIds }),
    });
  },
};

/**
 * Alert API Client
 */
const alertAPI = {
  /**
   * Get alerts with filters
   * @param {object} filters - Query parameters
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    return apiRequest(`/alerts?${params}`);
  },

  /**
   * Get alert by ID
   * @param {string} id - Alert ID
   */
  async getById(id) {
    return apiRequest(`/alerts/${id}`);
  },

  /**
   * Acknowledge alert
   * @param {string} id - Alert ID
   */
  async acknowledge(id) {
    return apiRequest(`/alerts/${id}/acknowledge`, {
      method: 'POST',
    });
  },
};

/**
 * Process Monitoring API Client
 */
const processAPI = {
  /**
   * Get current process status
   */
  async getStatus() {
    return apiRequest('/process/status');
  },

  /**
   * Get process metrics
   * @param {string} timeRange - Time range (1h, 6h, 24h, 7d)
   */
  async getMetrics(timeRange = '1h') {
    return apiRequest(`/process/metrics?timeRange=${timeRange}`);
  },
};

/**
 * Search API Client
 */
const searchAPI = {
  /**
   * Search videos
   * @param {object} params - Search parameters
   */
  async videos(params) {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/search/videos?${searchParams}`);
  },

  /**
   * Search events
   * @param {object} params - Search parameters
   */
  async events(params) {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/search/events?${searchParams}`);
  },
};

/**
 * Settings API Client
 */
const settingsAPI = {
  /**
   * Get system settings
   */
  async get() {
    return apiRequest('/settings');
  },

  /**
   * Update system settings
   * @param {object} settings - Settings object
   */
  async update(settings) {
    return apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

module.exports = {
  cameraAPI,
  alertAPI,
  processAPI,
  searchAPI,
  settingsAPI,
};
