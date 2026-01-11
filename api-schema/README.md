# API Schema

This directory contains the OpenAPI specification for the CCTV monitoring system backend API.

## OpenAPI Specification

The API contract is defined in `openapi.yaml` using OpenAPI 3.1.0 specification.

### Viewing the Specification

You can view and test the API using:
- Swagger UI: `http://localhost:8000/api/docs` (when backend is running)
- ReDoc: `http://localhost:8000/api/redoc`
- Or use online tools like [Swagger Editor](https://editor.swagger.io/)

## Type Generation

### TypeScript Types (Frontend)

Generate TypeScript types from the OpenAPI spec:

```bash
# Install openapi-typescript (if not installed)
npm install -D openapi-typescript

# Generate types
npm run generate:types
```

The generated types will be available in `api-schema/generated/typescript/schema.d.ts`.

### Python Types (Backend)

The backend uses Pydantic models which are manually maintained to match the OpenAPI spec.
These models are located in `backend/app/models/`.

## Development Workflow

### Adding a New API Endpoint

1. **Update OpenAPI spec** (`openapi.yaml`):
   ```yaml
   /cameras/{cameraId}/snapshot:
     get:
       operationId: getCameraSnapshot
       summary: Get camera snapshot
       # ...
   ```

2. **Regenerate TypeScript types**:
   ```bash
   npm run generate:types
   ```

3. **Implement backend endpoint** (`backend/app/api/cameras.py`):
   ```python
   @router.get("/{camera_id}/snapshot")
   async def get_camera_snapshot(camera_id: int):
       # Implementation
   ```

4. **Add Electron IPC handler** (`electron/main.js`):
   ```javascript
   ipcMain.handle('api:cameras:getSnapshot', async (event, id) => {
     return await cameraAPI.getSnapshot(id);
   });
   ```

5. **Add frontend API** (`electron/api/rest-client.js`):
   ```javascript
   async getSnapshot(id) {
     return apiRequest(`/cameras/${id}/snapshot`);
   }
   ```

6. **Expose in preload** (`electron/preload.js`):
   ```javascript
   getSnapshot: (id) => ipcRenderer.invoke('api:cameras:getSnapshot', id),
   ```

7. **Use in React**:
   ```javascript
   const snapshot = await window.api.cameras.getSnapshot(cameraId);
   ```

## Benefits of OpenAPI-First Approach

✅ **Single Source of Truth**: One spec for both frontend and backend
✅ **Type Safety**: Auto-generated TypeScript types prevent runtime errors
✅ **Documentation**: Always up-to-date API docs
✅ **Validation**: Backend validates requests against spec
✅ **Contract Testing**: Can generate tests from spec
✅ **Parallel Development**: Frontend and backend can be developed simultaneously

## API Versioning

The API uses URL versioning: `/api/v1/...`

When making breaking changes:
1. Create new version: `/api/v2/...`
2. Maintain old version for backwards compatibility
3. Document migration path
