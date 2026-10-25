import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    Image,
} from "react-native";

import {
    Cancel01Icon,
    CheckmarkCircle02Icon,
    Delete02Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

interface ConfirmDialogProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  colors: any;
  destructive?: boolean;
  loading?: boolean;
}

export default function ConfirmDialog({
  visible,
  title = "Are you sure?",
  message = "Do you want to proceed with this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  colors,
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  const icon = destructive ? Delete02Icon : CheckmarkCircle02Icon;

  const accentColor = destructive ? "#DC2626" : colors?.primary;

  const handleConfirm = async () => {
    if (loading || !onConfirm) return;
    await onConfirm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View
              style={[
                styles.dialog,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Close button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onCancel}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {/* Icon */}
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${accentColor}15` },
                ]}
              >
                <Image 
                  source={require("../../assets/eta_logo.png")}
                  style={styles.badgeImage}
                  resizeMode="cover"
                />
                {/* <HugeiconsIcon icon={icon} size={30} color={accentColor} /> */}
              </View>

              {/* Title */}
              <Text style={[styles.title, { color: colors.text }]}>
                {title}
              </Text>

              {/* Message */}
              <Text style={[styles.message, { color: colors.textSecondary }]}>
                {message}
              </Text>

              {/* Actions */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.cancelButton,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  onPress={onCancel}
                  disabled={loading}
                  accessibilityRole="button"
                >
                  <Text style={[styles.cancelText, { color: colors.text }]}>
                    {cancelText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      backgroundColor: accentColor,
                      opacity: loading ? 0.7 : 1,
                    },
                  ]}
                  onPress={handleConfirm}
                  disabled={loading}
                  accessibilityRole="button"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmText}>{confirmText}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  dialog: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    position: "relative",
  },

  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 6,
    zIndex: 1,
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },

  message: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 28,
  },

  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },

  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  cancelButton: {
    borderWidth: 1,
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "600",
  },

  confirmText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  badgeImage: {
    width: 70,
    height: 70,
    borderRadius: 28,
    borderWidth: 1.5,
    // borderColor: "rgba(255, 120, 40, 0.4)",
  },
});
