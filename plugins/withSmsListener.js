const { withAndroidManifest, withDangerousMod, withMainApplication } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

// ─── SmsReceiver.kt ───────────────────────────────────────────────────────────
// Recibe SMS del sistema y los delega al ForegroundService (persistente)
// ademas de notificar al hilo JS si la app esta en primer plano.
const SMS_RECEIVER_KT = `package com.smsforwarder.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
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

        // Notificar al hilo JS para actualizar la UI si la app esta en primer plano
        SmsListenerModule.instance?.emitSmsReceived(remitente, cuerpo)

        // Siempre delegar al servicio persistente si esta activo
        val prefs = context.getSharedPreferences("sms_forwarder", Context.MODE_PRIVATE)
        if (prefs.getBoolean("is_listening", false)) {
            val smsIntent = Intent(context, SmsForwarderService::class.java).apply {
                action = SmsForwarderService.ACTION_SMS
                putExtra("remitente", remitente)
                putExtra("cuerpo", cuerpo)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(smsIntent)
            } else {
                context.startService(smsIntent)
            }
        }
    }
}
`;

// ─── SmsForwarderService.kt ───────────────────────────────────────────────────
// ForegroundService que procesa y reenvía SMS a Telegram de forma autónoma,
// sin depender del hilo JS de React Native. Persiste aunque la app esté cerrada.
const SMS_FORWARDER_SERVICE_KT = `package com.smsforwarder.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import org.json.JSONArray
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

class SmsForwarderService : Service() {

    companion object {
        const val ACTION_START = "com.smsforwarder.START"
        const val ACTION_STOP  = "com.smsforwarder.STOP"
        const val ACTION_SMS   = "com.smsforwarder.SMS"
        const val CHANNEL_ID   = "sms_forwarder_channel"
        const val NOTIFICATION_ID = 101
    }

    override fun onCreate() {
        super.onCreate()
        crearCanalNotificacion()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                startForeground(NOTIFICATION_ID, construirNotificacion())
                getSharedPreferences("sms_forwarder", Context.MODE_PRIVATE)
                    .edit().putBoolean("is_listening", true).apply()
            }
            ACTION_STOP -> {
                getSharedPreferences("sms_forwarder", Context.MODE_PRIVATE)
                    .edit().putBoolean("is_listening", false).apply()
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    stopForeground(STOP_FOREGROUND_REMOVE)
                } else {
                    @Suppress("DEPRECATION")
                    stopForeground(true)
                }
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_SMS -> {
                val remitente = intent.getStringExtra("remitente") ?: return START_STICKY
                val cuerpo    = intent.getStringExtra("cuerpo")    ?: return START_STICKY
                procesarSms(remitente, cuerpo)
            }
        }
        return START_STICKY
    }

    private fun procesarSms(remitente: String, cuerpo: String) {
        val prefs         = getSharedPreferences("sms_forwarder", Context.MODE_PRIVATE)
        val tokenDefault  = prefs.getString("telegram_token", null)   ?: return
        val chatIdDefault = prefs.getString("telegram_chat_id", null) ?: return
        val reglasJson    = prefs.getString("rules", "[]")            ?: "[]"
        val configsJson   = prefs.getString("todas_configs", "[]")    ?: "[]"

        Thread {
            try {
                val reglas  = JSONArray(reglasJson)
                val configs = JSONArray(configsJson)

                // Sin reglas: reenviar todo con la config por defecto
                if (reglas.length() == 0) {
                    enviarTelegram(tokenDefault, chatIdDefault, remitente, cuerpo)
                    return@Thread
                }

                for (i in 0 until reglas.length()) {
                    val regla = reglas.getJSONObject(i)
                    if (!regla.optBoolean("activa", true)) continue

                    val campo          = regla.optString("campoObjetivo", "cuerpo")
                    val textoEvaluar   = if (campo == "remitente") remitente else cuerpo
                    val patron         = regla.optString("patron", "")
                    val esRegex        = regla.optBoolean("esRegex", false)

                    // Verificar horario si esta configurado
                    val horarioInicio  = regla.optString("horarioInicio", "")
                    val horarioFin     = regla.optString("horarioFin", "")
                    if (horarioInicio.isNotEmpty() && horarioFin.isNotEmpty()) {
                        val ahora = java.util.Calendar.getInstance()
                        val hh    = ahora.get(java.util.Calendar.HOUR_OF_DAY)
                        val mm    = ahora.get(java.util.Calendar.MINUTE)
                        val minActual = hh * 60 + mm
                        val (hI, mI)  = horarioInicio.split(":").map { it.toIntOrNull() ?: 0 }
                        val (hF, mF)  = horarioFin.split(":").map { it.toIntOrNull() ?: 0 }
                        val minInicio = hI * 60 + mI
                        val minFin    = hF * 60 + mF
                        if (minActual < minInicio || minActual > minFin) continue
                    }

                    // Verificar dia de la semana
                    val diasActivos = regla.optJSONArray("diasActivos")
                    if (diasActivos != null && diasActivos.length() > 0) {
                        val diaSemana = java.util.Calendar.getInstance().get(java.util.Calendar.DAY_OF_WEEK) - 1
                        var diaOk = false
                        for (d in 0 until diasActivos.length()) {
                            if (diasActivos.getInt(d) == diaSemana) { diaOk = true; break }
                        }
                        if (!diaOk) continue
                    }

                    val coincide = if (esRegex) {
                        try { Regex(patron, RegexOption.IGNORE_CASE).containsMatchIn(textoEvaluar) }
                        catch (e: Exception) { false }
                    } else {
                        textoEvaluar.contains(patron, ignoreCase = true)
                    }

                    if (!coincide) continue

                    // Resolver config de Telegram para esta regla
                    val configId = regla.optString("configTelegramId", "")
                    var token    = tokenDefault
                    var chatId   = chatIdDefault

                    if (configId.isNotEmpty()) {
                        for (c in 0 until configs.length()) {
                            val cfg = configs.getJSONObject(c)
                            if (cfg.optString("id") == configId) {
                                token  = cfg.optString("botToken", tokenDefault)
                                chatId = cfg.optString("chatId", chatIdDefault)
                                break
                            }
                        }
                    }

                    enviarTelegram(token, chatId, remitente, cuerpo)
                    return@Thread // regla coincidio, no seguir evaluando
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }.start()
    }

    private fun enviarTelegram(token: String, chatId: String, remitente: String, cuerpo: String) {
        try {
            val texto = "📱 *SMS de:* " + remitente + "\\n\\n" + cuerpo
            val url   = URL("https://api.telegram.org/bot" + token + "/sendMessage")
            val conn  = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.doOutput = true
            conn.connectTimeout = 15000
            conn.readTimeout    = 15000
            conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
            val cuerpoHttp = "chat_id=" + URLEncoder.encode(chatId, "UTF-8") +
                "&text="    + URLEncoder.encode(texto, "UTF-8") +
                "&parse_mode=Markdown"
            conn.outputStream.use { it.write(cuerpoHttp.toByteArray(Charsets.UTF_8)) }
            conn.responseCode // dispara la peticion
            conn.disconnect()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun construirNotificacion(): Notification {
        val launchIntent   = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent  = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        val stopIntent = Intent(this, SmsForwarderService::class.java).apply {
            action = ACTION_STOP
        }
        val stopPending = PendingIntent.getService(
            this, 1, stopIntent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
        }

        return builder
            .setContentTitle("SMS Forwarder activo")
            .setContentText("Escuchando y reenviando SMS a Telegram")
            .setSmallIcon(android.R.drawable.ic_dialog_email)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .addAction(
                android.R.drawable.ic_delete,
                "Detener",
                stopPending
            )
            .build()
    }

    private fun crearCanalNotificacion() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val canal = NotificationChannel(
                CHANNEL_ID,
                "SMS Forwarder",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Servicio de reenvio de SMS a Telegram"
                setShowBadge(false)
            }
            getSystemService(NotificationManager::class.java)?.createNotificationChannel(canal)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
`;

