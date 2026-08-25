# SunoBolo English - ProGuard Rules
# ====================================

# Keep Capacitor classes
-keep class com.getcapacitor.** { *; }
-keep class com.capacitor.** { *; }

# Keep WebView JavaScript Interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep React Native / V8 (if used)
-keep class com.facebook.** { *; }

# Keep Razorpay SDK
-keep class com.razorpay.** { *; }
-keep class com.razorpay.** { *; }

# Keep Firebase (for Push Notifications)
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Keep SQLite (for local storage)
-keep class org.sqlite.** { *; }

# General Android rules
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception

# Remove logging in release
-assumenosideeffects class android.util.Log {
    public static int v(...);
    public static int d(...);
    public static int i(...);
}

# Keep custom Application class (if any)
-keep class com.sunobolo.english.** { *; }
