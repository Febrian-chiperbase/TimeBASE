package com.timebase.ai

import com.timebase.data.model.Task
import com.timebase.data.model.AITaskSuggestion
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST
import javax.inject.Inject
import javax.inject.Singleton

interface AIApiService {
    @POST("ai/optimize-schedule")
    suspend fun optimizeSchedule(@Body request: ScheduleOptimizationRequest): Response<ScheduleOptimizationResponse>
    
    @POST("ai/task-suggestions")
    suspend fun getTaskSuggestions(@Body request: TaskSuggestionRequest): Response<TaskSuggestionResponse>
    
    @POST("ai/productivity-insights")
    suspend fun getProductivityInsights(@Body request: ProductivityRequest): Response<ProductivityInsightsResponse>
}

@Singleton
class AIService @Inject constructor(
    private val apiService: AIApiService
) {
    
    suspend fun optimizeDailySchedule(tasks: List<Task>, userPreferences: UserPreferences): Result<List<Task>> {
        return try {
            val request = ScheduleOptimizationRequest(
                tasks = tasks.map { it.toAITask() },
                preferences = userPreferences,
                currentTime = System.currentTimeMillis()
            )
            
            val response = apiService.optimizeSchedule(request)
            if (response.isSuccessful) {
                val optimizedTasks = response.body()?.optimizedTasks?.map { aiTask ->
                    tasks.find { it.id == aiTask.id }?.copy(
                        scheduledTime = aiTask.scheduledTime,
                        aiSuggestions = aiTask.suggestions
                    )
                }?.filterNotNull() ?: emptyList()
                
                Result.success(optimizedTasks)
            } else {
                Result.failure(Exception("AI optimization failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getTaskSuggestions(task: Task, historicalData: List<Task>): Result<AITaskSuggestion> {
        return try {
            val request = TaskSuggestionRequest(
                task = task.toAITask(),
                historicalTasks = historicalData.map { it.toAITask() },
                userContext = getCurrentUserContext()
            )
            
            val response = apiService.getTaskSuggestions(request)
            if (response.isSuccessful) {
                response.body()?.suggestion?.let { suggestion ->
                    Result.success(suggestion)
                } ?: Result.failure(Exception("No suggestions received"))
            } else {
                Result.failure(Exception("Failed to get AI suggestions: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getProductivityInsights(tasks: List<Task>, timeRange: TimeRange): Result<ProductivityInsights> {
        return try {
            val request = ProductivityRequest(
                completedTasks = tasks.filter { it.isCompleted }.map { it.toAITask() },
                timeRange = timeRange,
                userMetrics = getUserMetrics()
            )
            
            val response = apiService.getProductivityInsights(request)
            if (response.isSuccessful) {
                response.body()?.insights?.let { insights ->
                    Result.success(insights)
                } ?: Result.failure(Exception("No insights received"))
            } else {
                Result.failure(Exception("Failed to get productivity insights: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    private fun Task.toAITask(): AITask {
        return AITask(
            id = this.id,
            title = this.title,
            description = this.description,
            priority = this.priority.name,
            estimatedDuration = this.estimatedDuration,
            actualDuration = this.actualDuration,
            category = this.category,
            difficultyLevel = this.difficultyLevel,
            energyRequired = this.energyRequired.name,
            dueDate = this.dueDate?.time,
            scheduledTime = this.scheduledTime?.time,
            isCompleted = this.isCompleted
        )
    }
    
    private fun getCurrentUserContext(): UserContext {
        // Implementasi untuk mendapatkan konteks user saat ini
        return UserContext(
            currentTime = System.currentTimeMillis(),
            energyLevel = "medium",
            availableTime = 480, // 8 hours in minutes
            distractionLevel = "low"
        )
    }
    
    private fun getUserMetrics(): UserMetrics {
        // Implementasi untuk mendapatkan metrics user
        return UserMetrics(
            averageTaskDuration = 45,
            completionRate = 0.85f,
            mostProductiveHours = listOf(9, 10, 14, 15),
            preferredBreakDuration = 15
        )
    }
}

// Data classes untuk AI API
data class ScheduleOptimizationRequest(
    val tasks: List<AITask>,
    val preferences: UserPreferences,
    val currentTime: Long
)

data class ScheduleOptimizationResponse(
    val optimizedTasks: List<AITask>,
    val totalEstimatedTime: Int,
    val suggestions: List<String>
)

data class TaskSuggestionRequest(
    val task: AITask,
    val historicalTasks: List<AITask>,
    val userContext: UserContext
)

data class TaskSuggestionResponse(
    val suggestion: AITaskSuggestion
)

data class ProductivityRequest(
    val completedTasks: List<AITask>,
    val timeRange: TimeRange,
    val userMetrics: UserMetrics
)

data class ProductivityInsightsResponse(
    val insights: ProductivityInsights
)

data class AITask(
    val id: Long,
    val title: String,
    val description: String?,
    val priority: String,
    val estimatedDuration: Int,
    val actualDuration: Int?,
    val category: String?,
    val difficultyLevel: Int,
    val energyRequired: String,
    val dueDate: Long?,
    val scheduledTime: Long?,
    val isCompleted: Boolean,
    val suggestions: String? = null
)

data class UserPreferences(
    val workingHours: Pair<Int, Int>, // start and end hour
    val breakDuration: Int,
    val maxContinuousWork: Int,
    val preferredTaskOrder: String // "priority", "duration", "difficulty"
)

data class UserContext(
    val currentTime: Long,
    val energyLevel: String,
    val availableTime: Int,
    val distractionLevel: String
)

data class UserMetrics(
    val averageTaskDuration: Int,
    val completionRate: Float,
    val mostProductiveHours: List<Int>,
    val preferredBreakDuration: Int
)

data class TimeRange(
    val startTime: Long,
    val endTime: Long
)

data class ProductivityInsights(
    val overallScore: Float,
    val trends: List<String>,
    val recommendations: List<String>,
    val bestPerformingCategories: List<String>,
    val improvementAreas: List<String>
)
