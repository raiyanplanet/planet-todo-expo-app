import { SignedIn, SignedOut } from "@clerk/clerk-expo";

import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React from "react";
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import TodoApp from "./components/TodoApp";

const { width } = Dimensions.get("window");

export default function Page() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideUpAnim = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={["#0A0E27", "#0A0E27"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <SignedIn>
          <TodoApp />
        </SignedIn>
        <SignedOut>
          <Animated.View
            style={[
              styles.authContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}>
            <View style={styles.welcomeSection}>
              <View>
                <Image
                  source={require("@/assets/images/icon.png")}
                  style={{ width: 100, height: 100, marginBottom: 10 }}
                />
              </View>
              <Text style={styles.welcomeTitle}>Planet Todo</Text>
              <Text style={styles.welcomeSubtitle}>
                Simple task management for focused work
              </Text>
            </View>

            <View style={styles.authButtons}>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity
                  style={styles.signInButton}
                  activeOpacity={0.8}>
                  <Text style={styles.signintext}>Get started</Text>
                </TouchableOpacity>
              </Link>

              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity
                  style={styles.signUpButton}
                  activeOpacity={0.8}>
                  <Text style={styles.signuptext}>Create Account</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our Terms and Privacy Policy
              </Text>
              <Text style={styles.footerText}>
                Made by Tawsiful Alam Raiyan
              </Text>
            </View>
          </Animated.View>
        </SignedOut>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  safeArea: {
    flex: 1,
  },
  signOutContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    gap: 10,
  },
  homeButton: {
    padding: 5,
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 100,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  welcomeTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    maxWidth: width * 0.85,
    lineHeight: 24,
  },
  authButtons: {
    width: "100%",
    gap: 16,
  },
  signInButton: {
    backgroundColor: "#4FACFE",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  signUpButton: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1CA",
    borderColor: "#E5E7EB",
    shadowColor: "#333446",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  signintext: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  signuptext: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333446",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    paddingHorizontal: 32,
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
});
