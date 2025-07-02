#!/bin/bash

# CodeMentor Chatbot Setup Script
echo "🚀 Setting up CodeMentor Chatbot Integration..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Chatbot API Configuration
VITE_CHATBOT_API_URL=http://localhost:5000/chat

# Backend API Configuration
VITE_API_URL=http://localhost:8080/api/v1

# Other Frontend Configuration
VITE_APP_NAME=CodeMentor
VITE_APP_VERSION=1.0.0
EOF
    echo "✅ .env file created successfully!"
else
    echo "ℹ️  .env file already exists. Please make sure it contains VITE_CHATBOT_API_URL"
fi

# Check if Python is installed
if command -v python3 &> /dev/null; then
    echo "🐍 Python 3 is installed"
    
    # Check if pip is installed
    if command -v pip3 &> /dev/null; then
        echo "📦 Installing Python dependencies..."
        pip3 install -r requirements.txt
        echo "✅ Python dependencies installed!"
    else
        echo "⚠️  pip3 not found. Please install pip3 to run the example AI server."
    fi
else
    echo "⚠️  Python 3 not found. Please install Python 3 to run the example AI server."
fi

echo ""
echo "🎉 Chatbot setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start your AI server (or run the example: python3 ai-server-example.py)"
echo "2. Start your Frontend development server: npm run dev"
echo "3. The chatbot button will appear in the bottom-right corner of every page"
echo ""
echo "📚 For more information, see CHATBOT_README.md"
echo "" 