#!/usr/bin/env python3
"""
Startup script for CodeMentor Chatbot
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 10):
        print("❌ Python 3.10 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True

def check_dependencies():
    """Check if required dependencies are installed."""
    try:
        import flask
        import flask_cors
        import pydantic
        print("✅ All required dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Run: pip install -r requirements.txt")
        return False

def setup_environment():
    """Setup environment variables if .env doesn't exist."""
    env_file = Path(".env")
    if not env_file.exists():
        print("📝 Creating .env file from template...")
        try:
            with open("env.example", "r") as f:
                env_content = f.read()
            
            with open(".env", "w") as f:
                f.write(env_content)
            
            print("✅ Created .env file")
            print("⚠️  Please edit .env file with your API keys")
        except FileNotFoundError:
            print("❌ env.example not found")
            return False
    else:
        print("✅ .env file exists")
    return True

def create_logs_directory():
    """Create logs directory if it doesn't exist."""
    logs_dir = Path("logs")
    if not logs_dir.exists():
        logs_dir.mkdir()
        print("✅ Created logs directory")
    else:
        print("✅ Logs directory exists")

def start_server():
    """Start the Flask server."""
    print("\n🚀 Starting CodeMentor Chatbot Server...")
    print("📍 Server will be available at: http://localhost:5000")
    print("🔍 Health check: http://localhost:5000/health")
    print("📚 API docs: http://localhost:5000")
    print("\nPress Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        from app import app
        app.run(host='0.0.0.0', port=5000, debug=True)
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return False
    
    return True

def main():
    """Main startup function."""
    print("🤖 CodeMentor Chatbot Startup")
    print("=" * 40)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Setup environment
    if not setup_environment():
        sys.exit(1)
    
    # Create logs directory
    create_logs_directory()
    
    # Start server
    start_server()

if __name__ == "__main__":
    main() 