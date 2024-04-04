import React from "react";

import { View } from "./Themed";
import LottieView from "lottie-react-native";

import source from "@/data/loading.json";

const Loading = () => {
  return (
    <View
      style={{
        flex: 1,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LottieView
        autoPlay
        loop={false}
        style={{
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
        source={source}
      />
    </View>
  );
};

export default Loading;
