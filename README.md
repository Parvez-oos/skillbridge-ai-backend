# SkillBridge AI Backend

Express.js + TypeScript REST API for the SkillBridge AI platform.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt
- **Validation:** Zod
- **Security:** Helmet, CORS, rate-limiting, input sanitization

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/skillbridge-ai` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/github` - GitHub OAuth
- `POST /api/auth/facebook` - Facebook OAuth
- `GET /api/auth/me` - Get current user

### Learning Paths
- `GET /api/learning-paths` - List paths (public)
- `GET /api/learning-paths/slug/:slug` - Get by slug
- `POST /api/learning-paths` - Create (auth)
- `PUT /api/learning-paths/:id` - Update (auth)
- `DELETE /api/learning-paths/:id` - Delete (auth)

### Blog
- `GET /api/blog/posts` - List posts (public)
- `GET /api/blog/posts/:slug` - Get post by slug
- `POST /api/blog/posts` - Create post (auth)
- `PUT /api/blog/posts/:id` - Update post (auth)
- `DELETE /api/blog/posts/:id` - Delete post (auth)

### Dashboard
- `GET /api/dashboard` - Full dashboard data (auth)
- `GET /api/dashboard/stats` - Dashboard stats (auth)

### AI
- `POST /api/ai/roadmap` - Create roadmap (auth)
- `POST /api/ai/resume/analyze` - Analyze resume (auth)
- `POST /api/ai/recommendations` - Generate recommendations (auth)

## Deployment (Render)

1. Push to GitHub repository
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set build command: `cd backend && npm install && npm run build`
5. Set start command: `cd backend && npm start`
6. Set environment variables
7. Deploy

## Folder Structure

```
src/
├── config/          # Database, Cloudinary config
├── features/        # Feature-based modules
│   ├── auth/        # Authentication
│   ├── ai/          # AI tools
│   ├── blog/        # Blog system
│   ├── dashboard/   # Dashboard
│   ├── learning-path/ # Learning paths
│   └── user/        # User management
├── middleware/       # Auth, error, validation, sanitize
├── utils/           # JWT, response helpers
└── server.ts        # Express server entry
```
