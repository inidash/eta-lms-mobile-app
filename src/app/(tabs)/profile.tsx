import {
  ArrowRight01Icon,
  Award01Icon,
  Download01Icon,
  GiftIcon,
  Globe02Icon,
  HelpCircleIcon,
  Login01Icon,
  Logout01Icon,
  Moon01Icon,
  Notification01Icon,
  PencilEdit01Icon,
  SparklesIcon,
  Sun01Icon,
  UserCheck01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ConfirmDialog from "../../components/ConfirmDialog";
import { Header } from "../../components/Header";
import { useApp } from "../../context/AppContext";

import * as ImagePicker from "expo-image-picker";
import { ActivityIndicator } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const {
    userProfile,
    themeMode,
    toggleThemeMode,
    colors,
    isAuthenticated,
    logout,
  } = useApp();

  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setConfirmVisible(false);
      router.replace("/auth/login");
    } catch (error) {
      console.error("Failed to logout:", error);
      Alert.alert("Logout Error", "Could not sign out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const settingsMenuItems = [
    {
      id: "1",
      title: "Profile Settings",
      icon: UserCheck01Icon,
      route: "/profile-settings",
    },
    {
      id: "2",
      title: "Notifications",
      icon: Notification01Icon,
      route: "/notifications",
    },
    { id: "3", title: "Downloads", icon: Download01Icon, route: "/downloads" },
    {
      id: "4",
      title: "Help & Support",
      icon: HelpCircleIcon,
      route: "/help-support",
    },
    {
      id: "5",
      title: "Premium",
      icon: SparklesIcon,
      highlight: true,
      route: "/premium",
    },
    {
      id: "6",
      title: "Theme",
      icon: themeMode === "dark" ? Moon01Icon : Sun01Icon,
      isThemeToggle: true,
      badge: themeMode.toUpperCase(),
    },
    {
      id: "7",
      title: "Certifications",
      icon: Award01Icon,
      route: "/my-courses",
    },
    { id: "8", title: "Gift Course", icon: GiftIcon, route: "/gift-course" },
    ...(isAuthenticated
      ? [{ id: "9", title: "Logout", icon: Logout01Icon, isLogout: true }]
      : [
          {
            id: "9",
            title: "Logout",
            icon: Login01Icon,
            isLogin: true,
            route: "/auth/login",
          },
        ]),
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topGreetingHeader}>
        <View style={styles.greetingCol}>
          <Text style={[styles.greetingTitle, { color: colors.text }]}>
            {userProfile?.name}
          </Text>
          <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>
            {userProfile?.greeting}
          </Text>
        </View>
        <Header showCurrency={false} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Profile Card */}
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
            }}
            style={styles.cardCover}
          />

          <View style={styles.userInfoRow}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    profileImage ||
                    userProfile?.avatar ||
                    "https://www.gravatar.com/avatar/?d=mp",
                }}
                style={[styles.avatar, { borderColor: colors.primary }]}
              />
            </View>

            <View style={styles.userMetaCol}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {userProfile?.name}
              </Text>

              <View style={styles.userSubRow}>
                <Text
                  style={[styles.metaText, { color: colors.textSecondary }]}
                >
                  Joined {userProfile?.joinedYear}
                </Text>

                <HugeiconsIcon
                  icon={Globe02Icon}
                  size={12}
                  color={colors.textMuted}
                />

                <Text
                  style={[styles.metaText, { color: colors.textSecondary }]}
                >
                  {userProfile?.country}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* General Settings Section */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          General Settings
        </Text>

        <View style={styles.menuContainer}>
          {settingsMenuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                  item.highlight && {
                    borderColor: colors.primary,
                    backgroundColor: "rgba(0, 102, 255, 0.08)",
                  },
                ]}
                onPress={() => {
                  if (item.isLogout) {
                    setConfirmVisible(true);
                  } else if (item.isThemeToggle) {
                    toggleThemeMode();
                  } else if (item.route) {
                    router.push(item.route as any);
                  }
                }}
              >
                <View style={styles.menuItemLeft}>
                  <HugeiconsIcon
                    icon={IconComponent}
                    size={20}
                    color={
                      item.isLogout
                        ? colors.error
                        : item.highlight || item.isLogin
                          ? colors.primary
                          : colors.text
                    }
                  />
                  <Text
                    style={[
                      styles.menuItemText,
                      { color: colors.text },
                      item.isLogout && { color: colors.error },
                      (item.highlight || item.isLogin) && {
                        color: colors.primary,
                      },
                    ]}
                  >
                    {item.title}
                  </Text>
                </View>

                <View style={styles.menuItemRight}>
                  {item.badge && (
                    <View style={[styles.badgeContainer, { backgroundColor: colors.border }]}>
                      <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                        {item.badge}
                      </Text>
                    </View>
                  )}
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={16}
                    color={colors.textMuted}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Functional Context Confirm Dialog */}
      <ConfirmDialog
        visible={confirmVisible}
        title="Log Out"
        message="Are you sure you want to log out of your account?"
        confirmText="Log Out"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setConfirmVisible(false)}
        loading={loggingOut}
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topGreetingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greetingCol: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  greetingSub: {
    fontSize: 14,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  userCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 15,
  },
  cardCover: {
    width: "100%",
    height: 100,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: -30,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 3,
    backgroundColor: "#FFF",
  },
  userMetaCol: {
    flex: 1,
    marginLeft: 14,
    marginTop: 24,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
userSubRow: {
flexDirection: "row",
alignItems: "center",
marginTop: 4,
gap: 6,
},
metaText: {
fontSize: 12,
},
sectionHeader: {
fontSize: 14,
fontWeight: "bold",
marginTop: 24,
marginBottom: 10,
},
menuContainer: {
gap: 10,
},
menuItem: {
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
paddingHorizontal: 16,
height: 56,
borderRadius: 16,
borderWidth: 1,
},
menuItemLeft: {
flexDirection: "row",
alignItems: "center",
gap: 12,
},
menuItemText: {
fontSize: 15,
fontWeight: "600",
},
menuItemRight: {
flexDirection: "row",
alignItems: "center",
gap: 8,
},
badgeContainer: {
paddingHorizontal: 8,
paddingVertical: 4,
borderRadius: 8,
},
badgeText: {
fontSize: 11,
fontWeight: "bold",
},
});