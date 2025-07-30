# CodeMentor 🚀

A comprehensive **Tech Interview Preparation Platform** that helps developers prepare for technical interviews through structured learning paths, practice problems, live coding, AI-powered assistance, and company-specific question banks.

## 🌟 Features

### 📊 **Dashboard & Progress Tracking**
- **Personalized Dashboard** with comprehensive progress analytics
- **Progress by Topic** - Track articles read and questions solved per topic
- **Overall Progress Summary** - Total articles and questions completion
- **User Statistics** - Problems attempted, solved, accuracy rate, and streak tracking
- **Recent Activity** - Timeline of user's learning activities

### 📚 **Learning Materials**
- **Article-based Learning** with structured content by topics
- **Topic & Subtopic Organization** for systematic learning
- **Track-based Learning Paths** for different skill levels
- **Job Role-specific Content** tailored to different positions

### 💻 **Practice & Coding**
- **Live Code Editor** with real-time execution
- **Multiple Programming Languages** support (JavaScript, Python, Java, C++)
- **Coding Problems** with test cases and solutions
- **Non-coding Questions** for theoretical knowledge
- **Company-specific Question Banks** from top tech companies

### 🤖 **AI-Powered Assistance**
- **Intelligent Chatbot** with multi-AI provider support
- **Real-time Code Debugging** and solution suggestions
- **Personalized Learning Recommendations**
- **Streaming AI Responses** for interactive assistance

### 🏢 **Company Integration**
- **Company-specific Question Banks** from top tech companies
- **Progress Tracking per Company** to focus on target companies
- **Featured Companies** with curated question sets

## 🏗️ Architecture

CodeMentor is built as a **microservices architecture** with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Code Editor   │
│   (React/TS)    │◄──►│ (Spring Boot)   │◄──►│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Chatbot       │    │   PostgreSQL    │    │   Docker        │
│   (Python/Flask)│    │   Database      │    │   Containers    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **React Router DOM** for navigation
- **Monaco Editor** for code editing
- **React Query** for state management
- **Lucide React** for icons

### **Backend**
- **Java 17** with Spring Boot 3.2.3
- **Spring Security** with JWT authentication
- **Spring Data JPA** with Hibernate
- **PostgreSQL** database (Supabase)
- **Maven** for dependency management

### **Code Execution Service**
- **Node.js** with WebSocket support
- **Docker** for isolated code execution
- **Judge0 API** integration for code compilation
- **Resource limits** for security

### **AI Chatbot**
- **Python 3.10+** with Flask
- **Multi-AI Provider Support** (OpenAI GPT, Anthropic Claude)
- **WebSocket** for real-time communication
- **Streaming Responses** with Server-Sent Events

### **Infrastructure**
- **Docker & Docker Compose** for containerization
- **Nginx** for reverse proxy and load balancing
- **PostgreSQL** for data persistence

## 🚀 Quick Start

### **Prerequisites**
- Java 17 or higher
- Node.js 18 or higher
- Python 3.10 or higher
- Docker and Docker Compose
- PostgreSQL (or Supabase account)

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/codementor.git
cd codementor
```

### **2. Environment Setup**
```bash
# Copy environment files
cp env.example .env
cp Frontend/.env.example Frontend/.env
cp Backend/.env.example Backend/.env
cp Chatbot/env.example Chatbot/.env

# Edit the .env files with your configuration
```

### **3. Using Docker (Recommended)**
```bash
# Start all services
docker-compose up --build

