---
paths: src/**/*.{jsx,js}, electron/**/*.js
---

# Naming Conventions

## File Naming

### React Components
- **Format**: PascalCase
- **Pattern**: `ComponentName.jsx`
- **Examples**:
  - `App.jsx`
  - `LiveTab.jsx`
  - `CameraTab.jsx`
  - `ProcessTab.jsx`

### Electron Files
- **Format**: camelCase or kebab-case
- **Pattern**: `descriptiveName.js`
- **Examples**:
  - `main.js` (entry point)
  - `preload.js` (preload script)

### CSS Files
- **Format**: Match component name or use descriptive name
- **Examples**:
  - `App.css` (component-specific)
  - `global.css` (global styles)

## Component Naming

### React Components
- **Function name**: PascalCase, matching filename
- **Tab components**: Suffix with `Tab`

```jsx
// ✅ Correct
function LiveTab() { }
function CameraTab() { }

// ❌ Incorrect
function liveTab() { }
function camera_tab() { }
```

## Variable Naming

### JavaScript Variables
- **Format**: camelCase
- **Boolean variables**: Prefix with `is`, `has`, `should`
- **Event handlers**: Prefix with `handle`

```javascript
// ✅ State variables
const [activeTab, setActiveTab] = useState('live');
const [videos, setVideos] = useState([]);
const [isLoading, setIsLoading] = useState(false);

// ✅ Refs
const dragItem = useRef(null);
const dragOverItem = useRef(null);

// ✅ Event handlers
const handleSort = () => { };
const handleDragStart = (e, index) => { };
const handleTabChange = (tabKey) => { };

// ❌ Incorrect
const active_tab = useState('live');
const DragItem = useRef(null);
const sortHandler = () => { };
```

### Constants
- **Format**: UPPER_SNAKE_CASE for true constants
- **Format**: PascalCase for configuration arrays/objects

```javascript
// ✅ True constants
const MAX_VIDEO_COUNT = 100;
const DEFAULT_PORT = 5173;

// ✅ Configuration objects
const TAB_LIST = [
  { key: 'live', label: '라이브' },
  { key: 'camera', label: '카메라 리스트 설정' },
];

const initialVideos = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  title: `CCTV Feed #${i + 1}`,
}));
```

## CSS Class Naming

### Format
- **Convention**: kebab-case (BEM-inspired where appropriate)
- **Be descriptive**: Avoid generic names

```css
/* ✅ Correct */
.video-grid { }
.video-card { }
.video-wrapper { }
.tab-bar { }
.camera-list { }
.list-item { }
.main-content { }
.app-container { }

/* ❌ Incorrect */
.videoGrid { }
.video_card { }
.container { }  /* Too generic */
.box { }        /* Too generic */
```

### State Classes
- **Active states**: `.active` or `.is-active`
- **Disabled states**: `.disabled` or `.is-disabled`

```css
.tab { }
.tab.active { }

.button { }
.button.is-disabled { }
```

## Korean UI Labels

### User-Facing Text
- **Use Korean** for all user-facing labels and text
- **Keep English** for technical identifiers (keys, IDs, variables)

```javascript
// ✅ Correct pattern
const TAB_LIST = [
  { key: 'live', label: '라이브' },           // key: English, label: Korean
  { key: 'camera', label: '카메라 리스트 설정' },
  { key: 'process', label: '라이브 데이터 처리 프로세스 모니터링' },
  { key: 'alert', label: '실시간 알림 플로우 모니터링' },
  { key: 'search', label: '검색 페이지' },
];

// ❌ Incorrect - mixing languages in keys
{ key: '라이브', label: '라이브' }

// ❌ Incorrect - using English for UI labels
{ key: 'live', label: 'Live' }
```

### Placeholder Text
- **Under Development**: Use "준비 중" for placeholder pages

```jsx
// ✅ Correct
<h2>카메라 리스트 설정 (준비 중)</h2>
<h2>실시간 알림 플로우 모니터링 (준비 중)</h2>

// ❌ Incorrect
<h2>Camera List Setup (Coming Soon)</h2>
```

### Data Properties
- **Keep English** for data object properties
- **Use Korean** for display values

```javascript
// ✅ Correct
const video = {
  id: 1,
  title: 'CCTV Feed #1',  // Can use English for technical labels
  src: 'http://example.com/video.mp4',
  status: 'active'
};

