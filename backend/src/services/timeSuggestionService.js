/**
 * Service untuk memberikan saran waktu berdasarkan tugas serupa yang sudah selesai
 */
class TimeSuggestionService {
    
    /**
     * Fungsi utama untuk memberikan saran waktu
     * @param {string} namaTugasBaru - Nama tugas baru yang diinput user
     * @param {Array} daftarTugasSelesai - Array tugas yang sudah selesai
     * @returns {Object} - Objek berisi saran waktu dan detail analisis
     */
    static sarankanWaktu(namaTugasBaru, daftarTugasSelesai) {
        try {
            // 1. Validasi input
            if (!namaTugasBaru || typeof namaTugasBaru !== 'string') {
                throw new Error('Nama tugas baru harus berupa string yang valid');
            }
            
            if (!Array.isArray(daftarTugasSelesai) || daftarTugasSelesai.length === 0) {
                return {
                    saranWaktu: null,
                    confidence: 0,
                    tugasSerupa: [],
                    alasan: 'Tidak ada data tugas selesai untuk referensi'
                };
            }
            
            // 2. Ekstrak kata kunci dari nama tugas baru
            const kataKunci = this.ekstrakKataKunci(namaTugasBaru);
            
            // 3. Cari tugas serupa berdasarkan kata kunci
            const tugasSerupa = this.cariTugasSerupa(kataKunci, daftarTugasSelesai);
            
            // 4. Jika tidak ada tugas serupa ditemukan
            if (tugasSerupa.length === 0) {
                return {
                    saranWaktu: null,
                    confidence: 0,
                    tugasSerupa: [],
                    alasan: 'Tidak ditemukan tugas serupa untuk referensi'
                };
            }
            
            // 5. Hitung durasi rata-rata dari tugas serupa
            const analisisWaktu = this.hitungDurasiRataRata(tugasSerupa);
            
            // 6. Hitung confidence level berdasarkan jumlah sampel
            const confidence = this.hitungConfidence(tugasSerupa.length);
            
            return {
                saranWaktu: Math.round(analisisWaktu.rataRata),
                confidence: confidence,
                tugasSerupa: tugasSerupa.map(tugas => ({
                    nama: tugas.title,
                    durasi: tugas.durasi,
                    tanggalSelesai: tugas.completedAt
                })),
                statistik: {
                    jumlahSampel: tugasSerupa.length,
                    rataRata: analisisWaktu.rataRata,
                    median: analisisWaktu.median,
                    minimum: analisisWaktu.minimum,
                    maksimum: analisisWaktu.maksimum,
                    standarDeviasi: analisisWaktu.standarDeviasi
                },
                alasan: this.generateAlasan(tugasSerupa.length, analisisWaktu.rataRata, kataKunci)
            };
            
        } catch (error) {
            console.error('Error dalam sarankanWaktu:', error);
            return {
                saranWaktu: null,
                confidence: 0,
                tugasSerupa: [],
                error: error.message
            };
        }
    }
    
    /**
     * Ekstrak kata kunci dari nama tugas
     * @param {string} namaTugas - Nama tugas
     * @returns {Array} - Array kata kunci
     */
    static ekstrakKataKunci(namaTugas) {
        // Bersihkan dan split nama tugas
        const kataKasar = namaTugas
            .toLowerCase()
            .replace(/[^\w\s]/g, '') // Hapus karakter khusus
            .split(/\s+/) // Split berdasarkan spasi
            .filter(kata => kata.length > 2); // Filter kata dengan panjang > 2
        
        // Hapus kata-kata umum (stop words)
        const stopWords = [
            'dan', 'atau', 'yang', 'untuk', 'dari', 'ke', 'di', 'pada', 'dengan',
            'adalah', 'akan', 'sudah', 'telah', 'buat', 'membuat', 'lakukan',
            'the', 'and', 'or', 'for', 'from', 'to', 'in', 'on', 'with',
            'is', 'are', 'was', 'were', 'will', 'have', 'has', 'had', 'do', 'does'
        ];
        
        return kataKasar.filter(kata => !stopWords.includes(kata));
    }
    
    /**
     * Cari tugas serupa berdasarkan kata kunci
     * @param {Array} kataKunci - Array kata kunci
     * @param {Array} daftarTugas - Daftar tugas selesai
     * @returns {Array} - Array tugas serupa dengan skor kesamaan
     */
    static cariTugasSerupa(kataKunci, daftarTugas) {
        const tugasSerupa = [];
        
        daftarTugas.forEach(tugas => {
            // Pastikan tugas memiliki data yang diperlukan
            if (!tugas.title || !tugas.completedAt || !tugas.createdAt) {
                return;
            }
            
            // Hitung durasi kerja nyata (waktu_selesai - waktu_mulai)
            const waktuMulai = new Date(tugas.createdAt);
            const waktuSelesai = new Date(tugas.completedAt);
            const durasi = Math.round((waktuSelesai - waktuMulai) / (1000 * 60)); // dalam menit
            
            // Skip jika durasi tidak valid
            if (durasi <= 0 || durasi > 24 * 60) { // maksimal 24 jam
                return;
            }
            
            // Hitung skor kesamaan
            const skorKesamaan = this.hitungSkorKesamaan(kataKunci, tugas.title);
            
            // Tambahkan ke daftar jika ada kesamaan
            if (skorKesamaan > 0) {
                tugasSerupa.push({
                    ...tugas,
                    durasi: durasi,
                    skorKesamaan: skorKesamaan
                });
            }
        });
        
        // Urutkan berdasarkan skor kesamaan tertinggi
        return tugasSerupa
            .sort((a, b) => b.skorKesamaan - a.skorKesamaan)
            .slice(0, 10); // Ambil maksimal 10 tugas teratas
    }
    
