import { Stack } from "expo-router";
import { StyleSheet, SafeAreaView } from "react-native";
import SettingsScreen from "../components/SettingsScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Settings() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Settings" }} />
        <SettingsScreen />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
