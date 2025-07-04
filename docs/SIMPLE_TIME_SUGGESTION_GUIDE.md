# Simple Time Suggestion Implementation Guide

## 📋 **Overview**
Implementasi sistem saran waktu sederhana yang menganalisis tugas serupa yang sudah selesai untuk memberikan estimasi waktu pada tugas baru.

## 🔧 **Backend Implementation**

### **Fungsi Utama: `sarankanWaktu()`**

```javascript
function sarankanWaktu(namaTugasBaru, daftarTugasSelesai) {
    // 1. Ekstrak kata kunci dari nama tugas baru
    const kataKunci = ekstrakKataKunci(namaTugasBaru);
    
    // 2. Cari tugas serupa berdasarkan kata kunci
    const tugasSerupa = [];
    daftarTugasSelesai.forEach(tugas => {
        const namaTugasLower = tugas.nama.toLowerCase();
        let adaKesamaan = false;
        
        kataKunci.forEach(kata => {
            if (namaTugasLower.includes(kata)) {
                adaKesamaan = true;
            }
        });
        
        if (adaKesamaan) {
            // 3. Hitung durasi kerja nyata (waktu_selesai - waktu_mulai)
            const waktuMulai = new Date(tugas.waktu_mulai);
            const waktuSelesai = new Date(tugas.waktu_selesai);
            const durasiMenit = Math.round((waktuSelesai - waktuMulai) / (1000 * 60));
            
            if (durasiMenit > 0 && durasiMenit <= 24 * 60) {
                tugasSerupa.push({ nama: tugas.nama, durasi: durasiMenit });
            }
        }
    });
    
    // 4. Hitung durasi rata-rata
    if (tugasSerupa.length === 0) return 0;
    
    const totalDurasi = tugasSerupa.reduce((sum, tugas) => sum + tugas.durasi, 0);
    const rataRata = totalDurasi / tugasSerupa.length;
    
    return Math.round(rataRata);
}
```

### **API Endpoint**

```javascript
// POST /api/simple-suggestion
router.post('/', auth, validateSuggestionRequest, async (req, res) => {
    const { namaTugas } = req.body;
    const userId = req.user.id;
    
    // Ambil tugas selesai dari database
    const tugasSelesai = await Task.find({
        userId: userId,
        isCompleted: true,
        completedAt: { $exists: true },
        createdAt: { $exists: true }
    }).select('title createdAt completedAt').limit(50);
    
    // Konversi format data
    const daftarTugasSelesai = tugasSelesai.map(tugas => ({
        nama: tugas.title,
        waktu_mulai: tugas.createdAt,
        waktu_selesai: tugas.completedAt
    }));
    
    // Panggil fungsi sarankanWaktu
    const saranWaktuMenit = sarankanWaktu(namaTugas.trim(), daftarTugasSelesai);
    
    res.json({
        success: true,
        data: {
            namaTugas: namaTugas.trim(),
            saranWaktu: saranWaktuMenit,
            satuan: 'menit',
            adaSaran: saranWaktuMenit > 0,
            pesan: saranWaktuMenit > 0 
                ? `Berdasarkan tugas serupa, estimasi waktu: ${saranWaktuMenit} menit`
                : 'Tidak ditemukan tugas serupa untuk referensi'
        }
    });
});
```

## 📱 **Frontend Implementation (React)**

### **State Management**

```javascript
const TaskCreationForm = () => {
    // State untuk form
    const [namaTugas, setNamaTugas] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    
    // State untuk saran waktu
    const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
    const [saranWaktu, setSaranWaktu] = useState(null);
    const [errorSuggestion, setErrorSuggestion] = useState('');
    
    // State untuk response user
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [userResponded, setUserResponded] = useState(false);
    const [useManualInput, setUseManualInput] = useState(false);
    
    // State untuk estimasi final
    const [estimasiWaktu, setEstimasiWaktu] = useState('');
    const [waktuManual, setWaktuManual] = useState('');
    
    // Debounce timer
    const [debounceTimer, setDebounceTimer] = useState(null);
};
```

### **1. Memicu Pemanggilan API Setelah Pengguna Selesai Mengetik**

