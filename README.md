# PlanIt - Task and Milestone Management System

PlanIt is a modern, full-stack task and milestone management application that helps users organize their projects with hierarchical milestones, share roadmaps, and track progress effectively.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication with refresh token support
- **Task Management**: Create, update, and organize tasks
- **Milestone Hierarchy**: Create nested milestones with parent-child relationships
- **Progress Tracking**: Track milestone status (Not Started, In Progress, Completed, At Risk, Delayed)
- **Roadmap Sharing**: Share project roadmaps via public links
- **Roadmap Cloning**: Clone and customize existing roadmaps
- **Real-time Updates**: Track changes with timestamps
- **Responsive UI**: Modern, responsive interface built with React and Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with refresh tokens
- **Testing**: Jest with supertest
- **API Documentation**: Comprehensive markdown docs
- **Rate Limiting**: Express rate limiter for API protection

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit
- **Routing**: React Router v7
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with class-variance-authority
- **Build Tool**: Vite
- **Data Visualization**: D3.js
- **Animations**: Framer Motion
- **HTTP Client**: Axios

## 🏗️ Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, error handling, rate limiting
│   │   ├── routes/        # API route definitions
│   │   ├── service/       # Business logic
│   │   └── utils/         # Helper functions
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── tests/            # Unit, integration, and E2E tests
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── features/     # Feature-specific components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Route components
│   │   ├── services/    # API clients
│   │   ├── store/       # Redux store config
│   │   └── utils/       # Helper functions
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- pnpm (recommended) or npm

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your PostgreSQL connection string and JWT secrets.

4. Run database migrations:
   ```bash
   pnpm prisma migrate dev
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
    npm install
   ```

3. Start the development server:
   ```bash
   npm dev
   ```

## 🧪 Testing

### Backend Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run specific test suites
npm test:unit
npm test:integration
npm test:e2e

# Generate coverage report
npm test:coverage
```

## 📝 API Documentation

Detailed API documentation is available in the `backend/docs` directory:
- `API_ENDPOINTS.md`: Complete API endpoint documentation
- `TESTING_SUMMARY.md`: Testing strategy and coverage
- `ADVANCED_RATE_LIMITING.md`: Rate limiting implementation details

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with unique salts
- Rate limiting on sensitive endpoints
- CORS protection
- Input validation and sanitization
- Secure password reset flow

## 🎯 Future Enhancements

- Real-time collaboration using WebSockets
- Project templates
- Advanced analytics and reporting
- Timeline visualization
- Mobile applications
- Integration with third-party tools

