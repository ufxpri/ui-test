// electron/preload.js - Electron Preload 스크립트 (보안)
const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose backend API to renderer process
 *
 * This API follows the OpenAPI specification defined in api-schema/openapi.yaml
 * All calls go through Electron IPC to the main process, which then calls the FastAPI backend
 */
contextBridge.exposeInMainWorld('api', {
  // ==================== Camera API ====================
  cameras: {
    /**
     * Get all cameras
     * @returns {Promise<{success: boolean, data: Array}>}
     */
    getAll: () => ipcRenderer.invoke('api:cameras:getAll'),

    /**
     * Get camera by ID
     * @param {number} id - Camera ID
     */
    getById: (id) => ipcRenderer.invoke('api:cameras:getById', id),

    /**
     * Create new camera
     * @param {object} camera - Camera data {title, src, location, description}
     */
    create: (camera) => ipcRenderer.invoke('api:cameras:create', camera),

    /**
     * Update camera
     * @param {number} id - Camera ID
     * @param {object} camera - Updated camera data
     */
    update: (id, camera) => ipcRenderer.invoke('api:cameras:update', id, camera),

    /**
     * Delete camera
     * @param {number} id - Camera ID
     */
    delete: (id) => ipcRenderer.invoke('api:cameras:delete', id),

    /**
     * Update camera status
     * @param {number} id - Camera ID
     * @param {string} status - Status (active, inactive, error, connecting)
     */
    updateStatus: (id, status) => ipcRenderer.invoke('api:cameras:updateStatus', id, status),

    /**
     * Reorder cameras (for drag-and-drop)
     * @param {number[]} cameraIds - Ordered array of camera IDs
     */
    reorder: (cameraIds) => ipcRenderer.invoke('api:cameras:reorder', cameraIds),
  },

  // ==================== Alert API ====================
  alerts: {
    /**
     * Get alerts with filters
     * @param {object} filters - Query filters {limit, offset, severity, cameraId, startTime, endTime}
     */
    getAll: (filters) => ipcRenderer.invoke('api:alerts:getAll', filters),

    /**
     * Get alert by ID
     * @param {string} id - Alert ID
     */
    getById: (id) => ipcRenderer.invoke('api:alerts:getById', id),

    /**
     * Acknowledge alert
     * @param {string} id - Alert ID
     */
    acknowledge: (id) => ipcRenderer.invoke('api:alerts:acknowledge', id),
  },

  // ==================== Process Monitor API ====================
  process: {
    /**
     * Get current process status
     */
    getStatus: () => ipcRenderer.invoke('api:process:getStatus'),

    /**
     * Get process metrics
     * @param {string} timeRange - Time range (1h, 6h, 24h, 7d)
     */
    getMetrics: (timeRange) => ipcRenderer.invoke('api:process:getMetrics', timeRange),
  },

  // ==================== Search API ====================
  search: {
    /**
     * Search videos
     * @param {object} params - Search parameters {query, cameraIds, startTime, endTime, limit}
     */
    videos: (params) => ipcRenderer.invoke('api:search:videos', params),

    /**
     * Search events
     * @param {object} params - Search parameters {eventType, cameraIds, startTime, endTime}
     */
    events: (params) => ipcRenderer.invoke('api:search:events', params),
  },

  // ==================== Settings API ====================
  settings: {
    /**
     * Get system settings
     */
    get: () => ipcRenderer.invoke('api:settings:get'),

    /**
     * Update system settings
     * @param {object} settings - Settings object
     */
    update: (settings) => ipcRenderer.invoke('api:settings:update', settings),
  },

  // ==================== WebSocket Events ====================
  /**
   * Subscribe to WebSocket events from backend
   */
  events: {
    /**
     * Listen for new alerts
     * @param {function} callback - Callback function(alertData)
     */
    onAlertNew: (callback) => {
      ipcRenderer.on('ws:alert.new', (event, data) => callback(data));
    },

    /**
     * Listen for process status changes
     * @param {function} callback - Callback function(processData)
     */
    onProcessStatusChanged: (callback) => {
      ipcRenderer.on('ws:process.status_changed', (event, data) => callback(data));
    },

    /**
     * Listen for camera status changes
     * @param {function} callback - Callback function({cameraId, status, message})
     */
    onCameraStatusChanged: (callback) => {
      ipcRenderer.on('ws:camera.status_changed', (event, data) => callback(data));
    },

    /**
     * Remove event listeners
     */
    removeAllListeners: (channel) => {
      ipcRenderer.removeAllListeners(channel);
    },
  },
});
