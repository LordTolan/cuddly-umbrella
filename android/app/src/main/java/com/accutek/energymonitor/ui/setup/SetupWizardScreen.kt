package com.accutek.energymonitor.ui.setup

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.accutek.energymonitor.ui.dashboard.DashboardViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SetupWizardScreen(
    onSetupComplete: () -> Unit,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    var currentStep by remember { mutableIntStateOf(0) }

    // Site info
    var siteName by remember { mutableStateOf("") }
    var siteAddress by remember { mutableStateOf("") }

    // Emporia credentials
    var emporiaEmail by remember { mutableStateOf("") }
    var emporiaPassword by remember { mutableStateOf("") }

    // SMA credentials
    var smaUsername by remember { mutableStateOf("") }
    var smaPassword by remember { mutableStateOf("") }

    val steps = listOf("Create Site", "Connect Emporia", "Connect SMA", "Complete")

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Setup — Step ${currentStep + 1} of ${steps.size}") }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Progress
            LinearProgressIndicator(
                progress = { (currentStep + 1f) / steps.size },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(steps[currentStep], style = MaterialTheme.typography.titleMedium)

            Spacer(modifier = Modifier.height(32.dp))

            when (currentStep) {
                0 -> {
                    // Create Site
                    Icon(Icons.Default.Home, null, Modifier.size(48.dp), tint = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Set up your property", style = MaterialTheme.typography.titleLarge)
                    Spacer(modifier = Modifier.height(24.dp))

                    OutlinedTextField(
                        value = siteName,
                        onValueChange = { siteName = it },
                        label = { Text("Site Name (e.g., Home)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = siteAddress,
                        onValueChange = { siteAddress = it },
                        label = { Text("Address (optional)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                1 -> {
                    // Connect Emporia
                    Icon(Icons.Default.ElectricMeter, null, Modifier.size(48.dp), tint = MaterialTheme.colorScheme.secondary)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Connect Emporia Vue", style = MaterialTheme.typography.titleLarge)
                    Text("Monitor home consumption", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(modifier = Modifier.height(24.dp))

                    OutlinedTextField(
                        value = emporiaEmail,
                        onValueChange = { emporiaEmail = it },
                        label = { Text("Emporia Email") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = emporiaPassword,
                        onValueChange = { emporiaPassword = it },
                        label = { Text("Emporia Password") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(8.dp))
                    TextButton(onClick = { currentStep++ }) {
                        Text("Skip for now")
                    }
                }

                2 -> {
                    // Connect SMA
                    Icon(Icons.Default.WbSunny, null, Modifier.size(48.dp), tint = MaterialTheme.colorScheme.tertiary)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Connect SMA Inverter", style = MaterialTheme.typography.titleLarge)
                    Text("Monitor solar production", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(modifier = Modifier.height(24.dp))

                    OutlinedTextField(
                        value = smaUsername,
                        onValueChange = { smaUsername = it },
                        label = { Text("Sunny Portal Username") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = smaPassword,
                        onValueChange = { smaPassword = it },
                        label = { Text("Sunny Portal Password") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(8.dp))
                    TextButton(onClick = { currentStep++ }) {
                        Text("Skip for now")
                    }
                }

                3 -> {
                    // Complete
                    Icon(Icons.Default.CheckCircle, null, Modifier.size(72.dp), tint = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("You're all set!", style = MaterialTheme.typography.headlineMedium)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Your energy dashboard is ready. You can connect additional devices later in Settings.",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // Navigation buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                if (currentStep > 0) {
                    OutlinedButton(onClick = { currentStep-- }) { Text("Back") }
                } else {
                    Spacer(Modifier)
                }

                Button(
                    onClick = {
                        if (currentStep < steps.size - 1) {
                            currentStep++
                        } else {
                            onSetupComplete()
                        }
                    },
                    enabled = when (currentStep) {
                        0 -> siteName.isNotBlank()
                        else -> true
                    }
                ) {
                    Text(if (currentStep == steps.size - 1) "Go to Dashboard" else "Next")
                }
            }
        }
    }
}
