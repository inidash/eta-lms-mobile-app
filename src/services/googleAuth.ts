import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import * as SecureStore from "expo-secure-store";

// Replace with your actual WordPress API URL.
const API_URL = "https://expressteck.tech/wp-json/lms/v1/google-auth";

// Use the WEB OAuth client ID, not the Android client ID.
const WEB_CLIENT_ID = "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com";

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
});

export interface GoogleAuthResult {
  token: string;
  user: {
    id?: number | string;
    name?: string;
    email?: string;
    avatar?: string;
  };
}

export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  try {
    await GoogleSignin.hasPlayServices();

    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) {
      throw new Error("Google sign-in was cancelled.");
    }

    const idToken = response.data.idToken;

    if (!idToken) {
      throw new Error("Google did not return an ID token.");
    }

    // Exchange the Google ID token for your WordPress JWT.
    const apiResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        id_token: idToken,
      }),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      throw new Error(
        data.message || "Unable to authenticate with your LMS."
      );
    }

    // Adjust these fields to match your WordPress endpoint response.
    const jwt = data.token;

    if (!jwt || typeof jwt !== "string") {
      throw new Error("The server did not return a valid JWT.");
    }

    // Store the WordPress JWT securely.
    await SecureStore.setItemAsync("auth_token", jwt);

    return {
      token: jwt,
      user: {
        id: data.user?.id,
        name: data.user?.name,
        email: data.user?.email,
        avatar: data.user?.avatar,
      },
    };
  } catch (error) {
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error("Google sign-in is already in progress.");
      }

      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Google Play Services is unavailable.");
      }
    }

    throw error;
  }
}