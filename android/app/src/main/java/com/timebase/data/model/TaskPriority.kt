package com.timebase.data.model

import java.util.*
import java.util.concurrent.TimeUnit

/**
 * Enum untuk status tugas
 */
enum class TaskStatus {
    ACTIVE,      // Tugas aktif
    PAUSED,      // Tugas ditunda
    COMPLETED,   // Tugas selesai
    CANCELLED    // Tugas dibatalkan
}

/**
 * Enum untuk tingkat prioritas dengan nilai skor
 */
enum class TaskPriority(val score: Int) {
    HIGH(70),    // Prioritas tinggi = 70 poin
    MEDIUM(35),  // Prioritas sedang = 35 poin
    LOW(10)      // Prioritas rendah = 10 poin
}

/**
 * Data class untuk hasil scoring tugas
 */
data class TaskScore(
    val taskId: Long,
    val priorityScore: Int,
    val urgencyScore: Int,
    val totalScore: Int,
    val estimatedDuration: Int,
    val reasoning: String
)

/**
 * Utility class untuk menghitung skor dan rekomendasi tugas
 */
object TaskScoringEngine {
    
    /**
     * Menghitung skor kedesakan berdasarkan deadline
     */
    fun calculateUrgencyScore(dueDate: Date?): Int {
        if (dueDate == null) return 0
        
        val now = Date()
        val diffInMillis = dueDate.time - now.time
        val diffInDays = TimeUnit.MILLISECONDS.toDays(diffInMillis)
        
        return when {
            diffInDays <= 0 -> 30  // Deadline hari ini atau sudah lewat = 30 poin
            diffInDays == 1L -> 20  // Deadline besok = 20 poin
            diffInDays <= 7 -> 10   // Deadline dalam seminggu = 10 poin
            else -> 5               // Deadline lebih dari seminggu = 5 poin
        }
    }
    
    /**
     * Menghitung total skor tugas berdasarkan prioritas (70%) dan kedesakan (30%)
     */
    fun calculateTaskScore(task: Task): TaskScore {
        val priorityScore = task.priority.score
        val urgencyScore = calculateUrgencyScore(task.dueDate)
        val totalScore = priorityScore + urgencyScore
        
        val reasoning = buildString {
            append("Prioritas ${task.priority.name.lowercase()}: $priorityScore poin")
            if (task.dueDate != null) {
                val daysUntilDue = TimeUnit.MILLISECONDS.toDays(task.dueDate.time - Date().time)
                append(", Kedesakan (${formatDeadline(daysUntilDue)}): $urgencyScore poin")
            }
            append(" = Total: $totalScore poin")
        }
        
        return TaskScore(
            taskId = task.id,
            priorityScore = priorityScore,
            urgencyScore = urgencyScore,
            totalScore = totalScore,
            estimatedDuration = task.estimatedDuration,
            reasoning = reasoning
        )
    }
    
    /**
     * Mendapatkan rekomendasi tugas berdasarkan aturan scoring
     */
    fun getRecommendedTasks(tasks: List<Task>): List<TaskScore> {
        // Filter hanya tugas yang aktif dan tidak ditunda
        val activeTasks = tasks.filter { task ->
            task.status == TaskStatus.ACTIVE && !task.isCompleted
        }
        
        // Hitung skor untuk setiap tugas
        val taskScores = activeTasks.map { task ->
            calculateTaskScore(task)
        }
        
        // Urutkan berdasarkan:
        // 1. Total skor tertinggi
        // 2. Jika skor sama, estimasi waktu tercepat
        return taskScores.sortedWith(
            compareByDescending<TaskScore> { it.totalScore }
                .thenBy { it.estimatedDuration }
        )
    }
    
    /**
     * Mendapatkan tugas dengan prioritas tertinggi
     */
    fun getTopRecommendedTask(tasks: List<Task>): TaskScore? {
        return getRecommendedTasks(tasks).firstOrNull()
    }
    
    /**
     * Format deadline untuk display
     */
    private fun formatDeadline(daysUntilDue: Long): String {
        return when {
            daysUntilDue <= 0 -> "hari ini"
            daysUntilDue == 1L -> "besok"
            daysUntilDue <= 7 -> "dalam ${daysUntilDue} hari"
            else -> "lebih dari seminggu"
        }
    }
    
    /**
     * Mendapatkan penjelasan detail scoring untuk UI
     */
    fun getDetailedScoring(task: Task): Map<String, Any> {
        val taskScore = calculateTaskScore(task)
        val daysUntilDue = if (task.dueDate != null) {
            TimeUnit.MILLISECONDS.toDays(task.dueDate.time - Date().time)
        } else null
        
        return mapOf(
            "taskId" to task.id,
            "taskTitle" to task.title,
            "priority" to mapOf(
                "level" to task.priority.name,
                "score" to task.priority.score,
                "weight" to "70%"
            ),
            "urgency" to mapOf(
                "daysUntilDue" to daysUntilDue,
                "score" to taskScore.urgencyScore,
                "weight" to "30%"
            ),
            "totalScore" to taskScore.totalScore,
            "estimatedDuration" to task.estimatedDuration,
            "reasoning" to taskScore.reasoning,
            "recommendation" to when {
                taskScore.totalScore >= 90 -> "Sangat Direkomendasikan"
                taskScore.totalScore >= 60 -> "Direkomendasikan"
                taskScore.totalScore >= 30 -> "Pertimbangkan"
                else -> "Prioritas Rendah"
            }
        )
    }
}

/**
 * Extension function untuk Task model
 */
fun Task.calculateScore(): TaskScore {
    return TaskScoringEngine.calculateTaskScore(this)
}

/**
 * Extension function untuk List<Task>
 */
fun List<Task>.getRecommended(): List<TaskScore> {
    return TaskScoringEngine.getRecommendedTasks(this)
}

fun List<Task>.getTopRecommended(): TaskScore? {
    return TaskScoringEngine.getTopRecommendedTask(this)
}
