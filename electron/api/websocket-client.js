/**
 * WebSocket Client for Real-time Events
 *
 * Manages WebSocket connection to backend for real-time updates:
 * - alert.new: New alerts
 * - process.status_changed: Process status updates
 * - camera.status_changed: Camera status changes
 */

const WebSocket = require('ws');

const WS_URL = process.env.WS_URL || 'ws://localhost:8000/ws/events';
const RECONNECT_INTERVAL = 5000; // 5 seconds
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.eventHandlers = new Map();
    this.isManualClose = false;
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      console.log('⚠️ WebSocket already connected or connecting');
      return;
    }

    console.log('🔌 Connecting to WebSocket:', WS_URL);
    this.isManualClose = false;

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.on('open', () => {
        console.log('✅ WebSocket connected');
        this.startHeartbeat();
        this.emit('connected', null);
      });

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      });

      this.ws.on('close', (code, reason) => {
        console.log(`🔌 WebSocket closed: ${code} ${reason}`);
        this.stopHeartbeat();

        // Attempt to reconnect unless manually closed
        if (!this.isManualClose) {
          this.scheduleReconnect();
        }
      });

      this.ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message);
        this.emit('error', error);
      });
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    console.log('🔌 Disconnecting WebSocket');
    this.isManualClose = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    if (this.reconnectTimer) {
      return;
    }

    console.log(`⏱️ Scheduling reconnect in ${RECONNECT_INTERVAL}ms`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, RECONNECT_INTERVAL);
  }

  /**
   * Start heartbeat (ping/pong)
   */
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
    }, HEARTBEAT_INTERVAL);
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Handle incoming WebSocket message
   * @param {object} message - Parsed message
   */
  handleMessage(message) {
    const { type, data } = message;

    if (type === 'pong') {
      // Heartbeat response
      return;
    }

    console.log('📨 WebSocket message:', type);

    // Emit to registered handlers
    this.emit(type, data);
  }

  /**
   * Register event handler
   * @param {string} eventType - Event type (e.g., 'alert.new')
   * @param {function} handler - Handler function
   */
  on(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType).push(handler);
  }

  /**
   * Unregister event handler
   * @param {string} eventType - Event type
   * @param {function} handler - Handler function
   */
  off(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      return;
    }

    const handlers = this.eventHandlers.get(eventType);
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Emit event to registered handlers
   * @param {string} eventType - Event type
   * @param {any} data - Event data
   */
  emit(eventType, data) {
    if (!this.eventHandlers.has(eventType)) {
      return;
    }

    const handlers = this.eventHandlers.get(eventType);
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`❌ Error in handler for ${eventType}:`, error);
      }
    });
  }

  /**
   * Get connection status
   * @returns {boolean} True if connected
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let instance = null;

/**
 * Get WebSocket client instance
 * @returns {WebSocketClient}
 */
function getWebSocketClient() {
  if (!instance) {
    instance = new WebSocketClient();
  }
  return instance;
}

module.exports = {
  getWebSocketClient,
  WebSocketClient,
};
