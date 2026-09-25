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
import java.util.concurrent.atomic.AtomicInteger

private const val TAG = "SKPush"
private const val CHANNEL_ID = "sk_salesforce_notifications"
private const val CHANNEL_NAME = "Salesforce Notifications"

private val nextNotificationId = AtomicInteger(1)

/**
 * The Mobile SDK hands the payload to PushNotificationInterface but never posts anything
 * itself, so without this nothing reaches the notification tray.
 *
 * @return true if the notification was posted.
 */
fun showPushNotification(context: Context, push: SalesforcePush): Boolean {
    if (push.body == null) {
        Log.w(TAG, "Push has no alert fields; showing it anyway. Fields: ${push.fields.keys}")
    }

    val manager = context.getSystemService(NotificationManager::class.java)
    manager.createNotificationChannel(
        NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_HIGH),
    )

    if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) {
        Log.w(TAG, "Notifications are disabled for this app; the push cannot be shown.")
        return false
    }

    val body = push.body ?: context.getString(R.string.push_fallback_body)
    val launchIntent = Intent(context, MainActivity::class.java)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)

    val notification = NotificationCompat.Builder(context, CHANNEL_ID)
        .setSmallIcon(R.drawable.ic_notification)
        .setContentTitle(push.title ?: context.getString(R.string.app_name))
        .setContentText(body)
        .setStyle(NotificationCompat.BigTextStyle().bigText(body))
        .setPriority(NotificationCompat.PRIORITY_HIGH)
        .setAutoCancel(true)
        .setContentIntent(
            PendingIntent.getActivity(
                context,
                0,
                launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            ),
        )
        .build()

    manager.notify(push.notificationId?.hashCode() ?: nextNotificationId.getAndIncrement(), notification)
    return true
}
