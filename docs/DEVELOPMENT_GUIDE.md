# TimeBASE Development Guide

## Setup Development Environment

### Prerequisites
- **Android Studio** (latest version)
- **Node.js** (v18 or higher)
- **Java JDK** 11 or higher
- **Git**
- **Firebase CLI**
- **OpenAI API Key**

### 1. Clone Repository
```bash
git clone https://github.com/your-org/timeBASE.git
cd timeBASE
```

### 2. Backend Setup
```bash
cd backend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi Anda
```

**Environment Variables (.env):**
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/timebase
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

### 3. Database Setup
```bash
# Install MongoDB (jika belum ada)
# Ubuntu/Debian:
sudo apt-get install mongodb

# macOS:
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### 4. Android Setup
```bash
cd android

# Install dependencies (jika menggunakan React Native)
npm install

# Atau untuk native Android, buka di Android Studio
```

### 5. Firebase Setup
1. Buat project Firebase baru
2. Enable Authentication, Firestore, dan Storage
3. Download `google-services.json` dan letakkan di `android/app/`
4. Setup Firebase Admin SDK untuk backend

## Development Workflow

### 1. Start Backend Server
```bash
cd backend
npm run dev  # Development mode dengan hot reload
```

### 2. Start Android Development
```bash
cd android

# Untuk React Native:
npx react-native start
npx react-native run-android

# Untuk native Android: buka di Android Studio
```

### 3. Testing
```bash
# Backend testing
cd backend
npm test

# Android testing
cd android
./gradlew test
```

## Project Structure

```
timeBASE/
├── android/                    # Android application
│   ├── app/
│   │   ├── src/main/java/com/timebase/
│   │   │   ├── ui/            # UI components & activities
│   │   │   ├── data/          # Data layer (Room, repositories)
│   │   │   ├── ai/            # AI integration
│   │   │   ├── utils/         # Utility classes
│   │   │   └── di/            # Dependency injection
│   │   └── src/main/res/      # Resources (layouts, strings, etc.)
│   └── build.gradle
├── backend/                   # Backend API server
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Express middleware
│   │   └── config/           # Configuration files
│   └── package.json
├── ai-service/               # AI microservice (optional)
├── docs/                     # Documentation
└── database/                 # Database schemas & migrations
```

## AI Integration Architecture

### 1. AI Service Layer
```
Android App → Backend API → AI Service → OpenAI API
                ↓
            Database (MongoDB)
```

### 2. AI Features Implementation

#### Schedule Optimization
1. **Data Collection**: Ambil tasks dan user preferences
2. **Pattern Analysis**: Analisis pola kerja historis
3. **AI Processing**: Kirim ke OpenAI untuk optimasi
4. **Result Processing**: Parse dan validasi hasil AI
5. **Schedule Generation**: Buat jadwal optimal

#### Task Suggestions
1. **Similarity Analysis**: Cari tugas serupa dari riwayat
2. **Context Analysis**: Analisis konteks saat ini
3. **AI Recommendation**: Generate saran menggunakan AI
4. **Confidence Scoring**: Hitung tingkat kepercayaan

## Database Schema

### Tasks Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  description: String,
  priority: String, // LOW, MEDIUM, HIGH, URGENT
  category: String,
  estimatedDuration: Number, // minutes
  actualDuration: Number,
  dueDate: Date,
  scheduledTime: Date,
  isCompleted: Boolean,
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date,
  aiSuggestions: Object,
  difficultyLevel: Number, // 1-5
  energyRequired: String, // LOW, MEDIUM, HIGH
  tags: [String]
}
```

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  preferences: {
    workingHours: [Number, Number],
    timezone: String,
    breakDuration: Number,
    maxContinuousWork: Number,
    preferredTaskOrder: String,
    notificationSettings: Object
  },
  aiProfile: {
    workPatterns: Object,
    productivityMetrics: Object,
    learningData: Object
  },
  createdAt: Date,
  updatedAt: Date
}
```

## API Integration

### Android → Backend Communication
```kotlin
// Retrofit service interface
interface TimeBASEApiService {
    @POST("ai/optimize-schedule")
    suspend fun optimizeSchedule(
        @Body request: ScheduleOptimizationRequest
    ): Response<ScheduleOptimizationResponse>
    
    @GET("tasks")
    suspend fun getTasks(
        @Query("status") status: String? = null
    ): Response<List<Task>>
}