// ─── SmsListenerModule.kt ─────────────────────────────────────────────────────
// Modulo nativo expuesto a React Native. Gestiona el ciclo de vida del servicio
// y persiste la configuracion en SharedPreferences para uso del service.
const SMS_LISTENER_MODULE_KT = `package com.smsforwarder.app

import android.content.Context
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
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
        val intent = Intent(reactContext, SmsForwarderService::class.java).apply {
            action = SmsForwarderService.ACTION_START
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(intent)
        } else {
            reactContext.startService(intent)
        }
    }

    @ReactMethod
    fun stopListening() {
        val intent = Intent(reactContext, SmsForwarderService::class.java).apply {
            action = SmsForwarderService.ACTION_STOP
        }
        reactContext.startService(intent)
    }

    @ReactMethod
    fun actualizarConfiguracion(token: String, chatId: String, rulesJson: String, todasConfigsJson: String) {
        val prefs = reactContext.getSharedPreferences("sms_forwarder", Context.MODE_PRIVATE)
        prefs.edit()
            .putString("telegram_token", token)
            .putString("telegram_chat_id", chatId)
            .putString("rules", rulesJson)
            .putString("todas_configs", todasConfigsJson)
            .apply()
    }

    @ReactMethod
    fun getEstaEscuchando(promise: Promise) {
        val prefs = reactContext.getSharedPreferences("sms_forwarder", Context.MODE_PRIVATE)
        promise.resolve(prefs.getBoolean("is_listening", false))
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

// ─── SmsListenerPackage.kt ───────────────────────────────────────────────────
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

// ─── Plugin ───────────────────────────────────────────────────────────────────
const withSmsListener = (config) => {

    // 1. Permisos + BroadcastReceiver + ForegroundService en AndroidManifest
    config = withAndroidManifest(config, (modConfig) => {
        const manifest     = modConfig.modResults.manifest;
        const application  = manifest.application[0];

        // Permisos
        if (!manifest['uses-permission']) manifest['uses-permission'] = [];
        const permisosRequeridos = [
            'android.permission.FOREGROUND_SERVICE',
            'android.permission.FOREGROUND_SERVICE_DATA_SYNC',
            'android.permission.INTERNET',
        ];
        for (const permiso of permisosRequeridos) {
            const yaExiste = manifest['uses-permission'].some(
                (p) => p.$['android:name'] === permiso
            );
            if (!yaExiste) {
                manifest['uses-permission'].push({ $: { 'android:name': permiso } });
            }
        }

        // BroadcastReceiver
        if (!application.receiver) application.receiver = [];
        const receiverExiste = application.receiver.some(
            (r) => r.$['android:name'] === '.SmsReceiver'
        );
        if (!receiverExiste) {
            application.receiver.push({
                $: {
                    'android:name': '.SmsReceiver',
                    'android:enabled': 'true',
                    'android:exported': 'true',
                },
                'intent-filter': [{
                    $: { 'android:priority': '999' },
                    action: [{ $: { 'android:name': 'android.provider.Telephony.SMS_RECEIVED' } }],
                }],
            });
        }

        // ForegroundService
        if (!application.service) application.service = [];
        const serviceExiste = application.service.some(
            (s) => s.$['android:name'] === '.SmsForwarderService'
        );
        if (!serviceExiste) {
            application.service.push({
                $: {
                    'android:name': '.SmsForwarderService',
                    'android:enabled': 'true',
                    'android:exported': 'false',
                    'android:foregroundServiceType': 'dataSync',
                },
            });
        }

        return modConfig;
    });

    // 2. Escribir archivos Kotlin al proyecto nativo
    config = withDangerousMod(config, [
        'android',
        (modConfig) => {
            const pkgDir = path.join(
                modConfig.modRequest.platformProjectRoot,
                'app/src/main/java/com/smsforwarder/app'
            );
            fs.mkdirSync(pkgDir, { recursive: true });
            fs.writeFileSync(path.join(pkgDir, 'SmsReceiver.kt'),          SMS_RECEIVER_KT);
            fs.writeFileSync(path.join(pkgDir, 'SmsForwarderService.kt'),   SMS_FORWARDER_SERVICE_KT);
            fs.writeFileSync(path.join(pkgDir, 'SmsListenerModule.kt'),     SMS_LISTENER_MODULE_KT);
            fs.writeFileSync(path.join(pkgDir, 'SmsListenerPackage.kt'),    SMS_LISTENER_PACKAGE_KT);
            return modConfig;
        },
    ]);

    // 3. Registrar SmsListenerPackage en MainApplication.kt
    config = withMainApplication(config, (modConfig) => {
        let content = modConfig.modResults.contents;
        if (content.includes('SmsListenerPackage')) return modConfig;

        const patronApply = 'PackageList(this).packages.apply {';
        if (content.includes(patronApply)) {
            content = content.replace(
                patronApply,
                patronApply + '\n      add(SmsListenerPackage())'
            );
        } else {
            content = content.replace(
                '// add(MyReactNativePackage())',
                'add(SmsListenerPackage())\n          // add(MyReactNativePackage())'
            );
        }
        modConfig.modResults.contents = content;
        return modConfig;
    });

    return config;
};

module.exports = withSmsListener;
