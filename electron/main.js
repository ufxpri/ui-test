// electron/main.js - Electron 메인 프로세스 (Vite + React)
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { cameraAPI, alertAPI, processAPI, searchAPI, settingsAPI } = require('./api/rest-client');
const { getWebSocketClient } = require('./api/websocket-client');

let mainWindow = null;
let wsClient = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
  });
  // Vite 개발 서버 주소
  mainWindow.loadURL('http://localhost:5173');
}

// Initialize when app is ready
app.whenReady().then(() => {
  setupIpcHandlers();
  setupWebSocket();
  createWindow();
});

app.on('window-all-closed', () => {
  // Disconnect WebSocket
  if (wsClient) {
    wsClient.disconnect();
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Setup WebSocket connection and forward events to renderer
function setupWebSocket() {
  wsClient = getWebSocketClient();
  wsClient.connect();

  // Forward WebSocket events to renderer process
  wsClient.on('alert.new', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('ws:alert.new', data);
    }
  });

  wsClient.on('process.status_changed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('ws:process.status_changed', data);
    }
  });

  wsClient.on('camera.status_changed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('ws:camera.status_changed', data);
    }
  });
}

// Setup IPC handlers for backend API calls
function setupIpcHandlers() {
  // ==================== Camera API ====================
  ipcMain.handle('api:cameras:getAll', async () => {
    try {
      return await cameraAPI.getAll();
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('api:cameras:getById', async (event, id) => {
    try {
      return await cameraAPI.getById(id);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('api:cameras:create', async (event, camera) => {
    try {
      return await cameraAPI.create(camera);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('api:cameras:update', async (event, id, camera) => {
    try {
      return await cameraAPI.update(id, camera);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('api:cameras:delete', async (event, id) => {
    try {
      return await cameraAPI.delete(id);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('api:cameras:updateStatus', async (event, id, status) => {
    try {
      return await cameraAPI.updateStatus(id, status);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('api:cameras:reorder', async (event, cameraIds) => {
    try {
      return await cameraAPI.reorder(cameraIds);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ==================== Alert API ====================
  ipcMain.handle('api:alerts:getAll', async (event, filters) => {
    try {
      return await alertAPI.getAll(filters);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('api:alerts:getById', async (event, id) => {
    try {
      return await alertAPI.getById(id);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('api:alerts:acknowledge', async (event, id) => {
    try {
      return await alertAPI.acknowledge(id);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ==================== Process Monitor API ====================
  ipcMain.handle('api:process:getStatus', async () => {
    try {
      return await processAPI.getStatus();
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('api:process:getMetrics', async (event, timeRange) => {
    try {
      return await processAPI.getMetrics(timeRange);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ==================== Search API ====================
  ipcMain.handle('api:search:videos', async (event, params) => {
    try {
      return await searchAPI.videos(params);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('api:search:events', async (event, params) => {
    try {
      return await searchAPI.events(params);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ==================== Settings API ====================
  ipcMain.handle('api:settings:get', async () => {
    try {
      return await settingsAPI.get();
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('api:settings:update', async (event, settings) => {
    try {
      return await settingsAPI.update(settings);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
