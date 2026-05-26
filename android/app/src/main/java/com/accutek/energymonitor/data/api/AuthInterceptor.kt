package com.accutek.energymonitor.data.api

import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.tasks.await
import okhttp3.Interceptor
import okhttp3.Response

/**
 * OkHttp interceptor that attaches the Firebase ID token
 * to every outbound request as a Bearer token.
 */
class AuthInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val user = FirebaseAuth.getInstance().currentUser

        if (user == null) {
            return chain.proceed(original)
        }

        val token = runBlocking {
            try {
                user.getIdToken(false).await().token
            } catch (e: Exception) {
                null
            }
        }

        val request = if (token != null) {
            original.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            original
        }

        return chain.proceed(request)
    }
}
