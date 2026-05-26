package com.accutek.energymonitor.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.accutek.energymonitor.ui.auth.LoginScreen
import com.accutek.energymonitor.ui.auth.RegisterScreen
import com.accutek.energymonitor.ui.dashboard.DashboardScreen
import com.accutek.energymonitor.ui.setup.SetupWizardScreen
import com.accutek.energymonitor.ui.solar.SolarScreen
import com.accutek.energymonitor.ui.billing.BillingScreen
import com.accutek.energymonitor.ui.settings.SettingsScreen
import com.google.firebase.auth.FirebaseAuth

sealed class Screen(val route: String) {
    data object Login : Screen("login")
    data object Register : Screen("register")
    data object Setup : Screen("setup")
    data object Dashboard : Screen("dashboard")
    data object Solar : Screen("solar")
    data object Billing : Screen("billing")
    data object Settings : Screen("settings")
}

@Composable
fun EnergyNavHost() {
    val navController = rememberNavController()
    val startDestination = if (FirebaseAuth.getInstance().currentUser != null) {
        Screen.Dashboard.route
    } else {
        Screen.Login.route
    }

    NavHost(navController = navController, startDestination = startDestination) {
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = { navController.navigate(Screen.Dashboard.route) { popUpTo(0) } },
                onNavigateToRegister = { navController.navigate(Screen.Register.route) }
            )
        }

        composable(Screen.Register.route) {
            RegisterScreen(
                onRegisterSuccess = { navController.navigate(Screen.Setup.route) { popUpTo(0) } },
                onNavigateToLogin = { navController.popBackStack() }
            )
        }

        composable(Screen.Setup.route) {
            SetupWizardScreen(
                onSetupComplete = { navController.navigate(Screen.Dashboard.route) { popUpTo(0) } }
            )
        }

        composable(Screen.Dashboard.route) {
            DashboardScreen(
                onNavigateToSolar = { navController.navigate(Screen.Solar.route) },
                onNavigateToBilling = { navController.navigate(Screen.Billing.route) },
                onNavigateToSettings = { navController.navigate(Screen.Settings.route) }
            )
        }

        composable(Screen.Solar.route) {
            SolarScreen(onBack = { navController.popBackStack() })
        }

        composable(Screen.Billing.route) {
            BillingScreen(onBack = { navController.popBackStack() })
        }

        composable(Screen.Settings.route) {
            SettingsScreen(
                onBack = { navController.popBackStack() },
                onLogout = { navController.navigate(Screen.Login.route) { popUpTo(0) } }
            )
        }
    }
}
