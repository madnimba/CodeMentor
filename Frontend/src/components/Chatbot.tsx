import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, X, MessageCircle, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatbotService } from '@/services/chatbot';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  apiUrl?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ apiUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI coding assistant. How can I help you with programming today? 🚀',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set API URL if provided
  useEffect(() => {
    if (apiUrl) {
      chatbotService.setApiUrl(apiUrl);
    }
  }, [apiUrl]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatbotService.sendMessage({
        message: userMessage.text,
        history: messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      });
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response || 'Sorry, I couldn\'t process your request.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting to the server. Please try again later.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border-2 chat-button-float",
          isOpen 
            ? "bg-red-500 hover:bg-red-600 border-red-600 text-white" 
            : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-blue-400 text-white"
        )}
        size="icon"
      >
        {isOpen ? <X className="h-7 w-7" /> : <MessageCircle className="h-7 w-7" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-28 right-6 z-40 h-[500px] w-96 rounded-2xl shadow-2xl border-2 border-gray-200 bg-white/95 backdrop-blur-sm">
          <Card className="h-full flex flex-col bg-gradient-to-b from-white to-gray-50/50">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl flex-shrink-0">
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <div className="p-2 bg-white/20 rounded-full">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div>AI Coding Assistant</div>
                  <div className="text-xs font-normal opacity-90">Always here to help! 💻</div>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area - Native scrollable div */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-4 py-4 chatbot-scroll-area"
                style={{ maxHeight: '350px' }}
              >
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3 message-enter",
                        message.sender === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.sender === 'bot' && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      )}
                      
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-3 text-sm font-medium shadow-lg",
                          message.sender === 'user'
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                            : "bg-white border-2 border-gray-100 text-gray-800"
                        )}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                        <p className={cn(
                          "text-xs mt-2 opacity-70",
                          message.sender === 'user' ? "text-blue-100" : "text-gray-500"
                        )}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>

                      {message.sender === 'user' && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center shadow-lg">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3 justify-start message-enter">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 shadow-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4 bg-white/80 backdrop-blur-sm flex-shrink-0">
                <div className="flex gap-3">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your coding question..."
                    disabled={isLoading}
                    className="flex-1 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 font-medium"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    size="icon"
                    className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Press Enter to send • Shift+Enter for new line
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default Chatbot; 