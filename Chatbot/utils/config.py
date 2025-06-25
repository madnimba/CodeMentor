"""
Configuration for CodeMentor Chatbot
"""

import os
from typing import List

class Config:
    """Configuration class for the chatbot application."""
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_ENV') == 'development'
    
    # CORS Configuration
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(',')
    
    # AI Configuration
    DEFAULT_AI_MODEL = os.getenv('DEFAULT_AI_MODEL', 'gpt-3.5-turbo')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
    
    # Chat Configuration
    MAX_MESSAGE_LENGTH = int(os.getenv('MAX_MESSAGE_LENGTH', '4000'))
    MAX_HISTORY_LENGTH = int(os.getenv('MAX_HISTORY_LENGTH', '50'))
    DEFAULT_TEMPERATURE = float(os.getenv('DEFAULT_TEMPERATURE', '0.7'))
    DEFAULT_MAX_TOKENS = int(os.getenv('DEFAULT_MAX_TOKENS', '1000'))
    
    # Session Configuration
    SESSION_DURATION_HOURS = int(os.getenv('SESSION_DURATION_HOURS', '24'))
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS = int(os.getenv('RATE_LIMIT_REQUESTS', '100'))
    RATE_LIMIT_WINDOW = int(os.getenv('RATE_LIMIT_WINDOW', '3600'))  # 1 hour
    
    # Database Configuration (for future use)
    DATABASE_URL = os.getenv('DATABASE_URL')
    
    # Redis Configuration (for future use)
    REDIS_URL = os.getenv('REDIS_URL')
    
    @classmethod
    def validate(cls) -> List[str]:
        """Validate configuration and return list of warnings."""
        warnings = []
        
        if not cls.SECRET_KEY or cls.SECRET_KEY == 'your-secret-key-change-in-production':
            warnings.append("SECRET_KEY should be changed in production")
        
        if not cls.OPENAI_API_KEY and not cls.ANTHROPIC_API_KEY:
            warnings.append("No AI API keys configured - using fallback mode")
        
        if cls.DEBUG:
            warnings.append("Running in debug mode - not recommended for production")
        
        return warnings 