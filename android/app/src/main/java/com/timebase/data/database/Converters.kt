package com.timebase.data.database

import androidx.room.TypeConverter
import com.timebase.data.model.TaskPriority
import com.timebase.data.model.TaskStatus
import com.timebase.data.model.EnergyLevel
import java.util.Date

class Converters {
    
    @TypeConverter
    fun fromTimestamp(value: Long?): Date? {
        return value?.let { Date(it) }
    }
    
    @TypeConverter
    fun dateToTimestamp(date: Date?): Long? {
        return date?.time
    }
    
    @TypeConverter
    fun fromTaskPriority(priority: TaskPriority): String {
        return priority.name
    }
    
    @TypeConverter
    fun toTaskPriority(priority: String): TaskPriority {
        return TaskPriority.valueOf(priority)
    }
    
    @TypeConverter
    fun fromTaskStatus(status: TaskStatus): String {
        return status.name
    }
    
    @TypeConverter
    fun toTaskStatus(status: String): TaskStatus {
        return TaskStatus.valueOf(status)
    }
    
    @TypeConverter
    fun fromEnergyLevel(energyLevel: EnergyLevel): String {
        return energyLevel.name
    }
    
    @TypeConverter
    fun toEnergyLevel(energyLevel: String): EnergyLevel {
        return EnergyLevel.valueOf(energyLevel)
    }
}
