package com.timebase.ui.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timebase.data.model.Task
import com.timebase.data.model.TaskScore
import com.timebase.data.model.TaskScoringEngine
import com.timebase.data.repository.TaskRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class TaskRecommendationViewModel @Inject constructor(
    private val taskRepository: TaskRepository
) : ViewModel() {

    private val _recommendedTasks = MutableLiveData<List<TaskScore>>()
    val recommendedTasks: LiveData<List<TaskScore>> = _recommendedTasks

    private val _topRecommendedTask = MutableLiveData<TaskScore?>()
    val topRecommendedTask: LiveData<TaskScore?> = _topRecommendedTask

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    init {
        loadRecommendedTasks()
    }

    /**
     * Memuat dan menghitung rekomendasi tugas
     */
    fun loadRecommendedTasks() {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                _error.value = null

                // Ambil semua tugas aktif dari repository
                val activeTasks = taskRepository.getActiveTasks()
                
                // Hitung skor dan rekomendasi menggunakan TaskScoringEngine
                val recommendedTaskScores = TaskScoringEngine.getRecommendedTasks(activeTasks)
                val topTask = recommendedTaskScores.firstOrNull()

                _recommendedTasks.value = recommendedTaskScores
                _topRecommendedTask.value = topTask

            } catch (e: Exception) {
                _error.value = "Gagal memuat rekomendasi tugas: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }

    /**
     * Mendapatkan detail scoring untuk tugas tertentu
     */
    fun getTaskScoringDetails(taskId: Long): Map<String, Any>? {
        return viewModelScope.launch {
            try {
                val task = taskRepository.getTaskById(taskId)
                task?.let { TaskScoringEngine.getDetailedScoring(it) }
            } catch (e: Exception) {
                _error.value = "Gagal mendapatkan detail scoring: ${e.message}"
                null
            }
        }.let { null } // Placeholder return, should be handled properly
    }

    /**
     * Memperbarui status tugas dan refresh rekomendasi
     */
    fun updateTaskStatus(taskId: Long, newStatus: com.timebase.data.model.TaskStatus) {
        viewModelScope.launch {
            try {
                taskRepository.updateTaskStatus(taskId, newStatus)
                loadRecommendedTasks() // Refresh rekomendasi
            } catch (e: Exception) {
                _error.value = "Gagal memperbarui status tugas: ${e.message}"
            }
        }
    }

    /**
     * Menandai tugas sebagai selesai
     */
    fun completeTask(taskId: Long, actualDuration: Int? = null) {
        viewModelScope.launch {
            try {
                taskRepository.completeTask(taskId, actualDuration)
                loadRecommendedTasks() // Refresh rekomendasi
            } catch (e: Exception) {
                _error.value = "Gagal menyelesaikan tugas: ${e.message}"
            }
        }
    }

    /**
     * Mendapatkan statistik rekomendasi
     */
    fun getRecommendationStats(): LiveData<RecommendationStats> {
        val statsLiveData = MutableLiveData<RecommendationStats>()
        
        viewModelScope.launch {
            try {
                val activeTasks = taskRepository.getActiveTasks()
                val taskScores = TaskScoringEngine.getRecommendedTasks(activeTasks)
                
                val stats = RecommendationStats(
                    totalActiveTasks = activeTasks.size,
                    highPriorityTasks = activeTasks.count { it.priority == com.timebase.data.model.TaskPriority.HIGH },
                    urgentTasks = taskScores.count { it.urgencyScore >= 20 },
                    averageScore = if (taskScores.isNotEmpty()) taskScores.map { it.totalScore }.average() else 0.0,
                    recommendedTasksCount = taskScores.size
                )
                
                statsLiveData.value = stats
            } catch (e: Exception) {
                _error.value = "Gagal mendapatkan statistik: ${e.message}"
            }
        }
        
        return statsLiveData
    }

    /**
     * Clear error message
     */
    fun clearError() {
        _error.value = null
    }
}

/**
 * Data class untuk statistik rekomendasi
 */
data class RecommendationStats(
    val totalActiveTasks: Int,
    val highPriorityTasks: Int,
    val urgentTasks: Int,
    val averageScore: Double,
    val recommendedTasksCount: Int
)
