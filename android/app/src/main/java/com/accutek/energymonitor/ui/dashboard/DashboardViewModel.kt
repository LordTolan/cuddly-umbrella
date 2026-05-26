package com.accutek.energymonitor.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.accutek.energymonitor.data.model.*
import com.accutek.energymonitor.data.repository.EnergyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DashboardUiState(
    val isLoading: Boolean = true,
    val sites: List<Site> = emptyList(),
    val selectedSiteId: String? = null,
    val summary: DashboardSummary? = null,
    val alerts: List<Alert> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val repository: EnergyRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState

    init {
        loadSites()
    }

    fun loadSites() {
        viewModelScope.launch {
            try {
                val sites = repository.getSites()
                val selectedId = sites.firstOrNull()?.id
                _uiState.value = _uiState.value.copy(
                    sites = sites,
                    selectedSiteId = selectedId,
                    isLoading = false
                )
                selectedId?.let { loadDashboard(it) }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message
                )
            }
        }
    }

    fun loadDashboard(siteId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val summary = repository.getLiveDashboard(siteId)
                val alerts = repository.getAlerts(siteId, unreadOnly = true)
                _uiState.value = _uiState.value.copy(
                    summary = summary,
                    alerts = alerts,
                    isLoading = false,
                    selectedSiteId = siteId
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message
                )
            }
        }
    }

    fun refresh() {
        _uiState.value.selectedSiteId?.let { loadDashboard(it) }
    }
}
