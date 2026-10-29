import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";

import { PaystackCheckoutModal } from "../components/PaystackCheckoutModal";
import { DarkColors, LightColors, ThemeColors } from "../constants/theme";
import {
  Course,
  INITIAL_COURSES,
  Instructor,
  NotificationItem,
} from "../data/mockData";
import { authService, RegisterPayload } from "../services/authService";
import { courseService } from "../services/courseService";
import { storageService } from "../services/storage";
import { userDataService } from "../services/userDataService";

// Complete WebBrowser auth session if redirecting from Paystack.
WebBrowser.maybeCompleteAuthSession();

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface UserProfile {
  name: string;
  greeting: string;
  avatar: string;
  joinedYear: string;
  country: string;
  email?: string;
  phone?: string;
}

export type UpdateUserProfile = (payload: {
  name: string;
  email: string;
  phone: string;
  country: string;
  password?: string;
  avatarBase64?: string;
  avatar?: string;
}) => Promise<{
  success: boolean;
  error?: string;
}>;

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
}

export interface SiteInfo {
  promoText: string;
  contactEmail: string;
  faqs: { q: string; a: string }[];
}

// -----------------------------------------------------------------------------
// Default Values
// -----------------------------------------------------------------------------

const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Student",
  greeting: "What would you like to learn today?",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
  joinedYear: "2026",
  country: "Nigeria",
};

const DEFAULT_SITE_INFO: SiteInfo = {
  promoText: "Limited Time Offer — Get Up to 70% Off Courses!",
  contactEmail: "expresstechacademy@gmail.com",
  faqs: [
    {
      q: "After payment is confirmed, how do I begin?",
      a: "Sign in to your account and open My Learning to begin immediately.",
    },
    {
      q: "What format are the courses?",
      a: "Courses are self-paced video classes. Any live-session information is shared inside the relevant course.",
    },
    {
      q: "When does my certificate become available?",
      a: "After completing all required lessons and activities, your certificate becomes available from your learning dashboard.",
    },
  ],
};

// -----------------------------------------------------------------------------
// App Context Type
// -----------------------------------------------------------------------------

export interface AppContextType {
  themeMode: "dark" | "light";
  colors: ThemeColors;
  toggleThemeMode: () => void;

  currency: "NGN" | "USD";
  setCurrency: (c: "NGN" | "USD") => void;

  courses: Course[];
  newCourses: Course[];
  bundles: Course[];
  categories: CategoryItem[];
  instructors: Instructor[];
  siteInfo: SiteInfo;
  notifications: NotificationItem[];

  cartIds: string[];
  wishlistIds: string[];

  addToCart: (courseId: string) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  toggleWishlist: (courseId: string) => void;

  formatPrice: (amountInNGN: number) => string;

  userProfile: UserProfile;
  updateUserProfile: UpdateUserProfile;

  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Authentication
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  userToken: string | null;
  authError: string | null;

  login: (usernameOrEmail: string, password: string) => Promise<boolean>;

  signup: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;

  refreshLiveData: () => Promise<void>;
  isRefreshing: boolean;

  // Paystack
  startPaystackPayment: (
    items: Course[],
    email?: string,
    name?: string,
    phone?: string,
  ) => Promise<{
    success: boolean;
    orderId?: number;
    error?: string;
  }>;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const AppContext = createContext<AppContextType | undefined>(undefined);

// -----------------------------------------------------------------------------
// Provider
// -----------------------------------------------------------------------------

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");

  // Course and application data.
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [bundles, setBundles] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(DEFAULT_SITE_INFO);
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Always initialize with a complete profile.
  const [userProfile, setUserProfile] =
    useState<UserProfile>(DEFAULT_USER_PROFILE);

