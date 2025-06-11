import SignOutButton from "@/app/components/SignOutButton";
import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React from "react";
import {
  Animated,
  Dimensions,
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
    <LinearGradient colors={["#F8F9FA", "#EDF2F7"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <SignedIn>
          <TodoApp />
          <View style={styles.signOutContainer}>
            <SignOutButton />
          </View>
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
              <View style={styles.logoContainer}>
                <Ionicons name="checkmark-done" size={48} color="#6B46C1" />
              </View>
              <Text style={styles.welcomeTitle}>Welcome to Todo App</Text>
              <Text style={styles.welcomeSubtitle}>
                Organize your life, one task at a time
              </Text>
            </View>

            <View style={styles.authButtons}>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity
                  style={[styles.authButton, styles.signInButton]}
                  activeOpacity={0.8}>
                  <LinearGradient
                    colors={["#6B46C1", "#805AD5"]}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}>
                    <Text style={styles.authButtonText}>Sign In</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color="white"
                      style={styles.buttonIcon}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </Link>

              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity
                  style={[styles.authButton, styles.signUpButton]}
                  activeOpacity={0.8}>
                  <Text style={[styles.authButtonText, styles.signUpText]}>
                    Create Account
                  </Text>
                  <Ionicons
                    name="person-add"
                    size={20}
                    color="#6B46C1"
                    style={styles.buttonIcon}
                  />
                </TouchableOpacity>
              </Link>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our{" "}
                <Text style={styles.linkText}>Terms</Text> and{" "}
                <Text style={styles.linkText}>Privacy Policy</Text>
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
  },
  safeArea: {
    flex: 1,
  },
  signOutContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(107, 70, 193, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 60,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 10,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    maxWidth: width * 0.8,
    lineHeight: 24,
  },
  authButtons: {
    width: "100%",
    gap: 15,
  },
  authButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#6B46C1",

    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  signInButton: {
    backgroundColor: "#6B46C1",
    color: "#fff",
    borderRadius: 10,
  },
  signUpButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#fff",
  },
  signUpText: {
    color: "#6B46C1",
  },
  buttonIcon: {
    marginLeft: 8,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    paddingHorizontal: 40,
  },
  footerText: {
    fontSize: 12,
    color: "#A0AEC0",
    textAlign: "center",
    lineHeight: 18,
  },
  linkText: {
    color: "#6B46C1",
    textDecorationLine: "underline",
  },
});
