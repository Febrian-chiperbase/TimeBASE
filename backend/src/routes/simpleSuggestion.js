const express = require('express');
const router = express.Router();
const simpleSuggestionController = require('../controllers/simpleSuggestionController');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Middleware validasi
const validateSuggestionRequest = [
    body('namaTugas')
        .notEmpty()
        .withMessage('Nama tugas harus diisi')
        .isLength({ min: 3, max: 200 })
        .withMessage('Nama tugas harus antara 3-200 karakter')
        .trim(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validasi gagal',
                details: errors.array()
            });
        }
        next();
    }
];

/**
 * POST /api/simple-suggestion
 * Mendapatkan saran waktu berdasarkan nama tugas
 * 
 * Request Body:
 * {
 *   "namaTugas": "Buat laporan penjualan"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "namaTugas": "Buat laporan penjualan",
 *     "saranWaktu": 45,
 *     "satuan": "menit",
 *     "adaSaran": true,
 *     "pesan": "Berdasarkan tugas serupa, estimasi waktu: 45 menit"
 *   }
 * }
 */
router.post('/', auth, validateSuggestionRequest, simpleSuggestionController.getSuggestion);

/**
 * POST /api/simple-suggestion/test
 * Endpoint untuk testing fungsi sarankanWaktu
 * 
 * Request Body:
 * {
 *   "namaTugas": "Buat laporan penjualan",
 *   "daftarTugas": [
 *     {
 *       "nama": "Buat laporan bulanan",
 *       "waktu_mulai": "2025-01-01T09:00:00Z",
 *       "waktu_selesai": "2025-01-01T10:30:00Z"
 *     }
 *   ]
 * }
 */
router.post('/test', [
    body('namaTugas').notEmpty().withMessage('Nama tugas harus diisi'),
    body('daftarTugas').isArray().withMessage('Daftar tugas harus berupa array')
], simpleSuggestionController.testSuggestion);

module.exports = router;
