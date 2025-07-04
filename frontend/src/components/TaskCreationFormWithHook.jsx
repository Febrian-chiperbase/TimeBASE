import React, { useState } from 'react';
import useTimeSuggestion from '../hooks/useTimeSuggestion';
import './TaskCreationForm.css';

/**
 * Komponen TaskCreationForm menggunakan custom hook
 * untuk mengelola state dan logic saran waktu
 */
const TaskCreationFormWithHook = () => {
    // State untuk form
    const [namaTugas, setNamaTugas] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [waktuManual, setWaktuManual] = useState('');

    // Custom hook untuk saran waktu
    const {
        // State
        isLoadingSuggestion,
        saranWaktu,
        errorSuggestion,
        showSuggestion,
        useManualInput,
        estimasiWaktu,
        
        // Actions
        triggerSuggestion,
        acceptSuggestion,
        rejectSuggestion,
        setManualTime,
        resetSuggestionState,
        
        // Computed
        hasSuggestion,
        isReady
    } = useTimeSuggestion();

    /**
     * Handler untuk perubahan nama tugas
     */
    const handleNamaTugasChange = (e) => {
        const value = e.target.value;
        setNamaTugas(value);
        
        // Trigger saran waktu dengan debounce
        triggerSuggestion(value);
    };

    /**
     * Handler untuk set waktu manual
     */
    const handleManualTimeSubmit = () => {
        setManualTime(waktuManual);
        setWaktuManual(''); // Clear input setelah set
    };

    /**
     * Handler untuk submit form
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!namaTugas.trim() || !estimasiWaktu) {
            alert('Nama tugas dan estimasi waktu harus diisi');
            return;
        }
        
        // Logic untuk membuat tugas baru
        const tugasBaru = {
            nama: namaTugas.trim(),
            deskripsi: deskripsi.trim(),
            estimasiWaktu: parseInt(estimasiWaktu),
            tanggalBuat: new Date().toISOString()
        };
        
        console.log('Tugas baru:', tugasBaru);
        alert('Tugas berhasil dibuat!');
        
        // Reset form
        setNamaTugas('');
        setDeskripsi('');
        setWaktuManual('');
        resetSuggestionState();
    };

    return (
        <div className="task-creation-form">
            <h2>Buat Tugas Baru</h2>
            
            <form onSubmit={handleSubmit}>
                {/* Input Nama Tugas */}
                <div className="form-group">
                    <label htmlFor="namaTugas">Nama Tugas *</label>
                    <input
                        type="text"
                        id="namaTugas"
                        value={namaTugas}
                        onChange={handleNamaTugasChange}
                        placeholder="Masukkan nama tugas..."
                        required
                        className="form-input"
                    />
                    <small className="form-hint">
                        Minimal 3 karakter untuk mendapatkan saran waktu
                    </small>
                </div>

                {/* Loading State */}
                {isLoadingSuggestion && (
                    <div className="loading-suggestion">
                        <div className="spinner"></div>
                        <span>Mencari tugas serupa...</span>
                    </div>
                )}

                {/* Error Message */}
                {errorSuggestion && (
                    <div className="error-message">
                        <strong>ℹ️ Info:</strong> {errorSuggestion}
                    </div>
                )}

                {/* Suggestion Card */}
                {showSuggestion && hasSuggestion && (
                    <div className="suggestion-card">
                        <div className="suggestion-header">
                            <h3>🤖 Saran AI</h3>
                        </div>
                        
                        <div className="suggestion-content">
                            <div className="suggested-time">
                                <strong>Estimasi Waktu: {saranWaktu.saranWaktu} menit</strong>
                                <div className="time-format">
                                    ({Math.floor(saranWaktu.saranWaktu / 60) > 0 && 
                                      `${Math.floor(saranWaktu.saranWaktu / 60)} jam `}
                                    {saranWaktu.saranWaktu % 60 > 0 && 
                                      `${saranWaktu.saranWaktu % 60} menit`})
                                </div>
                            </div>
                            
                            <div className="suggestion-reason">
                                {saranWaktu.pesan}
                            </div>
                        </div>
                        
                        <div className="suggestion-buttons">
                            <button
                                type="button"
                                className="btn-accept"
                                onClick={acceptSuggestion}
                            >
                                ✅ Ya, Setuju
                            </button>
                            <button
                                type="button"
                                className="btn-reject"
                                onClick={rejectSuggestion}
                            >
                                ✏️ Tidak, Atur Sendiri
                            </button>
                        </div>
                    </div>
                )}

                {/* Manual Input */}
                {useManualInput && (
                    <div className="manual-input">
                        <h4>⏱️ Atur Waktu Manual</h4>
                        <p className="manual-description">
                            Masukkan estimasi waktu yang Anda butuhkan untuk menyelesaikan tugas ini.
                        </p>
                        <div className="manual-input-group">
                            <input
                                type="number"
                                value={waktuManual}
                                onChange={(e) => setWaktuManual(e.target.value)}
                                placeholder="Waktu dalam menit"
                                min="1"
                                max="1440"
                                className="form-input"
                            />
                            <button
                                type="button"
                                className="btn-set-manual"
                                onClick={handleManualTimeSubmit}
                                disabled={!waktuManual || parseInt(waktuManual) <= 0}
                            >
                                Set
                            </button>
                        </div>
                        <small className="form-hint">
                            Contoh: 30 menit, 120 menit (2 jam), dll.
                        </small>
                    </div>
                )}

                {/* Final Estimation Display */}
                {estimasiWaktu && (
                    <div className="final-estimation">
                        <div className="estimation-icon">⏰</div>
                        <div className="estimation-text">
                            <strong>Estimasi Waktu: {estimasiWaktu} menit</strong>
                            <div className="estimation-format">
                                ({Math.floor(estimasiWaktu / 60) > 0 && 
                                  `${Math.floor(estimasiWaktu / 60)} jam `}
                                {estimasiWaktu % 60 > 0 && 
                                  `${estimasiWaktu % 60} menit`})
                            </div>
                        </div>
                    </div>
                )}

                {/* Input Deskripsi */}
                <div className="form-group">
                    <label htmlFor="deskripsi">Deskripsi (Opsional)</label>
                    <textarea
                        id="deskripsi"
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                        placeholder="Tambahkan deskripsi atau catatan untuk tugas ini..."
                        rows="3"
                        className="form-textarea"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn-submit"
                    disabled={!isReady || !namaTugas.trim()}
                >
                    {isReady && namaTugas.trim() ? 
                        '🚀 Buat Tugas' : 
                        '⏳ Lengkapi Data Tugas'
                    }
                </button>
                
                {/* Form Status */}
                <div className="form-status">
                    {!namaTugas.trim() && (
                        <small className="status-warning">📝 Nama tugas harus diisi</small>
                    )}
                    {namaTugas.trim() && !estimasiWaktu && (
                        <small className="status-info">⏱️ Menunggu estimasi waktu</small>
                    )}
                    {isReady && namaTugas.trim() && (
                        <small className="status-success">✅ Siap untuk dibuat</small>
                    )}
                </div>
            </form>
        </div>
    );
};

export default TaskCreationFormWithHook;
