# TimeBASE Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### 1. Clone & Install
```bash
# Clone repository
git clone <repository-url>
cd timeBASE

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (optional)
cd ../frontend
npm install
```

### 2. Database Setup
```bash
# Option 1: Local MongoDB
# Install MongoDB locally and start service
mongod

# Option 2: MongoDB Atlas (Cloud)
# Create account at https://mongodb.com/atlas
# Get connection string and update .env
```

### 3. Environment Configuration
```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env file with your settings
nano .env
```

**Required Environment Variables:**
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/timebase
JWT_SECRET=your_super_secret_jwt_key_here

# Optional: Free AI API Keys
HUGGINGFACE_API_TOKEN=hf_your_token_here
GEMINI_API_KEY=your_gemini_key_here
COHERE_API_KEY=your_cohere_key_here
```

### 4. Start Application
```bash
# Start backend server
cd backend
npm start

# The server will start on http://localhost:3000
```

### 5. Test API
```bash
# Run API tests
npm test

# Expected output: All tests should pass ✅
```

## 🔧 Detailed Setup

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Database Connection**
   - **Local MongoDB**: Install and start MongoDB service
   - **MongoDB Atlas**: Create cluster and get connection string
   - Update `MONGODB_URI` in `.env` file

3. **JWT Secret**
   ```bash
   # Generate secure JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Free AI APIs (Optional)**
   - **Hugging Face**: https://huggingface.co/ → Settings → Access Tokens
   - **Google Gemini**: https://makersuite.google.com/ → Create API Key
   - **Cohere**: https://cohere.ai/ → Dashboard → API Keys

5. **Start Server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

### Frontend Setup (Optional)

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   # Opens http://localhost:3001
   ```

## 🧪 Testing

### API Testing
```bash
cd backend
npm test
```

**Test Coverage:**
- ✅ Health Check
- ✅ Authentication (Demo Login)
- ✅ Task Management (CRUD)
- ✅ Time Suggestions
- ✅ Task Recommendations
- ✅ Analytics
- ✅ Free AI Integration

### Manual Testing

1. **Health Check**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Demo Login**
   ```bash
   curl -X POST http://localhost:3000/api/auth/demo-login
   ```

3. **Create Task**
   ```bash
   curl -X POST http://localhost:3000/api/tasks \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"title":"Test Task","estimatedDuration":60,"priority":"HIGH"}'
   ```

## 📊 Features Overview

### ✅ Implemented Features

1. **Task Management**
   - Create, read, update, delete tasks
   - Task prioritization with scoring system
   - Status management (Active, Paused, Completed)

2. **AI-Powered Time Suggestions**
   - Analyze similar completed tasks
   - Suggest optimal time estimates
   - Keyword-based task matching

3. **Task Recommendations**
   - Priority-based scoring (70% priority + 30% urgency)
   - Intelligent task ordering
   - Deadline-aware recommendations

4. **Analytics & Insights**
   - Productivity statistics
   - Category performance analysis
   - Time tracking insights

5. **Free AI Integration**
   - Multiple AI service fallbacks
   - Rate limiting and error handling
   - Rule-based backup algorithms

6. **User Management**
   - Authentication system
   - User preferences
   - Profile management

### 🔄 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/auth/demo-login` | POST | Demo authentication |
| `/api/tasks` | GET/POST | Task management |
| `/api/tasks/recommended` | GET | Get recommended tasks |
| `/api/simple-suggestion` | POST | Time suggestions |
| `/api/analytics/productivity` | GET | Productivity stats |
| `/api/free-ai/status` | GET | AI services status |

## 🛠️ Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:27017
   Solution: Start MongoDB service or check connection string
   ```

2. **JWT Secret Missing**
   ```
   Error: JWT_SECRET is required
   Solution: Add JWT_SECRET to .env file
   ```

3. **Port Already in Use**
   ```
   Error: EADDRINUSE :::3000
   Solution: Change PORT in .env or kill process using port 3000
   ```

4. **AI API Rate Limit**
   ```
   Error: 429 Too Many Requests
   Solution: Wait or upgrade to paid plan
   ```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm start

# Or specific modules
DEBUG=timebase:* npm start
```

### Reset Database
```bash
# Connect to MongoDB and drop database
mongo
use timebase
db.dropDatabase()
```

## 🚀 Production Deployment

### Environment Setup
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/timebase
JWT_SECRET=your_production_jwt_secret
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Build & Deploy
```bash
# Build application
npm run build

# Start production server
NODE_ENV=production npm start
```

## 📈 Monitoring

### Health Checks
- `/health` - Application health
- `/api/free-ai/status` - AI services status

### Logging
- Request/response logging with Morgan
- Error logging to console
- Custom debug logging available

### Performance
- Response time monitoring
- Database query optimization
- Rate limiting for API protection

## 🔒 Security

### Implemented Security Features
- Helmet.js for security headers
- CORS configuration
- JWT authentication
- Input validation with express-validator
- Rate limiting
- Password hashing with bcrypt

### Security Best Practices
- Keep dependencies updated
- Use HTTPS in production
- Secure JWT secrets
- Validate all inputs
- Monitor for vulnerabilities

## 📞 Support

### Getting Help
1. Check this setup guide
2. Review error logs
3. Run API tests to identify issues
4. Check GitHub issues

### Contributing
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

---

**🎉 Congratulations!** Your TimeBASE application should now be running successfully. The API provides comprehensive task management with AI-powered features, all using free AI services with intelligent fallbacks.

For any issues, please check the troubleshooting section or run the test suite to identify specific problems.
