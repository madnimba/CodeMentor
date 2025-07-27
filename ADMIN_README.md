# CodeMentor Admin System

This document describes the admin system implementation for the CodeMentor platform.

## Overview

The admin system provides a comprehensive interface for administrators to manage the platform's content, users, and settings. It includes separate authentication, protected endpoints, and a dedicated admin interface.

## Features

### Authentication & Security
- **Separate Admin Authentication**: Admin users have their own sign-in endpoint (`/admin/auth/signin`)
- **Role-Based Access Control**: Only users with `isAdmin = true` can access admin endpoints
- **Protected Endpoints**: All admin endpoints require admin authentication
- **JWT Token Management**: Separate token storage for admin sessions

### Dashboard
- **Statistics Overview**: Total users, companies, questions, articles
- **Pending Approvals**: Unapproved articles and questions count
- **Quick Actions**: Direct links to manage different sections
- **System Status**: Platform health monitoring

### User Management
- **View All Users**: Paginated list of all registered users
- **Edit User Information**: Update email, username, preferences, and admin status
- **Delete Users**: Remove user accounts from the system
- **User Details**: View user creation date, role, and preferences

### Article Management
- **View All Articles**: Complete list of study materials
- **Pending Approvals**: Articles waiting for admin approval
- **Approve Articles**: Approve articles for public viewing
- **Edit Articles**: Update content, metadata, and approval status
- **Delete Articles**: Remove articles from the system

### Question Management
- **View All Questions**: Complete list of coding questions
- **Pending Approvals**: Questions waiting for admin approval
- **Approve Questions**: Approve questions for public use
- **Edit Questions**: Update content, difficulty, and metadata
- **Delete Questions**: Remove questions from the system

### Company Management
- **View All Companies**: List of all companies in the system
- **Add Companies**: Create new company entries
- **Edit Companies**: Update company information and details
- **Delete Companies**: Remove companies from the system

## Technical Implementation

### Backend

#### Controllers
- `AdminController`: Main admin endpoints with `@PreAuthorize("hasRole('ADMIN')")`
- `AdminAuthController`: Admin authentication endpoints

#### Services
- `AdminService`: Business logic for all admin operations
- `AdminAuthService`: Admin authentication with role verification

#### DTOs
- `AdminDashboardStats`: Dashboard statistics
- `AdminUserResponse`, `AdminArticleResponse`, `AdminQuestionResponse`, `AdminCompanyResponse`: Response DTOs
- `UpdateUserRequest`, `UpdateArticleRequest`, `UpdateQuestionRequest`, `UpdateCompanyRequest`: Update DTOs
- `CreateCompanyRequest`: Company creation DTO

#### Security Configuration
- Admin endpoints protected with `hasRole('ADMIN')`
- Separate authentication flow for admin users
- Role verification in authentication service

### Frontend

#### Context & Authentication
- `AdminAuthContext`: Admin authentication state management
- `AdminAuthProvider`: Provides admin auth context to the app
- `AdminProtectedRoute`: Route protection for admin pages

#### Services
- `adminAuth.ts`: Admin authentication API calls
- `admin.ts`: All admin management API calls

#### Pages
- `AdminAuth.tsx`: Admin sign-in page
- `AdminDashboard.tsx`: Main admin dashboard
- `AdminUsers.tsx`: User management interface
- `AdminArticles.tsx`: Article management interface
- `AdminQuestions.tsx`: Question management interface
- `AdminCompanies.tsx`: Company management interface

#### Components
- `AdminNavigation.tsx`: Navigation bar for admin pages

## API Endpoints

### Authentication
- `POST /admin/auth/signin` - Admin sign in
- `POST /admin/auth/signout` - Admin sign out

### Dashboard
- `GET /admin/dashboard/stats` - Get dashboard statistics

### User Management
- `GET /admin/users` - Get all users (paginated)
- `GET /admin/users/{id}` - Get user by ID
- `PUT /admin/users/{id}` - Update user
- `DELETE /admin/users/{id}` - Delete user

### Article Management
- `GET /admin/articles` - Get all articles (paginated)
- `GET /admin/articles/unapproved` - Get unapproved articles
- `GET /admin/articles/{id}` - Get article by ID
- `PUT /admin/articles/{id}` - Update article
- `DELETE /admin/articles/{id}` - Delete article
- `POST /admin/articles/{id}/approve` - Approve article

### Question Management
- `GET /admin/questions` - Get all questions (paginated)
- `GET /admin/questions/unapproved` - Get unapproved questions
- `GET /admin/questions/{id}` - Get question by ID
- `PUT /admin/questions/{id}` - Update question
- `DELETE /admin/questions/{id}` - Delete question
- `POST /admin/questions/{id}/approve` - Approve question

### Company Management
- `GET /admin/companies` - Get all companies (paginated)
- `GET /admin/companies/{id}` - Get company by ID
- `POST /admin/companies` - Create company
- `PUT /admin/companies/{id}` - Update company
- `DELETE /admin/companies/{id}` - Delete company

## Usage

### Setting Up Admin Users
1. Create a regular user account
2. Set `isAdmin = true` in the database for that user
3. Use the regular sign-in credentials on the admin sign-in page

### Accessing Admin Panel
1. Navigate to `/admin/auth`
2. Sign in with admin credentials
3. Access the admin dashboard at `/admin/dashboard`

### Managing Content
1. Use the navigation to access different management sections
2. View, edit, approve, or delete content as needed
3. Monitor pending approvals from the dashboard

## Security Considerations

- All admin endpoints require admin role authentication
- Admin tokens are stored separately from regular user tokens
- Failed authentication redirects to admin login
- Role verification happens on both frontend and backend
- Admin routes are completely separate from regular user routes

## Future Enhancements

- Audit logging for admin actions
- Bulk operations for content management
- Advanced analytics and reporting
- User activity monitoring
- Content versioning and rollback
- Advanced permission system with multiple admin roles 