```javascript
const handleNamaTugasChange = (e) => {
    const value = e.target.value;
    setNamaTugas(value);
    
    // Reset state saran jika nama tugas berubah
    resetSuggestionState();
    
    // Clear timer sebelumnya
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    
    // Set timer baru untuk debounce (1.5 detik)
    if (value.trim().length >= 3) {
        const timer = setTimeout(() => {
            getSuggestion(value.trim());
        }, 1500);
        setDebounceTimer(timer);
    }
};
```

**Penjelasan:**
- **Debounce**: Menunggu 1.5 detik setelah user berhenti mengetik
- **Minimum Length**: Hanya trigger jika nama tugas ≥ 3 karakter
- **Reset State**: Clear saran sebelumnya saat nama tugas berubah

### **2. Menampilkan Status Loading**

```javascript
const getSuggestion = async (taskName) => {
    try {
        setIsLoadingSuggestion(true);  // Set loading true
        setErrorSuggestion('');
        
        const response = await axios.post('/api/simple-suggestion', {
            namaTugas: taskName
        }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.data.success) {
            const suggestionData = response.data.data;
            setSaranWaktu(suggestionData);
            
            if (suggestionData.adaSaran) {
                setShowSuggestion(true);
            } else {
                setUseManualInput(true);
                setErrorSuggestion(suggestionData.pesan);
            }
        }
        
    } catch (error) {
        setErrorSuggestion('Gagal mendapatkan saran waktu. Silakan atur waktu manual.');
        setUseManualInput(true);
    } finally {
        setIsLoadingSuggestion(false);  // Set loading false
    }
};
```

**UI Loading State:**
```jsx
{isLoadingSuggestion && (
    <div className="loading-suggestion">
        <div className="spinner"></div>
        <span>Mencari tugas serupa...</span>
    </div>
)}
```

### **3. Menampilkan Saran AI dengan Tombol Response**

```jsx
{showSuggestion && saranWaktu && saranWaktu.adaSaran && (
    <div className="suggestion-card">
        <div className="suggestion-header">
            <h3>🤖 Saran AI</h3>
        </div>
        
        <div className="suggestion-content">
            <div className="suggested-time">
                <strong>Estimasi Waktu: {saranWaktu.saranWaktu} menit</strong>
            </div>
            
            <div className="suggestion-reason">
                {saranWaktu.pesan}
            </div>
        </div>
        
        <div className="suggestion-buttons">
            <button
                type="button"
                className="btn-accept"
                onClick={handleAcceptSuggestion}
            >
                Ya, Setuju
            </button>
            <button
                type="button"
                className="btn-reject"
                onClick={handleRejectSuggestion}
            >
                Tidak, Atur Sendiri
            </button>
        </div>
    </div>
)}
```

**Handler untuk Tombol:**
```javascript
// Handler untuk tombol "Ya, Setuju"
const handleAcceptSuggestion = () => {
    if (saranWaktu && saranWaktu.saranWaktu > 0) {
        setEstimasiWaktu(saranWaktu.saranWaktu);
        setUserResponded(true);
        setShowSuggestion(false);
    }
};

// Handler untuk tombol "Tidak, Atur Sendiri"
const handleRejectSuggestion = () => {
    setUseManualInput(true);
    setUserResponded(true);
    setShowSuggestion(false);
};
```

### **4. Beralih ke Input Manual**

```jsx
{useManualInput && (
    <div className="manual-input">
        <h4>Atur Waktu Manual</h4>
        <div className="manual-input-group">
            <input
                type="number"
                value={waktuManual}
                onChange={(e) => setWaktuManual(e.target.value)}
                placeholder="Waktu dalam menit"
                min="1"
                className="form-input"
            />
            <button
                type="button"
                className="btn-set-manual"
                onClick={handleManualTimeSubmit}
            >
                Set
            </button>
        </div>
    </div>
)}
```

**Handler Manual Input:**
```javascript
const handleManualTimeSubmit = () => {
    const waktu = parseInt(waktuManual);
    if (waktu && waktu > 0) {
        setEstimasiWaktu(waktu);
        setUseManualInput(false);
    }
};
```

## 🎯 **Flow Diagram**

