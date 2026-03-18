const { withAndroidManifest, withDangerousMod, withMainApplication } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

// ─── Kotlin: BroadcastReceiver que captura los SMS entrantes ─────────────────
const SMS_RECEIVER_KT = `package com.smsforwarder.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.telephony.SmsMessage

class SmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return
        val bundle = intent.extras ?: return
        val pdus = bundle.get("pdus") as? Array<*> ?: return
        val format = bundle.getString("format")
        val messages = pdus.filterIsInstance<ByteArray>().map {
            SmsMessage.createFromPdu(it, format)
        }
        if (messages.isEmpty()) return
        val remitente = messages[0].originatingAddress ?: ""
        val cuerpo = messages.joinToString("") { it.messageBody }
        SmsListenerModule.instance?.emitSmsReceived(remitente, cuerpo)
    }
}
`;

// ─── Kotlin: Módulo nativo React Native "SmsListener" ────────────────────────
const SMS_LISTENER_MODULE_KT = `package com.smsforwarder.app

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class SmsListenerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        var instance: SmsListenerModule? = null
    }

    init {
        instance = this
    }

    override fun getName(): String = "SmsListener"

    @ReactMethod
    fun startListening() {
        // El BroadcastReceiver ya está registrado en el manifest; no se necesita nada aquí.
    }

    @ReactMethod
    fun stopListening() {
        // La escucha es pasiva vía manifest; el JS deja de procesar eventos.
    }

    fun emitSmsReceived(remitente: String, cuerpo: String) {
        if (!reactContext.hasActiveReactInstance()) return
        val params = Arguments.createMap().apply {
            putString("remitente", remitente)
            putString("cuerpo", cuerpo)
        }
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("sms_received", params)
    }

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}
}
`;

// ─── Kotlin: ReactPackage que registra el módulo ─────────────────────────────
const SMS_LISTENER_PACKAGE_KT = `package com.smsforwarder.app

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class SmsListenerPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
        listOf(SmsListenerModule(reactContext))

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
        emptyList()
}
`;

// ─── Plugin principal ─────────────────────────────────────────────────────────
const withSmsListener = (config) => {
    // 1. Agregar el BroadcastReceiver al AndroidManifest.xml
    config = withAndroidManifest(config, (modConfig) => {
        const application = modConfig.modResults.manifest.application[0];
        if (!application.receiver) application.receiver = [];

        const exists = application.receiver.some(
            (r) => r.$['android:name'] === '.SmsReceiver'
        );

        if (!exists) {
            application.receiver.push({
                $: {
                    'android:name': '.SmsReceiver',
                    'android:enabled': 'true',
                    'android:exported': 'true',
                },
                'intent-filter': [
                    {
                        $: { 'android:priority': '999' },
                        action: [
                            {
                                $: {
                                    'android:name':
                                        'android.provider.Telephony.SMS_RECEIVED',
                                },
                            },
                        ],
                    },
                ],
            });
        }

        return modConfig;
    });

    // 2. Escribir archivos Kotlin y registrar el paquete en MainApplication.kt
    config = withDangerousMod(config, [
        'android',
        (modConfig) => {
            const pkgDir = path.join(
                modConfig.modRequest.platformProjectRoot,
                'app/src/main/java/com/smsforwarder/app'
            );
            fs.mkdirSync(pkgDir, { recursive: true });

            fs.writeFileSync(path.join(pkgDir, 'SmsReceiver.kt'), SMS_RECEIVER_KT);
            fs.writeFileSync(path.join(pkgDir, 'SmsListenerModule.kt'), SMS_LISTENER_MODULE_KT);
            fs.writeFileSync(path.join(pkgDir, 'SmsListenerPackage.kt'), SMS_LISTENER_PACKAGE_KT);

            // 3. Registrar SmsListenerPackage en MainApplication.kt de forma segura
    config = withMainApplication(config, (modConfig) => {
        let content = modConfig.modResults.contents;
        if (!content.includes('SmsListenerPackage')) {
            // Patrón RN 0.71+ con PackageList
            content = content.replace(
                'PackageList(this).packages.apply {',
                'PackageList(this).packages.apply {\n      add(SmsListenerPackage())'
            );
            // Patrón alternativo
            if (!content.includes('SmsListenerPackage')) {
                content = content.replace(
                    '// add(MyReactNativePackage())',
                    'add(SmsListenerPackage())\n          // add(MyReactNativePackage())'
                );
            }
            modConfig.modResults.contents = content;
        }
        return modConfig;
    });

    return config;
};

module.exports = withSmsListener;
