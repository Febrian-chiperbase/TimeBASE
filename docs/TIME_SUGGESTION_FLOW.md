# Time Suggestion Flow - TimeBASE

## Overview
Fitur Time Suggestion menggunakan AI untuk memberikan saran estimasi waktu berdasarkan tugas serupa yang sudah pernah diselesaikan user. Sistem menganalisis kata kunci dari nama tugas baru dan mencari pola dari riwayat tugas yang sudah selesai.

## 🔄 **Alur Kerja Sistem**

### 1. **Input Detection**
```
User mengetik nama tugas → Debounce 1 detik → Trigger API call
```

### 2. **Backend Processing**
```
Ekstrak kata kunci → Cari tugas serupa → Hitung durasi rata-rata → Return saran
```

### 3. **Frontend Response**
```
Show loading → Display suggestion → User response → Set estimation
```

## 🏗️ **Implementasi Backend**

### **Fungsi Utama: `sarankanWaktu()`**

```javascript
static sarankanWaktu(namaTugasBaru, daftarTugasSelesai) {
    // 1. Ekstrak kata kunci
    const kataKunci = this.ekstrakKataKunci(namaTugasBaru);
    
    // 2. Cari tugas serupa
    const tugasSerupa = this.cariTugasSerupa(kataKunci, daftarTugasSelesai);
    
    // 3. Hitung durasi rata-rata
    const analisisWaktu = this.hitungDurasiRataRata(tugasSerupa);
    
    // 4. Return saran dengan confidence
    return {
        saranWaktu: Math.round(analisisWaktu.rataRata),
        confidence: this.hitungConfidence(tugasSerupa.length),
        tugasSerupa: tugasSerupa,
        statistik: analisisWaktu,
        alasan: this.generateAlasan(tugasSerupa.length, analisisWaktu.rataRata, kataKunci)
    };
}
```

### **Algoritma Pencarian Tugas Serupa**

1. **Ekstraksi Kata Kunci**
   - Bersihkan teks dari karakter khusus
   - Split berdasarkan spasi
   - Filter kata dengan panjang > 2 karakter
   - Hapus stop words (dan, atau, untuk, dll.)

2. **Scoring Kesamaan**
   ```javascript
   skorKesamaan = jumlahKataYangCocok / totalKataKunci
   ```

3. **Perhitungan Durasi**
   ```javascript
   durasi = waktu_selesai - waktu_mulai (dalam menit)
   ```

### **Confidence Level**
- **≥10 sampel**: 90% confidence
- **≥5 sampel**: 70% confidence  
- **≥3 sampel**: 50% confidence
- **≥1 sampel**: 30% confidence

## 📱 **Implementasi Frontend (Android)**

### **State Management**

```kotlin
class TaskCreationViewModel {
    // Input state
    private val _taskName = MutableLiveData<String>()
    
    // Loading state
    private val _isLoadingSuggestion = MutableLiveData<Boolean>()
    
    // Suggestion state
    private val _timeSuggestion = MutableLiveData<TimeSuggestion?>()
    
    // User response state
    private val _isManualInput = MutableLiveData<Boolean>()
    private val _suggestionResponded = MutableLiveData<Boolean>()
    
    // Final estimation
    private val _manualEstimation = MutableLiveData<Int?>()
}
```

### **Debounce Implementation**

```kotlin
private fun triggerTimeSuggestion(taskName: String) {
    // Cancel previous job
    suggestionJob?.cancel()
    
    // Create new job with delay
    suggestionJob = viewModelScope.launch {
        delay(DEBOUNCE_DELAY) // 1 second
        
        _isLoadingSuggestion.value = true
        val suggestion = timeSuggestionRepository.getTimeSuggestion(taskName)
        _timeSuggestion.value = suggestion
        _isLoadingSuggestion.value = false
    }
}
```

### **UI Flow States**

1. **Initial State**
   - Input field kosong
   - Tidak ada suggestion card
   - Create button disabled

2. **Typing State**
   - User mengetik nama tugas
   - Debounce timer berjalan

3. **Loading State**
   - Progress bar muncul
   - "Mencari tugas serupa..." message
   - Suggestion card hidden

4. **Suggestion State**
   - Suggestion card muncul
   - Menampilkan estimasi waktu
   - Confidence level
   - Alasan saran
   - Tombol "Ya, Setuju" dan "Tidak, Atur Sendiri"

