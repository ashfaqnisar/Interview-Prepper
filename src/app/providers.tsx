"use client";
import { ReactNode } from "react";

import { FirebaseOptions } from "@firebase/app";
import { getFirestore } from "@firebase/firestore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { FirebaseAppProvider, FirestoreProvider, useFirebaseApp } from "reactfire";

//  Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID
};

const FirestoreCustomProvider = ({ children }: { children: ReactNode }) => {
  const firestoreInstance = getFirestore(useFirebaseApp());

  return <FirestoreProvider sdk={firestoreInstance}>{children}</FirestoreProvider>;
};

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <FirestoreCustomProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </FirestoreCustomProvider>
    </FirebaseAppProvider>
  );
}