```
User mengetik nama tugas
         ↓
    Debounce 1.5 detik
         ↓
    Trigger API call
         ↓
    Show loading state
         ↓
    API response
         ↓
┌─────────────────────┐
│   Ada saran?        │
└─────────────────────┘
    ↓ Ya        ↓ Tidak
Show suggestion   Show manual input
    ↓
User pilih response
    ↓
┌─────────────────────┐
│   Accept/Reject?    │
└─────────────────────┘
    ↓ Accept    ↓ Reject
Set estimation   Show manual input
    ↓               ↓
Enable submit   User input manual
    ↓               ↓
   Form ready   Set estimation
                    ↓
                Enable submit
```

## 🧪 **Testing Examples**

### **Backend Testing**
```javascript
// Test data
const daftarTugasSelesai = [
    {
        nama: "Buat laporan bulanan",
        waktu_mulai: "2025-01-01T09:00:00Z",
        waktu_selesai: "2025-01-01T10:30:00Z"  // 90 menit
    },
    {
        nama: "Review laporan tim",
        waktu_mulai: "2025-01-02T14:00:00Z",
        waktu_selesai: "2025-01-02T15:00:00Z"  // 60 menit
    }
];

// Test cases
console.log(sarankanWaktu("Buat laporan penjualan", daftarTugasSelesai)); 
// Expected: 75 (rata-rata dari 90 dan 60)

console.log(sarankanWaktu("Presentasi hasil", daftarTugasSelesai)); 
// Expected: 0 (tidak ada kata kunci yang cocok)

console.log(sarankanWaktu("", daftarTugasSelesai)); 
// Expected: 0 (nama tugas kosong)
```

### **Frontend Testing**
```javascript
// Test debounce
const mockGetSuggestion = jest.fn();
const { getByRole } = render(<TaskCreationForm />);
const input = getByRole('textbox', { name: /nama tugas/i });

fireEvent.change(input, { target: { value: 'Lap' } });
fireEvent.change(input, { target: { value: 'Lapor' } });
fireEvent.change(input, { target: { value: 'Laporan' } });

// Should only call API once after debounce
await waitFor(() => {
    expect(mockGetSuggestion).toHaveBeenCalledTimes(1);
    expect(mockGetSuggestion).toHaveBeenCalledWith('Laporan');
}, { timeout: 2000 });
```

## 🎨 **UI/UX Considerations**

### **Loading State**
- Spinner dengan animasi smooth
- Pesan informatif "Mencari tugas serupa..."
- Disable input selama loading

### **Suggestion Card**
- Design menarik dengan gradient background
- Icon AI untuk visual cue
- Informasi waktu yang jelas
- Alasan saran yang mudah dipahami

### **Manual Input**
- Muncul dengan animasi slide-in
- Placeholder yang jelas
- Validasi input (min 1 menit)
- Feedback visual saat berhasil set

### **Error Handling**
- Pesan error yang user-friendly
- Fallback ke manual input
- Retry option jika diperlukan

## 🚀 **Performance Optimizations**

### **Backend**
- Limit query tugas selesai (max 50)
- Index database pada field yang sering di-query
- Cache hasil untuk nama tugas yang sama

### **Frontend**
- Debounce untuk mengurangi API calls
- Cleanup timer saat component unmount
- Lazy loading untuk komponen besar

## 📊 **Analytics & Monitoring**

### **Metrics to Track**
- API response time
- Suggestion acceptance rate
- User interaction patterns
- Error rates

### **Logging**
```javascript
// Backend logging
console.log(`Suggestion requested: "${namaTugas}" by user ${userId}`);
console.log(`Found ${tugasSerupa.length} similar tasks`);
console.log(`Suggested time: ${saranWaktuMenit} minutes`);

// Frontend analytics
analytics.track('suggestion_requested', {
    task_name: namaTugas,
    user_id: userId,
    timestamp: new Date().toISOString()
});
```

## 🔧 **Configuration**

```javascript
// Backend config
const CONFIG = {
    MAX_COMPLETED_TASKS: 50,
    MIN_KEYWORD_LENGTH: 3,
    MAX_TASK_DURATION: 24 * 60, // 24 hours in minutes
    STOP_WORDS: ['dan', 'atau', 'yang', 'untuk', ...]
};

// Frontend config
const FRONTEND_CONFIG = {
    DEBOUNCE_DELAY: 1500,
    MIN_TASK_NAME_LENGTH: 3,
    API_TIMEOUT: 10000
};
```

Implementasi ini memberikan pengalaman user yang smooth dengan feedback yang jelas di setiap tahap proses! 🚀
