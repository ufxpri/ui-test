"""
Common response models
"""

from pydantic import BaseModel
from typing import Optional


class SuccessResponse(BaseModel):
    """Standard success response"""
    success: bool = True
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    """Standard error response"""
    success: bool = False
    error: str
    code: Optional[str] = None