5. **Response State**
   - User memilih accept/reject
   - Suggestion buttons hidden
   - Manual input muncul (jika reject)

6. **Final State**
   - Final estimation displayed
   - Create button enabled

## 🎨 **UI Components**

### **Suggestion Card Layout**
```xml
<MaterialCardView>
    <!-- Header dengan icon AI -->
    <LinearLayout>
        <ImageView src="@drawable/ic_ai_suggestion" />
        <TextView text="Saran AI" />
        <Button text="Refresh" />
    </LinearLayout>
    
    <!-- Estimasi waktu -->
    <TextView text="Estimasi Waktu: 45 menit" />
    
    <!-- Confidence level -->
    <TextView text="Tingkat Keyakinan: Yakin" />
    
    <!-- Info tugas serupa -->
    <TextView text="Berdasarkan 5 tugas serupa" />
    
    <!-- Alasan detail -->
    <TextView text="Berdasarkan 5 tugas serupa yang mengandung kata kunci 'laporan'..." />
    
    <!-- Action buttons -->
    <LinearLayout>
        <Button text="Ya, Setuju" />
        <Button text="Tidak, Atur Sendiri" />
    </LinearLayout>
</MaterialCardView>
```

### **Loading State**
```xml
<LinearLayout>
    <ProgressBar />
    <TextView text="Mencari tugas serupa..." />
</LinearLayout>
```

### **Manual Input**
```xml
<LinearLayout android:visibility="gone">
    <TextInputLayout hint="Waktu (menit)">
        <TextInputEditText inputType="number" />
    </TextInputLayout>
    <Button text="Set" />
</LinearLayout>
```

## 🔌 **API Endpoints**

### **1. Get Time Suggestion**
```http
POST /api/time-suggestion
Content-Type: application/json
Authorization: Bearer <token>

{
  "taskName": "Buat laporan penjualan"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "taskName": "Buat laporan penjualan",
    "suggestion": {
      "saranWaktu": 45,
      "confidence": 0.7,
      "tugasSerupa": [
        {
          "nama": "Laporan bulanan",
          "durasi": 50,
          "tanggalSelesai": "2025-07-01T10:00:00Z"
        }
      ],
      "statistik": {
        "jumlahSampel": 5,
        "rataRata": 45.2,
        "median": 45,
        "minimum": 30,
        "maksimum": 60,
        "standarDeviasi": 12.5
      },
      "alasan": "Berdasarkan 5 tugas serupa yang mengandung kata kunci 'laporan', rata-rata waktu penyelesaian adalah 45 menit."
    }
  }
}
```

### **2. Submit Feedback**
```http
POST /api/time-suggestion/feedback
Content-Type: application/json
Authorization: Bearer <token>

{
  "taskName": "Buat laporan penjualan",
  "suggestedTime": 45,
  "actualTime": 60,
  "accepted": true,
  "feedback": "Saran cukup akurat"
}
```

## 📊 **Analytics & Metrics**

### **Tracked Events**
1. **Suggestion Requested**
   - Task name
   - Keywords extracted
   - Similar tasks found
   - Confidence level

2. **User Response**
   - Accepted/Rejected
   - Manual time set
   - Response time

3. **Accuracy Feedback**
   - Suggested vs Actual time
   - Accuracy percentage
   - User satisfaction

### **Performance Metrics**
- **Suggestion Accuracy**: Rata-rata akurasi prediksi
- **Acceptance Rate**: Persentase user yang menerima saran
- **Response Time**: Waktu API response
- **User Satisfaction**: Rating dari feedback

## 🧪 **Testing Strategy**

### **Unit Tests**

```javascript
describe('TimeSuggestionService', () => {
    test('should extract keywords correctly', () => {
        const keywords = TimeSuggestionService.ekstrakKataKunci('Buat laporan penjualan bulanan');
        expect(keywords).toEqual(['buat', 'laporan', 'penjualan', 'bulanan']);
    });
    
    test('should calculate similarity score', () => {
        const score = TimeSuggestionService.hitungSkorKesamaan(['laporan'], 'Buat laporan harian');
        expect(score).toBe(1.0);
    });
    
    test('should suggest time based on similar tasks', () => {
        const suggestion = TimeSuggestionService.sarankanWaktu('Laporan baru', mockCompletedTasks);
        expect(suggestion.saranWaktu).toBeGreaterThan(0);
        expect(suggestion.confidence).toBeGreaterThanOrEqual(0);
    });
});
```

### **Integration Tests**

