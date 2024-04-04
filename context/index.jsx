import React, { useState } from "react";
import { router } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import { Alert } from "react-native";

const AuthContext = React.createContext({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider(props) {
  const [session, setSession] = useState();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <AuthContext.Provider
      value={{
        signIn: async () => {
          // Perform sign-in logic here
          setIsLoading(true);
          const options = {
            promptMessage: "Scan your fingerprint to use this app",
            fallbackLabel: "Enter your device password to use this app",
            maxAttempts: 3,
            cancelLabel: "Cancel",
            fallbackToPasscode: true,
            disableDeviceFallback: false,
          };

          const authenticated = await LocalAuthentication.authenticateAsync(
            options
          );

          if (authenticated.success) {
            router.replace("/");
            setSession("xxx");
            setIsLoading(false);
          } else {
            Alert.alert(
              "Authentication failed",
              authenticated.warning
            );
          }
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
