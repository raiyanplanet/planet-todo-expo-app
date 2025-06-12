import { useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import {
  Animated,
  Dimensions,
  Image,
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
                  We are sent a code to {emailAddress}
                </Text>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="key-outline"
                    size={20}
                    color="#fff"
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
      <LinearGradient colors={["#0A0E27", "#0A0E27"]} style={styles.gradient}>
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
                <Image
                  source={require("@/assets/images/icon.png")}
                  style={{ width: 100, height: 100, marginBottom: 10 }}
                />
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join us to get started</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#fff"
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
                  color="#fff"
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
                    color="#fff"
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
                  colors={["#4FACFE", "#4FACFE"]}
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
    backgroundColor: "#ffffff",
  },
  gradient: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "400",
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(155, 155, 155, 0.1)",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1.5,
    borderColor: "#rgba(196, 196, 196, 0.1)",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#ffff",
    fontWeight: "400",
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    padding: 4,
    opacity: 0.7,
  },
  signInButton: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#3b82f6",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  resendCode: {
    alignItems: "center",
    paddingVertical: 8,
    marginTop: 8,
  },
  resendCodeText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  footerText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "400",
  },
  signUpLink: {
    marginLeft: 4,
  },
  signUpText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
  },
});
