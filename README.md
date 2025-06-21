# 🫎 Moose Chat

A **backend-focused** real-time chat application built with FastAPI, featuring WebSocket connections for instant messaging. The React frontend was AI-generated to demonstrate the backend capabilities.

## ✨ Features

### Backend Technical Implementation
- **OAuth2.0 + JWT Authentication**: Secure token-based authentication with refresh tokens
- **SQLModel Integration**: Modern type-safe database operations with Pydantic validation
- **WebSocket Communication**: Real-time bidirectional messaging for instant chat
- **Async/Await Architecture**: Non-blocking I/O operations for high performance
- **Room-based Chat System**: Private conversations between users
- **Message History & Pagination**: Efficient message retrieval with timestamp-based pagination
- **Password Security**: Bcrypt hashing with salt for secure password storage
- **Database Migrations**: Alembic-powered schema versioning and updates

### Frontend Features (AI-Generated)
- **Responsive Design**: Modern, mobile-friendly user interface
- **Real-time Updates**: WebSocket integration for instant message display
- **User Management**: Registration, login, and profile management interface

## 🏗️ Architecture

This is primarily a **backend project** showcasing FastAPI capabilities, with an AI-generated frontend for demonstration:

### Backend (FastAPI) - *Hand-crafted*
- **API Layer**: RESTful endpoints for user management and messaging
- **Authentication**: JWT token-based authentication with OAuth2
- **Database**: SQLAlchemy ORM with Alembic migrations
- **WebSocket**: Real-time message broadcasting
- **Security**: Password hashing and token validation

### Frontend (React) - *AI-Generated for Demo*
- **Component-based**: Modular React components with hooks
- **State Management**: Context API and custom hooks
- **Routing**: React Router for navigation
- **Service Layer**: Separated API calls and business logic
- **Responsive UI**: CSS modules with modern design
- **Purpose**: Generated with AI to provide a functional interface for testing the backend APIs

## 📁 Project Structure

```
moose_chat/
├── app/                    # Backend FastAPI application
│   ├── api/               # API endpoints
│   ├── auth/              # Authentication logic
│   ├── core/              # Core configurations and utilities
│   ├── db/                # Database configuration
│   ├── migrations/        # Alembic database migrations
│   ├── models/            # SQLAlchemy models
│   └── schema/            # Pydantic schemas
├── frontend/              # React frontend application
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── contexts/      # React context providers
│       ├── hooks/         # Custom React hooks
│       ├── pages/         # Page components
│       ├── services/      # API service layer
│       ├── styles/        # CSS styling
│       └── utils/         # Utility functions
├── alembic.ini           # Alembic configuration
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd moose_chat
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up database**
   ```bash
   alembic upgrade head
   ```

5. **Run the backend server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./moose_chat.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Database Configuration

The application uses SQLite by default. To use PostgreSQL:

1. Install PostgreSQL dependencies:
   ```bash
   pip install psycopg2-binary
   ```

2. Update the database URL in your environment:
   ```env
   DATABASE_URL=postgresql://username:password@localhost/moose_chat
   ```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

- `POST /auth/token` - User login
- `POST /api/v1/user/create_user` - User registration
- `GET /api/v1/user/users` - Get all users
- `GET /api/v1/user/get_room/{user_id}` - Get or create chat room
- `GET /api/v1/user/get_messages/{room_id}` - Get message history
- `POST /api/v1/user/send_message/` - Send message
- `WS /api/v1/ws` - WebSocket connection for real-time messaging

## 🧪 Testing

### Backend Tests
```bash
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🛠️ Development

### Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:
```bash
alembic upgrade head
```

### Code Style

The project follows these conventions:
- **Python**: PEP 8 with Black formatter
- **JavaScript**: ESLint with Prettier
- **Git**: Conventional commits

## 🚢 Deployment

### Docker Deployment (Recommended)

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

### Manual Deployment

1. **Backend**: Deploy to services like Heroku, AWS, or DigitalOcean
2. **Frontend**: Build and deploy to Netlify, Vercel, or S3
   ```bash
   cd frontend
   npm run build
   ```

## 👨‍💻 Development Notes

### Project Focus: Backend Development
This is primarily a **backend-focused project** showcasing FastAPI expertise:

#### Core Backend Features (Hand-crafted)
- Custom JWT authentication system with secure token handling
- Real-time WebSocket integration for instant messaging
- Comprehensive SQLAlchemy models with proper relationships
- Database migrations using Alembic
- RESTful API design following best practices
- Password hashing and security implementations
- Room-based chat system architecture

#### Frontend Implementation (AI-Generated)
The React frontend was generated using AI for the following reasons:
- **Time Efficiency**: Focus development time on backend complexity
- **API Testing**: Provide a functional interface to test backend endpoints
- **Demonstration**: Show how the backend APIs work in practice
- **Modern Patterns**: Showcase current React development approaches

This approach allows showcasing strong backend development skills while leveraging AI to quickly create a functional frontend for demonstration purposes.

## 🙏 Acknowledgments

- FastAPI for the excellent backend framework
- SQLAlchemy for database ORM
- AI assistance for frontend development and architecture patterns
- GitHub Copilot for code generation and best practices implementation


---

Made with ❤️ and 🫎 by Snehil Chatterjee