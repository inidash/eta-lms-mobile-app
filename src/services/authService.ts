import { GOOGLE_WEB_CLIENT_ID } from "@/config/googleAuth";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { API_CONFIG } from "../config/apiConfig";
import { UserProfile } from "../context/AppContext";
import { apiClient, ApiResponse } from "./apiClient";
import { storageService } from "./storage";

export interface LoginResult {
  token: string;
  user: UserProfile;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  country?: string;
}

type WordPressUser = {
  id?: string | number;
  name?: string;
  display_name?: string;
  greeting?: string;
  avatar?: string;
  avatar_url?: string;
  joinedYear?: string;
  country?: string;
  email?: string;
  phone?: string;
};

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop";

const toUserProfile = (
  user: WordPressUser | undefined,
  fallbackEmail?: string,
): UserProfile => ({
  id: user?.id,
  name: user?.name || user?.display_name || fallbackEmail || "Student",
  greeting: user?.greeting || "What would you like to learn today?",
  avatar: user?.avatar || user?.avatar_url || DEFAULT_AVATAR,
  joinedYear: user?.joinedYear || new Date().getFullYear().toString(),
  country: user?.country || "Nigeria",
  email: user?.email || fallbackEmail,
  phone: user?.phone,
});

const getResponseError = (res: any, fallback: string): string =>
  res?.error || res?.data?.message || res?.data?.data?.message || fallback;

const saveSession = async (
  token: string,
  user: WordPressUser | undefined,
  fallbackEmail?: string,
): Promise<LoginResult> => {
  const userProfile = toUserProfile(user, fallbackEmail);

  await storageService.setUserToken(token);
  await storageService.setItem(
    storageService.STORAGE_KEYS.USER_PROFILE,
    JSON.stringify(userProfile),
  );

  return { token, user: userProfile };
};

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

