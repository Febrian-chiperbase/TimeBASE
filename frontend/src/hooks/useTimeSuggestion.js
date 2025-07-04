import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom Hook untuk mengelola state dan logic saran waktu
 */
const useTimeSuggestion = () => {
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
    
    // Debounce timer
    const [debounceTimer, setDebounceTimer] = useState(null);

    /**
     * Fungsi untuk reset semua state saran
     */
    const resetSuggestionState = useCallback(() => {
        setSaranWaktu(null);
        setShowSuggestion(false);
        setUserResponded(false);
        setUseManualInput(false);
        setErrorSuggestion('');
        setEstimasiWaktu('');
    }, []);

    /**
     * Fungsi untuk mendapatkan saran waktu dari API
     */
    const getSuggestion = useCallback(async (taskName) => {
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
    }, []);

    /**
     * Fungsi untuk trigger saran dengan debounce
     */
    const triggerSuggestion = useCallback((taskName) => {
        // Reset state saran
        resetSuggestionState();
        
        // Clear timer sebelumnya
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        
        // Set timer baru untuk debounce (1.5 detik)
        if (taskName.trim().length >= 3) {
            const timer = setTimeout(() => {
                getSuggestion(taskName.trim());
            }, 1500);
            setDebounceTimer(timer);
        }
    }, [debounceTimer, getSuggestion, resetSuggestionState]);

    /**
     * Handler untuk menerima saran
     */
    const acceptSuggestion = useCallback(() => {
        if (saranWaktu && saranWaktu.saranWaktu > 0) {
            setEstimasiWaktu(saranWaktu.saranWaktu);
            setUserResponded(true);
            setShowSuggestion(false);
        }
    }, [saranWaktu]);

    /**
     * Handler untuk menolak saran
     */
    const rejectSuggestion = useCallback(() => {
        setUseManualInput(true);
        setUserResponded(true);
        setShowSuggestion(false);
    }, []);

    /**
     * Handler untuk set waktu manual
     */
    const setManualTime = useCallback((waktu) => {
        const waktuInt = parseInt(waktu);
        if (waktuInt && waktuInt > 0) {
            setEstimasiWaktu(waktuInt);
            setUseManualInput(false);
        }
    }, []);

    // Cleanup timer saat hook di-unmount
    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);

    return {
        // State
        isLoadingSuggestion,
        saranWaktu,
        errorSuggestion,
        showSuggestion,
        userResponded,
        useManualInput,
        estimasiWaktu,
        
        // Actions
        triggerSuggestion,
        acceptSuggestion,
        rejectSuggestion,
        setManualTime,
        resetSuggestionState,
        
        // Computed
        hasSuggestion: saranWaktu && saranWaktu.adaSaran,
        isReady: Boolean(estimasiWaktu)
    };
};

export default useTimeSuggestion;
