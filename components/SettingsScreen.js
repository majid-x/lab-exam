import React, { useContext, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { QuranContext } from "../context/QuranContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen = () => {
  const { showTafseer, toggleTafseer, language, toggleLanguage } =
    useContext(QuranContext);

  // Log current settings values on component mount
  useEffect(() => {
    console.log("Settings Screen mounted with values:", {
      showTafseer,
      language,
    });
  }, []);

  // Debug function to show current values
  const debugSettings = async () => {
    try {
      const storedShowTafseer = await AsyncStorage.getItem("showTafseer");
      const storedLanguage = await AsyncStorage.getItem("language");

      Alert.alert(
        "Current Settings",
        `Context values:\n- showTafseer: ${showTafseer}\n- language: ${language}\n\nStored values:\n- showTafseer: ${storedShowTafseer}\n- language: ${storedLanguage}`
      );
    } catch (error) {
      console.error("Error getting settings", error);
    }
  };

  const handleToggleTafseer = () => {
    console.log("Toggling tafseer button pressed, current value:", showTafseer);
    toggleTafseer();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.settingsContainer}>
        <Text style={styles.heading}>Settings</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Show Tafseer</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#6200ee80" }}
            thumbColor={showTafseer ? "#6200ee" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleToggleTafseer}
            value={showTafseer}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Language</Text>
          <View style={styles.languageSelector}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === "english" && styles.activeLanguage,
              ]}
              onPress={() => language !== "english" && toggleLanguage()}>
              <Text
                style={[
                  styles.languageButtonText,
                  language === "english" && styles.activeLanguageText,
                ]}>
                English
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageButton,
                language === "urdu" && styles.activeLanguage,
              ]}
              onPress={() => language !== "urdu" && toggleLanguage()}>
              <Text
                style={[
                  styles.languageButtonText,
                  language === "urdu" && styles.activeLanguageText,
                ]}>
                Urdu
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.debugButton} onPress={debugSettings}>
          <Text style={styles.debugButtonText}>Check Current Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  settingsContainer: {
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#333",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
  },
  languageSelector: {
    flexDirection: "row",
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  activeLanguage: {
    backgroundColor: "#6200ee",
  },
  languageButtonText: {
    color: "#333",
  },
  activeLanguageText: {
    color: "white",
  },
  debugButton: {
    marginTop: 32,
    backgroundColor: "#6200ee22",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  debugButtonText: {
    color: "#6200ee",
    fontWeight: "bold",
  },
});

export default SettingsScreen;
