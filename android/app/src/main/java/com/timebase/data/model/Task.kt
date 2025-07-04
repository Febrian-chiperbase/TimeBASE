package com.timebase.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "tasks")
data class Task(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val description: String? = null,
    val priority: TaskPriority = TaskPriority.MEDIUM,
    val status: TaskStatus = TaskStatus.ACTIVE,
    val category: String? = null,
    val estimatedDuration: Int, // dalam menit
    val actualDuration: Int? = null,
    val dueDate: Date? = null,
    val scheduledTime: Date? = null,
    val isCompleted: Boolean = false,
    val createdAt: Date = Date(),
    val updatedAt: Date = Date(),
    val aiSuggestions: String? = null, // JSON string untuk AI suggestions
    val difficultyLevel: Int = 1, // 1-5 scale
    val energyRequired: EnergyLevel = EnergyLevel.MEDIUM
)

enum class EnergyLevel {
    LOW, MEDIUM, HIGH
}

data class AITaskSuggestion(
    val optimalTime: String,
    val estimatedDuration: Int,
    val breakSuggestions: List<String>,
    val preparationTips: List<String>,
    val focusScore: Float
)
