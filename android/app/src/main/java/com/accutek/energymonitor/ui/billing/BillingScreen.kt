package com.accutek.energymonitor.ui.billing

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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BillingScreen(onBack: () -> Unit) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Billing Validation") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                }
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { /* TODO: file picker for bill upload */ },
                icon = { Icon(Icons.Default.Upload, null) },
                text = { Text("Upload Bill") }
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
            // Upload prompt
            Card(
                Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f))
            ) {
                Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Receipt, null, Modifier.size(40.dp), tint = MaterialTheme.colorScheme.primary)
                    Spacer(Modifier.width(16.dp))
                    Column {
                        Text("Upload Duke Energy Bill", fontWeight = FontWeight.Bold)
                        Text("PDF or CSV format supported", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }

            // How it works
            Text("How Validation Works", style = MaterialTheme.typography.titleMedium)
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    ValidationStep("1", "Upload your Duke Energy bill (PDF/CSV)")
                    ValidationStep("2", "We extract billed kWh and cost")
                    ValidationStep("3", "Compare against measured consumption & solar")
                    ValidationStep("4", "Identify any discrepancies")
                }
            }

            // Bill History (empty state)
            Text("Bill History", style = MaterialTheme.typography.titleMedium)
            Card(Modifier.fillMaxWidth().height(120.dp)) {
                Box(Modifier.fillMaxSize(), Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.ReceiptLong, null, Modifier.size(36.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(Modifier.height(8.dp))
                        Text("No bills uploaded yet", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }

            // TOU Info
            Text("TOU Optimization", style = MaterialTheme.typography.titleMedium)
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp)) {
                    Text("Time-of-Use Tips", fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(8.dp))
                    TouTip(Icons.Default.WaterDrop, "Shift spa/pool heating to off-peak hours")
                    TouTip(Icons.Default.WbSunny, "Run heavy appliances during solar production hours")
                    TouTip(Icons.Default.ElectricCar, "Delay EV charging to off-peak or solar hours")
                }
            }

            Spacer(Modifier.height(80.dp)) // FAB clearance
        }
    }
}

@Composable
private fun ValidationStep(number: String, text: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Surface(
            shape = MaterialTheme.shapes.small,
            color = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f),
            modifier = Modifier.size(28.dp)
        ) {
            Box(Modifier.fillMaxSize(), Alignment.Center) {
                Text(number, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
            }
        }
        Spacer(Modifier.width(12.dp))
        Text(text, style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
private fun TouTip(icon: androidx.compose.ui.graphics.vector.ImageVector, text: String) {
    Row(Modifier.padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, Modifier.size(20.dp), tint = MaterialTheme.colorScheme.secondary)
        Spacer(Modifier.width(8.dp))
        Text(text, style = MaterialTheme.typography.bodySmall)
    }
}
