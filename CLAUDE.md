# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Electron + React + Vite application for a CCTV monitoring system with a Python FastAPI backend. The application provides a desktop interface for viewing multiple live camera feeds, real-time alerts, process monitoring, and video search capabilities.

### Project Structure

```
project-root/
├── api-schema/                 # OpenAPI specification (single source of truth)
│   ├── openapi.yaml           # API contract definition
│   └── generated/             # Auto-generated TypeScript types
├── backend/                   # Python FastAPI backend
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── api/              # REST API endpoints
│   │   ├── websockets/       # WebSocket event handlers
│   │   ├── models/           # Pydantic models
│   │   └── services/         # Business logic
│   └── requirements.txt       # Python dependencies
├── electron/                  # Electron main process
│   ├── main.js               # Entry point, IPC handlers
│   ├── preload.js            # Security bridge (contextBridge)
│   └── api/                  # Backend API clients
│       ├── rest-client.js    # HTTP client
│       └── websocket-client.js
├── src/                       # React frontend
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Main component with tabs
│   └── tabs/                 # Tab components
├── .claude/                   # Claude Code configuration
│   └── rules/                # Project-specific coding rules
└── CLAUDE.md                  # This file
```

## Development Commands

### Frontend (Electron + React)
```bash
npm run dev                    # Start Vite dev server + Electron
npm run build                  # Build React app with Vite
npm run preview                # Preview production build
```

### Backend (Python FastAPI)
```bash
npm run backend:install        # Install Python dependencies
npm run backend:dev            # Start FastAPI server (port 8000)

# Or manually:
cd backend
pip install -r requirements.txt
python -m app.main
```

### API Type Generation
```bash
npm run generate:types         # Generate TypeScript types from OpenAPI spec
```

The frontend (Electron) waits for Vite to be ready on port 5173 before loading. The backend runs on port 8000.

## Architecture

### Tech Stack
- **Frontend**: React 18 with JSX
- **Build Tool**: Vite 5
- **Desktop**: Electron 29
- **Backend**: Python FastAPI with Pydantic
- **API Spec**: OpenAPI 3.1.0 (contract-first approach)
- **Communication**: REST API + WebSocket
- **Development**: Concurrently manages Vite dev server and Electron process

### Application Structure

The app uses a **two-process architecture** (Electron main + renderer):

