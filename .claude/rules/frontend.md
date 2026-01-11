---
paths: src/**/*.{jsx,js,css}
---

# Frontend Development Rules

## React Component Standards

### Component Structure
- Use functional components with hooks exclusively
- One component per file, matching filename
- Export component as default at the end of the file
- Import order: React → Components → Utilities → CSS

Example:
```jsx
import React, { useState, useRef } from 'react';
import ComponentName from './ComponentName';
import './ComponentName.css';

function MyComponent() {
  // Component logic
}

export default MyComponent;
```

### Hooks Usage
- Place all hooks at the top of the component, before any logic
- Use `useState` for local component state
- Use `useRef` for DOM references and mutable values that don't trigger re-renders
- Never call hooks conditionally

### Props Management
- Destructure props in function parameters: `function Component({ prop1, prop2 })`
- Document expected props with comments for complex components
- Pass state setters directly when child needs to modify parent state

## Drag-and-Drop Pattern

When implementing drag-and-drop functionality, follow the pattern established in `src/tabs/LiveTab.jsx`:

1. **Use React refs to track drag state**:
```jsx
const dragItem = useRef(null);
const dragOverItem = useRef(null);
```

2. **Implement HTML5 drag events**:
- `onDragStart`: Store source index
- `onDragEnter`: Store target index
- `onDragEnd`: Execute the swap
- `onDragOver`: Prevent default to allow drop

3. **Swap array items by index**:
```jsx
const handleSort = () => {
  let _items = [...items];
  const draggedItem = _items.splice(dragItem.current, 1)[0];
  _items.splice(dragOverItem.current, 0, draggedItem);
  dragItem.current = null;
  dragOverItem.current = null;
  setItems(_items);
};
```

4. **Never manipulate DOM directly** - always work with state arrays

## State Management

### State Location
- Keep state in `App.jsx` when shared across multiple tabs
- Keep state local to tab components when only used within that tab
- Pass `setState` functions down to children that need to modify parent state

### State Updates
- Always use functional updates when new state depends on previous state:
```jsx
setItems(prev => [...prev, newItem]);
```
- Never mutate state directly - use spread operator or array methods that return new arrays

## CSS Conventions

### Class Naming
- Use kebab-case: `video-grid`, `camera-list`, `tab-bar`
- Be descriptive: prefer `video-wrapper` over `wrapper`
- Avoid generic names like `container`, `box`, `item` without context

### Dynamic Styling
- Use CSS custom properties for dynamic values:
```jsx
<div style={{ '--video-grid-cols': gridCols }}>
```
- Keep inline styles minimal - prefer CSS classes

### Layout Patterns
- Use CSS Grid for card/grid layouts
- Use Flexbox for navigation bars and linear layouts
- Calculate responsive columns dynamically: `Math.ceil(Math.sqrt(items.length))`

## Tab Component Pattern

### Tab Structure
Each tab component should:
1. Accept props from `App.jsx` (if needed)
2. Return JSX wrapped in appropriate container (`<div className="main-content">`)
3. Handle its own internal state (unless shared across tabs)
4. Be exported as default

### Placeholder Tabs
For tabs under development:
```jsx
function TabName() {
  return <div className="main-content"><h2>탭 제목 (준비 중)</h2></div>;
}
```

## Video/Media Handling

### Video Elements
- Always include `controls` attribute for user control
- Use `muted` and `autoPlay` for auto-playing videos
- Use `loop` for continuous playback (CCTV feeds)
- Wrap videos in container div for aspect ratio control

Example:
```jsx
<div className="video-wrapper">
  <video src={src} controls muted autoPlay loop />
</div>
```

## Performance Considerations

### Array Rendering
- Always provide unique `key` prop when mapping arrays
- Use stable IDs (not array index) when items can be reordered
- Current pattern: `key={video.id}` from data objects

### Unnecessary Re-renders
- Memoize expensive calculations with `useMemo` if needed
- Avoid creating new objects/arrays in render (moves them to `useState` initialization)

## Code Organization

### File Structure
```
src/
├── main.jsx          # Entry point
├── App.jsx           # Main component with tab routing
├── App.css           # Main styles
├── global.css        # Global styles
└── tabs/             # Tab components
    ├── LiveTab.jsx
    ├── CameraTab.jsx
    ├── ProcessTab.jsx
    ├── AlertTab.jsx
    └── SearchTab.jsx
```

### Component Responsibilities
- `App.jsx`: Tab navigation, shared state management
- Tab components: Tab-specific UI and functionality
- Keep components focused on single responsibility
