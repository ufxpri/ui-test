"""
Camera models matching OpenAPI schema
"""

from datetime import datetime
from typing import Optional, Any
from enum import Enum
from pydantic import BaseModel, Field, HttpUrl


class CameraStatus(str, Enum):
    """Camera operational status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    CONNECTING = "connecting"


class CameraInput(BaseModel):
    """Input model for creating/updating cameras"""
    title: str = Field(..., min_length=1, max_length=100)
    src: str = Field(..., description="Video stream URL (RTSP, HLS, or HTTP)")
    location: Optional[str] = None
    description: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None


class Camera(BaseModel):
    """Camera model matching OpenAPI schema"""
    id: int
    title: str
    src: str
    status: CameraStatus
    location: Optional[str] = None
    description: Optional[str] = None
    display_order: int = Field(default=0, alias="displayOrder")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")
    metadata: Optional[dict[str, Any]] = None

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "title": "CCTV Feed #1",
                "src": "rtsp://192.168.1.100:554/stream",
                "status": "active",
                "location": "Building A - Entrance",
                "displayOrder": 0,
                "createdAt": "2024-01-12T10:00:00Z",
                "updatedAt": "2024-01-12T10:00:00Z"
            }
        }
    }


class CameraResponse(BaseModel):
    """Response wrapper for single camera"""
    success: bool = True
    data: Camera


class CameraListResponse(BaseModel):
    """Response wrapper for camera list"""
    success: bool = True
    data: list[Camera]


class CameraStatusUpdate(BaseModel):
    """Model for updating camera status"""
    status: CameraStatus


class CameraReorderRequest(BaseModel):
    """Model for reordering cameras"""
    camera_ids: list[int] = Field(alias="cameraIds")
