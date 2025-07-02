"""
AI Service for CodeMentor Chatbot
"""

import os
import time
import logging
import requests
from typing import List, Optional, Dict, Any, Generator
from datetime import datetime

from models.chat_models import Message, ChatResponse, StreamingChunk, ModelInfo, HealthStatus

logger = logging.getLogger(__name__)

class AIService:
    """Service for handling AI model interactions."""
    
    def __init__(self):
        self.default_model = os.getenv('DEFAULT_AI_MODEL', 'llama3-70b-8192')
        self.groq_api_key = os.getenv('OPENAI_API_KEY')  # Using OPENAI_API_KEY for Groq
        self.groq_base_url = "https://api.groq.com/openai/v1"
    
    def get_available_models(self) -> List[ModelInfo]:
        """Get list of available AI models."""
        return [
            ModelInfo(
                name="llama3-70b-8192",
                provider="Groq",
                max_tokens=8192,
                cost_per_1k_tokens=0.0001,
                description="Fast Llama 3 70B model via Groq"
            ),
            ModelInfo(
                name="llama3-8b-8192",
                provider="Groq",
                max_tokens=8192,
                cost_per_1k_tokens=0.00005,
                description="Fast Llama 3 8B model via Groq"
            ),
            ModelInfo(
                name="mixtral-8x7b-32768",
                provider="Groq",
                max_tokens=32768,
                cost_per_1k_tokens=0.00024,
                description="Fast Mixtral 8x7B model via Groq"
            )
        ]
    
    def generate_response(
        self,
        messages: List[Message],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> ChatResponse:
        """Generate a response using the specified AI model."""
        start_time = time.time()
        
        if not model:
            model = self.default_model
        
        # Try to use Groq API if available
        if self.groq_api_key:
            try:
                return self._generate_groq_response(messages, model, temperature, max_tokens, start_time)
            except Exception as e:
                logger.warning(f"Groq API failed, falling back to default response: {str(e)}")
        
        # Fallback to simple responses
        return self._generate_fallback_response(messages, model, start_time)
    
    def _generate_groq_response(
        self,
        messages: List[Message],
        model: str,
        temperature: float,
        max_tokens: int,
        start_time: float
    ) -> ChatResponse:
        """Generate response using Groq API."""
        
        # Convert messages to OpenAI format
        openai_messages = []
        for msg in messages:
            openai_messages.append({
                "role": msg.role.value,
                "content": msg.content
            })
        
        # Prepare request payload
        payload = {
            "model": model,
            "messages": openai_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False
        }
        
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }
        
        # Make API request
        response = requests.post(
            f"{self.groq_base_url}/chat/completions",
            json=payload,
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            raise Exception(f"Groq API error: {response.status_code} - {response.text}")
        
        response_data = response.json()
        ai_response = response_data["choices"][0]["message"]["content"]
        processing_time = time.time() - start_time
        
        return ChatResponse(
            response=ai_response,
            model=model,
            processing_time=processing_time,
            metadata={
                "provider": "Groq",
                "usage": response_data.get("usage", {}),
                "model_used": model
            }
        )
    
    def _generate_fallback_response(
        self,
        messages: List[Message],
        model: str,
        start_time: float
    ) -> ChatResponse:
        """Generate a fallback response when AI providers are not available."""
        processing_time = time.time() - start_time
        
        # Simple response logic
        last_message = messages[-1].content.lower() if messages else ""
        
        if "hello" in last_message or "hi" in last_message:
            response = "Hello! I'm your AI coding assistant. How can I help you with your programming questions today?"
        elif "help" in last_message:
            response = "I'm here to help you with programming questions, code reviews, debugging, and learning new technologies. What would you like to know?"
        elif "code" in last_message or "programming" in last_message:
            response = "I can help you with coding questions, explain concepts, review code, and suggest improvements. What specific programming topic are you working on?"
        else:
            response = "I'm your AI coding assistant! I can help you with programming questions, code reviews, debugging, and learning new technologies. What would you like to know?"
        
        return ChatResponse(
            response=response,
            model=model,
            processing_time=processing_time,
            metadata={"fallback": True}
        )
    
    def health_check(self) -> HealthStatus:
        """Check the health of AI services."""
        details = {
            "default_model": self.default_model,
            "groq_api_configured": bool(self.groq_api_key)
        }
        
        # Test Groq API if configured
        if self.groq_api_key:
            try:
                test_response = requests.get(
                    f"{self.groq_base_url}/models",
                    headers={"Authorization": f"Bearer {self.groq_api_key}"},
                    timeout=5
                )
                details["groq_api_status"] = "healthy" if test_response.status_code == 200 else "unhealthy"
            except Exception as e:
                details["groq_api_status"] = f"error: {str(e)}"
        
        return HealthStatus(
            status="healthy" if self.groq_api_key else "fallback_mode",
            details=details
        ) 