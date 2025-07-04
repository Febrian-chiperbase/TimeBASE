package com.timebase.data.model

import com.google.gson.annotations.SerializedName

/**
 * Data class untuk saran waktu dari AI
 */
data class TimeSuggestion(
    @SerializedName("saranWaktu")
    val suggestedTime: Int?, // dalam menit
    
    @SerializedName("confidence")
    val confidence: Double, // 0.0 - 1.0
    
    @SerializedName("tugasSerupa")
    val similarTasks: List<SimilarTask>,
    
    @SerializedName("statistik")
    val statistics: SuggestionStatistics?,
    
    @SerializedName("alasan")
    val reason: String
)

/**
 * Data class untuk tugas serupa yang ditemukan
 */
data class SimilarTask(
    @SerializedName("nama")
    val name: String,
    
    @SerializedName("durasi")
    val duration: Int, // dalam menit
    
    @SerializedName("tanggalSelesai")
    val completedAt: String
)

/**
 * Data class untuk statistik saran
 */
data class SuggestionStatistics(
    @SerializedName("jumlahSampel")
    val sampleCount: Int,
    
    @SerializedName("rataRata")
    val average: Double,
    
    @SerializedName("median")
    val median: Double,
    
    @SerializedName("minimum")
    val minimum: Int,
    
    @SerializedName("maksimum")
    val maximum: Int,
    
    @SerializedName("standarDeviasi")
    val standardDeviation: Double
)

/**
 * Data class untuk request saran waktu
 */
data class TimeSuggestionRequest(
    @SerializedName("taskName")
    val taskName: String
)

/**
 * Data class untuk response API saran waktu
 */
data class TimeSuggestionResponse(
    @SerializedName("success")
    val success: Boolean,
    
    @SerializedName("data")
    val data: TimeSuggestionData?,
    
    @SerializedName("error")
    val error: String?
)

/**
 * Data class untuk data dalam response
 */
data class TimeSuggestionData(
    @SerializedName("taskName")
    val taskName: String,
    
    @SerializedName("suggestion")
    val suggestion: TimeSuggestion,
    
    @SerializedName("timestamp")
    val timestamp: String
)

/**
 * Data class untuk feedback request
 */
data class FeedbackRequest(
    @SerializedName("taskName")
    val taskName: String,
    
    @SerializedName("suggestedTime")
    val suggestedTime: Int,
    
    @SerializedName("actualTime")
    val actualTime: Int,
    
    @SerializedName("accepted")
    val accepted: Boolean,
    
    @SerializedName("feedback")
    val feedback: String?
)

/**
 * Enum untuk confidence level
 */
enum class ConfidenceLevel {
    VERY_LOW,    // 0.0 - 0.3
    LOW,         // 0.3 - 0.5
    MEDIUM,      // 0.5 - 0.7
    HIGH,        // 0.7 - 0.9
    VERY_HIGH    // 0.9 - 1.0
}

/**
 * Extension function untuk mendapatkan confidence level
 */
fun TimeSuggestion.getConfidenceLevel(): ConfidenceLevel {
    return when {
        confidence >= 0.9 -> ConfidenceLevel.VERY_HIGH
        confidence >= 0.7 -> ConfidenceLevel.HIGH
        confidence >= 0.5 -> ConfidenceLevel.MEDIUM
        confidence >= 0.3 -> ConfidenceLevel.LOW
        else -> ConfidenceLevel.VERY_LOW
    }
}

/**
 * Extension function untuk mendapatkan confidence text
 */
fun TimeSuggestion.getConfidenceText(): String {
    return when (getConfidenceLevel()) {
        ConfidenceLevel.VERY_HIGH -> "Sangat Yakin"
        ConfidenceLevel.HIGH -> "Yakin"
        ConfidenceLevel.MEDIUM -> "Cukup Yakin"
        ConfidenceLevel.LOW -> "Kurang Yakin"
        ConfidenceLevel.VERY_LOW -> "Tidak Yakin"
    }
}

/**
 * Extension function untuk format durasi
 */
fun Int.formatDuration(): String {
    return when {
        this < 60 -> "$this menit"
        this == 60 -> "1 jam"
        this < 120 -> "1 jam ${this - 60} menit"
        else -> {
            val hours = this / 60
            val minutes = this % 60
            if (minutes == 0) {
                "$hours jam"
            } else {
                "$hours jam $minutes menit"
            }
        }
    }
}

/**
 * Extension function untuk check apakah saran valid
 */
fun TimeSuggestion.isValid(): Boolean {
    return suggestedTime != null && 
           suggestedTime > 0 && 
           confidence >= 0.0 && 
           reason.isNotEmpty()
}

/**
 * Extension function untuk mendapatkan summary saran
 */
fun TimeSuggestion.getSummary(): String {
    return if (suggestedTime != null) {
        "Saran: ${suggestedTime.formatDuration()} (${getConfidenceText()})"
    } else {
        "Tidak ada saran tersedia"
    }
}
