/*
 * Copyright (c) 2025-present, salesforce.com, inc.
 * All rights reserved.
 */

package com.sk.sk

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.salesforce.androidsdk.app.SalesforceSDKManager
import com.salesforce.androidsdk.rest.RestClient
import com.salesforce.androidsdk.rest.RestRequest
import com.salesforce.androidsdk.rest.RestResponse
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.net.URI
import java.net.URLEncoder

private const val FRONTDOOR_URI_KEY = "frontdoor_uri"
private const val SINGLE_ACCESS_PATH = "/services/oauth2/singleaccess"
private val FORM_URLENCODED = "application/x-www-form-urlencoded".toMediaType()

/**
 * Bridges the Mobile SDK's Identity API "Single Access" UI Bridge to JS, so a
 * WebView can be handed an authenticated, one-time-use frontdoor URL instead of
 * the app manually constructing frontdoor.jsp with a raw session id.
 * @see <a href="https://help.salesforce.com/s/articleView?id=sf.frontdoor_singleaccess.htm">Single Access UI Bridge</a>
 */
class SingleAccessModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "SingleAccessBridge"

    @ReactMethod
    fun getFrontDoorUrl(siteUrl: String, promise: Promise) {
        val restClient = SalesforceSDKManager.getInstance().clientManager?.peekRestClient()
        if (restClient == null) {
            promise.reject("NOT_AUTHENTICATED", "No authenticated Salesforce session available.")
            return
        }

        val target = try {
            URI(siteUrl)
        } catch (e: Exception) {
            promise.reject("INVALID_SITE_URL", "Not a valid site URL: $siteUrl", e)
            return
        }
        if (target.scheme == null || target.authority == null) {
            promise.reject("INVALID_SITE_URL", "Site URL must be absolute: $siteUrl")
            return
        }

        // singleaccess rejects an absolute redirect_uri with "Invalid_Param", and the frontdoor URL
        // it returns only establishes a session on the host that issued it. So the request is posted
        // to the site's own origin, with the site path passed as a relative redirect.
        val origin = "${target.scheme}://${target.authority}"
        val redirectUri = buildString {
            append(target.rawPath?.takeIf { it.isNotEmpty() } ?: "/")
            target.rawQuery?.let { append("?").append(it) }
        }

        try {
            val request = RestRequest(
                RestRequest.RestMethod.POST,
                RestRequest.RestEndpoint.INSTANCE,
                origin + SINGLE_ACCESS_PATH,
                ("redirect_uri=" + URLEncoder.encode(redirectUri, RestRequest.UTF_8))
                    .toRequestBody(FORM_URLENCODED),
                null,
            )
            restClient.sendAsync(request, object : RestClient.AsyncRequestCallback {
                override fun onSuccess(request: RestRequest, response: RestResponse) {
                    try {
                        val body = response.asString()
                        if (!response.isSuccess) {
                            promise.reject(
                                "SINGLE_ACCESS_FAILED",
                                "singleaccess returned HTTP ${response.statusCode}: $body",
                            )
                            return
                        }
                        val frontDoorUri = JSONObject(body).optString(FRONTDOOR_URI_KEY)
                        if (frontDoorUri.isEmpty()) {
                            promise.reject(
                                "SINGLE_ACCESS_FAILED",
                                "singleaccess response has no $FRONTDOOR_URI_KEY: $body",
                            )
                        } else {
                            promise.resolve(frontDoorUri)
                        }
                    } catch (e: Exception) {
                        promise.reject("SINGLE_ACCESS_PARSE_ERROR", e)
                    }
                }

                override fun onError(exception: Exception) {
                    promise.reject("SINGLE_ACCESS_FAILED", exception)
                }
            })
        } catch (e: Exception) {
            promise.reject("SINGLE_ACCESS_FAILED", e)
        }
    }
}
