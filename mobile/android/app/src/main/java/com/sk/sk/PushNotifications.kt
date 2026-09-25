/*
 * Copyright (c) 2025-present, salesforce.com, inc.
 * All rights reserved.
 */

package com.sk.sk

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import org.json.JSONObject
import java.util.concurrent.atomic.AtomicInteger

private const val TAG = "SKPush"
private const val CHANNEL_ID = "sk_salesforce_notifications"
private const val CHANNEL_NAME = "Salesforce Notifications"

private val nextNotificationId = AtomicInteger(1)

/**
 * The Mobile SDK hands the FCM payload to PushNotificationInterface but never posts
 * anything itself, so without this nothing ever reaches the notification tray.
 *
 * @return true if the notification was posted.
 */
fun showPushNotification(context: Context, data: Map<String?, String?>): Boolean {
    Log.i(TAG, "Push received with keys ${data.keys}")

    // Salesforce nests the notification under "content" as JSON once PushNotificationDecryptor runs.
    val content = data["content"]?.let { runCatching { JSONObject(it) }.getOrNull() }
    val title = content?.pick("title") ?: data["title"] ?: context.getString(R.string.app_name)
    val body = content?.pick("body") ?: content?.pick("alert")
        ?: data["alert"] ?: data["body"] ?: data["message"]
        // Showing an unrecognised payload verbatim beats dropping it with no trace.
        ?: data.toString()

    val manager = context.getSystemService(NotificationManager::class.java)
    manager.createNotificationChannel(
        NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_HIGH),
    )

    val launchIntent = Intent(context, MainActivity::class.java)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    val contentIntent = PendingIntent.getActivity(
        context,
        0,
        launchIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    val notification = NotificationCompat.Builder(context, CHANNEL_ID)
        .setSmallIcon(R.drawable.ic_notification)
        .setContentTitle(title)
        .setContentText(body)
        .setStyle(NotificationCompat.BigTextStyle().bigText(body))
        .setPriority(NotificationCompat.PRIORITY_HIGH)
        .setAutoCancel(true)
        .setContentIntent(contentIntent)
        .build()

    if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) {
        Log.w(TAG, "Notifications are disabled for this app; the push was received but cannot be shown.")
        return false
    }

    manager.notify(data["sfdc.nid"]?.hashCode() ?: nextNotificationId.getAndIncrement(), notification)
    return true
}

private fun JSONObject.pick(key: String) = optString(key).takeIf { it.isNotEmpty() }
