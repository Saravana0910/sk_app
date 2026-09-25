/*
 * Copyright (c) 2025-present, salesforce.com, inc.
 * All rights reserved.
 */

package com.sk.sk

import org.json.JSONObject

/**
 * A Salesforce notification, unwrapped from the `content` -> `sfdc` JSON envelope that
 * the Mobile SDK's PushNotificationDecryptor leaves in the raw FCM data map.
 */
data class SalesforcePush(
    val title: String?,
    val body: String?,
    val notificationId: String?,
    val fields: Map<String, String>,
) {
    companion object {
        fun from(data: Map<String?, String?>): SalesforcePush {
            val sfdc = data["content"]
                ?.let { runCatching { JSONObject(it).optJSONObject("sfdc") }.getOrNull() }
            val fields = sfdc?.keys()?.asSequence()?.associateWith { sfdc.optString(it) }.orEmpty()

            return SalesforcePush(
                title = fields["alertTitle"] ?: fields["alert"],
                body = fields["alertBody"] ?: fields["alert"],
                notificationId = fields["nid"],
                fields = fields,
            )
        }
    }
}
