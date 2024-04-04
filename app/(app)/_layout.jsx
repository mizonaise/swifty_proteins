import { Stack, Redirect } from "expo-router";
import * as MediaLibrary from "expo-media-library";

import { useSession } from "@/context";
import { TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Loading from "@/components/Loding";

export default function AppLayout() {
  const { signOut, session, isLoading } = useSession();

  const [status, requestPermission] = MediaLibrary.usePermissions();

  if (status === null) {
    requestPermission();
  }

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Loading />;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/sign-in" />;
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => null,
          headerRight: ({ tintColor }) => (
            <TouchableOpacity
              onPress={() => {
                // The `app/(app)/_layout.tsx` will redirect to the sign-in screen.
                signOut();
              }}
            >
              <MaterialCommunityIcons
                size={24}
                name="logout"
                color={tintColor}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="legend"
        options={{
          title: "Molucule",
          headerRight: ({ tintColor }) => (
            <TouchableOpacity
              onPress={() => {
                // The `app/(app)/_layout.tsx` will redirect to the sign-in screen.
                signOut();
              }}
            >
              <MaterialCommunityIcons
                size={24}
                name="logout"
                color={tintColor}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="modal"
        options={{
          title: "Chemical Element",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
