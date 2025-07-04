# Task Scoring Logic - TimeBASE

## Overview
Sistem scoring TimeBASE menggunakan algoritma yang menggabungkan **Prioritas (70%)** dan **Kedesakan/Urgency (30%)** untuk memberikan rekomendasi tugas yang optimal kepada pengguna.

## Aturan Scoring

### 1. Filter Tugas
Sistem hanya mempertimbangkan tugas dengan kriteria:
- Status: `ACTIVE` (tidak `PAUSED`, `COMPLETED`, atau `CANCELLED`)
- Belum selesai: `isCompleted = false`

### 2. Komponen Scoring

#### A. Prioritas (Bobot 70%)
| Prioritas | Skor | Deskripsi |
|-----------|------|-----------|
| HIGH      | 70   | Tugas dengan prioritas tinggi |
| MEDIUM    | 35   | Tugas dengan prioritas sedang |
| LOW       | 10   | Tugas dengan prioritas rendah |

#### B. Kedesakan/Urgency (Bobot 30%)
| Kondisi Deadline | Skor | Deskripsi |
|------------------|------|-----------|
| Hari ini atau lewat | 30 | Deadline hari ini atau sudah terlewat |
| Besok | 20 | Deadline besok |
| Dalam seminggu | 10 | Deadline 2-7 hari ke depan |
| Lebih dari seminggu | 5 | Deadline lebih dari 7 hari |
| Tidak ada deadline | 0 | Tugas tanpa deadline |

### 3. Perhitungan Total Skor
```
Total Skor = Skor Prioritas + Skor Kedesakan
```

**Contoh Perhitungan:**
- Tugas A: Prioritas HIGH (70) + Deadline besok (20) = **90 poin**
- Tugas B: Prioritas MEDIUM (35) + Deadline hari ini (30) = **65 poin**
- Tugas C: Prioritas HIGH (70) + Deadline minggu depan (10) = **80 poin**

### 4. Aturan Tie-Breaking
Jika dua atau lebih tugas memiliki skor yang sama, tugas dengan **estimasi waktu tercepat** akan diprioritaskan.

**Contoh:**
- Tugas D: Total skor 65, estimasi 30 menit
- Tugas E: Total skor 65, estimasi 60 menit
- **Hasil: Tugas D direkomendasikan terlebih dahulu**

## Implementasi

### Android (Kotlin)
```kotlin
// Menghitung skor prioritas
val priorityScore = when(task.priority) {
    TaskPriority.HIGH -> 70
    TaskPriority.MEDIUM -> 35
    TaskPriority.LOW -> 10
}

// Menghitung skor kedesakan
val urgencyScore = when {
    daysUntilDue <= 0 -> 30
    daysUntilDue == 1L -> 20
    daysUntilDue <= 7 -> 10
    else -> 5
}

val totalScore = priorityScore + urgencyScore
```

### Backend (JavaScript)
```javascript
// Konstanta scoring
const PRIORITY_SCORES = {
    HIGH: 70,
    MEDIUM: 35,
    LOW: 10
};

const URGENCY_SCORES = {
    TODAY: 30,
    TOMORROW: 20,
    WEEK: 10,
    LATER: 5
};

// Fungsi perhitungan
function calculateTaskScore(task) {
    const priorityScore = PRIORITY_SCORES[task.priority];
    const urgencyScore = calculateUrgencyScore(task.dueDate);
    return priorityScore + urgencyScore;
}
```

## Contoh Skenario

### Skenario 1: Tugas Harian
**Input:**
- Tugas A: Prioritas HIGH, deadline hari ini, estimasi 45 menit
- Tugas B: Prioritas MEDIUM, deadline besok, estimasi 30 menit
- Tugas C: Prioritas HIGH, deadline minggu depan, estimasi 60 menit

**Perhitungan:**
- Tugas A: 70 + 30 = **100 poin**
- Tugas B: 35 + 20 = **55 poin**
- Tugas C: 70 + 10 = **80 poin**

**Rekomendasi:** A → C → B

### Skenario 2: Tie-Breaking
**Input:**
- Tugas D: Prioritas MEDIUM, deadline besok, estimasi 90 menit
- Tugas E: Prioritas HIGH, deadline minggu depan, estimasi 45 menit

**Perhitungan:**
- Tugas D: 35 + 20 = **55 poin**
- Tugas E: 70 + 10 = **80 poin**

**Rekomendasi:** E → D

### Skenario 3: Skor Sama
**Input:**
- Tugas F: Prioritas HIGH, deadline minggu depan, estimasi 120 menit
- Tugas G: Prioritas MEDIUM, deadline hari ini, estimasi 60 menit

**Perhitungan:**
- Tugas F: 70 + 10 = **80 poin**
- Tugas G: 35 + 30 = **65 poin**

**Rekomendasi:** F → G

## Level Rekomendasi

Berdasarkan total skor, tugas dikategorikan dalam level rekomendasi:

| Total Skor | Level | Deskripsi |
|------------|-------|-----------|
| 90-100 | Sangat Direkomendasikan | Prioritas tinggi dengan deadline mendesak |
| 60-89 | Direkomendasikan | Prioritas sedang-tinggi atau deadline dekat |
| 30-59 | Pertimbangkan | Prioritas rendah-sedang |
| 0-29 | Prioritas Rendah | Tugas dengan prioritas dan kedesakan rendah |

## API Endpoints

### 1. Get Recommended Tasks
```http
GET /api/tasks/recommended?limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendedTasks": [
      {
        "taskId": "123",
        "taskTitle": "Menyelesaikan laporan",
        "priorityScore": 70,
        "urgencyScore": 30,
        "totalScore": 100,
        "estimatedDuration": 45,
        "reasoning": "Prioritas high: 70 poin, Kedesakan (hari ini): 30 poin = Total: 100 poin",
        "recommendation": "Sangat Direkomendasikan"
      }
    ],
    "topRecommendedTask": { /* tugas dengan skor tertinggi */ },
    "statistics": {
      "totalActiveTasks": 15,
      "highPriorityTasks": 5,
      "urgentTasks": 3,
      "averageScore": 67.5
    }
  }
}
```

