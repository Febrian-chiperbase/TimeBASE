/**
 * Fungsi untuk memberikan saran waktu berdasarkan tugas serupa yang sudah selesai
 * @param {string} namaTugasBaru - Nama tugas baru yang diinput user
 * @param {Array} daftarTugasSelesai - Array tugas yang sudah selesai
 * @returns {number} - Saran waktu dalam menit
 */
function sarankanWaktu(namaTugasBaru, daftarTugasSelesai) {
    // 1. Validasi input
    if (!namaTugasBaru || typeof namaTugasBaru !== 'string') {
        return 0;
    }
    
    if (!Array.isArray(daftarTugasSelesai) || daftarTugasSelesai.length === 0) {
        return 0;
    }
    
    // 2. Ekstrak kata kunci dari nama tugas baru
    const kataKunci = ekstrakKataKunci(namaTugasBaru);
    
    if (kataKunci.length === 0) {
        return 0;
    }
    
    // 3. Cari tugas serupa berdasarkan kata kunci
    const tugasSerupa = [];
    
    daftarTugasSelesai.forEach(tugas => {
        // Pastikan tugas memiliki data yang diperlukan
        if (!tugas.nama || !tugas.waktu_mulai || !tugas.waktu_selesai) {
            return;
        }
        
        // Cek apakah nama tugas mengandung kata kunci yang mirip
        const namaTugasLower = tugas.nama.toLowerCase();
        let adaKesamaan = false;
        
        kataKunci.forEach(kata => {
            if (namaTugasLower.includes(kata)) {
                adaKesamaan = true;
            }
        });
        
        if (adaKesamaan) {
            // 4. Hitung durasi kerja nyata (waktu_selesai - waktu_mulai)
            const waktuMulai = new Date(tugas.waktu_mulai);
            const waktuSelesai = new Date(tugas.waktu_selesai);
            const durasiMenit = Math.round((waktuSelesai - waktuMulai) / (1000 * 60));
            
            // Validasi durasi (harus positif dan masuk akal)
            if (durasiMenit > 0 && durasiMenit <= 24 * 60) { // maksimal 24 jam
                tugasSerupa.push({
                    nama: tugas.nama,
                    durasi: durasiMenit
                });
            }
        }
    });
    
    // 5. Jika tidak ada tugas serupa ditemukan
    if (tugasSerupa.length === 0) {
        return 0;
    }
    
    // 6. Hitung durasi rata-rata
    const totalDurasi = tugasSerupa.reduce((sum, tugas) => sum + tugas.durasi, 0);
    const rataRata = totalDurasi / tugasSerupa.length;
    
    // 7. Bulatkan ke menit terdekat
    return Math.round(rataRata);
}

/**
 * Fungsi helper untuk mengekstrak kata kunci dari nama tugas
 * @param {string} namaTugas - Nama tugas
 * @returns {Array} - Array kata kunci
 */
function ekstrakKataKunci(namaTugas) {
    // Bersihkan dan split nama tugas
    const kata = namaTugas
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
    
    return kata.filter(kata => !stopWords.includes(kata));
}

// Export fungsi untuk digunakan di tempat lain
module.exports = {
    sarankanWaktu,
    ekstrakKataKunci
};

// Contoh penggunaan:
/*
const daftarTugasSelesai = [
    {
        nama: "Buat laporan bulanan",
        waktu_mulai: "2025-01-01T09:00:00Z",
        waktu_selesai: "2025-01-01T10:30:00Z"
    },
    {
        nama: "Review laporan tim",
        waktu_mulai: "2025-01-02T14:00:00Z",
        waktu_selesai: "2025-01-02T15:00:00Z"
    },
    {
        nama: "Presentasi hasil",
        waktu_mulai: "2025-01-03T10:00:00Z",
        waktu_selesai: "2025-01-03T11:30:00Z"
    }
];

const namaTugasBaru = "Buat laporan penjualan";
const saranWaktu = sarankanWaktu(namaTugasBaru, daftarTugasSelesai);
console.log(`Saran waktu: ${saranWaktu} menit`); // Output: Saran waktu: 75 menit
*/