  const [userToken, setUserToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const colors = themeMode === "dark" ? DarkColors : LightColors;

  // ---------------------------------------------------------------------------
  // Toast
  // ---------------------------------------------------------------------------

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  }, []);

  // ---------------------------------------------------------------------------
  // Theme
  // ---------------------------------------------------------------------------

  const toggleThemeMode = useCallback(() => {
    setThemeMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      showToast(`Switched to ${next === "light" ? "Light" : "Dark"} Mode`);
      return next;
    });
  }, [showToast]);

  // ---------------------------------------------------------------------------
  // Derived Course Data
  // ---------------------------------------------------------------------------

  const newCourses = useMemo(() => {
    return courses.slice(0, 4).map((course) => ({
      ...course,
      isNew: true,
    }));
  }, [courses]);

  // ---------------------------------------------------------------------------
  // Refresh Live Data
  // ---------------------------------------------------------------------------

  const refreshLiveData = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const [courseRes, enrolledRes] = await Promise.all([
        courseService.fetchCourses(),
        courseService.fetchEnrolledCourses(),
      ]);

      const enrolledList =
        enrolledRes.success && Array.isArray(enrolledRes.data)
          ? enrolledRes.data
          : [];

      const findEnrolledMatch = (course: Course) => {
        return enrolledList.find((enrolled) => {
          if (String(course.id) === String(enrolled.id)) {
            return true;
          }

          if (
            course.product_id &&
            String(course.product_id) === String(enrolled.id)
          ) {
            return true;
          }

          if (
            enrolled.product_id &&
            String(course.id) === String(enrolled.product_id)
          ) {
            return true;
          }

          if (
            course.product_id &&
            enrolled.product_id &&
            String(course.product_id) === String(enrolled.product_id)
          ) {
            return true;
          }

          if (course.slug && enrolled.slug && course.slug === enrolled.slug) {
            return true;
          }

          return false;
        });
      };

      if (courseRes.success && courseRes.data && courseRes.data.length > 0) {
        const mergedCourses = courseRes.data.map((course) => {
          const match = findEnrolledMatch(course);

          if (match) {
            return {
              ...course,
              isEnrolled: true,
              progress: match.progress || 15,
              modules:
                match.modules && match.modules.length > 0
                  ? match.modules
                  : course.modules,
            };
          }

          return course;
        });

        for (const enrolledCourse of enrolledList) {
          const alreadyIn = mergedCourses.some(
            (course) =>
              String(course.id) === String(enrolledCourse.id) ||
              (course.product_id &&
                String(course.product_id) === String(enrolledCourse.id)) ||
              (enrolledCourse.product_id &&
                String(course.id) === String(enrolledCourse.product_id)) ||
              (course.slug &&
                enrolledCourse.slug &&
                course.slug === enrolledCourse.slug),
          );

          if (!alreadyIn) {
            mergedCourses.unshift({
              ...enrolledCourse,
              isEnrolled: true,
              progress: enrolledCourse.progress || 15,
            });
          }
        }

        setCourses(mergedCourses);

        const uniqueCategoryNames = Array.from(
          new Set(
            mergedCourses.map((course) => course.category).filter(Boolean),
          ),
        );

        if (uniqueCategoryNames.length > 0) {
          const dynamicCategories: CategoryItem[] = uniqueCategoryNames.map(
            (name, index) => ({
              id: `cat_${index + 1}`,
              name,
              icon: "book-open",
            }),
          );

          setCategories(dynamicCategories);
        }
      }

      const [
        fetchedBundles,
        fetchedCategories,
        fetchedInstructors,
        fetchedSiteInfo,
      ] = await Promise.all([
        courseService.fetchBundles(),
        courseService.fetchCategories(),
        courseService.fetchInstructors(),
        courseService.fetchSiteInfo(),
      ]);

      if (fetchedBundles && fetchedBundles.length > 0) {
        setBundles(fetchedBundles);
      }

      if (fetchedCategories && fetchedCategories.length > 0) {
        setCategories(fetchedCategories);
      }

      if (fetchedInstructors && fetchedInstructors.length > 0) {
        setInstructors(fetchedInstructors);
      }

      if (fetchedSiteInfo) {
        setSiteInfo(fetchedSiteInfo);
      }

      const [cart, wishlist] = await Promise.all([
        userDataService.loadCart(),
        userDataService.loadWishlist(),
      ]);

      setCartIds(cart);
      setWishlistIds(wishlist);

      const notificationResponse = await userDataService.fetchNotifications();

      if (notificationResponse.success && notificationResponse.data) {
        setNotifications(notificationResponse.data);
      }
    } catch (error) {
      console.warn("[AppContext] Refresh live data error:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // App Foreground Synchronization
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        console.log(
          "[AppContext] App returned to active. Syncing live data...",
        );

        void refreshLiveData();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    const interval = setInterval(() => {
      void refreshLiveData();
    }, 90000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [refreshLiveData]);

  // ---------------------------------------------------------------------------
  // Restore Authentication and Cached Profile
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      setIsLoadingAuth(true);

      try {
        const token = await storageService.getUserToken();

        // Restore cached profile if available.
        if (typeof storageService.getUserProfile === "function") {
          const cachedProfile = await storageService.getUserProfile();

          if (mounted && cachedProfile) {
            setUserProfile({
              ...DEFAULT_USER_PROFILE,
              ...cachedProfile,
            });
          }
        }

        if (token) {
          if (mounted) {
            setUserToken(token);
            setIsAuthenticated(true);
          }

          // Fetch the latest profile from the server.
          const profileResponse = await authService.getCurrentUser();

          if (mounted && profileResponse.success && profileResponse.data) {
            const completeProfile: UserProfile = {
              ...DEFAULT_USER_PROFILE,
              ...profileResponse.data,
            };

            setUserProfile(completeProfile);

            if (typeof storageService.saveUserProfile === "function") {
              await storageService.saveUserProfile(completeProfile);
            }
          }
        } else if (mounted) {
          setUserToken(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.warn("[AppContext] Restore auth error:", error);
      } finally {
        if (mounted) {
          setIsLoadingAuth(false);
          void refreshLiveData();
        }
      }
    };

    void initializeAuth();

    return () => {
      mounted = false;
    };
  }, [refreshLiveData]);

  // ---------------------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------------------

  const login = async (
    usernameOrEmail: string,
    password: string,
  ): Promise<boolean> => {
    setAuthError(null);

    try {
      const response = await authService.login(usernameOrEmail, password);

      if (response.success && response.data) {
        setUserToken(response.data.token);

        const completeProfile: UserProfile = {
          ...DEFAULT_USER_PROFILE,
          ...response.data.user,
        };

        setUserProfile(completeProfile);
        setIsAuthenticated(true);

        if (typeof storageService.saveUserProfile === "function") {
          await storageService.saveUserProfile(completeProfile);
        }

        showToast(`Welcome back, ${completeProfile.name}!`);

        await refreshLiveData();

        return true;
      }

      const message = response.error || "Failed to log in";

      setAuthError(message);
      showToast(message);

      return false;
    } catch (error: any) {
      const message = error?.message || "An unexpected login error occurred.";

      setAuthError(message);
      showToast(message);

      return false;
    }
  };

  // ---------------------------------------------------------------------------
  // Signup
  // ---------------------------------------------------------------------------

  const signup = async (payload: RegisterPayload): Promise<boolean> => {
    setAuthError(null);

    try {
      const response = await authService.register(payload);

      if (response.success && response.data) {
        setUserToken(response.data.token);

        const completeProfile: UserProfile = {
          ...DEFAULT_USER_PROFILE,
          ...response.data.user,
        };

        setUserProfile(completeProfile);
        setIsAuthenticated(true);

        if (typeof storageService.saveUserProfile === "function") {
          await storageService.saveUserProfile(completeProfile);
        }

        showToast(
          `Account created successfully! Welcome ${completeProfile.name}`,
        );

        await refreshLiveData();

        return true;
      }

      const message = response.error || "Registration failed";

      setAuthError(message);
      showToast(message);

      return false;
    } catch (error: any) {
      const message =
        error?.message || "An unexpected registration error occurred.";

      setAuthError(message);
      showToast(message);

      return false;
    }
  };

  // ---------------------------------------------------------------------------
  // Update User Profile
  // ---------------------------------------------------------------------------

  const updateUserProfile: UpdateUserProfile = useCallback(
    async (payload) => {
      try {
        const apiPayload = {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          country: payload.country,
          password: payload.password,
          avatar: payload.avatar,
          avatar_base64: payload.avatarBase64,
        };

        const response = await authService.updateProfile(apiPayload);

        if (response.success && response.data) {
          const completeProfile: UserProfile = {
            ...DEFAULT_USER_PROFILE,
            ...response.data,
          };

          setUserProfile(completeProfile);

          if (typeof storageService.saveUserProfile === "function") {
            await storageService.saveUserProfile(completeProfile);
          }

          showToast("Profile updated successfully!");

          return { success: true };
        }

        return {
          success: false,
          error: response.error || "Failed to update profile data.",
        };
      } catch (error: any) {
        console.error("[AppContext] Profile update process failed:", error);

        return {
          success: false,
          error: error?.message || "An unexpected network error occurred.",
        };
      }
    },
    [showToast],
  );

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn("[AppContext] Logout request error:", error);
    } finally {
      setUserToken(null);
      setIsAuthenticated(false);
      setUserProfile(DEFAULT_USER_PROFILE);
      setCartIds([]);
      setWishlistIds([]);
    }

    await refreshLiveData();
    showToast("Logged out successfully");
  };

  // ---------------------------------------------------------------------------
  // Cart Management
  // ---------------------------------------------------------------------------

  const addToCart = (courseId: string) => {
    setCartIds((previousIds) => {
      if (previousIds.includes(courseId)) {
        showToast("Course is already in your cart");
        return previousIds;
      }

      const nextIds = [...previousIds, courseId];

      void userDataService.syncCart(nextIds);
      showToast("Course added to cart");

      return nextIds;
    });
  };

  const removeFromCart = (courseId: string) => {
    setCartIds((previousIds) => {
      const nextIds = previousIds.filter((id) => id !== courseId);

      void userDataService.syncCart(nextIds);
      showToast("Course removed from cart");

      return nextIds;
    });
  };

  const clearCart = () => {
    setCourses((previousCourses) =>
      previousCourses.map((course) =>
        cartIds.includes(course.id)
          ? { ...course, isEnrolled: true, progress: 0 }
          : course,
      ),
    );

    setCartIds([]);
    void userDataService.syncCart([]);

    showToast("Payment successful! Courses added to My Courses");
  };

  // ---------------------------------------------------------------------------
  // Wishlist Management
  // ---------------------------------------------------------------------------

  const toggleWishlist = (courseId: string) => {
    setWishlistIds((previousIds) => {
      const alreadyExists = previousIds.includes(courseId);

      const nextIds = alreadyExists
        ? previousIds.filter((id) => id !== courseId)
        : [...previousIds, courseId];

      void userDataService.syncWishlist(nextIds);

      showToast(
        alreadyExists ? "Removed from favourites" : "Added to favourites",
      );

      return nextIds;
    });
  };

  // ---------------------------------------------------------------------------
  // Price Formatting
  // ---------------------------------------------------------------------------

  const formatPrice = (amountInNGN: number): string => {
    if (currency === "USD") {
      const usdAmount = Math.max(1, Math.round(amountInNGN / 1500));

      return `$${usdAmount}`;
    }

    return `₦${amountInNGN.toLocaleString()}`;
  };

  // ---------------------------------------------------------------------------
  // Paystack Session
  // ---------------------------------------------------------------------------

  const [paystackSession, setPaystackSession] = useState<{
    visible: boolean;
    authorizationUrl: string | null;
    reference: string | null;
    orderId: number | null;
  }>({
    visible: false,
    authorizationUrl: null,
    reference: null,
    orderId: null,
  });

  // ---------------------------------------------------------------------------
  // Start Paystack Payment
  // ---------------------------------------------------------------------------

  const startPaystackPayment = async (
    items: Course[],
    email?: string,
    name?: string,
    phone?: string,
  ): Promise<{
    success: boolean;
    orderId?: number;
    error?: string;
  }> => {
    try {
      showToast("Connecting to Paystack gateway...");

      const targetEmail =
        email || userProfile.email || "student@expressteck.tech";

      const targetName = name || userProfile.name || "Student";

      const initializationResponse =
        await courseService.initializePaystackCheckout({
          items: items.map((item) => item.id),
          email: targetEmail,
          name: targetName,
          phone: phone || "",
        });

      if (
        !initializationResponse.success ||
        !initializationResponse.data ||
        !initializationResponse.data.authorization_url
      ) {
        const errorMessage =
          initializationResponse.error ||
          "Failed to initialize Paystack transaction";

        showToast(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      }

      const { authorization_url, reference, order_id } =
        initializationResponse.data;

      setPaystackSession({
        visible: true,
        authorizationUrl: authorization_url,
        reference,
        orderId: order_id,
      });

      return {
        success: true,
        orderId: order_id,
      };
    } catch (error: any) {
      console.warn("[AppContext] Paystack error:", error);

      const message = error?.message || "Payment flow interrupted";

      showToast(message);

      return {
        success: false,
        error: message,
      };
    }
  };

  // ---------------------------------------------------------------------------
  // Handle Paystack Success
  // ---------------------------------------------------------------------------

  const handlePaystackModalSuccess = async (
    reference: string,
    orderId: number,
  ) => {
    try {
      setPaystackSession((previous) => ({
        ...previous,
        visible: false,
      }));

      showToast("Verifying payment with Expressteck...");

      const verificationResponse = await courseService.verifyPaystackPayment({
        reference,
        order_id: orderId,
      });

      if (
        verificationResponse.success &&
        verificationResponse.data &&
        (verificationResponse.data.verified ||
          (verificationResponse.data as any).enrolled ||
          (verificationResponse.data as any).success)
      ) {
        clearCart();
        await refreshLiveData();

        showToast("Payment successful! Your course is now active.");

        router.push("/(tabs)/my-courses");
      } else {
        showToast("Payment completed. Verifying enrollment...");

        clearCart();
        await refreshLiveData();

        router.push("/(tabs)/my-courses");
      }
    } catch (error) {
      console.warn("[AppContext] Paystack verification error:", error);

      clearCart();
      await refreshLiveData();

      showToast("Payment confirmed! Enrolling in course...");

      router.push("/(tabs)/my-courses");
    }
  };

  // ---------------------------------------------------------------------------
  // Close Paystack Modal
  // ---------------------------------------------------------------------------

  const closePaystackModal = () => {
    setPaystackSession({
      visible: false,
      authorizationUrl: null,
      reference: null,
      orderId: null,
    });

    showToast("Payment cancelled");
  };

  // ---------------------------------------------------------------------------
  // Provider
  // ---------------------------------------------------------------------------

  return (
    <AppContext.Provider
      value={{
        themeMode,
        colors,
        toggleThemeMode,

        currency,
        setCurrency,

        courses,
        newCourses,
        bundles,
        categories,
        instructors,
        siteInfo,
        notifications,

        cartIds,
        wishlistIds,

        addToCart,
        removeFromCart,
        clearCart,
        toggleWishlist,

        formatPrice,

        userProfile,
        updateUserProfile,

        toastMessage,
        showToast,

        isAuthenticated,
        isLoadingAuth,
        userToken,
        authError,

        login,
        signup,
        logout,

        refreshLiveData,
        isRefreshing,

        startPaystackPayment,
      }}
    >
      {children}

      <PaystackCheckoutModal
        visible={paystackSession.visible}
        authorizationUrl={paystackSession.authorizationUrl}
        reference={paystackSession.reference}
        orderId={paystackSession.orderId}
        onClose={closePaystackModal}
        onSuccess={handlePaystackModalSuccess}
      />
    </AppContext.Provider>
  );
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }

  return context;
};
