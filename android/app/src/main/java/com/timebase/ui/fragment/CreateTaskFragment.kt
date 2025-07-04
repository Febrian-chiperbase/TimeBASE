package com.timebase.ui.fragment

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import com.timebase.R
import com.timebase.databinding.FragmentCreateTaskBinding
import com.timebase.ui.viewmodel.TaskCreationViewModel
import com.timebase.data.model.formatDuration
import com.timebase.data.model.getConfidenceText
import com.timebase.data.model.isValid
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class CreateTaskFragment : Fragment() {

    private var _binding: FragmentCreateTaskBinding? = null
    private val binding get() = _binding!!

    private val viewModel: TaskCreationViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCreateTaskBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupViews()
        observeViewModel()
    }

    private fun setupViews() {
        // Setup text watcher untuk nama tugas
        binding.editTextTaskName.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            
            override fun afterTextChanged(s: Editable?) {
                val taskName = s?.toString()?.trim() ?: ""
                viewModel.onTaskNameChanged(taskName)
            }
        })

        // Setup click listeners untuk saran AI
        binding.buttonAcceptSuggestion.setOnClickListener {
            viewModel.acceptSuggestion()
        }

        binding.buttonRejectSuggestion.setOnClickListener {
            viewModel.rejectSuggestion()
        }

        // Setup manual input
        binding.buttonSetManualTime.setOnClickListener {
            val minutes = binding.editTextManualTime.text.toString().toIntOrNull()
            if (minutes != null && minutes > 0) {
                viewModel.setManualEstimation(minutes)
            }
        }

        // Setup create task button
        binding.buttonCreateTask.setOnClickListener {
            createTask()
        }

        // Setup refresh suggestion button
        binding.buttonRefreshSuggestion.setOnClickListener {
            viewModel.refreshSuggestion()
        }
    }

    private fun observeViewModel() {
        // Observe loading state
        viewModel.isLoadingSuggestion.observe(viewLifecycleOwner) { isLoading ->
            showLoadingState(isLoading)
        }

        // Observe time suggestion
        viewModel.timeSuggestion.observe(viewLifecycleOwner) { suggestion ->
            showTimeSuggestion(suggestion)
        }

        // Observe error
        viewModel.error.observe(viewLifecycleOwner) { error ->
            showError(error)
        }

        // Observe manual input mode
        viewModel.isManualInput.observe(viewLifecycleOwner) { isManual ->
            showManualInput(isManual)
        }

        // Observe manual estimation
        viewModel.manualEstimation.observe(viewLifecycleOwner) { estimation ->
            updateEstimationDisplay(estimation)
        }

        // Observe suggestion responded
        viewModel.suggestionResponded.observe(viewLifecycleOwner) { responded ->
            binding.layoutSuggestionButtons.isVisible = !responded && 
                viewModel.timeSuggestion.value?.isValid() == true
        }
    }

    private fun showLoadingState(isLoading: Boolean) {
        binding.apply {
            progressBarSuggestion.isVisible = isLoading
            textViewLoadingMessage.isVisible = isLoading
            
            if (isLoading) {
                textViewLoadingMessage.text = "Mencari tugas serupa..."
                hideSuggestionViews()
            }
        }
    }

    private fun showTimeSuggestion(suggestion: com.timebase.data.model.TimeSuggestion?) {
        binding.apply {
            if (suggestion != null && suggestion.isValid()) {
                // Show suggestion card
                cardViewSuggestion.isVisible = true
                layoutSuggestionButtons.isVisible = !viewModel.suggestionResponded.value!!
                
                // Update suggestion content
                textViewSuggestedTime.text = suggestion.suggestedTime?.formatDuration() ?: "N/A"
                textViewConfidence.text = suggestion.getConfidenceText()
                textViewReason.text = suggestion.reason
                
                // Update similar tasks info
                val similarTasksCount = suggestion.similarTasks.size
                textViewSimilarTasks.text = "Berdasarkan $similarTasksCount tugas serupa"
                
                // Show statistics if available
                suggestion.statistics?.let { stats ->
                    textViewStatistics.isVisible = true
                    textViewStatistics.text = buildString {
                        append("Rata-rata: ${stats.average.toInt()} menit\n")
                        append("Range: ${stats.minimum}-${stats.maximum} menit\n")
                        append("Sampel: ${stats.sampleCount} tugas")
                    }
                }
                
            } else {
                hideSuggestionViews()
            }
        }
    }

    private fun showError(error: String?) {
        binding.apply {
            if (!error.isNullOrEmpty()) {
                textViewError.isVisible = true
                textViewError.text = error
                
                // Auto hide error after 5 seconds
                lifecycleScope.launch {
                    kotlinx.coroutines.delay(5000)
                    if (textViewError.text == error) {
                        textViewError.isVisible = false
                        viewModel.clearError()
                    }
                }
            } else {
                textViewError.isVisible = false
            }
        }
    }

    private fun showManualInput(isManual: Boolean) {
        binding.apply {
            layoutManualInput.isVisible = isManual
            
            if (isManual) {
                editTextManualTime.requestFocus()
                textViewManualInputTitle.text = "Atur waktu sendiri"
            }
        }
    }

    private fun updateEstimationDisplay(estimation: Int?) {
        binding.apply {
            if (estimation != null && estimation > 0) {
                textViewFinalEstimation.isVisible = true
                textViewFinalEstimation.text = "Estimasi: ${estimation.formatDuration()}"
                buttonCreateTask.isEnabled = viewModel.isReadyToSubmit()
            } else {
                textViewFinalEstimation.isVisible = false
                buttonCreateTask.isEnabled = false
            }
        }
    }

    private fun hideSuggestionViews() {
        binding.apply {
            cardViewSuggestion.isVisible = false
            layoutSuggestionButtons.isVisible = false
            textViewStatistics.isVisible = false
        }
    }

    private fun createTask() {
        val taskName = binding.editTextTaskName.text.toString().trim()
        val estimation = viewModel.getFinalEstimation()
        val description = binding.editTextDescription.text.toString().trim()
        
        if (taskName.isNotEmpty() && estimation != null && estimation > 0) {
            // Create task logic here
            // You can call TaskRepository to create the task
            
            // Show success message
            showSuccessMessage("Tugas berhasil dibuat!")
            
            // Clear form
            clearForm()
        }
    }

    private fun showSuccessMessage(message: String) {
        // Implement success message display
        // Could use Snackbar, Toast, or custom dialog
    }

    private fun clearForm() {
        binding.apply {
            editTextTaskName.text?.clear()
            editTextDescription.text?.clear()
            editTextManualTime.text?.clear()
        }
        
        // Reset ViewModel state
        viewModel.onTaskNameChanged("")
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
