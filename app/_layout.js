import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { QuranProvider } from "../context/QuranContext";

export default function AppLayout() {
  return (
    <QuranProvider>
      <>
        <StatusBar style="light" />
        <Tabs
          screenOptions={{
            headerStyle: {
              backgroundColor: "#6200ee",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            tabBarActiveTintColor: "#6200ee",
            tabBarInactiveTintColor: "gray",
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: "Surahs",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="book-outline" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: "Settings",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings-outline" color={color} size={size} />
              ),
            }}
          />
        </Tabs>
      </>
    </QuranProvider>
  );
}
