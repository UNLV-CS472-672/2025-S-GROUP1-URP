import React from "react";
import { View, Text } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

const ParkingMap = ({ parkingLot }) => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
        {parkingLot}
      </Text>

      <Svg height="400" width="300" viewBox="0 0 300 400">
        {/* Background */}
        <Rect x="0" y="0" width="300" height="400" fill="lightgray" />

        {/* Parking Spaces */}
        {[...Array(6)].map((_, i) => (
          <Rect
            key={i}
            x="50"
            y={i * 60 + 60}
            width="200"
            height="50"
            fill="white"
            stroke="black"
            strokeWidth="2"
          />
        ))}

        {/* Labels */}
        {[...Array(6)].map((_, i) => (
          <SvgText
            key={i}
            x="150"
            y={i * 60 + 90}
            fontSize="20"
            fill="black"
            textAnchor="middle"
          >
            {`P${i + 1}`}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
};

export default ParkingMap;
