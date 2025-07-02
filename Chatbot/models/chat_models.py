"""
Chat models for the CodeMentor chatbot.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class Role(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class Message(BaseModel):
    """Represents a single message in a conversation."""
    role: Role
    content: str
    timestamp: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    message: str = Field(..., min_length=1, max_length=4000, description="User's message")
    history: List[Message] = Field(default=[], description="Conversation history")
    model: Optional[str] = Field(default=None, description="AI model to use")
    temperature: Optional[float] = Field(default=0.7, ge=0.0, le=2.0, description="Response creativity")
    max_tokens: Optional[int] = Field(default=1000, ge=1, le=4000, description="Maximum response length")
    user_id: Optional[str] = Field(default=None, description="User identifier")
    session_id: Optional[str] = Field(default=None, description="Session identifier")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    response: str = Field(..., description="AI assistant's response")
    model: str = Field(..., description="Model used for response")
    tokens_used: Optional[int] = Field(default=None, description="Number of tokens used")
    processing_time: Optional[float] = Field(default=None, description="Processing time in seconds")
    timestamp: datetime = Field(default_factory=datetime.now, description="Response timestamp")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class StreamingChunk(BaseModel):
    """Model for streaming response chunks."""
    content: str = Field(..., description="Partial response content")
    is_complete: bool = Field(default=False, description="Whether this is the final chunk")
    model: Optional[str] = Field(default=None, description="Model used")
    timestamp: datetime = Field(default_factory=datetime.now, description="Chunk timestamp")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ChatSession(BaseModel):
    """Model for chat session management."""
    session_id: str = Field(..., description="Unique session identifier")
    user_id: Optional[str] = Field(default=None, description="User identifier")
    created_at: datetime = Field(default_factory=datetime.now, description="Session creation time")
    last_activity: datetime = Field(default_factory=datetime.now, description="Last activity time")
    messages: List[Message] = Field(default=[], description="Session messages")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Session metadata")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ModelInfo(BaseModel):
    """Model information."""
    name: str = Field(..., description="Model name")
    provider: str = Field(..., description="Model provider (OpenAI, Anthropic, etc.)")
    max_tokens: int = Field(..., description="Maximum tokens supported")
    cost_per_1k_tokens: Optional[float] = Field(default=None, description="Cost per 1k tokens")
    description: Optional[str] = Field(default=None, description="Model description")
    is_available: bool = Field(default=True, description="Whether model is available")

class HealthStatus(BaseModel):
    """Health status model."""
    status: str = Field(..., description="Health status (healthy, unhealthy, degraded)")
    timestamp: datetime = Field(default_factory=datetime.now, description="Check timestamp")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Health details")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        } 