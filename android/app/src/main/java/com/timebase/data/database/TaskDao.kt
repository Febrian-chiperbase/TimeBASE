package com.timebase.data.database

import androidx.lifecycle.LiveData
import androidx.room.*
import com.timebase.data.model.Task
import com.timebase.data.model.TaskPriority
import com.timebase.data.model.TaskStatus
import java.util.Date

@Dao
interface TaskDao {
    
    @Query("SELECT * FROM tasks ORDER BY createdAt DESC")
    fun getAllTasks(): LiveData<List<Task>>
    
    @Query("SELECT * FROM tasks WHERE status = 'ACTIVE' AND isCompleted = 0 ORDER BY priority DESC, dueDate ASC")
    fun getActiveTasks(): LiveData<List<Task>>
    
    @Query("SELECT * FROM tasks WHERE isCompleted = 1 ORDER BY updatedAt DESC")
    fun getCompletedTasks(): LiveData<List<Task>>
    
    @Query("SELECT * FROM tasks WHERE status = 'PAUSED' ORDER BY updatedAt DESC")
    fun getPausedTasks(): LiveData<List<Task>>
    
    @Query("SELECT * FROM tasks WHERE dueDate BETWEEN :startDate AND :endDate")
    fun getTasksByDateRange(startDate: Date, endDate: Date): LiveData<List<Task>>
    
    @Query("SELECT * FROM tasks WHERE priority = :priority AND status = 'ACTIVE' AND isCompleted = 0")
    fun getTasksByPriority(priority: TaskPriority): LiveData<List<Task>>
    
    @Query("SELECT * FROM tasks WHERE category = :category")
    fun getTasksByCategory(category: String): LiveData<List<Task>>
    
    @Query("SELECT * FROM tasks WHERE status = :status")
    fun getTasksByStatus(status: TaskStatus): LiveData<List<Task>>
    
    @Query("SELECT * FROM tasks WHERE id = :taskId")
    suspend fun getTaskById(taskId: Long): Task?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTask(task: Task): Long
    
    @Update
    suspend fun updateTask(task: Task)
    
    @Delete
    suspend fun deleteTask(task: Task)
    
    @Query("UPDATE tasks SET isCompleted = 1, updatedAt = :completedAt WHERE id = :taskId")
    suspend fun markTaskCompleted(taskId: Long, completedAt: Date = Date())
    
    @Query("UPDATE tasks SET status = :status, updatedAt = :updatedAt WHERE id = :taskId")
    suspend fun updateTaskStatus(taskId: Long, status: TaskStatus, updatedAt: Date = Date())
    
    @Query("UPDATE tasks SET actualDuration = :duration WHERE id = :taskId")
    suspend fun updateTaskDuration(taskId: Long, duration: Int)
    
    @Query("SELECT AVG(actualDuration) FROM tasks WHERE isCompleted = 1 AND category = :category")
    suspend fun getAverageDurationByCategory(category: String): Double?
    
    @Query("SELECT COUNT(*) FROM tasks WHERE isCompleted = 1 AND DATE(updatedAt) = DATE('now')")
    suspend fun getTodayCompletedTasksCount(): Int
    
    @Query("SELECT * FROM tasks WHERE scheduledTime BETWEEN :startTime AND :endTime")
    fun getScheduledTasks(startTime: Date, endTime: Date): LiveData<List<Task>>
    
    // Query untuk mendapatkan tugas berdasarkan scoring logic
    @Query("""
        SELECT * FROM tasks 
        WHERE status = 'ACTIVE' AND isCompleted = 0 
        ORDER BY 
            CASE priority 
                WHEN 'HIGH' THEN 70 
                WHEN 'MEDIUM' THEN 35 
                WHEN 'LOW' THEN 10 
            END DESC,
            dueDate ASC,
            estimatedDuration ASC
    """)
    suspend fun getRecommendedTasks(): List<Task>
}
