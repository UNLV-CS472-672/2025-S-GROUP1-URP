import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import Svg, { Rect, Text as SvgText, Image as SvgImage } from "react-native-svg";
import carIcon from "../../../assets/car_icon.png";
import { useNavigation } from "@react-navigation/native"; // Import navigation

const ParkingMap = ({ parkingLot }) => {
    const navigation = useNavigation(); // Initialize navigation

    // Sample parking data (Replace with dynamic data later)
    const parkingSpaces = [
        { id: 1, status: "open" },
        { id: 2, status: "occupied" },
        { id: 3, status: "reserved" },
        { id: 4, status: "occupied" },
        { id: 5, status: "occupied" },
        { id: 6, status: "open" },
        { id: 7, status: "open" },
        { id: 8, status: "open" },
        { id: 9, status: "occupied" },
        { id: 10, status: "open" },
        { id: 11, status: "reserved" },
        { id: 12, status: "open" },
    ];

    // Color map for different parking statuses
    const statusColors = {
        open: "green",
        occupied: "red",
        reserved: "yellow",
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{parkingLot}</Text>

            {/* Parking Key */}
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: "green" }]} />
                    <Text style={styles.legendText}>Open</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: "yellow" }]} />
                    <Text style={styles.legendText}>Reserved</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: "red" }]} />
                    <Text style={styles.legendText}>Occupied</Text>
                </View>
            </View>

            {/* SVG Parking Lot Map */}
            <ScrollView vertical>
                <ScrollView horizontal>
                    <Svg height="600" width="300" viewBox="0 0 300 600">
                        {/* Background */}
                        <Rect x="0" y="0" width="300" height="600" fill="lightgray" />

                        {/* Parking Spaces - Two Columns */}
                        {parkingSpaces.map((space, i) => {
                            const col = i % 2; // Left (0) or Right (1) column
                            const row = Math.floor(i / 2); // Position in row
                            const xPos = col === 0 ? 30 : 160; // Adjust X position for columns
                            const yPos = row * 60 + 40; // Adjust Y position

                            return (
                                <React.Fragment key={space.id}>
                                    {/* Parking Spot */}
                                    <Rect
                                        x={xPos}
                                        y={yPos}
                                        width="100"
                                        height="50"
                                        fill={statusColors[space.status]}
                                        stroke="black"
                                        strokeWidth="2"
                                        rx="5"
                                        ry="5"
                                    />
                                    {/* Parking Spot Label */}
                                    <SvgText
                                        x={xPos + 50}
                                        y={yPos + 30}
                                        fontSize="18"
                                        fill="black"
                                        textAnchor="middle"
                                        fontWeight="bold"
                                    >
                                        {space.id}
                                    </SvgText>
                                    {/* Add a car image to occupied spots */}
                                    {space.status === "occupied" && (
                                        <SvgImage
                                            x={xPos + 10}
                                            y={yPos + 5}
                                            width="80"
                                            height="40"
                                            href={carIcon} // Use imported image
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </Svg>
                </ScrollView>
            </ScrollView>

            {/* Availability Section */}
            <View style={styles.availabilityContainer}>
                <Text style={styles.availabilityText}>Availability:</Text>
                <Text style={styles.availabilityDetail}>13 Reserved</Text>
                <Text style={styles.availabilityDetail}>2 Open</Text>
                <Text style={styles.availabilityDetail}>28,721 Occupied</Text>
            </View>

            {/* Steps for Reserving a Spot */}
            <View style={styles.stepsContainer}>
                <Text style={styles.stepsTitle}>Steps:</Text>
                <Text style={styles.stepsText}>1. Click on an available green spot</Text>
                <Text style={styles.stepsText}>
                    2. Hit the reserve button after selecting
                </Text>
                <Text style={styles.stepsText}>3. Arrive within an hour</Text>
            </View>

            {/* Reserve Button with Navigation to Confirmation Screen */}
            <TouchableOpacity
                style={styles.reserveButton}
                onPress={() => navigation.navigate("ReservationConfirmation")}
            >
                <Text style={{ color: "white", fontSize: 16 }}>Reserve</Text>
            </TouchableOpacity>
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: "white",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    legendContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 10,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 10,
    },
    legendBox: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    legendText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    availabilityContainer: {
        marginTop: 15,
        alignItems: "center",
        padding: 10,
        backgroundColor: "#ddd",
        borderRadius: 8,
    },
    availabilityText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    availabilityDetail: {
        fontSize: 16,
        color: "black",
    },
    stepsContainer: {
        marginTop: 15,
        alignItems: "center",
        padding: 10,
    },
    stepsTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    stepsText: {
        fontSize: 16,
    },
    reserveButton: {
        backgroundColor: "red",
        padding: 12,
        marginTop: 10,
        borderRadius: 5,
    },
});

export default ParkingMap;
