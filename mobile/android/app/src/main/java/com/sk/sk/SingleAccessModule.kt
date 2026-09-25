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

private const val FRONTDOOR_URL_KEY = "frontdoor_url"

/**
 * Bridges the Mobile SDK's Identity API "Single Access" UI Bridge
 * (RestRequest.getRequestForSingleAccess) to JS, so a WebView can be handed
 * an authenticated, one-time-use frontdoor URL instead of the app manually
 * constructing frontdoor.jsp with a raw session id.
 * @see <a href="https://help.salesforce.com/s/articleView?id=sf.frontdoor_singleaccess.htm">Single Access UI Bridge</a>
 */
class SingleAccessModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "SingleAccessBridge"

    @ReactMethod
    fun getFrontDoorUrl(redirectUri: String, promise: Promise) {
        val restClient = SalesforceSDKManager.getInstance().clientManager?.peekRestClient()
        if (restClient == null) {
            promise.reject("NOT_AUTHENTICATED", "No authenticated Salesforce session available.")
            return
        }

        try {
            val request = RestRequest.getRequestForSingleAccess(redirectUri)
            restClient.sendAsync(request, object : RestClient.AsyncRequestCallback {
                override fun onSuccess(request: RestRequest, response: RestResponse) {
                    try {
                        promise.resolve(response.asJSONObject().getString(FRONTDOOR_URL_KEY))
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
