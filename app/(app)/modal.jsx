import { StatusBar } from "expo-status-bar";
import { Linking, Platform, StyleSheet, TouchableOpacity } from "react-native";

import { Text, View } from "@/components/Themed";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

const navigateToLink = (url) => {
  Linking.openURL(url).catch((err) =>
    console.error("Error navigating to link:", err)
  );
};

export default function ModalScreen() {
  const params = useLocalSearchParams();

  const { data } = params;
  const [ligend, setLigend] = useState();

  useEffect(() => {
    setLigend(JSON.parse(data));
  }, [data]);

  return (
    <View style={styles.container}>
      {ligend?.name && (
        <Text style={styles.title}>{`Name: ${ligend.name}`}</Text>
      )}
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      {ligend?.element && (
        <Text style={styles.title}>{`Element: ${ligend.element}`}</Text>
      )}
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      {ligend?.phase && (
        <Text style={styles.title}>{`Phase: ${ligend.phase}`}</Text>
      )}
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      {ligend?.discoverdBy && (
        <TouchableOpacity
          onPress={() => {
            navigateToLink(
              `https://fr.wikipedia.org/wiki/${ligend.discoverdBy
                .split(" ")
                .join("_")}`
            );
          }}
        >
          <Text
            style={styles.title}
          >{`Discoverd By: ${ligend.discoverdBy}`}</Text>
        </TouchableOpacity>
      )}
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    // alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    marginVertical: 20,
  },
});