// Display to user
<p>{video.title}</p>
```

## Function Naming

### Event Handlers
- **Prefix**: `handle` or `on`
- **Pattern**: `handle{EventType}` or `on{EventType}`

```javascript
// ✅ Correct
const handleSort = () => { };
const handleDragStart = (e) => { };
const handleDragEnd = () => { };
const handleTabClick = (tabKey) => { };

// ❌ Incorrect
const sort = () => { };
const dragStart = (e) => { };
const clickTab = (tabKey) => { };
```

### Utility Functions
- **Descriptive verbs**: `calculate`, `format`, `validate`, `parse`
- **Clear purpose**: Function name should describe what it returns

```javascript
// ✅ Correct
const calculateGridCols = (itemCount) => Math.ceil(Math.sqrt(itemCount));
const formatTimestamp = (date) => { };
const isValidCameraUrl = (url) => { };

// ❌ Incorrect
const cols = (count) => { };  // Too short
const doValidation = (url) => { };  // Generic
```

## Props Naming

### Boolean Props
- **Prefix**: `is`, `has`, `should`, `can`
- **Examples**: `isActive`, `hasError`, `shouldAutoPlay`

```jsx
// ✅ Correct
<VideoPlayer isPlaying autoPlay />
<CameraList hasSelection />

// ❌ Incorrect
<VideoPlayer playing play />
<CameraList selected />
```

### Callback Props
- **Prefix**: `on`
- **Pattern**: `on{EventType}`

```jsx
// ✅ Correct
<VideoCard
  onPlay={handlePlay}
  onError={handleError}
  onClick={handleClick}
/>

// ❌ Incorrect
<VideoCard
  play={handlePlay}
  error={handleError}
  clicked={handleClick}
/>
```

## IPC Channel Naming

### Format
- **Convention**: kebab-case
- **Pattern**: `{domain}:{action}` or `{action}-{resource}`

```javascript
// ✅ Correct
ipcMain.handle('camera:get-list', ...);
ipcMain.handle('camera:add', ...);
ipcMain.handle('settings:save', ...);
ipcMain.handle('alert:get-recent', ...);

// Alternative pattern
ipcMain.handle('get-camera-list', ...);
ipcMain.handle('save-settings', ...);

// ❌ Incorrect
ipcMain.handle('getCameraList', ...);  // camelCase
ipcMain.handle('Camera_Add', ...);     // Mixed case
```

## ID and Key Naming

### Object IDs
- **Use**: Numeric IDs for data objects
- **Format**: `id` property

```javascript
// ✅ Correct
const videos = [
  { id: 0, title: 'CCTV Feed #1' },
  { id: 1, title: 'CCTV Feed #2' },
];

// ❌ Incorrect
{ videoId: 0 }
{ video_id: 0 }
```

### React Keys
- **Use**: `key` attribute with unique ID
- **Never**: Use array index for items that can reorder

```jsx
// ✅ Correct (items can be reordered)
{videos.map(video => (
  <div key={video.id}>{video.title}</div>
))}

// ⚠️ Acceptable only if items never reorder
{staticList.map((item, index) => (
  <div key={index}>{item}</div>
))}
```

## Comment Conventions

### File Headers
- **Include**: Korean comments for file purpose (current pattern)

```javascript
// ✅ Current pattern
// App.jsx - CCTV 그리드 및 드래그 앤 드롭 UI
// LiveTab.jsx - 라이브 CCTV 그리드 탭
// electron/main.js - Electron 메인 프로세스 (Vite + React)
```

### Inline Comments
- **Use Korean or English** consistently within each file
- **Prefer**: Code that is self-documenting

```javascript
// ✅ Acceptable
// 카메라 개수에 따라 가장 가까운 정사각형 그리드 열 개수 계산
const gridCols = Math.ceil(Math.sqrt(videos.length));

// ✅ Also acceptable (English)
// Calculate grid columns as square root of video count
const gridCols = Math.ceil(Math.sqrt(videos.length));
```

## Consistency Rules

1. **Match existing patterns**: When adding to existing code, follow the established naming
2. **Be consistent within scope**: Don't mix camelCase and snake_case in the same file
3. **Tab keys**: Always use English lowercase (live, camera, process, alert, search)
4. **UI labels**: Always use Korean for user-facing text
5. **Code identifiers**: Always use English for variables, functions, classes
