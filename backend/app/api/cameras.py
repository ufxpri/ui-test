"""
Camera API endpoints

Implements camera CRUD operations according to OpenAPI specification.
"""

from fastapi import APIRouter, HTTPException, status
from typing import List

from app.models.camera import (
    Camera,
    CameraInput,
    CameraResponse,
    CameraListResponse,
    CameraStatusUpdate,
    CameraReorderRequest,
    CameraStatus
)
from app.models.common import SuccessResponse, ErrorResponse

router = APIRouter()

# TODO: Replace with actual database
# Temporary in-memory storage
_cameras_db: dict[int, Camera] = {}
_next_id = 1


@router.get("", response_model=CameraListResponse)
async def get_all_cameras():
    """
    Get all cameras

    Retrieve list of all configured cameras with their current status.
    """
    cameras = list(_cameras_db.values())
    return CameraListResponse(success=True, data=cameras)


@router.post("", response_model=CameraResponse, status_code=status.HTTP_201_CREATED)
async def create_camera(camera_input: CameraInput):
    """
    Create new camera

    Add a new camera to the system.
    """
    global _next_id

    from datetime import datetime

    camera = Camera(
        id=_next_id,
        title=camera_input.title,
        src=camera_input.src,
        status=CameraStatus.INACTIVE,  # Default to inactive
        location=camera_input.location,
        description=camera_input.description,
        display_order=len(_cameras_db),
        created_at=datetime.now(),
        updated_at=datetime.now(),
        metadata=camera_input.metadata
    )

    _cameras_db[_next_id] = camera
    _next_id += 1

    return CameraResponse(success=True, data=camera)


@router.get("/{camera_id}", response_model=CameraResponse)
async def get_camera(camera_id: int):
    """
    Get camera by ID
    """
    if camera_id not in _cameras_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Camera with id {camera_id} not found"
        )

    return CameraResponse(success=True, data=_cameras_db[camera_id])


@router.put("/{camera_id}", response_model=CameraResponse)
async def update_camera(camera_id: int, camera_input: CameraInput):
    """
    Update camera

    Update camera configuration.
    """
    if camera_id not in _cameras_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Camera with id {camera_id} not found"
        )

    from datetime import datetime

    existing = _cameras_db[camera_id]
    updated = Camera(
        id=camera_id,
        title=camera_input.title,
        src=camera_input.src,
        status=existing.status,  # Keep existing status
        location=camera_input.location,
        description=camera_input.description,
        display_order=existing.display_order,
        created_at=existing.created_at,
        updated_at=datetime.now(),
        metadata=camera_input.metadata
    )

    _cameras_db[camera_id] = updated

    return CameraResponse(success=True, data=updated)


@router.delete("/{camera_id}", response_model=SuccessResponse)
async def delete_camera(camera_id: int):
    """
    Delete camera
    """
    if camera_id not in _cameras_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Camera with id {camera_id} not found"
        )

    del _cameras_db[camera_id]

    return SuccessResponse(
        success=True,
        message=f"Camera {camera_id} deleted successfully"
    )


@router.patch("/{camera_id}/status", response_model=CameraResponse)
async def update_camera_status(camera_id: int, status_update: CameraStatusUpdate):
    """
    Update camera status

    Update only the status of a camera (active/inactive/error).
    """
    if camera_id not in _cameras_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Camera with id {camera_id} not found"
        )

    from datetime import datetime

    camera = _cameras_db[camera_id]
    camera.status = status_update.status
    camera.updated_at = datetime.now()

    # TODO: Emit WebSocket event for camera status change

    return CameraResponse(success=True, data=camera)


@router.post("/reorder", response_model=SuccessResponse)
async def reorder_cameras(reorder_request: CameraReorderRequest):
    """
    Reorder cameras

    Update the display order of cameras (for drag-and-drop).
    """
    camera_ids = reorder_request.camera_ids

    # Validate all camera IDs exist
    for camera_id in camera_ids:
        if camera_id not in _cameras_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Camera with id {camera_id} not found"
            )

    # Update display order
    for order, camera_id in enumerate(camera_ids):
        _cameras_db[camera_id].display_order = order

    return SuccessResponse(
        success=True,
        message="Camera order updated successfully"
    )
