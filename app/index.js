import { Stack } from "expo-router";
import { StyleSheet, SafeAreaView } from "react-native";
import SurahViewer from "../components/SurahViewer";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useQuranData from "../hooks/useQuranData";

export default function Home() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Quran Surahs" }} />
        <AppContent />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Separated to use hooks that depend on QuranProvider
function AppContent() {
  // Initialize data loading
  useQuranData();

  return <SurahViewer />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
