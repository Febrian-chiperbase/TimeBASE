const { sarankanWaktu } = require('../utils/timeSuggestion');
const Task = require('../models/Task');

class SimpleSuggestionController {
    
    /**
     * Endpoint untuk mendapatkan saran waktu sederhana
     */
    async getSuggestion(req, res) {
        try {
            const { namaTugas } = req.body;
            const userId = req.user.id;
            
            // Validasi input
            if (!namaTugas || typeof namaTugas !== 'string' || namaTugas.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Nama tugas harus diisi'
                });
            }
            
            // Ambil daftar tugas yang sudah selesai dari database
            const tugasSelesai = await Task.find({
                userId: userId,
                isCompleted: true,
                completedAt: { $exists: true },
                createdAt: { $exists: true }
            }).select('title createdAt completedAt')
              .sort({ completedAt: -1 })
              .limit(50); // Ambil maksimal 50 tugas terakhir
            
            // Konversi format data untuk fungsi sarankanWaktu
            const daftarTugasSelesai = tugasSelesai.map(tugas => ({
                nama: tugas.title,
                waktu_mulai: tugas.createdAt,
                waktu_selesai: tugas.completedAt
            }));
            
            // Panggil fungsi sarankanWaktu
            const saranWaktuMenit = sarankanWaktu(namaTugas.trim(), daftarTugasSelesai);
            
            // Response
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
            
        } catch (error) {
            console.error('Error getting time suggestion:', error);
            res.status(500).json({
                success: false,
                error: 'Gagal mendapatkan saran waktu',
                message: error.message
            });
        }
    }
    
    /**
     * Endpoint untuk testing fungsi sarankanWaktu
     */
    async testSuggestion(req, res) {
        try {
            const { namaTugas, daftarTugas } = req.body;
            
            if (!namaTugas || !Array.isArray(daftarTugas)) {
                return res.status(400).json({
                    success: false,
                    error: 'namaTugas dan daftarTugas harus diisi'
                });
            }
            
            const saranWaktuMenit = sarankanWaktu(namaTugas, daftarTugas);
            
            res.json({
                success: true,
                data: {
                    namaTugas,
                    daftarTugas,
                    saranWaktu: saranWaktuMenit,
                    satuan: 'menit'
                }
            });
            
        } catch (error) {
            console.error('Error testing suggestion:', error);
            res.status(500).json({
                success: false,
                error: 'Gagal menjalankan test',
                message: error.message
            });
        }
    }
}

module.exports = new SimpleSuggestionController();
