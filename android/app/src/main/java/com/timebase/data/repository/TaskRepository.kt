package com.timebase.data.repository

import androidx.lifecycle.LiveData
import com.timebase.data.database.TaskDao
import com.timebase.data.model.Task
import com.timebase.data.model.TaskPriority
import com.timebase.data.model.TaskStatus
import java.util.Date
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TaskRepository @Inject constructor(
    private val taskDao: TaskDao
) {

    /**
     * Mendapatkan semua tugas
     */
    fun getAllTasks(): LiveData<List<Task>> {
        return taskDao.getAllTasks()
    }

    /**
     * Mendapatkan tugas aktif (tidak ditunda dan belum selesai)
     */
    suspend fun getActiveTasks(): List<Task> {
        return taskDao.getRecommendedTasks()
    }

    /**
     * Mendapatkan tugas aktif sebagai LiveData
     */
    fun getActiveTasksLiveData(): LiveData<List<Task>> {
        return taskDao.getActiveTasks()
    }

    /**
     * Mendapatkan tugas yang sudah selesai
     */
    fun getCompletedTasks(): LiveData<List<Task>> {
        return taskDao.getCompletedTasks()
    }

    /**
     * Mendapatkan tugas yang ditunda
     */
    fun getPausedTasks(): LiveData<List<Task>> {
        return taskDao.getPausedTasks()
    }

    /**
     * Mendapatkan tugas berdasarkan ID
     */
    suspend fun getTaskById(taskId: Long): Task? {
        return taskDao.getTaskById(taskId)
    }

    /**
     * Mendapatkan tugas berdasarkan prioritas
     */
    fun getTasksByPriority(priority: TaskPriority): LiveData<List<Task>> {
        return taskDao.getTasksByPriority(priority)
    }

    /**
     * Mendapatkan tugas berdasarkan kategori
     */
    fun getTasksByCategory(category: String): LiveData<List<Task>> {
        return taskDao.getTasksByCategory(category)
    }

    /**
     * Mendapatkan tugas berdasarkan status
     */
    fun getTasksByStatus(status: TaskStatus): LiveData<List<Task>> {
        return taskDao.getTasksByStatus(status)
    }

    /**
     * Mendapatkan tugas berdasarkan rentang tanggal
     */
    fun getTasksByDateRange(startDate: Date, endDate: Date): LiveData<List<Task>> {
        return taskDao.getTasksByDateRange(startDate, endDate)
    }

    /**
     * Mendapatkan tugas yang dijadwalkan
     */
    fun getScheduledTasks(startTime: Date, endTime: Date): LiveData<List<Task>> {
        return taskDao.getScheduledTasks(startTime, endTime)
    }

    /**
     * Menambah tugas baru
     */
    suspend fun insertTask(task: Task): Long {
        return taskDao.insertTask(task)
    }

    /**
     * Memperbarui tugas
     */
    suspend fun updateTask(task: Task) {
        taskDao.updateTask(task.copy(updatedAt = Date()))
    }

    /**
     * Menghapus tugas
     */
    suspend fun deleteTask(task: Task) {
        taskDao.deleteTask(task)
    }

    /**
     * Menandai tugas sebagai selesai
     */
    suspend fun completeTask(taskId: Long, actualDuration: Int? = null) {
        val task = taskDao.getTaskById(taskId)
        task?.let {
            val updatedTask = it.copy(
                isCompleted = true,
                status = TaskStatus.COMPLETED,
                actualDuration = actualDuration ?: it.actualDuration,
                updatedAt = Date()
            )
            taskDao.updateTask(updatedTask)
        }
    }

    /**
     * Memperbarui status tugas
     */
    suspend fun updateTaskStatus(taskId: Long, status: TaskStatus) {
        taskDao.updateTaskStatus(taskId, status)
    }

    /**
     * Memperbarui durasi aktual tugas
     */
    suspend fun updateTaskDuration(taskId: Long, duration: Int) {
        taskDao.updateTaskDuration(taskId, duration)
    }

    /**
     * Mendapatkan rata-rata durasi berdasarkan kategori
     */
    suspend fun getAverageDurationByCategory(category: String): Double? {
        return taskDao.getAverageDurationByCategory(category)
    }

    /**
     * Mendapatkan jumlah tugas yang diselesaikan hari ini
     */
    suspend fun getTodayCompletedTasksCount(): Int {
        return taskDao.getTodayCompletedTasksCount()
    }

    /**
     * Pause/Resume tugas
     */
    suspend fun pauseTask(taskId: Long) {
        updateTaskStatus(taskId, TaskStatus.PAUSED)
    }

    suspend fun resumeTask(taskId: Long) {
        updateTaskStatus(taskId, TaskStatus.ACTIVE)
    }

    /**
     * Membatalkan tugas
     */
    suspend fun cancelTask(taskId: Long) {
        updateTaskStatus(taskId, TaskStatus.CANCELLED)
    }

    /**
     * Mendapatkan tugas berdasarkan rekomendasi scoring
     */
    suspend fun getRecommendedTasks(): List<Task> {
        return taskDao.getRecommendedTasks()
    }
}
