package com.accutek.energymonitor.ui.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.accutek.energymonitor.ui.components.KpiCard
import com.accutek.energymonitor.ui.components.StatusBadge

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigateToSolar: () -> Unit,
    onNavigateToBilling: () -> Unit,
    onNavigateToSettings: () -> Unit,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Energy Monitor") },
                actions = {
                    IconButton(onClick = { viewModel.refresh() }) {
                        Icon(Icons.Default.Refresh, "Refresh")
                    }
                    IconButton(onClick = onNavigateToSettings) {
                        Icon(Icons.Default.Settings, "Settings")
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = true,
                    onClick = {},
                    icon = { Icon(Icons.Default.Dashboard, null) },
                    label = { Text("Home") }
                )
                NavigationBarItem(
                    selected = false,
                    onClick = onNavigateToSolar,
                    icon = { Icon(Icons.Default.WbSunny, null) },
                    label = { Text("Solar") }
                )
                NavigationBarItem(
                    selected = false,
                    onClick = onNavigateToBilling,
                    icon = { Icon(Icons.Default.Receipt, null) },
                    label = { Text("Billing") }
                )
            }
        }
    ) { padding ->
        if (state.isLoading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (state.error != null) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.ErrorOutline, null, Modifier.size(48.dp), tint = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.height(8.dp))
                    Text(state.error ?: "Unknown error")
                    Spacer(Modifier.height(16.dp))
                    Button(onClick = { viewModel.refresh() }) { Text("Retry") }
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                val summary = state.summary

                // ── Live Status ──────────────────────────────────────
                Text("Live Status", style = MaterialTheme.typography.titleMedium)

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    KpiCard(
                        modifier = Modifier.weight(1f),
                        title = "Solar",
                        value = String.format("%.1f kW", summary?.live?.solarKw ?: 0.0),
                        icon = Icons.Default.WbSunny,
                        color = Color(0xFFFFCA28)
                    )
                    KpiCard(
                        modifier = Modifier.weight(1f),
                        title = "Usage",
                        value = String.format("%.0f W", summary?.live?.consumptionWatts ?: 0.0),
                        icon = Icons.Default.ElectricMeter,
                        color = Color(0xFF29B6F6)
                    )
                }

                // Net Grid
                val netGrid = summary?.live?.netGridWatts ?: 0.0
                val exporting = summary?.live?.exporting ?: false

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = if (exporting) Color(0xFF1B5E20).copy(alpha = 0.3f)
                        else MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp).fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Net Grid", style = MaterialTheme.typography.bodyMedium)
                            Text(
                                if (exporting) "Exporting to grid" else "Importing from grid",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Text(
                            String.format("%.0f W", kotlin.math.abs(netGrid)),
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = if (exporting) Color(0xFF4CAF50) else MaterialTheme.colorScheme.error
                        )
                    }
                }

                // ── Today's Summary ──────────────────────────────────
                Text("Today", style = MaterialTheme.typography.titleMedium)

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    KpiCard(
                        modifier = Modifier.weight(1f),
                        title = "Generated",
                        value = String.format("%.1f kWh", summary?.today?.solarKwh ?: 0.0),
                        icon = Icons.Default.WbSunny,
                        color = Color(0xFFFFCA28)
                    )
                    KpiCard(
                        modifier = Modifier.weight(1f),
                        title = "Consumed",
                        value = String.format("%.1f kWh", summary?.today?.consumptionKwh ?: 0.0),
                        icon = Icons.Default.Bolt,
                        color = Color(0xFF29B6F6)
                    )
                }

                // ── Monthly Summary ──────────────────────────────────
                Text("This Month", style = MaterialTheme.typography.titleMedium)

                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Solar Offset")
                            StatusBadge(
                                text = "${summary?.month?.solarOffsetPercent ?: 0}%",
                                color = Color(0xFF4CAF50)
                            )
                        }
                        Spacer(Modifier.height(8.dp))
                        LinearProgressIndicator(
                            progress = { ((summary?.month?.solarOffsetPercent ?: 0.0) / 100.0).toFloat().coerceIn(0f, 1f) },
                            modifier = Modifier.fillMaxWidth().height(8.dp),
                            color = Color(0xFF4CAF50)
                        )
                        Spacer(Modifier.height(12.dp))

                        Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween) {
                            Text("Generated", style = MaterialTheme.typography.bodySmall)
                            Text(String.format("%.0f kWh", summary?.month?.solarKwh ?: 0.0), style = MaterialTheme.typography.bodySmall)
                        }
                        Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween) {
                            Text("Consumed", style = MaterialTheme.typography.bodySmall)
                            Text(String.format("%.0f kWh", summary?.month?.consumptionKwh ?: 0.0), style = MaterialTheme.typography.bodySmall)
                        }
                        Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween) {
                            Text("Net Utility", style = MaterialTheme.typography.bodySmall)
                            Text(String.format("%.0f kWh", summary?.month?.netUtilityKwh ?: 0.0), style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }

                // ── Alerts ───────────────────────────────────────────
                if (state.alerts.isNotEmpty()) {
                    Text("Alerts", style = MaterialTheme.typography.titleMedium)
                    state.alerts.take(3).forEach { alert ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(
                                containerColor = when (alert.severity) {
                                    "CRITICAL" -> MaterialTheme.colorScheme.error.copy(alpha = 0.1f)
                                    "WARNING" -> Color(0xFFFFF3E0)
                                    else -> MaterialTheme.colorScheme.surfaceVariant
                                }
                            )
                        ) {
                            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    when (alert.severity) {
                                        "CRITICAL" -> Icons.Default.Error
                                        "WARNING" -> Icons.Default.Warning
                                        else -> Icons.Default.Info
                                    },
                                    null,
                                    tint = when (alert.severity) {
                                        "CRITICAL" -> MaterialTheme.colorScheme.error
                                        "WARNING" -> Color(0xFFFF9800)
                                        else -> MaterialTheme.colorScheme.primary
                                    }
                                )
                                Spacer(Modifier.width(12.dp))
                                Column {
                                    Text(alert.title, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
                                    Text(alert.message, style = MaterialTheme.typography.bodySmall)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