    /**
     * Hitung skor kesamaan antara kata kunci dan nama tugas
     * @param {Array} kataKunci - Array kata kunci
     * @param {string} namaTugas - Nama tugas untuk dibandingkan
     * @returns {number} - Skor kesamaan (0-1)
     */
    static hitungSkorKesamaan(kataKunci, namaTugas) {
        const namaTugasLower = namaTugas.toLowerCase();
        let jumlahKecocokan = 0;
        
        kataKunci.forEach(kata => {
            if (namaTugasLower.includes(kata)) {
                jumlahKecocokan++;
            }
        });
        
        // Skor kesamaan = jumlah kata yang cocok / total kata kunci
        return kataKunci.length > 0 ? jumlahKecocokan / kataKunci.length : 0;
    }
    
    /**
     * Hitung durasi rata-rata dan statistik lainnya
     * @param {Array} tugasSerupa - Array tugas serupa
     * @returns {Object} - Objek berisi statistik durasi
     */
    static hitungDurasiRataRata(tugasSerupa) {
        const durasi = tugasSerupa.map(tugas => tugas.durasi).sort((a, b) => a - b);
        const jumlah = durasi.length;
        
        // Rata-rata
        const rataRata = durasi.reduce((sum, d) => sum + d, 0) / jumlah;
        
        // Median
        const median = jumlah % 2 === 0 
            ? (durasi[jumlah / 2 - 1] + durasi[jumlah / 2]) / 2
            : durasi[Math.floor(jumlah / 2)];
        
        // Min dan Max
        const minimum = Math.min(...durasi);
        const maksimum = Math.max(...durasi);
        
        // Standar Deviasi
        const variance = durasi.reduce((sum, d) => sum + Math.pow(d - rataRata, 2), 0) / jumlah;
        const standarDeviasi = Math.sqrt(variance);
        
        return {
            rataRata,
            median,
            minimum,
            maksimum,
            standarDeviasi
        };
    }
    
    /**
     * Hitung confidence level berdasarkan jumlah sampel
     * @param {number} jumlahSampel - Jumlah tugas serupa yang ditemukan
     * @returns {number} - Confidence level (0-1)
     */
    static hitungConfidence(jumlahSampel) {
        if (jumlahSampel >= 10) return 0.9;
        if (jumlahSampel >= 5) return 0.7;
        if (jumlahSampel >= 3) return 0.5;
        if (jumlahSampel >= 1) return 0.3;
        return 0;
    }
    
    /**
     * Generate alasan untuk saran waktu
     * @param {number} jumlahSampel - Jumlah sampel
     * @param {number} rataRata - Durasi rata-rata
     * @param {Array} kataKunci - Kata kunci yang digunakan
     * @returns {string} - Alasan saran
     */
    static generateAlasan(jumlahSampel, rataRata, kataKunci) {
        const kataKunciStr = kataKunci.join(', ');
        return `Berdasarkan ${jumlahSampel} tugas serupa yang mengandung kata kunci "${kataKunciStr}", rata-rata waktu penyelesaian adalah ${Math.round(rataRata)} menit.`;
    }
    
    /**
     * Fungsi untuk testing dan debugging
     * @param {string} namaTugasBaru - Nama tugas baru
     * @param {Array} daftarTugasSelesai - Daftar tugas selesai
     * @returns {Object} - Detail analisis untuk debugging
     */
    static debugAnalisis(namaTugasBaru, daftarTugasSelesai) {
        const kataKunci = this.ekstrakKataKunci(namaTugasBaru);
        const tugasSerupa = this.cariTugasSerupa(kataKunci, daftarTugasSelesai);
        
        return {
            namaTugasBaru,
            kataKunci,
            jumlahTugasSelesai: daftarTugasSelesai.length,
            tugasSerupaDetail: tugasSerupa.map(tugas => ({
                nama: tugas.title,
                durasi: tugas.durasi,
                skorKesamaan: tugas.skorKesamaan
            })),
            hasilSaran: this.sarankanWaktu(namaTugasBaru, daftarTugasSelesai)
        };
    }
}

module.exports = TimeSuggestionService;
