package com.accutek.energymonitor.ui.solar

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.accutek.energymonitor.ui.components.KpiCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SolarScreen(onBack: () -> Unit) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Solar Analytics") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Live Production
            Text("Current Production", style = MaterialTheme.typography.titleMedium)
            Row(Modifier.fillMaxWidth(), Arrangement.spacedBy(12.dp)) {
                KpiCard(
                    modifier = Modifier.weight(1f),
                    title = "Now",
                    value = "0.0 kW",
                    icon = Icons.Default.WbSunny,
                    color = Color(0xFFFFCA28)
                )
                KpiCard(
                    modifier = Modifier.weight(1f),
                    title = "Today",
                    value = "0.0 kWh",
                    icon = Icons.Default.Today,
                    color = Color(0xFF4CAF50)
                )
            }

            // Inverter Status
            Card(Modifier.fillMaxWidth()) {
                Row(Modifier.padding(16.dp).fillMaxWidth(), Arrangement.SpaceBetween, Alignment.CenterVertically) {
                    Column {
                        Text("Inverter Status", style = MaterialTheme.typography.bodyMedium)
                        Text("SMA Sunny Boy", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Surface(shape = MaterialTheme.shapes.small, color = Color(0xFF4CAF50).copy(alpha = 0.15f)) {
                        Text("Online", Modifier.padding(horizontal = 12.dp, vertical = 6.dp), color = Color(0xFF4CAF50), fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Monthly Summary
            Text("This Month", style = MaterialTheme.typography.titleMedium)
            Row(Modifier.fillMaxWidth(), Arrangement.spacedBy(12.dp)) {
                KpiCard(Modifier.weight(1f), "Generated", "0 kWh", Icons.Default.WbSunny, Color(0xFFFFCA28))
                KpiCard(Modifier.weight(1f), "Offset", "0%", Icons.Default.TrendingUp, Color(0xFF4CAF50))
            }

            // Self-Consumption
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp)) {
                    Text("Self-Consumption", style = MaterialTheme.typography.titleSmall)
                    Spacer(Modifier.height(8.dp))
                    Text("Solar energy used directly by your home vs exported to the grid.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(12.dp))
                    LinearProgressIndicator(progress = { 0f }, modifier = Modifier.fillMaxWidth().height(8.dp), color = Color(0xFF4CAF50))
                    Spacer(Modifier.height(4.dp))
                    Text("0% self-consumed", style = MaterialTheme.typography.bodySmall)
                }
            }

            // Placeholder for chart
            Card(Modifier.fillMaxWidth().height(200.dp)) {
                Box(Modifier.fillMaxSize(), Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.BarChart, null, Modifier.size(48.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(Modifier.height(8.dp))
                        Text("Production chart", color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text("Connect SMA to see data", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}
