export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: "AIzaSyD4Se-odYCWderv8fPDvY2ylwMX_W3m00w", // Optional: Use process.env if using a custom shell script, but for client-side it's common to keep it here if not secret
    authDomain: "sharespace-ai.firebaseapp.com",
    projectId: "sharespace-ai",
    storageBucket: "sharespace-ai.firebasestorage.app",
    messagingSenderId: "225454938407",
    appId: "1:225454938407:web:8a97d36b9bda016d2c3102"
  },
  supabase: {
    url: 'https://xpkxsvfbufbqghxkxofs.supabase.co',
    anonKey: 'sb_publishable_spKO3M5DqfHLWlnqK8QLQw_RoEl8xv-'
  }
};
