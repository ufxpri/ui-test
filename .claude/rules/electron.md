---
paths: electron/**/*.js
---

# Electron Development Rules

## Security Standards (CRITICAL)

### BrowserWindow Configuration
Always use these security settings when creating windows:

```javascript
const win = new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,        // REQUIRED - Isolates preload context
    nodeIntegration: false,         // REQUIRED - Prevents Node.js in renderer
    enableRemoteModule: false,      // REQUIRED - Disables deprecated remote
    sandbox: true,                  // RECOMMENDED - Enables Chromium sandbox
  }
});
```

**Never allow**:
- `nodeIntegration: true` - Security vulnerability
- `contextIsolation: false` - Breaks security boundary
- `webSecurity: false` - Disables same-origin policy
- Direct Node.js access from renderer process

### Current Project Settings
Reference: `electron/main.js:9-13`
- Window size: 1200x800
- Auto-hide menu bar: true
- Preload script: `electron/preload.js`

## IPC Communication Pattern

### Main Process (electron/main.js)
When implementing IPC handlers:

```javascript
const { ipcMain } = require('electron');

// Handle IPC requests
ipcMain.handle('channel-name', async (event, arg) => {
  // Validate input
  if (typeof arg !== 'expected-type') {
    throw new Error('Invalid argument');
  }

  // Process and return
  return result;
});

// One-way messages
ipcMain.on('channel-name', (event, arg) => {
  // Handle event
});
```

**Always**:
- Validate all IPC message inputs
- Use `ipcMain.handle` for request-response patterns
- Use `ipcMain.on` for one-way messages
- Sanitize data before processing

### Preload Script (electron/preload.js)
Expose safe APIs to renderer using `contextBridge`:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Expose specific functions only
  getCameraList: () => ipcRenderer.invoke('get-camera-list'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  // Event listeners
  onAlertReceived: (callback) => {
    ipcRenderer.on('alert-received', (event, data) => callback(data));
  }
});
```

**Never**:
- Expose entire `ipcRenderer` to renderer
- Expose Node.js modules directly
- Allow arbitrary channel names from renderer

### Renderer Process (React Components)
Access IPC through exposed API:

```javascript
// In React component
const handleSave = async () => {
  const result = await window.api.saveSettings(settings);
};

useEffect(() => {
  window.api.onAlertReceived((data) => {
    // Handle alert
  });
}, []);
```

## Development vs Production

### URL Loading
```javascript
// Current: Development only
win.loadURL('http://localhost:5173');

// Production: Load built files
if (process.env.NODE_ENV === 'production') {
  win.loadFile(path.join(__dirname, '../dist/index.html'));
} else {
  win.loadURL('http://localhost:5173');
}
```

### DevTools
```javascript
// Development: Enable DevTools
if (process.env.NODE_ENV === 'development') {
  win.webContents.openDevTools();
}

// Production: Never enable DevTools by default
```

## Application Lifecycle

### Window Management
Follow the current pattern in `electron/main.js`:

```javascript
// Create window when ready
app.whenReady().then(createWindow);

// Quit when all windows closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Re-create window on macOS when dock icon clicked
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
```

### Cleanup
Always clean up resources:
```javascript
app.on('before-quit', () => {
  // Close database connections
  // Save state
  // Clean up temp files
});
```

## File System Access

### Safe Path Handling
```javascript
const path = require('path');

// Always use path.join for cross-platform compatibility
const filePath = path.join(__dirname, 'relative', 'path', 'file.txt');

// Validate paths before accessing
if (!filePath.startsWith(app.getPath('userData'))) {
  throw new Error('Invalid path');
}
```

### User Data Directory
```javascript
const userDataPath = app.getPath('userData');
// Use for: settings, logs, cache, database
```

## Error Handling

### Main Process Errors
```javascript
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log to file
  // Show error dialog
  // Graceful shutdown if needed
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log to file
});
```

### Window Errors
```javascript
win.webContents.on('crashed', () => {
  // Handle renderer crash
  // Reload or recreate window
});

win.on('unresponsive', () => {
  // Handle frozen renderer
  // Show dialog to wait or kill
});
```

## CCTV-Specific Considerations

### Video Stream Handling
When implementing RTSP/camera streams:
```javascript
// Consider using native modules or child processes
// Never trust camera feed URLs from renderer
ipcMain.handle('add-camera', async (event, cameraUrl) => {
  // Validate URL format
  if (!isValidCameraUrl(cameraUrl)) {
    throw new Error('Invalid camera URL');
  }

  // Validate against whitelist if needed
  // Store in secure location
  return saveCameraConfig(cameraUrl);
});
```

### Performance for Multiple Streams
- Use hardware acceleration when available
- Limit concurrent video decoding
- Implement lazy loading for off-screen cameras
- Monitor memory usage with `process.memoryUsage()`

## Build and Packaging

### Electron Builder Configuration (Future)
When adding electron-builder:
```json
{
  "build": {
    "appId": "com.yourcompany.cctv-monitor",
    "productName": "CCTV Monitor",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "electron/**/*",
      "dist/**/*"
    ],
    "win": {
      "target": "nsis"
    }
  }
}
```

## Testing Electron Code

### Main Process Tests
- Use `spectron` or `playwright-electron` for E2E tests
- Test IPC handlers independently
- Mock file system operations

### Security Checklist
Before any release:
- [ ] `contextIsolation: true`
- [ ] `nodeIntegration: false`
- [ ] All IPC handlers validate inputs
- [ ] No arbitrary code execution from renderer
- [ ] File paths are sanitized
- [ ] DevTools disabled in production
- [ ] CSP headers set if loading remote content
