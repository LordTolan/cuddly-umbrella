package com.accutek.energymonitor.ui.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.google.firebase.auth.FirebaseAuth

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onBack: () -> Unit,
    onLogout: () -> Unit
) {
    val user = FirebaseAuth.getInstance().currentUser

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
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
        ) {
            // Account section
            Text("Account", Modifier.padding(horizontal = 16.dp, vertical = 12.dp), style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)

            SettingsItem(Icons.Default.Person, "Profile", user?.displayName ?: "Not set")
            SettingsItem(Icons.Default.Email, "Email", user?.email ?: "")

            HorizontalDivider(Modifier.padding(vertical = 8.dp))

            // Devices
            Text("Devices", Modifier.padding(horizontal = 16.dp, vertical = 12.dp), style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)

            SettingsItem(Icons.Default.ElectricMeter, "Emporia Vue", "Manage connection")
            SettingsItem(Icons.Default.WbSunny, "SMA Inverter", "Manage connection")

            HorizontalDivider(Modifier.padding(vertical = 8.dp))

            // Preferences
            Text("Preferences", Modifier.padding(horizontal = 16.dp, vertical = 12.dp), style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)

            SettingsItem(Icons.Default.Notifications, "Notifications", "Configure alerts")
            SettingsItem(Icons.Default.AttachMoney, "TOU Rates", "Set your utility rate schedule")

            HorizontalDivider(Modifier.padding(vertical = 8.dp))

            // About
            Text("About", Modifier.padding(horizontal = 16.dp, vertical = 12.dp), style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)

            SettingsItem(Icons.Default.Info, "Version", "1.0.0")
            SettingsItem(Icons.Default.Description, "Privacy Policy", "")
            SettingsItem(Icons.Default.Gavel, "Terms of Service", "")

            HorizontalDivider(Modifier.padding(vertical = 8.dp))

            // Logout
            ListItem(
                headlineContent = { Text("Sign Out", color = MaterialTheme.colorScheme.error) },
                leadingContent = { Icon(Icons.AutoMirrored.Filled.Logout, null, tint = MaterialTheme.colorScheme.error) },
                modifier = Modifier.clickable {
                    FirebaseAuth.getInstance().signOut()
                    onLogout()
                }
            )

            Spacer(Modifier.height(32.dp))
        }
    }
}

@Composable
private fun SettingsItem(icon: ImageVector, title: String, subtitle: String) {
    ListItem(
        headlineContent = { Text(title) },
        supportingContent = if (subtitle.isNotBlank()) {{ Text(subtitle) }} else null,
        leadingContent = { Icon(icon, null) },
        modifier = Modifier.clickable { /* TODO */ }
    )
}
