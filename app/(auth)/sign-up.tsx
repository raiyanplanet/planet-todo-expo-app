import { useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
      Toast.show({
        type: "success",
        text1: "Verification sent!",
        text2: "Check your email for the verification code",
        visibilityTime: 4000,
      });
    } catch (err: any) {
      let errorMessage = "Sign up failed. Please try again.";

      if (err.errors) {
        const clerkError = err.errors[0];
        if (clerkError.code === "form_password_pwned") {
          errorMessage =
            "Password is too common. Please choose a stronger one.";
        } else if (clerkError.code === "form_param_format_invalid") {
          errorMessage = "Invalid email format. Please check your email.";
        } else if (clerkError.message) {
          errorMessage = clerkError.message;
        }
      }

      Toast.show({
        type: "error",
        text1: "Sign up error",
        text2: errorMessage,
        position: "top",
        topOffset: 60,
        visibilityTime: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
        Toast.show({
          type: "success",
          text1: "Welcome!",
          text2: "Your account has been created successfully",
          visibilityTime: 3000,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Verification incomplete",
          text2: "Please try again",
          visibilityTime: 4000,
        });
      }
    } catch (err: any) {
      let errorMessage = "Verification failed. Please try again.";

      if (err.errors) {
        const clerkError = err.errors[0];
        if (clerkError.code === "form_code_incorrect") {
          errorMessage =
            "Incorrect verification code. Please check your email.";
        } else if (clerkError.message) {
          errorMessage = clerkError.message;
        }
      }

      Toast.show({
        type: "error",
        text1: "Verification error",
        text2: errorMessage,
        position: "top",
        topOffset: 60,
        visibilityTime: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.gradient}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoid}>
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}>
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Ionicons name="mail-open-outline" size={40} color="#fff" />
                </View>
                <Text style={styles.title}>Verify Your Email</Text>
                <Text style={styles.subtitle}>
                  We've sent a code to {emailAddress}
                </Text>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="key-outline"
                    size={20}
                    color="#667eea"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={code}
                    placeholder="Enter verification code"
                    placeholderTextColor="#A0A0A0"
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    autoFocus
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.signInButton,
                    isLoading && styles.signInButtonDisabled,
                  ]}
                  onPress={onVerifyPress}
                  disabled={isLoading}>
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    style={styles.buttonGradient}>
                    {isLoading ? (
                      <Text style={styles.buttonText}>Verifying...</Text>
                    ) : (
                      <Text style={styles.buttonText}>Verify Email</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendCode}
                  onPress={async () => {
                    await signUp.prepareEmailAddressVerification({
                      strategy: "email_code",
                    });
                    Toast.show({
                      type: "info",
                      text1: "Code resent!",
                      text2: "Check your email again",
                      visibilityTime: 3000,
                    });
                  }}>
                  <Text style={styles.resendCodeText}>Resend code</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-add-outline" size={40} color="#fff" />
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join us to get started</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#667eea"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  autoCapitalize="none"
                  value={emailAddress}
                  placeholder="Enter your email"
                  placeholderTextColor="#A0A0A0"
                  onChangeText={setEmailAddress}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#667eea"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  placeholder="Enter your password"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#667eea"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.signInButton,
                  isLoading && styles.signInButtonDisabled,
                ]}
                onPress={onSignUpPress}
                disabled={isLoading}>
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  style={styles.buttonGradient}>
                  {isLoading ? (
                    <Text style={styles.buttonText}>Creating Account...</Text>
                  ) : (
                    <Text style={styles.buttonText}>Sign Up</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Link href="/sign-in" style={styles.signUpLink}>
                  <Text style={styles.signUpText}>Sign In</Text>
                </Link>
              </View>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    padding: 4,
  },
  signInButton: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resendCode: {
    alignItems: "center",
    marginTop: 8,
  },
  resendCodeText: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  signUpLink: {
    marginLeft: 4,
  },
  signUpText: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "600",
  },
});
