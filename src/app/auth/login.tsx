import {
  ArrowLeft01Icon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GoogleSignInButton from "../../components/GoogleSigninBtn";
import { useApp } from "../../context/AppContext";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, authError, colors } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const statusBarPadding =
    Platform.OS === "android"
      ? Math.max(insets.top, StatusBar.currentHeight || 24) + 8
      : Math.max(insets.top, 14);

  const bottomPadding = Math.max(insets.bottom, 20) + 12;
  const displayError = errorMessage || authError;

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const success = await login(trimmedEmail, password);

      if (success) {
        router.replace("/(tabs)");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please check your details and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.glowContainer} pointerEvents="none">
        <LinearGradient
          colors={[
            "rgba(255, 69, 0, 0.4)",
            "rgba(235, 45, 0, 0.18)",
            "transparent",
          ]}
          style={styles.radialGlow}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.8 }}
        />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: statusBarPadding, paddingBottom: bottomPadding },
        ]}
      >
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.capsuleBackBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={15} color="#FFFFFF" />
            <Text style={styles.capsuleBackText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentBox}>
          <View style={styles.badgeWrapper}>
            <View style={styles.auraGlow} />
            <Image
              source={require("../../../assets/images/eta_glowing_card_badge.jpg")}
              style={styles.badgeImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.screenTitle}>Sign in to Express Tech</Text>
          <Text style={styles.screenSubtitle}>
            Welcome back. Enter your email and password to continue.
          </Text>
          {displayError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          ) : null}
          <View style={styles.inputContainer}>
            <HugeiconsIcon icon={Mail01Icon} size={18} color="#72727D" />
            <TextInput
              style={styles.inputField}
              placeholder="Email address"
              placeholderTextColor="#6B6B76"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (errorMessage) setErrorMessage(null);
              }}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>
          <View style={styles.inputContainer}>
            <HugeiconsIcon icon={LockIcon} size={18} color="#72727D" />
            <TextInput
              style={styles.inputField}
              placeholder="Password"
              placeholderTextColor="#6B6B76"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (errorMessage) setErrorMessage(null);
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((visible) => !visible)}
              style={styles.eyeBtn}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
            >
              <HugeiconsIcon
                icon={showPassword ? EyeOffIcon : EyeIcon}
                size={18}
                color="#888894"
              />
            </TouchableOpacity>
          </View>
          // forgot password link
          <TouchableOpacity
            onPress={() => router.push("/auth/forgot-password")}
            style={{ alignSelf: "flex-end", marginBottom: 8 }}
          >
            <Text
              style={{
                color: "#2563EB",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Forgot password?
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.continueBtn, styles.continueBtnActive]}
            activeOpacity={0.88}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text style={styles.continueBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>
          <GoogleSignInButton
            onSuccess={(result) => {
              console.log(
                "Google authentication successful:",
                result.user.email,
              );
              router.replace("/(tabs)");
            }}
            onError={(message) => {
              setErrorMessage(message);
            }}
          />
          <Text style={styles.disclaimerText}>
            By continuing, you agree to our{" "}
            <Text style={styles.disclaimerLink}>Privacy Policy</Text> and{" "}
            <Text style={styles.disclaimerLink}>Terms & Conditions</Text>.
          </Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/auth/signup")}
            accessibilityRole="button"
          >
            <Text style={[styles.signupText, { color: colors.accent }]}>
              Sign up with email
            </Text>
          </TouchableOpacity>
          {/* Bottom Button: continue as guest (Dark Translucent Pill) */}
        </View>
        <TouchableOpacity
          style={styles.guestBtn}
          activeOpacity={0.85}
          onPress={() => router.push("/(tabs)")}
        >
          <Text style={styles.guestBtnText}>Continue as Guest</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090C",
  },
  glowContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 380,
    overflow: "hidden",
  },
  radialGlow: {
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  capsuleBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  capsuleBackText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  contentBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  badgeWrapper: {
    position: "relative",
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  auraGlow: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(255, 85, 0, 0.28)",
    shadowColor: "#FF5500",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  badgeImage: {
    width: 136,
    height: 136,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(255, 120, 40, 0.4)",
  },
  screenTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: "center",
  },
  screenSubtitle: {
    color: "#8A8A96",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 300,
    marginBottom: 24,
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "#EF4444",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
    maxWidth: 320,
    width: "100%",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131318",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 27,
    height: 54,
    paddingHorizontal: 18,
    width: "100%",
    marginBottom: 10,
  },
  inputField: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    marginLeft: 8,
  },
  eyeBtn: {
    padding: 6,
  },
  continueBtn: {
    width: "100%",
    height: 52,
    backgroundColor: "#1A1A22",
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  continueBtnActive: {
    backgroundColor: "#2d94e7",
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  dividerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#2A2A32",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#8A8A96",
    fontSize: 13,
  },
  disclaimerText: {
    color: "#656570",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 300,
    marginTop: 22,
  },
  disclaimerLink: {
    color: "#8E8E9C",
    textDecorationLine: "underline",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 12,
    marginBottom: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
  },
  signupText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  guestBtn: {
    height: 52,
    backgroundColor: "rgba(233, 83, 14, 0.39)",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  guestBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
});
