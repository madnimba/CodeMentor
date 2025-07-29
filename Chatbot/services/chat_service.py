"""
Chat Service for CodeMentor Chatbot
Handles message processing and conversation management.
"""

import logging
import time
from typing import List, Optional, Dict, Any, Generator
from datetime import datetime

from models.chat_models import Message, ChatRequest, ChatResponse, StreamingChunk, Role
from services.ai_service import AIService

logger = logging.getLogger(__name__)

class ChatService:
    """Service for handling chat operations."""
    
    def __init__(self):
        self.ai_service = AIService()
        self.conversation_history: Dict[str, List[Message]] = {}
    
    def process_message(self, request: ChatRequest) -> ChatResponse:
        """Process a chat message and return AI response."""
        try:
            # Add user message to conversation
            user_message = Message(
                role=Role.USER,
                content=request.message,
                timestamp=datetime.now()
            )
            
            # Get or create conversation history
            session_id = request.session_id or "default"
            if session_id not in self.conversation_history:
                self.conversation_history[session_id] = []
            
            # Add system message if this is a new conversation
            if not self.conversation_history[session_id]:
                system_message = Message(
                    role=Role.SYSTEM,
                    content="You are CodeMentor, an AI coding assistant. You help users with programming questions, code reviews, debugging, and learning new technologies. Be helpful, accurate, and encouraging.",
                    timestamp=datetime.now()
                )
                self.conversation_history[session_id].append(system_message)
            
            # Add user message to history
            self.conversation_history[session_id].append(user_message)
            
            # Prepare messages for AI (include history if provided)
            messages_for_ai = self.conversation_history[session_id].copy()
            
            # Add provided history if any
            if request.history:
                # Convert provided history to Message objects
                history_messages = []
                for hist_msg in request.history:
                    history_messages.append(Message(
                        role=Role(hist_msg.role),
                        content=hist_msg.content,
                        timestamp=datetime.now()
                    ))
                
                # Combine with current conversation
                messages_for_ai = history_messages + messages_for_ai
            
            # Generate AI response
            ai_response = self.ai_service.generate_response(
                messages=messages_for_ai,
                model=request.model,
                temperature=request.temperature,
                max_tokens=request.max_tokens
            )
            
            # Add AI response to conversation history
            assistant_message = Message(
                role=Role.ASSISTANT,
                content=ai_response.response,
                timestamp=datetime.now()
            )
            self.conversation_history[session_id].append(assistant_message)
            
            # Limit conversation history to prevent memory issues
            self._limit_conversation_history(session_id)
            
            return ai_response
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            raise


    
    def process_message_stream(self, request: ChatRequest) -> Generator[StreamingChunk, None, None]:
        """Process a chat message and return streaming response."""
        try:
            # For now, we'll simulate streaming with the regular response
            # In a full implementation, this would use the AI service's streaming capability
            response = self.process_message(request)
            
            # Simulate streaming by yielding characters
            for char in response.response:
                yield StreamingChunk(
                    content=char,
                    model=response.model
                )
                time.sleep(0.01)  # Small delay to simulate streaming
            
            # Final chunk
            yield StreamingChunk(
                content="",
                is_complete=True,
                model=response.model
            )
            
        except Exception as e:
            logger.error(f"Error in streaming message: {str(e)}")
            yield StreamingChunk(
                content=f"Error: {str(e)}",
                is_complete=True
            )
    
    def get_chat_history(self, user_id: str, session_id: Optional[str] = None) -> List[Message]:
        """Get chat history for a user or session."""
        if session_id:
            return self.conversation_history.get(session_id, [])
        else:
            # Return all sessions for the user (simplified implementation)
            return self.conversation_history.get(user_id, [])
    
    def clear_chat_history(self, session_id: str) -> bool:
        """Clear chat history for a session."""
        try:
            if session_id in self.conversation_history:
                del self.conversation_history[session_id]
                logger.info(f"Cleared chat history for session: {session_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error clearing chat history: {str(e)}")
            return False
    
    def _limit_conversation_history(self, session_id: str, max_messages: int = 50):
        """Limit conversation history to prevent memory issues."""
        if session_id in self.conversation_history:
            history = self.conversation_history[session_id]
            if len(history) > max_messages:
                # Keep system message and recent messages
                system_message = None
                if history and history[0].role == Role.SYSTEM:
                    system_message = history[0]
                
                # Keep the most recent messages
                recent_messages = history[-max_messages+1:] if system_message else history[-max_messages:]
                
                # Reconstruct history
                new_history = []
                if system_message:
                    new_history.append(system_message)
                new_history.extend(recent_messages)
                
                self.conversation_history[session_id] = new_history
                logger.info(f"Limited conversation history for session {session_id} to {len(new_history)} messages")
    
    def get_conversation_stats(self, session_id: str) -> Dict[str, Any]:
        """Get statistics about a conversation."""
        if session_id not in self.conversation_history:
            return {"error": "Session not found"}
        
        history = self.conversation_history[session_id]
        
        user_messages = [msg for msg in history if msg.role == Role.USER]
        assistant_messages = [msg for msg in history if msg.role == Role.ASSISTANT]
        
        total_user_chars = sum(len(msg.content) for msg in user_messages)
        total_assistant_chars = sum(len(msg.content) for msg in assistant_messages)
        
        return {
            "session_id": session_id,
            "total_messages": len(history),
            "user_messages": len(user_messages),
            "assistant_messages": len(assistant_messages),
            "total_user_chars": total_user_chars,
            "total_assistant_chars": total_assistant_chars,
            "created_at": history[0].timestamp.isoformat() if history else None,
            "last_activity": history[-1].timestamp.isoformat() if history else None
        } 