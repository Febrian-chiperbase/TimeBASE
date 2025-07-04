import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './TaskCreationForm.css';

const TaskCreationForm = () => {
    // State Management
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

    // 1. Fungsi untuk memicu pemanggilan API setelah pengguna selesai mengetik
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

    // Fungsi untuk reset state saran
    const resetSuggestionState = () => {
        setSaranWaktu(null);
        setShowSuggestion(false);
        setUserResponded(false);
        setUseManualInput(false);
        setErrorSuggestion('');
        setEstimasiWaktu('');
    };

    // 2. Fungsi untuk memanggil API dan menampilkan loading
    const getSuggestion = async (taskName) => {
        try {
            setIsLoadingSuggestion(true);
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
                    // Jika tidak ada saran, langsung ke input manual
                    setUseManualInput(true);
                    setErrorSuggestion(suggestionData.pesan);
                }
            }
            
        } catch (error) {
            console.error('Error getting suggestion:', error);
            setErrorSuggestion('Gagal mendapatkan saran waktu. Silakan atur waktu manual.');
            setUseManualInput(true);
        } finally {
            setIsLoadingSuggestion(false);
        }
    };

    // 3. Handler untuk tombol "Ya, Setuju"
    const handleAcceptSuggestion = () => {
        if (saranWaktu && saranWaktu.saranWaktu > 0) {
            setEstimasiWaktu(saranWaktu.saranWaktu);
            setUserResponded(true);
            setShowSuggestion(false);
        }
    };

    // 4. Handler untuk tombol "Tidak, Atur Sendiri"
    const handleRejectSuggestion = () => {
        setUseManualInput(true);
        setUserResponded(true);
        setShowSuggestion(false);
    };

    // Handler untuk input manual
    const handleManualTimeSubmit = () => {
        const waktu = parseInt(waktuManual);
        if (waktu && waktu > 0) {
            setEstimasiWaktu(waktu);
            setUseManualInput(false);
        }
    };

    // Handler untuk submit form
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
        resetSuggestionState();
        setWaktuManual('');
    };

    // Cleanup timer saat component unmount
    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);

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
                        {errorSuggestion}
                    </div>
                )}

                {/* Suggestion Card */}
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

                {/* Manual Input */}
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

                {/* Final Estimation Display */}
                {estimasiWaktu && (
                    <div className="final-estimation">
                        <strong>Estimasi Waktu: {estimasiWaktu} menit</strong>
                    </div>
                )}

                {/* Input Deskripsi */}
                <div className="form-group">
                    <label htmlFor="deskripsi">Deskripsi (Opsional)</label>
                    <textarea
                        id="deskripsi"
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                        placeholder="Deskripsi tugas..."
                        rows="3"
                        className="form-textarea"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn-submit"
                    disabled={!namaTugas.trim() || !estimasiWaktu}
                >
                    Buat Tugas
                </button>
            </form>
        </div>
    );
};

export default TaskCreationForm;