```kotlin
@Test
fun `should get time suggestion from API`() = runTest {
    // Given
    val taskName = "Buat laporan penjualan"
    
    // When
    val suggestion = repository.getTimeSuggestion(taskName)
    
    // Then
    assertNotNull(suggestion)
    assertTrue(suggestion.isValid())
}

@Test
fun `should handle debounce correctly`() = runTest {
    // Given
    viewModel.onTaskNameChanged("Lap")
    viewModel.onTaskNameChanged("Lapor")
    viewModel.onTaskNameChanged("Laporan")
    
    // When
    delay(1500) // Wait for debounce
    
    // Then
    verify(repository, times(1)).getTimeSuggestion("Laporan")
}
```

### **UI Tests**

```kotlin
@Test
fun `should show suggestion card when API returns data`() {
    // Given
    val mockSuggestion = TimeSuggestion(45, 0.7, emptyList(), null, "Test reason")
    
    // When
    composeTestRule.setContent {
        CreateTaskScreen(suggestion = mockSuggestion)
    }
    
    // Then
    composeTestRule.onNodeWithText("Saran AI").assertIsDisplayed()
    composeTestRule.onNodeWithText("45 menit").assertIsDisplayed()
    composeTestRule.onNodeWithText("Ya, Setuju").assertIsDisplayed()
}
```

## 🚀 **Performance Optimizations**

### **Backend Optimizations**
1. **Database Indexing**
   ```javascript
   // Index untuk query tugas selesai
   db.tasks.createIndex({ userId: 1, isCompleted: 1, completedAt: -1 });
   ```

2. **Caching**
   ```javascript
   // Cache hasil saran untuk task name yang sama
   const cacheKey = `suggestion_${userId}_${taskNameHash}`;
   const cachedResult = await redis.get(cacheKey);
   ```

3. **Limit Query**
   ```javascript
   // Batasi jumlah tugas yang dianalisis
   const completedTasks = await Task.find(query).limit(100);
   ```

### **Frontend Optimizations**
1. **Debouncing**: Mengurangi API calls
2. **Caching**: Simpan hasil saran sementara
3. **Lazy Loading**: Load suggestion card hanya saat diperlukan

## 🔧 **Configuration**

### **Backend Config**
```javascript
const CONFIG = {
    DEBOUNCE_DELAY: 1000,           // 1 second
    MAX_COMPLETED_TASKS: 100,       // Limit query
    MIN_KEYWORD_LENGTH: 3,          // Minimum keyword length
    MIN_TASK_NAME_LENGTH: 3,        // Minimum task name for suggestion
    CACHE_TTL: 300,                 // 5 minutes cache
    MAX_SIMILAR_TASKS: 10           // Max similar tasks to analyze
};
```

### **Frontend Config**
```kotlin
object SuggestionConfig {
    const val DEBOUNCE_DELAY = 1000L
    const val MIN_TASK_NAME_LENGTH = 3
    const val ERROR_DISPLAY_DURATION = 5000L
    const val MAX_RETRY_ATTEMPTS = 3
}
```

## 🐛 **Error Handling**

### **Common Errors**
1. **No Similar Tasks Found**
   - Show message: "Tidak ditemukan tugas serupa"
   - Fallback to manual input

2. **API Timeout**
   - Show retry button
   - Fallback to manual input after 3 attempts

3. **Invalid Task Name**
   - Show validation message
   - Disable suggestion until valid

### **Error Recovery**
```kotlin
private fun handleSuggestionError(error: Throwable) {
    when (error) {
        is NetworkException -> {
            _error.value = "Koneksi bermasalah. Coba lagi."
            showRetryOption()
        }
        is TimeoutException -> {
            _error.value = "Permintaan timeout. Coba lagi."
            showRetryOption()
        }
        else -> {
            _error.value = "Gagal mendapatkan saran. Silakan atur waktu manual."
            _isManualInput.value = true
        }
    }
}
```

## 📈 **Future Enhancements**

### **1. Machine Learning Integration**
- Personalized suggestion berdasarkan user behavior
- Improved keyword extraction dengan NLP
- Context-aware suggestions

### **2. Advanced Analytics**
- Prediction accuracy tracking
- User pattern analysis
- Suggestion improvement recommendations

### **3. Smart Features**
- Category-based suggestions
- Time-of-day considerations
- Workload balancing

### **4. UI Improvements**
- Animated transitions
- Voice input support
- Smart notifications
