# CCTV Monitoring System - Backend

Python-based FastAPI backend for CCTV monitoring system.

## Setup

### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Run Development Server

```bash
# From backend directory
python -m app.main

# Or using uvicorn directly
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`
- OpenAPI JSON: `http://localhost:8000/api/openapi.json`

### WebSocket Connection

Connect to WebSocket at: `ws://localhost:8000/ws/events`

## API Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── api/                 # REST API endpoints
│   │   ├── cameras.py       # Camera CRUD
│   │   ├── alerts.py        # Alert management
│   │   ├── process_monitor.py
│   │   ├── search.py
│   │   └── settings.py
│   ├── websockets/          # WebSocket handlers
│   │   └── events.py        # Real-time event streaming
│   ├── models/              # Pydantic models
│   │   ├── camera.py
│   │   └── common.py
│   ├── services/            # Business logic
│   └── db/                  # Database models and migrations
├── video/                   # Video streaming server
└── tests/                   # Tests
```

## API Documentation

The API is defined by the OpenAPI specification in `../api-schema/openapi.yaml`.

All endpoints follow the specification exactly to ensure frontend-backend compatibility.

## Development

### Adding New Endpoints

1. Update `../api-schema/openapi.yaml` first
2. Implement the endpoint in appropriate router
3. Add Pydantic models in `app/models/`
4. Regenerate TypeScript types (see frontend README)

### WebSocket Events

The system broadcasts these event types:
- `alert.new` - New alert detected
- `process.status_changed` - Backend process status update
- `camera.status_changed` - Camera status change

## TODO

- [ ] Implement database (SQLAlchemy + SQLite/PostgreSQL)
- [ ] Add video streaming server (RTSP/HLS)
- [ ] Implement actual process monitoring
- [ ] Add authentication/authorization
- [ ] Implement video recording and storage
- [ ] Add unit tests
