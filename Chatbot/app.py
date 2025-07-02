"""
CodeMentor Chatbot Backend
A comprehensive AI chatbot server for the CodeMentor platform.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
import json
import logging
from datetime import datetime
from dotenv import load_dotenv

# Import custom modules
from services.ai_service import AIService
from services.chat_service import ChatService
from services.auth_service import AuthService
from models.chat_models import ChatRequest, ChatResponse, Message
from utils.logger import setup_logger
from utils.config import Config

# Load environment variables
load_dotenv()

# Setup logging
logger = setup_logger()

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS
CORS(app, origins=app.config['ALLOWED_ORIGINS'])

# Initialize SocketIO for real-time communication
socketio = SocketIO(app, cors_allowed_origins=app.config['ALLOWED_ORIGINS'])

# Initialize services
ai_service = AIService()
chat_service = ChatService()
auth_service = AuthService()

@app.route('/')
def root():
    """Root endpoint with API information."""
    return jsonify({
        "service": "CodeMentor AI Chatbot Server",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "chat": "/chat (POST)",
            "chat_stream": "/chat/stream (POST)",
            "health": "/health (GET)",
            "models": "/models (GET)",
            "websocket": "Socket.IO connection"
        },
        "documentation": "/docs"
    })

@app.route('/health')
def health_check():
    """Health check endpoint."""
    try:
        # Check AI service health
        ai_health = ai_service.health_check()
        
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "service": "CodeMentor AI Chatbot",
            "ai_service": ai_health,
            "version": "1.0.0"
        })
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint that accepts messages and returns AI responses.
    
    Expected request format:
    {
        "message": "User's message",
        "history": [
            {"role": "user", "content": "Previous user message"},
            {"role": "assistant", "content": "Previous bot response"}
        ],
        "model": "gpt-3.5-turbo" (optional),
        "temperature": 0.7 (optional),
        "max_tokens": 1000 (optional)
    }
    """
    try:
        # Validate request
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        data = request.get_json()
        
        # Parse and validate request
        try:
            chat_request = ChatRequest(**data)
        except Exception as e:
            return jsonify({"error": f"Invalid request format: {str(e)}"}), 400
        
        # Log the request
        logger.info(f"Chat request received: {chat_request.message[:100]}...")
        
        # Process the message
        response = chat_service.process_message(chat_request)
        
        # Log the response
        logger.info(f"Chat response generated: {response.response[:100]}...")
        
        return jsonify(response.dict())
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.route('/chat/stream', methods=['POST'])
def chat_stream():
    """
    Streaming chat endpoint for real-time responses.
    """
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        data = request.get_json()
        chat_request = ChatRequest(**data)
        
        def generate():
            try:
                for chunk in chat_service.process_message_stream(chat_request):
                    yield f"data: {json.dumps(chunk.dict())}\n\n"
            except Exception as e:
                error_chunk = {"error": str(e), "type": "error"}
                yield f"data: {json.dumps(error_chunk)}\n\n"
        
        return app.response_class(
            generate(),
            mimetype='text/plain',
            headers={'Cache-Control': 'no-cache', 'Connection': 'keep-alive'}
        )
        
    except Exception as e:
        logger.error(f"Error in streaming chat: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/models', methods=['GET'])
def get_models():
    """Get available AI models."""
    try:
        models = ai_service.get_available_models()
        return jsonify({
            "models": models,
            "default_model": ai_service.default_model
        })
    except Exception as e:
        logger.error(f"Error getting models: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/chat/history', methods=['GET'])
def get_chat_history():
    """Get chat history for a user (if authentication is implemented)."""
    try:
        # This would typically require user authentication
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "user_id parameter required"}), 400
        
        history = chat_service.get_chat_history(user_id)
        return jsonify({"history": history})
    except Exception as e:
        logger.error(f"Error getting chat history: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Socket.IO events for real-time communication
@socketio.on('connect')
def handle_connect():
    """Handle client connection."""
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'message': 'Connected to CodeMentor Chatbot'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection."""
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('chat_message')
def handle_chat_message(data):
    """Handle real-time chat messages."""
    try:
        chat_request = ChatRequest(**data)
        response = chat_service.process_message(chat_request)
        
        emit('chat_response', response.dict())
    except Exception as e:
        logger.error(f"Error in socket chat: {str(e)}")
        emit('error', {'error': str(e)})

@socketio.on('typing')
def handle_typing(data):
    """Handle typing indicators."""
    emit('typing', data, broadcast=True, include_self=False)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting CodeMentor Chatbot Server on port {port}")
    logger.info(f"Debug mode: {debug}")
    
    if debug:
        app.run(host='0.0.0.0', port=port, debug=True)
    else:
        socketio.run(app, host='0.0.0.0', port=port, debug=False) 