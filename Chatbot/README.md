# CodeMentor Chatbot Backend

A comprehensive AI chatbot server for the CodeMentor platform, built with Flask and designed to integrate with various AI providers.

## Features

- **Multi-AI Provider Support**: OpenAI GPT models, Anthropic Claude models, and fallback responses
- **Real-time Communication**: WebSocket support via Socket.IO
- **Streaming Responses**: Server-sent events for real-time response streaming
- **Session Management**: Conversation history and session tracking
- **RESTful API**: Clean REST endpoints for chat functionality
- **Health Monitoring**: Built-in health checks and monitoring
- **Docker Support**: Containerized deployment with Docker and Docker Compose
- **Configurable**: Environment-based configuration
- **Logging**: Comprehensive logging system

## Quick Start

### Prerequisites

- Python 3.10+
- pip
- Docker (optional)

### Local Development

1. **Clone and navigate to the chatbot directory:**
   ```bash
   cd Chatbot
   ```

2. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Run the server:**
   ```bash
   python start.py
   ```

The server will start on `http://localhost:5000`

### Docker Deployment

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Or build and run manually:**
   ```bash
   docker build -t codementor-chatbot .
   docker run -p 5000:5000 --env-file .env codementor-chatbot
   ```

## API Endpoints

### Chat Endpoints

- `POST /chat` - Send a message and get AI response
- `POST /chat/stream` - Stream AI responses in real-time
- `GET /chat/history` - Get chat history for a user

### System Endpoints

- `GET /` - API information and status
- `GET /health` - Health check
- `GET /models` - Available AI models

### WebSocket Events

- `connect` - Client connection
- `disconnect` - Client disconnection
- `chat_message` - Send chat message
- `typing` - Typing indicators

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_ENV` | Flask environment | `development` |
| `SECRET_KEY` | Flask secret key | `your-secret-key-change-in-production` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000,http://localhost:5173` |
| `DEFAULT_AI_MODEL` | Default AI model | `gpt-3.5-turbo` |
| `OPENAI_API_KEY` | OpenAI API key | None |
| `ANTHROPIC_API_KEY` | Anthropic API key | None |
| `MAX_MESSAGE_LENGTH` | Maximum message length | `4000` |
| `MAX_HISTORY_LENGTH` | Maximum conversation history | `50` |
| `DEFAULT_TEMPERATURE` | AI response creativity | `0.7` |
| `DEFAULT_MAX_TOKENS` | Maximum response length | `1000` |
| `LOG_LEVEL` | Logging level | `INFO` |

### AI Provider Setup

#### OpenAI
1. Get your API key from [OpenAI Platform](https://platform.openai.com/)
2. Set `OPENAI_API_KEY` in your environment
3. Available models: `gpt-3.5-turbo`, `gpt-4`, `gpt-4-turbo`

#### Anthropic
1. Get your API key from [Anthropic Console](https://console.anthropic.com/)
2. Set `ANTHROPIC_API_KEY` in your environment
3. Available models: `claude-3-haiku`, `claude-3-sonnet`, `claude-3-opus`

## Usage Examples

### Basic Chat Request

```bash
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! Can you help me with Python programming?",
    "model": "gpt-3.5-turbo",
    "temperature": 0.7,
    "max_tokens": 1000
  }'
```

### Chat with History

```bash
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the difference between a list and a tuple?",
    "history": [
      {"role": "user", "content": "Hello!"},
      {"role": "assistant", "content": "Hello! How can I help you with Python programming?"}
    ],
    "session_id": "user123"
  }'
```

### Streaming Response

```bash
curl -X POST http://localhost:5000/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain recursion in programming",
    "model": "gpt-4"
  }'
```

### WebSocket Connection (JavaScript)

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to chatbot');
});

socket.emit('chat_message', {
  message: 'Hello!',
  model: 'gpt-3.5-turbo'
});

socket.on('chat_response', (response) => {
  console.log('AI Response:', response.response);
});
```

## Project Structure

```
Chatbot/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
├── env.example           # Environment variables example
├── README.md             # This file
├── models/               # Data models
│   ├── __init__.py
│   └── chat_models.py    # Pydantic models
├── services/             # Business logic
│   ├── __init__.py
│   ├── ai_service.py     # AI provider integration
│   ├── chat_service.py   # Chat processing
│   └── auth_service.py   # Authentication
└── utils/                # Utilities
    ├── __init__.py
    ├── config.py         # Configuration management
    └── logger.py         # Logging setup
```

## Development

### Adding New AI Providers

1. Update `services/ai_service.py` to add new provider support
2. Add provider-specific configuration in `utils/config.py`
3. Update `requirements.txt` with new dependencies
4. Add provider to the available models list

### Adding New Features

1. Create new service classes in the `services/` directory
2. Add new endpoints in `app.py`
3. Update models in `models/chat_models.py` if needed
4. Add tests for new functionality

### Testing

```bash
# Run tests (when implemented)
python -m pytest

# Run with coverage
python -m pytest --cov=.
```

## Deployment

### Production Considerations

1. **Security**: Change default secret keys and API keys
2. **Environment**: Set `FLASK_ENV=production`
3. **Logging**: Configure proper log rotation and monitoring
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Database**: Set up persistent storage for conversations
6. **SSL**: Use HTTPS in production
7. **Monitoring**: Set up health checks and monitoring

### Docker Production

```bash
# Build production image
docker build -t codementor-chatbot:latest .

# Run with production environment
docker run -d \
  -p 5000:5000 \
  --env-file .env.production \
  --name chatbot \
  codementor-chatbot:latest
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check `ALLOWED_ORIGINS` configuration
2. **AI API Errors**: Verify API keys and model availability
3. **Memory Issues**: Adjust `MAX_HISTORY_LENGTH` and conversation limits
4. **Performance**: Use streaming responses for long conversations

### Logs

Check logs in the `logs/` directory or Docker logs:

```bash
# Docker logs
docker logs chatbot

# Local logs
tail -f logs/chatbot_$(date +%Y%m%d).log
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is part of the CodeMentor platform.

## Support

For support and questions:
- Check the logs for error messages
- Review the configuration
- Test with the health endpoint
- Open an issue with detailed information 