package com.timebase.ui.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timebase.data.model.TimeSuggestion
import com.timebase.data.repository.TimeSuggestionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class TaskCreationViewModel @Inject constructor(
    private val timeSuggestionRepository: TimeSuggestionRepository
) : ViewModel() {

    // State untuk nama tugas
    private val _taskName = MutableLiveData<String>()
    val taskName: LiveData<String> = _taskName

    // State untuk loading saran waktu
    private val _isLoadingSuggestion = MutableLiveData<Boolean>()
    val isLoadingSuggestion: LiveData<Boolean> = _isLoadingSuggestion

    // State untuk saran waktu dari AI
    private val _timeSuggestion = MutableLiveData<TimeSuggestion?>()
    val timeSuggestion: LiveData<TimeSuggestion?> = _timeSuggestion

    // State untuk error
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    // State untuk mode input manual
    private val _isManualInput = MutableLiveData<Boolean>()
    val isManualInput: LiveData<Boolean> = _isManualInput

    // State untuk estimasi waktu manual
    private val _manualEstimation = MutableLiveData<Int?>()
    val manualEstimation: LiveData<Int?> = _manualEstimation

    // State untuk menunjukkan apakah user sudah merespons saran
    private val _suggestionResponded = MutableLiveData<Boolean>()
    val suggestionResponded: LiveData<Boolean> = _suggestionResponded

    // Job untuk debounce typing
    private var suggestionJob: Job? = null

    // Konstanta untuk debounce delay
    private val DEBOUNCE_DELAY = 1000L // 1 detik

    init {
        _isManualInput.value = false
        _suggestionResponded.value = false
    }

    /**
     * Dipanggil setiap kali user mengetik nama tugas
     */
    fun onTaskNameChanged(newTaskName: String) {
        _taskName.value = newTaskName
        
        // Reset state saran jika nama tugas berubah
        if (newTaskName.trim() != (_taskName.value?.trim() ?: "")) {
            resetSuggestionState()
        }
        
        // Trigger pencarian saran dengan debounce
        triggerTimeSuggestion(newTaskName.trim())
    }

    /**
     * Trigger pencarian saran waktu dengan debounce
     */
    private fun triggerTimeSuggestion(taskName: String) {
        // Cancel job sebelumnya jika ada
        suggestionJob?.cancel()
        
        // Jika nama tugas kosong atau terlalu pendek, tidak perlu cari saran
        if (taskName.length < 3) {
            _timeSuggestion.value = null
            return
        }
        
        // Buat job baru dengan delay
        suggestionJob = viewModelScope.launch {
            try {
                // Delay untuk debounce (menunggu user selesai mengetik)
                delay(DEBOUNCE_DELAY)
                
                // Set loading state
                _isLoadingSuggestion.value = true
                _error.value = null
                
                // Panggil API untuk mendapatkan saran
                val suggestion = timeSuggestionRepository.getTimeSuggestion(taskName)
                
                // Update state dengan hasil saran
                _timeSuggestion.value = suggestion
                
                // Log untuk debugging
                println("Time suggestion received: ${suggestion?.suggestedTime} minutes")
                
            } catch (e: Exception) {
                _error.value = "Gagal mendapatkan saran waktu: ${e.message}"
                _timeSuggestion.value = null
            } finally {
                _isLoadingSuggestion.value = false
            }
        }
    }

    /**
     * User menerima saran AI
     */
    fun acceptSuggestion() {
        val suggestion = _timeSuggestion.value
        if (suggestion != null) {
            _manualEstimation.value = suggestion.suggestedTime
            _suggestionResponded.value = true
            _isManualInput.value = false
            
            // Log acceptance untuk analytics
            logSuggestionResponse(true, suggestion)
        }
    }

    /**
     * User menolak saran AI dan ingin input manual
     */
    fun rejectSuggestion() {
        val suggestion = _timeSuggestion.value
        _isManualInput.value = true
        _suggestionResponded.value = true
        _manualEstimation.value = null
        
        // Log rejection untuk analytics
        if (suggestion != null) {
            logSuggestionResponse(false, suggestion)
        }
    }

    /**
     * Set estimasi waktu manual
     */
    fun setManualEstimation(minutes: Int) {
        _manualEstimation.value = minutes
    }

    /**
     * Reset state saran
     */
    private fun resetSuggestionState() {
        _timeSuggestion.value = null
        _isLoadingSuggestion.value = false
        _suggestionResponded.value = false
        _isManualInput.value = false
        _error.value = null
    }

    /**
     * Get final estimation (dari saran AI atau manual input)
     */
    fun getFinalEstimation(): Int? {
        return _manualEstimation.value
    }

    /**
     * Check apakah form siap untuk submit
     */
    fun isReadyToSubmit(): Boolean {
        val taskName = _taskName.value?.trim()
        val estimation = _manualEstimation.value
        
        return !taskName.isNullOrEmpty() && 
               taskName.length >= 3 && 
               estimation != null && 
               estimation > 0
    }

    /**
     * Submit feedback setelah tugas selesai
     */
    fun submitFeedback(actualTime: Int, feedback: String? = null) {
        val suggestion = _timeSuggestion.value
        val taskName = _taskName.value?.trim()
        
        if (suggestion != null && !taskName.isNullOrEmpty()) {
            viewModelScope.launch {
                try {
                    timeSuggestionRepository.submitFeedback(
                        taskName = taskName,
                        suggestedTime = suggestion.suggestedTime,
                        actualTime = actualTime,
                        accepted = _suggestionResponded.value == true && !_isManualInput.value,
                        feedback = feedback
                    )
                } catch (e: Exception) {
                    // Log error tapi jangan ganggu user experience
                    println("Failed to submit feedback: ${e.message}")
                }
            }
        }
    }

    /**
     * Log response user terhadap saran (untuk analytics)
     */
    private fun logSuggestionResponse(accepted: Boolean, suggestion: TimeSuggestion) {
        viewModelScope.launch {
            try {
                // Implementasi logging untuk analytics
                println("Suggestion ${if (accepted) "accepted" else "rejected"}: ${suggestion.suggestedTime} minutes")
                // Bisa dikirim ke analytics service
            } catch (e: Exception) {
                // Silent fail untuk logging
            }
        }
    }

    /**
     * Clear error message
     */
    fun clearError() {
        _error.value = null
    }

    /**
     * Force refresh suggestion
     */
    fun refreshSuggestion() {
        val currentTaskName = _taskName.value?.trim()
        if (!currentTaskName.isNullOrEmpty() && currentTaskName.length >= 3) {
            resetSuggestionState()
            triggerTimeSuggestion(currentTaskName)
        }
    }

    override fun onCleared() {
        super.onCleared()
        suggestionJob?.cancel()
    }
}