1. **Electron Main Process** (`electron/main.js`):
   - Creates BrowserWindow (1200x800, auto-hide menu bar)
   - Loads Vite dev server URL (http://localhost:5173) in development
   - Uses preload script (`electron/preload.js`) with `contextIsolation: true` and `nodeIntegration: false` for security

2. **React Renderer Process** (`src/`):
   - Entry point: `src/main.jsx` renders `App.jsx` into `#root`
   - Root component: `App.jsx` manages tab navigation and shared state
   - Tab-based UI with 5 tabs (라이브, 카메라 리스트 설정, 라이브 데이터 처리 프로세스 모니터링, 실시간 알림 플로우 모니터링, 검색 페이지)

### State Management

State is managed in `App.jsx` and passed down to tabs:
- `activeTab`: Current tab selection
- `videos`: Array of CCTV feed objects (id, title, src) - used by LiveTab only
- LiveTab implements drag-and-drop reordering using React refs (`dragItem`, `dragOverItem`)

### Tab Components (`src/tabs/`)

- **LiveTab.jsx**: Main live view with:
  - Left sidebar: Draggable camera list for reordering
  - Right grid: Dynamic grid layout (calculated as √n columns) displaying video feeds
  - Drag-and-drop uses native HTML5 draggable API with React refs

- **CameraTab.jsx**: Camera configuration (placeholder)
- **ProcessTab.jsx**: Data processing monitoring (placeholder)
- **AlertTab.jsx**: Real-time alert monitoring (placeholder)
- **SearchTab.jsx**: Search functionality (placeholder)

### Key Patterns

1. **Dynamic Grid Layout**: LiveTab calculates grid columns as `Math.ceil(Math.sqrt(videos.length))` to create square-ish grids
2. **Drag-and-Drop**: Uses `useRef` hooks to track drag source and target, then swaps array positions
3. **Tab Routing**: Switch-case pattern in `renderTabContent()` to conditionally render tabs
4. **CSS Custom Properties**: Grid uses `--video-grid-cols` CSS variable for dynamic column count

## Backend Communication Architecture

### Overview

The system uses a **three-layer architecture** for frontend-backend communication:

```
React Components (src/)
    ↕ window.api.*
Electron Preload (electron/preload.js)
    ↕ IPC (contextBridge)
Electron Main Process (electron/main.js)
    ↕ REST API / WebSocket
Python Backend (backend/app/)
```

### Communication Layers

#### 1. OpenAPI Specification (Single Source of Truth)
- Location: `api-schema/openapi.yaml`
- Defines all API endpoints, request/response schemas, and WebSocket events
- **Always update this first** when adding new APIs

#### 2. Python Backend (FastAPI)
- Location: `backend/app/`
- REST API endpoints in `backend/app/api/` (cameras, alerts, process, search, settings)
- WebSocket handler in `backend/app/websockets/events.py`
- Pydantic models in `backend/app/models/` match OpenAPI schemas exactly

#### 3. Electron API Client Layer
- REST Client: `electron/api/rest-client.js` - HTTP requests to backend
- WebSocket Client: `electron/api/websocket-client.js` - Real-time event streaming
- Main process (`electron/main.js`) calls these clients and exposes via IPC

#### 4. Electron Preload Script
- Location: `electron/preload.js`
- Exposes `window.api` to React using `contextBridge`
- **Security**: Uses `contextIsolation: true` and `nodeIntegration: false`

#### 5. React Components
- Call `window.api.cameras.getAll()`, `window.api.alerts.getAll()`, etc.
- Subscribe to WebSocket events via `window.api.events.onAlertNew(callback)`

### API Categories

| Category | Endpoints | Purpose |
|----------|-----------|---------|
| **Cameras** | `/api/v1/cameras` | CRUD operations, status updates, reordering |
| **Alerts** | `/api/v1/alerts` | Alert history, acknowledgment |
| **Process** | `/api/v1/process` | Backend process monitoring, metrics |
| **Search** | `/api/v1/search` | Video/event search |
| **Settings** | `/api/v1/settings` | System configuration |
| **WebSocket** | `ws://localhost:8000/ws/events` | Real-time updates |

### WebSocket Events

The backend broadcasts these event types:
- `alert.new` - New alert detected
- `process.status_changed` - Backend process status update
- `camera.status_changed` - Camera connection status change

React components subscribe to these events in `useEffect`:
```javascript
useEffect(() => {
  window.api.events.onAlertNew((alert) => {
    // Handle new alert
  });
}, []);
```

### Adding a New API Endpoint

**CRITICAL**: Always follow this order to maintain type safety:

1. **Update OpenAPI spec** (`api-schema/openapi.yaml`):
   ```yaml
   /cameras/{cameraId}/snapshot:
     get:
       operationId: getCameraSnapshot
       # Define request/response schemas
   ```

2. **Regenerate TypeScript types**:
   ```bash
   npm run generate:types
   ```

3. **Implement backend** (`backend/app/api/cameras.py`):
   ```python
   @router.get("/{camera_id}/snapshot")
   async def get_camera_snapshot(camera_id: int):
       # Implementation
   ```

4. **Add to REST client** (`electron/api/rest-client.js`):
   ```javascript
   async getSnapshot(id) {
     return apiRequest(`/cameras/${id}/snapshot`);
   }
   ```

5. **Add IPC handler** (`electron/main.js`):
   ```javascript
   ipcMain.handle('api:cameras:getSnapshot', async (event, id) => {
     return await cameraAPI.getSnapshot(id);
   });
   ```

6. **Expose in preload** (`electron/preload.js`):
   ```javascript
   getSnapshot: (id) => ipcRenderer.invoke('api:cameras:getSnapshot', id)
   ```

7. **Use in React**:
   ```javascript
   const snapshot = await window.api.cameras.getSnapshot(cameraId);
   ```

### Why This Architecture?

✅ **Type Safety**: OpenAPI → TypeScript types prevent runtime errors
✅ **Single Source of Truth**: One spec for frontend and backend
✅ **Security**: Electron's contextBridge prevents direct Node.js access
✅ **Maintainability**: Clear separation of concerns
✅ **Parallel Development**: Frontend and backend can develop simultaneously
✅ **Documentation**: API docs auto-generated from OpenAPI spec

## Important Notes

- The application uses Korean language for UI labels (탭 names are in Korean)
- Video streaming will use RTSP/HLS protocols (not through REST API)
- Most tabs are placeholder components (준비 중 = "in preparation")
- Backend connection is required for full functionality