### 2. Get Task Scoring Details
```http
GET /api/tasks/:taskId/scoring
```

**Response:**
```json
{
  "success": true,
  "data": {
    "taskId": "123",
    "taskTitle": "Menyelesaikan laporan",
    "priority": {
      "level": "HIGH",
      "score": 70,
      "weight": "70%"
    },
    "urgency": {
      "daysUntilDue": 0,
      "score": 30,
      "weight": "30%"
    },
    "totalScore": 100,
    "estimatedDuration": 45,
    "reasoning": "Prioritas high: 70 poin, Kedesakan (hari ini): 30 poin = Total: 100 poin",
    "recommendation": "Sangat Direkomendasikan",
    "scoringBreakdown": {
      "priorityContribution": "70.0%",
      "urgencyContribution": "30.0%"
    }
  }
}
```

### 3. Simulate Score Change
```http
POST /api/tasks/:taskId/simulate-score
```

**Request:**
```json
{
  "newPriority": "HIGH",
  "newDueDate": "2025-07-04T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "original": {
      "totalScore": 45,
      "reasoning": "Prioritas medium: 35 poin, Kedesakan (minggu depan): 10 poin = Total: 45 poin"
    },
    "modified": {
      "totalScore": 90,
      "reasoning": "Prioritas high: 70 poin, Kedesakan (besok): 20 poin = Total: 90 poin"
    },
    "scoreDifference": 45,
    "impact": "Peningkatan Signifikan"
  }
}
```

## Validasi dan Error Handling

### Validasi Input
- Prioritas harus salah satu dari: `HIGH`, `MEDIUM`, `LOW`
- Status harus salah satu dari: `ACTIVE`, `PAUSED`, `COMPLETED`, `CANCELLED`
- Estimasi durasi harus bilangan positif (minimal 1 menit)
- Deadline harus format ISO 8601 yang valid

### Error Responses
```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    {
      "field": "priority",
      "message": "Priority must be HIGH, MEDIUM, or LOW"
    }
  ]
}
```

## Performance Considerations

### Database Indexing
```javascript
// MongoDB indexes untuk optimasi query
taskSchema.index({ userId: 1, status: 1, isCompleted: 1 });
taskSchema.index({ userId: 1, priority: 1, dueDate: 1 });
taskSchema.index({ dueDate: 1, status: 1 });
```

### Caching Strategy
- Cache hasil rekomendasi untuk 5 menit
- Invalidate cache saat ada perubahan tugas
- Use Redis untuk distributed caching

### Query Optimization
```sql
-- SQL equivalent untuk Android Room
SELECT * FROM tasks 
WHERE status = 'ACTIVE' AND isCompleted = 0 
ORDER BY 
    CASE priority 
        WHEN 'HIGH' THEN 70 
        WHEN 'MEDIUM' THEN 35 
        WHEN 'LOW' THEN 10 
    END DESC,
    dueDate ASC,
    estimatedDuration ASC
```

## Testing

### Unit Tests
```javascript
describe('Task Scoring Logic', () => {
    test('should calculate correct priority score', () => {
        const task = { priority: 'HIGH' };
        const score = TaskScoringService.calculateTaskScore(task);
        expect(score.priorityScore).toBe(70);
    });
    
    test('should handle tie-breaking correctly', () => {
        const tasks = [
            { priority: 'HIGH', dueDate: tomorrow, estimatedDuration: 60 },
            { priority: 'HIGH', dueDate: tomorrow, estimatedDuration: 30 }
        ];
        const recommended = TaskScoringService.getRecommendedTasks(tasks);
        expect(recommended[0].estimatedDuration).toBe(30);
    });
});
```

### Integration Tests
```javascript
describe('Task Recommendation API', () => {
    test('should return recommended tasks in correct order', async () => {
        const response = await request(app)
            .get('/api/tasks/recommended')
            .set('Authorization', `Bearer ${token}`);
            
        expect(response.status).toBe(200);
        expect(response.body.data.recommendedTasks).toBeDefined();
        
        // Verify sorting order
        const tasks = response.body.data.recommendedTasks;
        for (let i = 1; i < tasks.length; i++) {
            expect(tasks[i-1].totalScore).toBeGreaterThanOrEqual(tasks[i].totalScore);
        }
    });
});
```

## Monitoring dan Analytics

### Metrics to Track
- Average task completion time vs estimation
- Scoring accuracy (user follows recommendations)
- Priority distribution
- Deadline adherence rate

### Dashboard Queries
```javascript
// Analisis akurasi rekomendasi
const accuracyAnalysis = await Task.aggregate([
    { $match: { isCompleted: true } },
    { $group: {
        _id: '$priority',
        avgEstimated: { $avg: '$estimatedDuration' },
        avgActual: { $avg: '$actualDuration' },
        count: { $sum: 1 }
    }}
]);
```

## Future Enhancements

### 1. Machine Learning Integration
- Personalized scoring berdasarkan user behavior
- Dynamic weight adjustment (70%-30% bisa berubah)
- Predictive deadline estimation

### 2. Context-Aware Scoring
- Waktu dalam hari (pagi/siang/malam)
- Energy level user
- Historical performance patterns

### 3. Advanced Tie-Breaking
- User preference patterns
- Task complexity consideration
- Resource availability

### 4. Real-time Adjustments
- Dynamic priority updates
- Deadline proximity alerts
- Smart notifications based on scoring
