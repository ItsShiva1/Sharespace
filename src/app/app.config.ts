import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideAuth, getAuth } from '@angular/fire/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD4Se-odYCWderv8fPDvY2ylwMX_W3m00w",
  authDomain: "sharespace-ai.firebaseapp.com",
  projectId: "sharespace-ai",
  storageBucket: "sharespace-ai.firebasestorage.app",
  messagingSenderId: "225454938407",
  appId: "1:225454938407:web:8a97d36b9bda016d2c3102"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideAuth(() => getAuth())
  ]
};
