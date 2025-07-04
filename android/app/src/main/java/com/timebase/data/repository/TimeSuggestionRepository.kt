package com.timebase.data.repository

import com.timebase.data.api.TimeSuggestionApiService
import com.timebase.data.model.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TimeSuggestionRepository @Inject constructor(
    private val apiService: TimeSuggestionApiService
) {

    /**
     * Mendapatkan saran waktu berdasarkan nama tugas
     */
    suspend fun getTimeSuggestion(taskName: String): TimeSuggestion? {
        return try {
            val request = TimeSuggestionRequest(taskName)
            val response = apiService.getTimeSuggestion(request)
            
            if (response.isSuccessful) {
                response.body()?.data?.suggestion
            } else {
                throw Exception("API Error: ${response.message()}")
            }
        } catch (e: Exception) {
            throw Exception("Failed to get time suggestion: ${e.message}")
        }
    }

    /**
     * Mendapatkan saran waktu dengan detail analisis
     */
    suspend fun getDetailedTimeSuggestion(taskName: String): TimeSuggestionDetailResponse? {
        return try {
            val request = TimeSuggestionRequest(taskName)
            val response = apiService.getDetailedTimeSuggestion(request)
            
            if (response.isSuccessful) {
                response.body()
            } else {
                throw Exception("API Error: ${response.message()}")
            }
        } catch (e: Exception) {
            throw Exception("Failed to get detailed time suggestion: ${e.message}")
        }
    }

    /**
     * Submit feedback untuk saran waktu
     */
    suspend fun submitFeedback(
        taskName: String,
        suggestedTime: Int,
        actualTime: Int,
        accepted: Boolean,
        feedback: String? = null
    ): Boolean {
        return try {
            val request = FeedbackRequest(
                taskName = taskName,
                suggestedTime = suggestedTime,
                actualTime = actualTime,
                accepted = accepted,
                feedback = feedback
            )
            
            val response = apiService.submitFeedback(request)
            response.isSuccessful
        } catch (e: Exception) {
            false // Silent fail untuk feedback
        }
    }

    /**
     * Mendapatkan riwayat saran waktu
     */
    suspend fun getSuggestionHistory(page: Int = 1, limit: Int = 20): SuggestionHistoryResponse? {
        return try {
            val response = apiService.getSuggestionHistory(page, limit)
            
            if (response.isSuccessful) {
                response.body()
            } else {
                throw Exception("API Error: ${response.message()}")
            }
        } catch (e: Exception) {
            throw Exception("Failed to get suggestion history: ${e.message}")
        }
    }
}

/**
 * Data class untuk detailed response
 */
data class TimeSuggestionDetailResponse(
    val success: Boolean,
    val data: DetailedSuggestionData?,
    val error: String?
)

data class DetailedSuggestionData(
    val taskName: String,
    val suggestion: TimeSuggestion,
    val analysis: SuggestionAnalysis,
    val timestamp: String
)

data class SuggestionAnalysis(
    val extractedKeywords: List<String>,
    val totalCompletedTasks: Int,
    val similarTasksFound: List<SimilarTaskDetail>,
    val matchingProcess: MatchingProcess
)

data class SimilarTaskDetail(
    val nama: String,
    val durasi: Int,
    val skorKesamaan: Double
)

data class MatchingProcess(
    val keywordExtraction: String,
    val similarityScoring: String,
    val durationCalculation: SuggestionStatistics?
)

/**
 * Data class untuk history response
 */
data class SuggestionHistoryResponse(
    val success: Boolean,
    val data: HistoryData?,
    val error: String?
)

data class HistoryData(
    val history: List<AccuracyStats>,
    val pagination: Pagination,
    val overallStats: OverallStats
)

data class AccuracyStats(
    val taskName: String,
    val estimated: Int,
    val actual: Int,
    val accuracy: Double?,
    val completedAt: String,
    val category: String?
)

data class Pagination(
    val currentPage: Int,
    val totalPages: Int,
    val totalItems: Int,
    val itemsPerPage: Int
)

data class OverallStats(
    val averageAccuracy: Double?,
    val totalTasks: Int,
    val distribution: AccuracyDistribution,
    val accuracyPercentage: Int
)

data class AccuracyDistribution(
    val accurate: Int,
    val overEstimated: Int,
    val underEstimated: Int
)
