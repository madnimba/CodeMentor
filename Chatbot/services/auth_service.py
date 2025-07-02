"""
Auth Service for CodeMentor Chatbot
Handles authentication and authorization.
"""

import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class AuthService:
    """Service for handling authentication and authorization."""
    
    def __init__(self):
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
    
    def validate_session(self, session_id: str) -> bool:
        """Validate if a session is active and not expired."""
        if session_id not in self.active_sessions:
            return False
        
        session = self.active_sessions[session_id]
        if datetime.now() > session['expires_at']:
            # Session expired, remove it
            del self.active_sessions[session_id]
            return False
        
        return True
    
    def create_session(self, user_id: str, session_duration_hours: int = 24) -> str:
        """Create a new session for a user."""
        import uuid
        
        session_id = str(uuid.uuid4())
        expires_at = datetime.now() + timedelta(hours=session_duration_hours)
        
        self.active_sessions[session_id] = {
            'user_id': user_id,
            'created_at': datetime.now(),
            'expires_at': expires_at,
            'last_activity': datetime.now()
        }
        
        logger.info(f"Created session {session_id} for user {user_id}")
        return session_id
    
    def update_session_activity(self, session_id: str) -> bool:
        """Update the last activity time for a session."""
        if session_id in self.active_sessions:
            self.active_sessions[session_id]['last_activity'] = datetime.now()
            return True
        return False
    
    def revoke_session(self, session_id: str) -> bool:
        """Revoke a session."""
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]
            logger.info(f"Revoked session {session_id}")
            return True
        return False
    
    def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a session."""
        if self.validate_session(session_id):
            return self.active_sessions[session_id]
        return None
    
    def cleanup_expired_sessions(self) -> int:
        """Remove expired sessions and return count of removed sessions."""
        current_time = datetime.now()
        expired_sessions = [
            session_id for session_id, session in self.active_sessions.items()
            if current_time > session['expires_at']
        ]
        
        for session_id in expired_sessions:
            del self.active_sessions[session_id]
        
        if expired_sessions:
            logger.info(f"Cleaned up {len(expired_sessions)} expired sessions")
        
        return len(expired_sessions) 
 