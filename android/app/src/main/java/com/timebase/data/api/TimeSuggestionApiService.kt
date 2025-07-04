package com.timebase.data.api

import com.timebase.data.model.*
import com.timebase.data.repository.*
import retrofit2.Response
import retrofit2.http.*

interface TimeSuggestionApiService {
    
    @POST("time-suggestion")
    suspend fun getTimeSuggestion(
        @Body request: TimeSuggestionRequest
    ): Response<TimeSuggestionResponse>
    
    @POST("time-suggestion/detailed")
    suspend fun getDetailedTimeSuggestion(
        @Body request: TimeSuggestionRequest
    ): Response<TimeSuggestionDetailResponse>
    
    @POST("time-suggestion/feedback")
    suspend fun submitFeedback(
        @Body request: FeedbackRequest
    ): Response<ApiResponse>
    
    @GET("time-suggestion/history")
    suspend fun getSuggestionHistory(
        @Query("page") page: Int,
        @Query("limit") limit: Int
    ): Response<SuggestionHistoryResponse>
}

/**
 * Generic API response
 */
data class ApiResponse(
    val success: Boolean,
    val message: String?,
    val data: Any?
)
