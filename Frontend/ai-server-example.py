"""
Example AI Server for CodeMentor Chatbot Integration

This is a simple Flask server that demonstrates the expected API format
for the chatbot integration. Replace this with your actual AI implementation.

Run with: python ai-server-example.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

@app.route('/chat', methods=['POST'])
def chat():
    """
    Chat endpoint that accepts messages and returns AI responses.
    
    Expected request format:
    {
        "message": "User's message",
        "history": [
            {"role": "user", "content": "Previous user message"},
            {"role": "assistant", "content": "Previous bot response"}
        ]
    }
    
    Expected response format:
    {
        "response": "AI assistant's response"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        user_message = data.get('message', '')
        history = data.get('history', [])
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
        # Log the request for debugging
        print(f"[{datetime.now()}] Received message: {user_message}")
        print(f"[{datetime.now()}] History length: {len(history)}")
        
        # TODO: Replace this with your actual AI implementation
        # This is just a simple echo response for demonstration
        ai_response = generate_response(user_message, history)
        
        return jsonify({
            "response": ai_response,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

def generate_response(message: str, history: list) -> str:
    """
    Generate AI response based on user message and conversation history.
    
    Replace this function with your actual AI implementation.
    """
    # Simple response logic - replace with your AI model
    message_lower = message.lower()
    
    if "hello" in message_lower or "hi" in message_lower:
        return "Hello! How can I help you with your coding questions today?"
    
    elif "help" in message_lower:
        return "I'm here to help you with programming questions, code reviews, debugging, and learning new technologies. What would you like to know?"
    
    elif "code" in message_lower or "programming" in message_lower:
        return "I can help you with coding questions, explain concepts, review code, and suggest improvements. What specific programming topic are you working on?"
    
    elif "python" in message_lower:
        return "Python is a great programming language! I can help you with Python syntax, libraries, best practices, and problem-solving. What Python question do you have?"
    
    elif "javascript" in message_lower or "js" in message_lower:
        return "JavaScript is essential for web development! I can help you with JS syntax, frameworks, DOM manipulation, and more. What JavaScript topic are you exploring?"
    
    elif "react" in message_lower:
        return "React is a popular JavaScript library for building user interfaces! I can help you with React components, hooks, state management, and best practices. What React question do you have?"
    
    elif "thank" in message_lower:
        return "You're welcome! Feel free to ask more questions anytime."
    
    elif "bye" in message_lower or "goodbye" in message_lower:
        return "Goodbye! Happy coding! 🚀"
    
    else:
        # Default response
        return f"I received your message: '{message}'. I'm here to help with programming and coding questions. Could you please be more specific about what you'd like to learn or get help with?"

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "CodeMentor AI Chatbot"
    })

@app.route('/', methods=['GET'])
def root():
    """Root endpoint with API information."""
    return jsonify({
        "service": "CodeMentor AI Chatbot Server",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/chat (POST)",
            "health": "/health (GET)"
        },
        "usage": "Send POST requests to /chat with message and history"
    })

if __name__ == '__main__':
    print("Starting CodeMentor AI Chatbot Server...")
    print("Server will be available at: http://localhost:5000")
    print("Chat endpoint: http://localhost:5000/chat")
    print("Health check: http://localhost:5000/health")
    print("\nMake sure to update the VITE_CHATBOT_API_URL in your Frontend .env file to:")
    print("VITE_CHATBOT_API_URL=http://localhost:5000/chat")
    print("\nPress Ctrl+C to stop the server")
    
    app.run(host='0.0.0.0', port=5000, debug=True) 