/*
 * Copyright (c) 2025-present, salesforce.com, inc.
 * All rights reserved.
 */

package com.sk.sk

import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.firebase.messaging.FirebaseMessaging
import com.salesforce.androidsdk.app.SalesforceSDKManager
import com.salesforce.androidsdk.push.PushMessaging

/** Test-only hooks for checking that push notifications can reach and display on this device. */
class PushDiagnosticsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "PushDiagnostics"

    /** Posts a notification through the exact path a real Salesforce push takes. */
    @ReactMethod
    fun sendTestNotification(promise: Promise) {
        promise.resolve(
            showPushNotification(
                reactContext,
                SalesforcePush(
                    title = "Test notification",
                    body = "If you can see this, the device can display Salesforce pushes.",
                    notificationId = null,
                    fields = emptyMap(),
                ),
            ),
        )
    }

    @ReactMethod
    fun getStatus(promise: Promise) {
        val status = Arguments.createMap()
        status.putBoolean(
            "notificationsEnabled",
            NotificationManagerCompat.from(reactContext).areNotificationsEnabled(),
        )

        val account = SalesforceSDKManager.getInstance().userAccountManager?.currentUser
        // The device registration belongs to this user; notifications sent to anyone else won't arrive.
        status.putString("userId", account?.userId)
        // A null salesforceDeviceId means the org never created a MobilePushServiceDevice row.
        status.putString("salesforceDeviceId", account?.let { PushMessaging.getDeviceId(reactContext, it) })
        status.putString("storedFcmToken", account?.let { PushMessaging.getRegistrationId(reactContext, it) }.fingerprint())

        FirebaseMessaging.getInstance().token
            .addOnSuccessListener { token ->
                status.putString("liveFcmToken", token.fingerprint())
                promise.resolve(status)
            }
            .addOnFailureListener { e ->
                status.putString("liveFcmToken", "unavailable: ${e.message}")
                promise.resolve(status)
            }
    }

    /** The SDK only registers the device at login, so this re-runs it against the current org config. */
    @ReactMethod
    fun registerForPush(promise: Promise) {
        val account = SalesforceSDKManager.getInstance().userAccountManager?.currentUser
        if (account == null) {
            promise.reject("NOT_AUTHENTICATED", "No logged-in Salesforce user.")
            return
        }
        PushMessaging.register(reactContext, account)
        promise.resolve(null)
    }
}

/** Debug logs are shareable, so only ever expose enough of a token to prove it exists. */
private fun String?.fingerprint() = this?.let { "${it.take(8)}… (${it.length} chars)" }
