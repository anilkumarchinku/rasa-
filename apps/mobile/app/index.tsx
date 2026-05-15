import {
  RASA_CITY,
  demoOtpCode,
  minimumCuisineSelections,
  phaseZeroCuisines,
  type PhaseZeroCuisine,
} from "@rasa/shared";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

type Step = "phone" | "otp" | "taste" | "home";

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "").slice(0, 14);
}

export default function HomeScreen() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<PhaseZeroCuisine[]>([]);
  const [error, setError] = useState("");

  function submitPhone() {
    const nextPhone = normalizePhone(phone);

    if (nextPhone.length < 10) {
      setError("Enter a valid phone number.");
      return;
    }

    setPhone(nextPhone);
    setError("");
    setStep("otp");
  }

  function submitOtp() {
    if (otp.trim() !== demoOtpCode) {
      setError("Use the demo OTP 123456.");
      return;
    }

    setError("");
    setStep("taste");
  }

  function toggleCuisine(cuisine: PhaseZeroCuisine) {
    setSelectedCuisines((current) =>
      current.includes(cuisine)
        ? current.filter((item) => item !== cuisine)
        : [...current, cuisine],
    );
  }

  function finishOnboarding() {
    if (selectedCuisines.length < minimumCuisineSelections) {
      setError(`Pick at least ${minimumCuisineSelections} cuisines.`);
      return;
    }

    setError("");
    setStep("home");
  }

  function resetOnboarding() {
    setStep("phone");
    setPhone("");
    setOtp("");
    setSelectedCuisines([]);
    setError("");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.kicker}>Phase 0.3</Text>
      <Text style={styles.title}>Rasa starts with your saved food brain.</Text>
      <Text style={styles.body}>Sign in, lock {RASA_CITY}, and pick your first taste signals.</Text>

      <View style={styles.panel}>
        {step === "phone" && (
          <View style={styles.stack}>
            <Text style={styles.panelKicker}>Phone</Text>
            <Text style={styles.panelTitle}>Enter your number</Text>
            <TextInput
              inputMode="tel"
              onChangeText={(value) => setPhone(normalizePhone(value))}
              placeholder="+91 98765 43210"
              style={styles.input}
              value={phone}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable onPress={submitPhone} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Send OTP</Text>
            </Pressable>
          </View>
        )}

        {step === "otp" && (
          <View style={styles.stack}>
            <Text style={styles.panelKicker}>Verify</Text>
            <Text style={styles.panelTitle}>Check your code</Text>
            <TextInput
              inputMode="numeric"
              maxLength={6}
              onChangeText={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              style={styles.input}
              value={otp}
            />
            <Text style={styles.hint}>Demo OTP: 123456</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.buttonRow}>
              <Pressable onPress={() => setStep("phone")} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </Pressable>
              <Pressable onPress={submitOtp} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Verify</Text>
              </Pressable>
            </View>
          </View>
        )}

        {step === "taste" && (
          <View style={styles.stack}>
            <Text style={styles.panelKicker}>{RASA_CITY}</Text>
            <Text style={styles.panelTitle}>Pick your first cravings</Text>
            <View style={styles.chips}>
              {phaseZeroCuisines.map((cuisine) => {
                const selected = selectedCuisines.includes(cuisine);

                return (
                  <Pressable
                    key={cuisine}
                    onPress={() => toggleCuisine(cuisine)}
                    style={[styles.chip, selected && styles.selectedChip]}
                  >
                    <Text style={[styles.chipText, selected && styles.selectedChipText]}>
                      {cuisine}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.hint}>
              {selectedCuisines.length}/{minimumCuisineSelections} selected
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.buttonRow}>
              <Pressable onPress={() => setStep("otp")} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </Pressable>
              <Pressable onPress={finishOnboarding} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Finish</Text>
              </Pressable>
            </View>
          </View>
        )}

        {step === "home" && (
          <View style={styles.stack}>
            <Text style={styles.panelKicker}>Ready</Text>
            <Text style={styles.panelTitle}>Welcome to Rasa</Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Phone</Text>
              <Text style={styles.summaryValue}>{phone}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>City</Text>
              <Text style={styles.summaryValue}>{RASA_CITY}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Tastes</Text>
              <Text style={styles.summaryValue}>{selectedCuisines.join(", ")}</Text>
            </View>
            <Pressable onPress={resetOnboarding} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Reset test profile</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fffaf3",
  },
  kicker: {
    color: "#2f7a5f",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 14,
  },
  title: {
    color: "#171412",
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 44,
  },
  body: {
    color: "#655f59",
    fontSize: 18,
    lineHeight: 28,
    marginTop: 20,
  },
  panel: {
    backgroundColor: "#ffffff",
    borderColor: "#e5ddd1",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 28,
    padding: 20,
  },
  stack: {
    gap: 16,
  },
  panelKicker: {
    color: "#2f7a5f",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  panelTitle: {
    color: "#171412",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 31,
  },
  input: {
    borderColor: "#e5ddd1",
    borderRadius: 8,
    borderWidth: 1,
    color: "#171412",
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#d94b32",
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#f4eee5",
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: "#171412",
    fontSize: 15,
    fontWeight: "800",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#ffffff",
    borderColor: "#e5ddd1",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedChip: {
    backgroundColor: "#2f7a5f",
    borderColor: "#2f7a5f",
  },
  chipText: {
    color: "#655f59",
    fontWeight: "700",
  },
  selectedChipText: {
    color: "#ffffff",
  },
  hint: {
    color: "#655f59",
    fontSize: 14,
  },
  error: {
    color: "#d94b32",
    fontSize: 14,
    fontWeight: "700",
  },
  summaryItem: {
    borderColor: "#e5ddd1",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  summaryLabel: {
    color: "#655f59",
    fontSize: 13,
    marginBottom: 4,
  },
  summaryValue: {
    color: "#171412",
    fontSize: 17,
    fontWeight: "800",
  },
});
