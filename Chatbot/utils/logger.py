"""
Logging configuration for CodeMentor Chatbot
"""

import logging
import sys
from datetime import datetime
from utils.config import Config

def setup_logger(name: str = 'codementor_chatbot') -> logging.Logger:
    """Setup and configure the logger."""
    
    # Create logger
    logger = logging.getLogger(name)
    
    # Set log level
    log_level = getattr(logging, Config.LOG_LEVEL.upper(), logging.INFO)
    logger.setLevel(log_level)
    
    # Clear existing handlers
    logger.handlers.clear()
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    
    # Create formatter
    formatter = logging.Formatter(Config.LOG_FORMAT)
    console_handler.setFormatter(formatter)
    
    # Add handler to logger
    logger.addHandler(console_handler)
    
    # Create file handler for production
    if not Config.DEBUG:
        try:
            file_handler = logging.FileHandler(f'logs/chatbot_{datetime.now().strftime("%Y%m%d")}.log')
            file_handler.setLevel(log_level)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)
        except Exception as e:
            logger.warning(f"Could not create file handler: {e}")
    
    return logger

def get_logger(name: str = None) -> logging.Logger:
    """Get a logger instance."""
    if name:
        return logging.getLogger(f'codementor_chatbot.{name}')
    return logging.getLogger('codementor_chatbot') 