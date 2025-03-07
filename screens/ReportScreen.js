// import React from "react";
// import { View, Text, StyleSheet } from "react-native";

// export default function ReportScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Report</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//   },
//   text: {
//     fontSize: 20,
//     fontWeight: "bold",
//   },
// });
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ReportScreen() {
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Report Violation</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.text}>Report</Text>
      </View>
    </View>
  );
}

// the following is the title for report page
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    height: 150, // Adjust height as needed
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30, // Optional for styling
    borderBottomRightRadius: 30, // Optional for styling
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    // Text Outline Effect
    textShadowColor: "black",
    textShadowOffset: { width: 3, height: 1 }, // Offset to create the outline
    textShadowRadius: 10, // Controls the thickness of the outline
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
