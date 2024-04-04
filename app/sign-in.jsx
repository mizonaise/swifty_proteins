import { router } from "expo-router";
import { Button, Text, View } from "@/components/Themed";

import { useSession } from "@/context";

export default function SignIn() {
  const { signIn } = useSession();
  return (
    <View
      style={{
        flex: 1,
        padding: 40,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button
        onPress={() => {
          signIn();
        }}
        style={{
          width: "100%",
          padding: 8,
          marginTop: 22,
          borderRadius: 10,
          // display: "flex",
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
        }}
        lightColor="rgba(0,0,0,0.8)"
        darkColor="rgba(255,255,255,0.9)"
      >
        <Text
          style={{ fontSize: 18, fontWeight: "800" }}
          darkColor="black"
          lightColor="white"
        >
          Sign In
        </Text>
      </Button>
    </View>
  );
}
