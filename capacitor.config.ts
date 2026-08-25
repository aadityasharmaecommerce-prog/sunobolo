import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sunobolo.english',
  appName: 'SunoBolo English',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // url removed for Play Store — app loads from local assets (dist/)
    // Only uncomment for local dev: url: 'http://192.168.x.x:5173'
    cleartext: false,
  },
  plugins: {
    App: {
      // Handle deep links
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#07051a',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#07051a',
    },
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
