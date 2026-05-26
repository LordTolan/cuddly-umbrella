package com.accutek.energymonitor.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

// ── Energy-themed dark palette ───────────────────────────────────
private val SolarGreen = Color(0xFF4CAF50)
private val SolarGreenDark = Color(0xFF388E3C)
private val EnergyBlue = Color(0xFF29B6F6)
private val SunYellow = Color(0xFFFFCA28)
private val DarkBackground = Color(0xFF121212)
private val DarkSurface = Color(0xFF1E1E1E)
private val DarkSurfaceVariant = Color(0xFF2D2D2D)

private val DarkColorScheme = darkColorScheme(
    primary = SolarGreen,
    onPrimary = Color.White,
    primaryContainer = SolarGreenDark,
    secondary = EnergyBlue,
    onSecondary = Color.White,
    tertiary = SunYellow,
    background = DarkBackground,
    surface = DarkSurface,
    surfaceVariant = DarkSurfaceVariant,
    onBackground = Color.White,
    onSurface = Color.White,
    onSurfaceVariant = Color(0xFFB0B0B0),
    error = Color(0xFFEF5350),
)

private val LightColorScheme = lightColorScheme(
    primary = SolarGreen,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFC8E6C9),
    secondary = EnergyBlue,
    tertiary = SunYellow,
)

@Composable
fun EnergyMonitorTheme(
    darkTheme: Boolean = true, // Default dark per spec
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context)
            else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