export const authService = {
  /**
   * Log in user with the Expressteck WordPress API.
   */
  async login(
    usernameOrEmail: string,
    password: string,
  ): Promise<ApiResponse<LoginResult>> {
    // Try the ETA API bridge endpoint first.
    let res: any = await apiClient.post(API_CONFIG.ENDPOINTS.LOGIN, {
      username: usernameOrEmail,
      password,
    });

    // Fall back to the JWT plugin endpoint if the bridge endpoint is missing.
    if (!res.success && res.statusCode === 404) {
      res = await apiClient.post(API_CONFIG.ENDPOINTS.JWT_LOGIN_FALLBACK, {
        username: usernameOrEmail,
        password,
      });
    }

    const payload = res?.data?.data || res?.data;
    const token = payload?.token;
    const user = payload?.user;

    if (!res.success || !token) {
      return {
        success: false,
        error: getResponseError(
          res,
          "Invalid credentials or failed to log in.",
        ),
      };
    }

    const result = await saveSession(
      token,
      user,
      usernameOrEmail.includes("@") ? usernameOrEmail : undefined,
    );

    return { success: true, data: result };
  },

  /**
   * Sign in with Google.
   * The WordPress endpoint must verify the Google ID token and return
   * a WordPress token and user profile.
   */

  async googleLogin(): Promise<ApiResponse<LoginResult>> {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response: any = await GoogleSignin.signIn();

      // Handle cancellation and both current and older package response shapes.
      if (response?.type === "cancelled" || response?.type === "canceled") {
        return {
          success: false,
          error: "Google sign-in was cancelled.",
        };
      }

      const googleData = response?.data || response;
      const idToken = googleData?.idToken;

      if (!idToken) {
        return {
          success: false,
          error:
            "Google did not return an ID token. Check your Google Sign-In configuration.",
        };
      }

      // API_CONFIG.ENDPOINTS.GOOGLE_AUTH should point to your WordPress
      // endpoint, e.g. /wp-json/eta/v1/google-auth.
      const res: any = await apiClient.post(API_CONFIG.ENDPOINTS.GOOGLE_AUTH, {
        id_token: idToken,
      });

      const payload = res?.data?.data || res?.data;
      const token = payload?.token;
      const user = payload?.user;

      if (!res.success || !token) {
        return {
          success: false,
          error: getResponseError(
            res,
            "Google sign-in failed. Please try again.",
          ),
        };
      }

      const googleUser = googleData?.user;
      const result = await saveSession(
        token,
        user || {
          name: googleUser?.name,
          email: googleUser?.email,
          avatar: googleUser?.photo,
        },
        googleUser?.email,
      );

      return { success: true, data: result };
    } catch (error: any) {
      let message =
        error?.message || "Google sign-in failed. Please try again.";

      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        message = "Google sign-in was cancelled.";
      } else if (error?.code === statusCodes.IN_PROGRESS) {
        message = "Google sign-in is already in progress.";
      } else if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        message = "Google Play Services is unavailable or needs updating.";
      }

      return { success: false, error: message };
    }
  },

  /**
   * Register a new user on Expressteck WordPress, then log in.
   */
  async register(payload: RegisterPayload): Promise<ApiResponse<LoginResult>> {
    const res: any = await apiClient.post(API_CONFIG.ENDPOINTS.REGISTER, {
      name: payload.fullName,
      email: payload.email,
      password: payload.password,
      meta: {
        phone: payload.phone,
        country: payload.country,
      },
    });

    if (!res.success) {
      return {
        success: false,
        error: getResponseError(res, "Registration failed."),
      };
    }

    return this.login(payload.email, payload.password);
  },

  /**
   * Get the logged-in user's profile from WordPress.
   */
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    const res: any = await apiClient.get(API_CONFIG.ENDPOINTS.USER_PROFILE);

    if (res.success && res.data) {
      const u = res.data.data || res.data.user || res.data;
      const profile = toUserProfile(u);

      await storageService.setItem(
        storageService.STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(profile),
      );

      return { success: true, data: profile };
    }

    // Fall back to the cached profile if the request fails.
    const stored = await storageService.getItem(
      storageService.STORAGE_KEYS.USER_PROFILE,
    );

    if (stored) {
      try {
        return {
          success: true,
          data: JSON.parse(stored) as UserProfile,
        };
      } catch {
        // Ignore invalid cached JSON and return the API error below.
      }
    }

    return {
      success: false,
      error: getResponseError(res, "Failed to load user profile."),
    };
  },

  /**
   * Update the logged-in user's profile.
   */
  async updateProfile(payload: {
    name?: string;
    email?: string;
    phone?: string;
    country?: string;
    // password?: string;
    avatar?: string;
    avatar_base64?: string;
  }): Promise<ApiResponse<UserProfile>> {
    const res: any = await apiClient.post(
      API_CONFIG.ENDPOINTS.UPDATE_PROFILE,
      payload,
    );

    if (!res.success) {
      return {
        success: false,
        error: getResponseError(res, "Failed to update profile."),
      };
    }

    const u = res.data?.data || res.data?.user || res.data;
    const profile = toUserProfile(u);

    await storageService.setItem(
      storageService.STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(profile),
    );

    return { success: true, data: profile };
  },

  /**
   * Request a 6-digit password-reset code by email.
   */
  async forgotPassword(
    email: string,
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const res: any = await apiClient.post(
      API_CONFIG.ENDPOINTS.FORGOT_PASSWORD,
      { email },
    );

    if (res.success) {
      return {
        success: true,
        message: res.data?.message || "Verification code sent.",
      };
    }

    return {
      success: false,
      error: getResponseError(res, "Failed to send reset code."),
    };
  },

  /**
   * Verify a 6-digit password-reset code.
   */
  async verifyResetCode(
    email: string,
    code: string,
  ): Promise<{ success: boolean; error?: string }> {
    const res: any = await apiClient.post(
      API_CONFIG.ENDPOINTS.VERIFY_RESET_CODE,
      { email, code },
    );

    if (res.success) {
      return { success: true };
    }

    return {
      success: false,
      error: getResponseError(res, "Invalid verification code."),
    };
  },

  /**
   * Reset password and save the returned session if the endpoint auto-logs in.
   */
  async resetPassword(
    email: string,
    code: string,
    password: string,
  ): Promise<{
    success: boolean;
    token?: string;
    user?: UserProfile;
    error?: string;
  }> {
    const res: any = await apiClient.post(API_CONFIG.ENDPOINTS.RESET_PASSWORD, {
      email,
      code,
      password,
    });

    const payload = res?.data?.data || res?.data;

    if (res.success && payload?.token) {
      const result = await saveSession(payload.token, payload.user, email);
      return {
        success: true,
        token: result.token,
        user: result.user,
      };
    }

    return {
      success: false,
      error: getResponseError(res, "Failed to reset password."),
    };
  },

  /**
   * Log out user and clear the local session.
   */
  async logout(): Promise<void> {
    await storageService.clearUserSession();
  },
};
