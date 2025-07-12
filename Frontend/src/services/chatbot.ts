export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  error?: string;
}

class ChatbotService {
  private apiUrl: string;

  constructor(apiUrl: string = '/chatbot/chat') {
    this.apiUrl = apiUrl;
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      throw error;
    }
  }

  // Method to update the API URL (useful for different environments)
  setApiUrl(url: string) {
    this.apiUrl = url;
  }

  // Method to get current API URL
  getApiUrl(): string {
    return this.apiUrl;
  }
}

// Create a singleton instance
export const chatbotService = new ChatbotService();

// Export the class for custom instances
export default ChatbotService; 