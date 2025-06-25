# Chatbot Integration

This document explains how to set up and configure the chatbot feature in CodeMentor.

## Features

- **Floating Chat Button**: A circular button in the bottom-right corner of every page
- **Expandable Chat Window**: Click the button to open/close the chat interface
- **Real-time Messaging**: Send messages and receive responses from your AI server
- **Message History**: Maintains conversation context
- **Loading States**: Visual feedback while waiting for responses
- **Responsive Design**: Works on desktop and mobile devices

## Setup

### 1. Environment Configuration

Create a `.env` file in the Frontend directory with the following variables:

```env
# Chatbot API Configuration
VITE_CHATBOT_API_URL=http://localhost:5000/chat

# Backend API Configuration
VITE_API_URL=http://localhost:8080/api/v1
```

### 2. AI Server Requirements

Your AI server should accept POST requests at the configured endpoint with the following format:

**Request Body:**
```json
{
  "message": "User's message here",
  "history": [
    {
      "role": "user",
      "content": "Previous user message"
    },
    {
      "role": "assistant", 
      "content": "Previous bot response"
    }
  ]
}
```

**Response Body:**
```json
{
  "response": "AI assistant's response here"
}
```

### 3. API Endpoint Structure

The chatbot expects your AI server to:
- Accept POST requests
- Return JSON responses
- Include a `response` field in the response
- Handle conversation history for context

## Usage

### For Users

1. **Open Chat**: Click the chat button (message icon) in the bottom-right corner
2. **Send Message**: Type your message and press Enter or click the send button
3. **Close Chat**: Click the X button to close the chat window
4. **View History**: Previous messages are displayed in the chat window

### For Developers

#### Customizing the Chatbot

You can customize the chatbot by modifying the `Chatbot` component:

```tsx
// Custom API URL
<Chatbot apiUrl="https://your-custom-ai-server.com/chat" />

// Default behavior (uses environment variable)
<Chatbot />
```

#### Styling

The chatbot uses Tailwind CSS classes and can be customized by modifying:
- `Frontend/src/components/Chatbot.tsx` - Main component styling
- `Frontend/src/index.css` - Global styles

#### Service Integration

The chatbot service is located at `Frontend/src/services/chatbot.ts` and provides:
- Message sending functionality
- Error handling
- API URL configuration

## Troubleshooting

### Common Issues

1. **Chatbot not appearing**: Check that the component is imported and rendered in `App.tsx`
2. **API connection errors**: Verify the `VITE_CHATBOT_API_URL` environment variable
3. **CORS issues**: Ensure your AI server allows requests from the frontend domain
4. **Message not sending**: Check browser console for network errors

### Debug Mode

Enable debug logging by adding this to your `.env` file:
```env
VITE_DEBUG=true
```

## Security Considerations

- The chatbot sends conversation history to your AI server
- Ensure your AI server implements proper authentication if needed
- Consider rate limiting to prevent abuse
- Validate and sanitize user inputs on the server side

## Performance

- Messages are stored in component state (cleared on page refresh)
- Consider implementing persistent storage for longer conversations
- The chat window is optimized for performance with virtual scrolling for large message histories

## Future Enhancements

Potential improvements:
- Persistent message storage
- File upload support
- Voice messages
- Typing indicators
- Message reactions
- Conversation export
- Custom themes 