"use client";

import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "@/store/store";

interface ReduxProviderProps {
  children: React.ReactNode;
}

export default function ReduxProvider({
  children,
}: ReduxProviderProps) {
 
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
    >
      <Provider store={store}>{children}</Provider>
    </GoogleOAuthProvider>
  );
}