// Repository implementation
class TaskRepository @Inject constructor(
    private val apiService: TimeBASEApiService,
    private val taskDao: TaskDao
) {
    suspend fun optimizeSchedule(tasks: List<Task>): Result<List<Task>> {
        return try {
            val response = apiService.optimizeSchedule(
                ScheduleOptimizationRequest(tasks, userPreferences)
            )
            if (response.isSuccessful) {
                Result.success(response.body()?.optimizedTasks ?: emptyList())
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

## AI Prompt Engineering

### Schedule Optimization Prompt Template
```javascript
const generateScheduleOptimizationPrompt = (tasks, preferences, workPatterns) => {
    return `
    You are an AI productivity assistant. Optimize this daily schedule:
    
    TASKS TO SCHEDULE:
    ${JSON.stringify(tasks, null, 2)}
    
    USER PREFERENCES:
    - Working hours: ${preferences.workingHours[0]}:00 - ${preferences.workingHours[1]}:00
    - Break duration: ${preferences.breakDuration} minutes
    - Max continuous work: ${preferences.maxContinuousWork} minutes
    - Task order preference: ${preferences.preferredTaskOrder}
    
    HISTORICAL WORK PATTERNS:
    - Most productive hours: ${workPatterns.productiveHours.join(', ')}
    - Average task completion rate: ${workPatterns.completionRate}%
    - Preferred break frequency: every ${workPatterns.breakFrequency} minutes
    
    OPTIMIZATION RULES:
    1. Schedule high-priority tasks during productive hours
    2. Match task energy requirements with user energy levels
    3. Include appropriate breaks between tasks
    4. Consider task dependencies and deadlines
    5. Minimize context switching between different categories
    
    Return a JSON response with:
    {
      "optimizedTasks": [
        {
          "id": task_id,
          "scheduledTime": "ISO_datetime",
          "suggestions": "specific_suggestion_for_this_task"
        }
      ],
      "totalEstimatedTime": total_minutes,
      "suggestions": ["general_suggestions"],
      "confidence": confidence_score_0_to_1
    }
    `;
};
```

## Testing Strategy

### 1. Unit Testing
```kotlin
// Android unit test example
@Test
fun `optimizeSchedule should return optimized tasks`() = runTest {
    // Given
    val tasks = listOf(createMockTask())
    val preferences = createMockPreferences()
    
    // When
    val result = aiService.optimizeDailySchedule(tasks, preferences)
    
    // Then
    assertTrue(result.isSuccess)
    assertEquals(1, result.getOrNull()?.size)
}
```

### 2. Integration Testing
```javascript
// Backend integration test
describe('AI Controller', () => {
    test('should optimize schedule successfully', async () => {
        const response = await request(app)
            .post('/api/ai/optimize-schedule')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                tasks: mockTasks,
                preferences: mockPreferences
            });
            
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.optimizedTasks).toBeDefined();
    });
});
```

### 3. AI Testing
```javascript
// Test AI responses
describe('AI Service', () => {
    test('should generate valid schedule optimization', async () => {
        const result = await aiService.optimizeSchedule(mockData);
        
        expect(result.optimizedTasks).toBeInstanceOf(Array);
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
    });
});
```

## Performance Optimization

### 1. Database Optimization
- Index pada field yang sering di-query
- Pagination untuk large datasets
- Caching untuk data yang sering diakses

### 2. AI Response Caching
```javascript
// Cache AI responses untuk mengurangi API calls
const cacheKey = `ai_optimization_${userId}_${tasksHash}`;
const cachedResult = await redis.get(cacheKey);

if (cachedResult) {
    return JSON.parse(cachedResult);
}

const aiResult = await callOpenAI(prompt);
await redis.setex(cacheKey, 3600, JSON.stringify(aiResult)); // Cache 1 hour
```

### 3. Android Performance
- Lazy loading untuk lists
- Image optimization
- Background processing untuk AI calls
- Local caching dengan Room database

## Deployment

### 1. Backend Deployment
```bash
# Build for production
npm run build

# Deploy to cloud (contoh: Heroku)
git push heroku main

# Atau menggunakan Docker
docker build -t timebase-backend .
docker run -p 3000:3000 timebase-backend
```

### 2. Android Deployment
```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Upload to Google Play Console
```

### 3. Environment Configuration
- **Development**: Local database, test API keys
- **Staging**: Cloud database, limited AI quota
- **Production**: Production database, full AI quota, monitoring

## Monitoring & Analytics

### 1. Application Monitoring
- Error tracking (Sentry)
- Performance monitoring (Firebase Performance)
- User analytics (Firebase Analytics)

### 2. AI Usage Monitoring
- Track AI API usage dan costs
- Monitor response times
- Analyze AI suggestion accuracy

### 3. Business Metrics
- User engagement
- Task completion rates
- AI feature adoption
- User retention

## Security Best Practices

### 1. API Security
- JWT token authentication
- Rate limiting
- Input validation
- CORS configuration
- HTTPS only

### 2. Data Privacy
- Encrypt sensitive data
- Anonymize AI training data
- GDPR compliance
- User data deletion

### 3. AI Security
- Secure API key storage
- Input sanitization for AI prompts
- Output validation
- Cost monitoring

## Troubleshooting

### Common Issues

1. **AI API Rate Limits**
   - Implement exponential backoff
   - Cache responses
   - Use fallback strategies

2. **Database Connection Issues**
   - Connection pooling
   - Retry logic
   - Health checks

3. **Android Build Issues**
   - Clean and rebuild
   - Check dependencies
   - Verify SDK versions

### Debug Tools
- Android Studio debugger
- Chrome DevTools untuk web debugging
- Postman untuk API testing
- MongoDB Compass untuk database inspection
