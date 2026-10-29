import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authService, LoginResult } from "../services/authService";

type Props = {
  onSuccess: (result: LoginResult) => void;
  onError: (message: string) => void;
  label?: string;
};

export default function GoogleSignInButton({
  onSuccess,
  onError,
  label = "Continue with Google",
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const result = await authService.googleLogin();

      if (result.success && result.data) {
        onSuccess(result.data);
      } else {
        onError(result.error || "Google sign-in failed.");
      }
    } catch (error: any) {
      onError(error?.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.disabled]}
      onPress={handleGoogleSignIn}
      disabled={loading}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color="#202124" />
      ) : (
        <View style={styles.content}>
          <Text style={styles.googleIcon}>
            {/* <HugeiconsIcon icon={GoogleIcon} size={30} color="#2d94e7" /> */}
            <Image
              source={require("../../assets/images/google-icon.png")}
              style={styles.googleIcon}
            />
          </Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DADCE0",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  disabled: {
    opacity: 0.7,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  googleIcon: {
    color: "#4285F4",
    fontSize: 19,
    fontWeight: "800",
  },
  label: {
    color: "#202124",
    fontSize: 15,
    fontWeight: "600",
  },
  googleIcon: {
    width: 30,
    height: 30,
  },
});
