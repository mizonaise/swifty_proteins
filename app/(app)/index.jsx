import { useState, useCallback } from "react";

import { AntDesign } from "@expo/vector-icons";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";

import DATA from "@/data/ligand.json";
import useDebounce from "@/hooks/useDebounce";

import { filterData } from "@/data/helpers";
import { Input, Text, View } from "@/components/Themed";

export default function Index({}) {
  const colorScheme = useColorScheme();
  const [text, setText] = useState();
  const debouncedSearchTerm = useDebounce(text, 10);

  const handleChangeText = (input) => {
    setText(input);
  };

  const renderItem = useCallback(
    ({ item, index }) => (
      <TouchableOpacity
        onPress={() =>
          router.push({ pathname: "/legend", params: { query: item } })
        }
      >
        <View style={styles.item}>
          <Text key={index} style={styles.title} onPress={() => {}}>
            {`Ligand: ${item}`}
          </Text>
          <View
            style={{
              padding: 4,
              borderWidth: 1,
              borderRadius: 30,
              borderColor:
                colorScheme !== "dark"
                  ? "rgba(0,0,0,0.5)"
                  : "rgba(255,255,255,0.5)",
            }}
          >
            <AntDesign
              name="arrowright"
              size={20}
              color={
                colorScheme !== "dark"
                  ? "rgba(0,0,0,0.5)"
                  : "rgba(255,255,255,0.5)"
              }
            />
          </View>
        </View>
        <View
          style={styles.separator}
          lightColor="#eee"
          darkColor="rgba(255,255,255,0.1)"
        />
      </TouchableOpacity>
    ),
    []
  );

  return (
    <View style={{ flex: 1, padding: 10, paddingTop: 30 }}>
      <Input
        placeholder="Enter your email address"
        style={{
          height: 48,
          width: "100%",
          borderRadius: 8,
          paddingHorizontal: 22,
        }}
        lightColor="#eee"
        onChangeText={handleChangeText}
        darkColor="rgba(255,255,255,0.7)"
      />
      <FlatList
        renderItem={renderItem}
        initialNumToRender={10}
        keyExtractor={(item) => item}
        data={filterData(DATA, debouncedSearchTerm)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 8,
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
  },
  separator: {
    height: 1,
    width: "100%",
    marginVertical: 1,
  },
});
