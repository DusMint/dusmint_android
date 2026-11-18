package com.dusmint.customer.sms

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.Bundle
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.auth.api.phone.SmsRetriever
import com.google.android.gms.common.api.CommonStatusCodes
import com.google.android.gms.common.api.Status
import java.util.regex.Pattern

class GoogleSmsConsentModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "GoogleSmsConsent"
        private const val SMS_CONSENT_REQUEST = 1523
    }

    private var isReceiverRegistered = false

    private val smsVerificationReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (SmsRetriever.SMS_RETRIEVED_ACTION == intent?.action) {
                val extras: Bundle? = intent.extras
                val smsRetrieverStatus = extras?.get(SmsRetriever.EXTRA_STATUS) as? Status

                when (smsRetrieverStatus?.statusCode) {
                    CommonStatusCodes.SUCCESS -> {
                        @Suppress("DEPRECATION")
                        val consentIntent: Intent? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            extras?.getParcelable(SmsRetriever.EXTRA_CONSENT_INTENT, Intent::class.java)
                        } else {
                            extras?.getParcelable(SmsRetriever.EXTRA_CONSENT_INTENT) as? Intent
                        }
                        try {
                            val activity = reactApplicationContext.currentActivity
                            if (activity != null && consentIntent != null) {
                                activity.startActivityForResult(consentIntent, SMS_CONSENT_REQUEST)
                            }
                        } catch (e: ActivityNotFoundException) {
                            sendEvent("onSmsError", WritableNativeMap().apply {
                                putString("error", "ActivityNotFoundException")
                            })
                        }
                    }
                    CommonStatusCodes.TIMEOUT -> {
                        sendEvent("onSmsTimeout", WritableNativeMap())
                    }
                }
            }
        }
    }

    private val activityEventListener: ActivityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(
            activity: Activity,
            requestCode: Int,
            resultCode: Int,
            data: Intent?
        ) {
            if (requestCode == SMS_CONSENT_REQUEST) {
                if (resultCode == Activity.RESULT_OK && data != null) {
                    val message = data.getStringExtra(SmsRetriever.EXTRA_SMS_MESSAGE)
                    if (message != null) {
                        val otp = parseOtp(message)
                        val params = WritableNativeMap().apply {
                            putString("message", message)
                            putString("otp", otp)
                        }
                        sendEvent("onSmsReceived", params)
                    }
                } else if (resultCode == Activity.RESULT_CANCELED) {
                    sendEvent("onSmsDenied", WritableNativeMap())
                }
            }
        }
    }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun startSmsConsent(promise: Promise) {
        try {
            registerReceiver()
            val client = SmsRetriever.getClient(reactApplicationContext)
            client.startSmsUserConsent(null)
                .addOnSuccessListener {
                    promise.resolve(true)
                }
                .addOnFailureListener { e ->
                    promise.reject("SMS_CONSENT_FAILED", e.message, e)
                }
        } catch (e: Exception) {
            promise.reject("SMS_CONSENT_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun stopSmsConsent(promise: Promise) {
        try {
            unregisterReceiver()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SMS_STOP_FAILED", e.message, e)
        }
    }

    private fun registerReceiver() {
        if (!isReceiverRegistered) {
            val intentFilter = IntentFilter(SmsRetriever.SMS_RETRIEVED_ACTION)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                reactApplicationContext.registerReceiver(
                    smsVerificationReceiver,
                    intentFilter,
                    SmsRetriever.SEND_PERMISSION,
                    null,
                    Context.RECEIVER_EXPORTED
                )
            } else {
                reactApplicationContext.registerReceiver(
                    smsVerificationReceiver,
                    intentFilter,
                    SmsRetriever.SEND_PERMISSION,
                    null
                )
            }
            isReceiverRegistered = true
        }
    }

    private fun unregisterReceiver() {
        if (isReceiverRegistered) {
            try {
                reactApplicationContext.unregisterReceiver(smsVerificationReceiver)
            } catch (e: Exception) {}
            isReceiverRegistered = false
        }
    }

    private fun parseOtp(message: String): String {
        val pattern = Pattern.compile("\\b(\\d{6})\\b")
        val matcher = pattern.matcher(message)
        return if (matcher.find()) matcher.group(1) ?: "" else ""
    }

    private fun sendEvent(eventName: String, params: Any?) {
        try {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        } catch (e: Exception) {}
    }
}
