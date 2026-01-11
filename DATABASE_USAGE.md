# SQLite Database Usage Guide

This guide explains how to use the SQLite database in your Electron + React application.

## Overview

The application now uses SQLite to persist data locally. The database is stored in your app's user data directory and includes tables for:
- **cameras**: CCTV camera configurations
- **alerts**: Alert notifications from cameras
- **recordings**: Video recording metadata (for future use)

## Database Location

The SQLite database file is stored at:
```
Windows: C:\Users\<username>\AppData\Roaming\electron-react-vite-app\cctv_app.db
macOS: ~/Library/Application Support/electron-react-vite-app/cctv_app.db
Linux: ~/.config/electron-react-vite-app/cctv_app.db
```

## Database Schema

### Cameras Table
```sql
CREATE TABLE cameras (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  src TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Alerts Table
```sql
CREATE TABLE alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  camera_id INTEGER,
  alert_type TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE
)
```

## Usage in React Components

### Method 1: Using the Custom Hook (Recommended)

```javascript
import { useCameras, useAlerts } from '../hooks/useDatabase';

function MyComponent() {
  const cameras = useCameras();
  const [cameraList, setCameraList] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await cameras.getAll();
      setCameraList(data);
    } catch (error) {
      console.error('Error loading cameras:', error);
    }
  };

  const addCamera = async () => {
    try {
      await cameras.create({
        title: 'New Camera',
        src: 'http://example.com/stream.mp4',
        location: 'Front Door',
        status: 'active'
      });
      loadData(); // Reload data
    } catch (error) {
      console.error('Error adding camera:', error);
    }
  };

  const updateCamera = async (id) => {
    try {
      await cameras.update(id, {
        title: 'Updated Camera',
        src: 'http://example.com/stream2.mp4',
        location: 'Back Door',
        status: 'active'
      });
      loadData();
    } catch (error) {
      console.error('Error updating camera:', error);
    }
  };

  const deleteCamera = async (id) => {
    try {
      await cameras.remove(id);
      loadData();
    } catch (error) {
      console.error('Error deleting camera:', error);
    }
  };

  return (
    <div>
      {cameras.loading && <p>Loading...</p>}
      {cameras.error && <p>Error: {cameras.error}</p>}
      {/* Your UI here */}
    </div>
  );
}
```

### Method 2: Direct API Calls

```javascript
function MyComponent() {
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    const result = await window.api.cameras.getAll();
    if (result.success) {
      setCameras(result.data);
    } else {
      console.error('Error:', result.error);
    }
  };

  const addCamera = async () => {
    const result = await window.api.cameras.create({
      title: 'New Camera',
      src: 'http://example.com/stream.mp4',
      location: 'Front Door'
    });

    if (result.success) {
      console.log('Camera added:', result.data);
      loadCameras();
    }
  };

  return <div>{/* Your UI */}</div>;
}
```

## Available API Methods

### Camera Operations

```javascript
// Get all cameras
window.api.cameras.getAll()

// Get camera by ID
window.api.cameras.getById(id)

// Create new camera
window.api.cameras.create({
  title: 'Camera Name',
  src: 'http://example.com/stream',
  location: 'Location',
  status: 'active'
})

// Update camera
window.api.cameras.update(id, {
  title: 'Updated Name',
  src: 'http://example.com/stream',
  location: 'New Location',
  status: 'active'
})

// Delete camera
window.api.cameras.delete(id)
```

### Alert Operations

```javascript
// Get all alerts
window.api.alerts.getAll()

// Get alert by ID
window.api.alerts.getById(id)

// Create new alert
window.api.alerts.create({
  camera_id: 1,
  alert_type: 'motion_detected',
  description: 'Motion detected in front door',
  severity: 'high',
  status: 'new'
})

// Update alert status
window.api.alerts.updateStatus(id, 'resolved')

// Delete alert
window.api.alerts.delete(id)
```

## Migration to PostgreSQL

When you're ready to migrate to PostgreSQL, you'll need to:

1. Install PostgreSQL client library (e.g., `pg` or `pg-promise`)
2. Update `electron/database.js` to use PostgreSQL instead of SQLite
3. Create equivalent tables in PostgreSQL
4. Migrate existing data from SQLite to PostgreSQL

The current code structure is designed to make this migration easier. All database operations are centralized in `electron/database.js`, so you'll only need to modify that file and keep the IPC handlers and React API calls the same.

### Migration Tips

```javascript
// SQLite (current)
const Database = require('better-sqlite3');
const db = new Database('cctv_app.db');

// PostgreSQL (future)
const { Client } = require('pg');
const db = new Client({
  host: 'localhost',
  port: 5432,
  database: 'cctv_app',
  user: 'postgres',
  password: 'password'
});
await db.connect();
```

The main differences will be:
- Connection management (PostgreSQL requires async connection)
- Query syntax changes from synchronous to async/await
- Placeholders change from `?` to `$1, $2, etc.`
- Data type mapping adjustments

All React components will continue to work without changes since they use the same IPC API.

## Example: Complete Camera Management

```javascript
import React, { useState, useEffect } from 'react';
import { useCameras } from '../hooks/useDatabase';

function CameraManager() {
  const cameras = useCameras();
  const [cameraList, setCameraList] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    src: '',
    location: '',
    status: 'active'
  });

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      const data = await cameras.getAll();
      setCameraList(data);
    } catch (error) {
      console.error('Failed to load cameras:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await cameras.create(formData);
      setFormData({ title: '', src: '', location: '', status: 'active' });
      loadCameras();
    } catch (error) {
      console.error('Failed to add camera:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this camera?')) {
      try {
        await cameras.remove(id);
        loadCameras();
      } catch (error) {
        console.error('Failed to delete camera:', error);
      }
    }
  };

  return (
    <div>
      <h2>Camera Management</h2>

      {cameras.loading && <p>Loading...</p>}
      {cameras.error && <p style={{ color: 'red' }}>{cameras.error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Camera Title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Stream URL"
          value={formData.src}
          onChange={(e) => setFormData({...formData, src: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
        />
        <button type="submit">Add Camera</button>
      </form>

      <ul>
        {cameraList.map((camera) => (
          <li key={camera.id}>
            {camera.title} - {camera.location}
            <button onClick={() => handleDelete(camera.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CameraManager;
```

## Testing the Database

1. Run your app: `npm run dev`
2. The database will be created automatically with sample data
3. Check the console for the database path
4. You can inspect the database using tools like:
   - [DB Browser for SQLite](https://sqlitebrowser.org/)
   - [SQLite Viewer (VS Code Extension)](https://marketplace.visualstudio.com/items?itemName=alexcvzz.vscode-sqlite)

## Troubleshooting

### Database not found
- Make sure the Electron app has write permissions to the user data directory
- Check the console for the database path

### Changes not persisting
- Verify database operations return `success: true`
- Check for errors in the console
- Ensure you're calling `loadCameras()` or similar after modifications

### Foreign key violations
- Make sure camera_id references exist before creating alerts
- Foreign keys are enabled by default in this setup
