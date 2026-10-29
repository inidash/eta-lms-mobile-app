import { HugeiconsIcon } from "@hugeicons/react-native";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BookOpen01Icon,
  CompassIcon,
  FavouriteIcon,
  PlayCircleIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import { useApp } from "../../context/AppContext";

export default function TabsLayout() {
  const { colors, themeMode } = useApp();
  const insets = useSafeAreaInsets();

  // Account for Android's bottom system navigation area.
  const bottomInset = Platform.OS === "android" ? insets.bottom : 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,

        tabBarStyle: {
          backgroundColor: themeMode === "dark" ? "#0D0D0E" : "#FFFFFF",

          borderTopColor: colors.border,

          // Add the system navigation inset to the tab bar height.
          height: 64 + bottomInset,

          // Keep the tabs above Android's navigation buttons.
          paddingBottom: bottomInset + 6,
          paddingTop: 8,

          paddingLeft: insets.left,
          paddingRight: insets.right,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },

        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <HugeiconsIcon icon={PlayCircleIcon} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <HugeiconsIcon icon={CompassIcon} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="my-courses"
        options={{
          title: "My Courses",
          tabBarIcon: ({ color, size }) => (
            <HugeiconsIcon icon={BookOpen01Icon} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          tabBarIcon: ({ color, size }) => (
            <HugeiconsIcon icon={FavouriteIcon} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <HugeiconsIcon icon={UserIcon} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
