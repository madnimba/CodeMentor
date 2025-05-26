# CodeMentor

CodeMentor is a tech interview preparation platform that helps developers prepare for technical interviews through structured learning paths, practice problems, and study materials.

## Features

- User Authentication and Authorization
- Article-based Learning Materials
- Job Role-specific Content
- Track-based Learning Paths
- Topic and Subtopic Organization
- Practice Questions with Solutions
- Company-specific Question Bank

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.2.3
- Spring Security with JWT
- PostgreSQL (Supabase)
- Maven

### Frontend (Coming Soon)
- React
- TypeScript
- Tailwind CSS

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven
- PostgreSQL (or Supabase account)

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
SPRING_DATASOURCE_URL=your_database_url
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

### Running the Application
1. Clone the repository
```bash
git clone https://github.com/yourusername/codementor.git
cd codementor
```

2. Build the project
```bash
mvn clean install
```

3. Run the application
```bash
mvn spring-boot:run
```

The application will be available at `http://localhost:8080/api/v1`

## API Documentation

### Authentication Endpoints
- POST `/api/v1/auth/register` - Register a new user
- POST `/api/v1/auth/login` - Login user

### Article Endpoints
- GET `/api/v1/articles` - Get all articles
- GET `/api/v1/articles/{slug}` - Get article by slug
- POST `/api/v1/articles` - Create new article (requires authentication)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 