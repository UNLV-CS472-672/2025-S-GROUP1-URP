import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

const ParkingMap = ({ parkingLot }) => {
  // Sample parking data (Replace with dynamic data later)
  const parkingSpaces = [
    { id: 1, status: "open" }, // Green
    { id: 2, status: "occupied" }, // Red
    { id: 3, status: "reserved" }, // Yellow
    { id: 4, status: "occupied" },
    { id: 5, status: "occupied" },
    { id: 6, status: "open" },
    { id: 7, status: "open" },
    { id: 8, status: "open" },
    { id: 9, status: "open" },
    { id: 10, status: "open" },
    { id: 11, status: "open" },
    { id: 12, status: "open" },
  ];

  // Color map for different parking statuses
  const statusColors = {
    open: "green",
    occupied: "red",
    reserved: "yellow",
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
        {parkingLot}
      </Text>

      {/* Parking Key */}
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <Text style={{ textShadowColor: 'black', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3, color: "green", marginRight: 10 }}>🟩 Open</Text>
        <Text style={{ textShadowColor: 'black', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3, color: "yellow", marginRight: 10 }}>🟨 Reserved</Text>
        <Text style={{ textShadowColor: 'black', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3, color: "red" }}>🟥 Occupied</Text>
      </View>

      {/* SVG Parking Lot Map */}
      <ScrollView vertical>
        <ScrollView>
          <Svg height="1000" viewBox="0 0 300 1000">
            {/* Background */}
            <Rect x="0" y="0" width="300" height="1000" fill="lightgray" />

            {/* Parking Spaces */}
            {parkingSpaces.map((space, i) => (
              <Rect
                key={space.id}
                x="50"
                y={i * 60 + 60}
                width="200"
                height="50"
                fill={statusColors[space.status]}
                stroke="black"
                strokeWidth="2"
              />
            ))}

            {/* Parking Labels */}
            {parkingSpaces.map((space, i) => (
              <SvgText
                key={space.id}
                x="150"
                y={i * 60 + 90}
                fontSize="20"
                fill="black"
                textAnchor="middle"
              >
                {`P${space.id}`}
              </SvgText>
            ))}
          </Svg>
        </ScrollView>
      </ScrollView>

      {/* Action Buttons */}
      <View style={{ flexDirection: "row", marginTop: 20 }}>
        {/* <TouchableOpacity style={{ backgroundColor: "blue", padding: 10, margin: 5, borderRadius: 5 }}>
          <Text style={{ color: "white" }}>Back</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={{ backgroundColor: "red", padding: 10, margin: 5, borderRadius: 5 }}>
          <Text style={{ color: "white" }}>Reserve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ParkingMap;
