# TimeBASE API Documentation

## Base URL
```
https://api.timebase.app/v1
```

## Authentication
Semua endpoint yang memerlukan autentikasi menggunakan Bearer Token:
```
Authorization: Bearer <your_jwt_token>
```

## AI Endpoints

### 1. Optimize Schedule
Mengoptimalkan jadwal harian menggunakan AI.

**Endpoint:** `POST /api/ai/optimize-schedule`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Menyelesaikan laporan",
      "description": "Laporan bulanan untuk tim",
      "priority": "HIGH",
      "estimatedDuration": 120,
      "category": "work",
      "difficultyLevel": 3,
      "energyRequired": "HIGH",
      "dueDate": "2025-07-04T10:00:00Z"
    }
  ],
  "preferences": {
    "workingHours": [9, 17],
    "breakDuration": 15,
    "maxContinuousWork": 90,
    "preferredTaskOrder": "priority"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "optimizedTasks": [
      {
        "id": 1,
        "scheduledTime": "2025-07-04T09:00:00Z",
        "suggestions": "Kerjakan saat energi tinggi di pagi hari"
      }
    ],
    "totalEstimatedTime": 120,
    "suggestions": [
      "Mulai dengan tugas prioritas tinggi",
      "Ambil istirahat setiap 90 menit"
    ],
    "confidence": 0.85
  }
}
```

### 2. Task Suggestions
Mendapatkan saran untuk tugas spesifik.

**Endpoint:** `POST /api/ai/task-suggestions`

**Request Body:**
```json
{
  "task": {
    "title": "Belajar React Native",
    "category": "learning",
    "estimatedDuration": 60,
    "difficultyLevel": 4
  },
  "historicalTasks": [
    {
      "title": "Belajar JavaScript",
      "actualDuration": 90,
      "completionRate": 0.8
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestion": {
      "optimalTime": "09:00-11:00",
      "estimatedDuration": 75,
      "breakSuggestions": [
        "Istirahat 10 menit setiap 25 menit",
        "Lakukan stretching ringan"
      ],
      "preparationTips": [
        "Siapkan dokumentasi React Native",
        "Tutup aplikasi yang mengganggu"
      ],
      "focusScore": 0.9
    },
    "confidence": 0.78
  }
}
```

### 3. Productivity Insights
Mendapatkan analisis produktivitas dengan AI.

**Endpoint:** `POST /api/ai/productivity-insights`

**Request Body:**
```json
{
  "completedTasks": [
    {
      "id": 1,
      "title": "Task 1",
      "actualDuration": 60,
      "estimatedDuration": 45,
      "completedAt": "2025-07-03T10:00:00Z",
      "category": "work"
    }
  ],
  "timeRange": {
    "startTime": "2025-07-01T00:00:00Z",
    "endTime": "2025-07-03T23:59:59Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "insights": {
      "overallScore": 78,
      "trends": [
        "Produktivitas meningkat 15% minggu ini",
        "Estimasi waktu cenderung terlalu optimis"
      ],
      "recommendations": [
        "Tambahkan buffer 20% untuk estimasi waktu",
        "Fokus pada tugas kategori 'work' di pagi hari"
      ],
      "bestPerformingCategories": ["work", "learning"],
      "improvementAreas": ["personal", "health"]
    }
  }
}
```

### 4. Predict Task Duration
Memprediksi durasi tugas berdasarkan data historis.

**Endpoint:** `POST /api/ai/predict-duration`

**Request Body:**
```json
{
  "task": {
    "title": "Code Review",
    "category": "development",
    "difficultyLevel": 3,
    "description": "Review 5 pull requests"
  },
  "similarTasks": [
    {
      "title": "Code Review - 3 PRs",
      "actualDuration": 45,
      "category": "development"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "predictedDuration": 75,
    "confidence": 0.82,
    "factors": [
      "Jumlah PR lebih banyak (+67%)",
      "Kategori development konsisten",
      "Tingkat kesulitan sedang"
    ],
    "range": {
      "min": 60,
      "max": 90
    }
  }
}
```

### 5. Break Recommendations
Mendapatkan rekomendasi waktu istirahat.

**Endpoint:** `POST /api/ai/break-recommendations`

**Request Body:**
```json
{
  "workSession": {
    "duration": 120,
    "intensity": "high",
    "taskType": "coding",
    "currentFatigue": 0.6
  },
  "userPreferences": {
    "preferredBreakDuration": 15,
    "breakActivities": ["walk", "stretch", "meditation"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendedBreakDuration": 20,
    "breakType": "active",
    "activities": [
      "Jalan kaki 10 menit",
      "Stretching mata dan leher",
      "Minum air putih"
    ],
    "nextBreakIn": 25,
    "reasoning": "Intensitas kerja tinggi memerlukan istirahat lebih lama"
  }
}
```

## Task Management Endpoints

### 1. Get All Tasks
**Endpoint:** `GET /api/tasks`

**Query Parameters:**
- `status`: `active`, `completed`, `all` (default: `all`)
- `category`: Filter by category
- `priority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

### 2. Create Task
**Endpoint:** `POST /api/tasks`

**Request Body:**
```json
{
  "title": "Judul tugas",
  "description": "Deskripsi tugas",
  "priority": "HIGH",
  "category": "work",
  "estimatedDuration": 60,
  "dueDate": "2025-07-04T10:00:00Z",
  "difficultyLevel": 3,
  "energyRequired": "MEDIUM"
}
```

### 3. Update Task
**Endpoint:** `PUT /api/tasks/:id`

### 4. Delete Task
**Endpoint:** `DELETE /api/tasks/:id`

### 5. Mark Task Complete
**Endpoint:** `PATCH /api/tasks/:id/complete`

## Analytics Endpoints

### 1. Get Productivity Stats
**Endpoint:** `GET /api/analytics/productivity`

**Query Parameters:**
- `period`: `day`, `week`, `month`, `year`
- `startDate`: Start date (ISO format)
- `endDate`: End date (ISO format)

### 2. Get Category Performance
**Endpoint:** `GET /api/analytics/categories`

### 3. Get Time Tracking Stats
**Endpoint:** `GET /api/analytics/time-tracking`

## User Management Endpoints

### 1. Get User Profile
**Endpoint:** `GET /api/users/profile`

### 2. Update User Preferences
**Endpoint:** `PUT /api/users/preferences`

**Request Body:**
```json
{
  "workingHours": [9, 17],
  "timezone": "Asia/Jakarta",
  "breakDuration": 15,
  "notificationSettings": {
    "taskReminders": true,
    "breakReminders": true,
    "dailySummary": true
  }
}
```

## Error Responses

Semua error response mengikuti format berikut:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Detailed error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes:
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Invalid or missing token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Server error

## Rate Limiting

API menggunakan rate limiting:
- **General endpoints**: 100 requests per 15 minutes per IP
- **AI endpoints**: 50 requests per hour per user
- **Authentication endpoints**: 10 requests per minute per IP

## Webhooks

TimeBASE mendukung webhooks untuk notifikasi real-time:

### Events:
- `task.created`
- `task.completed`
- `task.overdue`
- `schedule.optimized`
- `productivity.milestone`

### Webhook Payload:
```json
{
  "event": "task.completed",
  "timestamp": "2025-07-03T16:00:00Z",
  "data": {
    "taskId": 123,
    "userId": 456,
    "completionTime": 75
  }
}
```