# The application will be available at:
# Frontend: http://localhost
# Backend API: http://localhost:8080/api/v1
# Chatbot: http://localhost:5000
# Code Editor: http://localhost:3000
```

### **4. Local Development**

#### **Backend**
```bash
cd Backend
mvn clean install
mvn spring-boot:run
```

#### **Frontend**
```bash
cd Frontend
npm install
npm run dev
```

#### **Code Editor Service**
```bash
cd code-editor
npm install
npm start
```

#### **Chatbot Service**
```bash
cd Chatbot
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python start.py
```

## 📁 Project Structure

```
CodeMentor/
├── Frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── Backend/                 # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/codementor/
│   │       ├── controller/ # REST controllers
│   │       ├── service/    # Business logic
│   │       ├── repository/ # Data access layer
│   │       ├── model/      # Entity classes
│   │       └── config/     # Configuration classes
│   └── pom.xml
├── Chatbot/                 # AI chatbot service
│   ├── services/           # AI provider services
│   ├── models/             # Data models
│   ├── utils/              # Utility functions
│   └── app.py             # Flask application
├── code-editor/            # Code execution service
│   ├── src/               # Node.js source code
│   └── package.json
├── nginx/                  # Nginx configuration
├── Data/                   # Database scripts and data
└── docker-compose.yml      # Docker orchestration
```

## 🔧 Configuration

### **Environment Variables**

#### **Main Application (.env)**
```env
# Database
DB_URL=your_postgresql_url
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=86400000

# Server
SERVER_PORT=8080
SERVER_CONTEXT_PATH=/api/v1

# AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
DEFAULT_AI_MODEL=gpt-3.5-turbo

# Code Execution
JUDGE0_API=your_judge0_api
RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
RAPIDAPI_KEY=your_rapidapi_key
```

## 📊 Key Features in Detail

### **Dashboard Analytics**
- **Progress Tracking**: Real-time tracking of articles read and questions solved
- **Topic-based Progress**: Detailed breakdown by learning topics
- **Company Progress**: Track progress for specific companies
- **User Statistics**: Accuracy rate, streak tracking, and performance metrics

### **Learning System**
- **Structured Content**: Articles organized by topics and subtopics
- **Interactive Learning**: Mark articles as read with progress tracking
- **Learning Paths**: Guided learning tracks for different skill levels
- **Progress Visualization**: Beautiful charts and progress indicators

### **Practice Platform**
- **Live Coding**: Real-time code editor with execution
- **Multiple Languages**: Support for JavaScript, Python, Java, C++
- **Test Cases**: Comprehensive test case validation
- **Solution Tracking**: Track completed vs attempted problems

### **AI Integration**
- **Smart Chatbot**: AI-powered assistance for learning
- **Code Debugging**: Real-time code analysis and suggestions
- **Learning Recommendations**: Personalized content suggestions
- **Multi-Provider Support**: OpenAI GPT and Anthropic Claude

## 🧪 Testing

### **Frontend Testing**
```bash
cd Frontend
npm run test
npm run test:coverage
```

### **Backend Testing**
```bash
cd Backend
mvn test
```

## 🚀 Deployment

### **Production Deployment**
```bash
# Build and deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up --build -d
```

### **Environment-Specific Configurations**
- **Development**: `docker-compose.yml`
- **Production**: `docker-compose.prod.yml`

## 🤝 Contributing

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 API Documentation

### **Authentication Endpoints**
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh JWT token

### **Dashboard Endpoints**
- `GET /api/v1/dashboard/topic-progress` - Get progress by topic
- `GET /api/v1/dashboard/overall-progress` - Get overall progress
- `GET /api/v1/dashboard/user-stats` - Get user statistics

### **Articles Endpoints**
- `GET /api/v1/articles` - Get all articles
- `GET /api/v1/articles/{slug}` - Get article by slug
- `POST /api/v1/articles/{id}/mark-read` - Mark article as read

### **Questions Endpoints**
- `GET /api/v1/questions` - Get all questions
- `GET /api/v1/questions/{id}` - Get question by ID
- `POST /api/v1/questions/{id}/complete` - Mark question as completed

### **Companies Endpoints**
- `GET /api/v1/companies` - Get all companies
- `GET /api/v1/companies/{id}/questions` - Get company questions

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Spring Boot** team for the excellent framework
- **React** team for the amazing frontend library
- **Tailwind CSS** for the utility-first CSS framework
- **Shadcn/ui** for the beautiful component library
- **OpenAI** and **Anthropic** for AI capabilities
- **Judge0** for code execution services

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Made with ❤️ by the CodeMentor Team** 