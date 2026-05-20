import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  accessToken: string | null;
  user: AuthUser | null;
}

const AUTH_KEY = "dev-hube-admin-auth";

function loadAuth(): AuthState {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, email: null, accessToken: null, user: null };
  }
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return { isAuthenticated: false, email: null, accessToken: null, user: null };
    const parsed = JSON.parse(raw) as {
      email?: string;
      accessToken?: string;
      apiKey?: string;
      user?: AuthUser | null;
    };
    const token = parsed.accessToken ?? parsed.apiKey ?? null;
    return {
      isAuthenticated: Boolean(token),
      email: parsed.email ?? parsed.user?.email ?? null,
      accessToken: token,
      user: parsed.user ?? null,
    };
  } catch {
    return { isAuthenticated: false, email: null, accessToken: null, user: null };
  }
}

const initialState: AuthState = {
  isAuthenticated: false,
  email: null,
  accessToken: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(
      state,
      action: PayloadAction<{ email: string; accessToken: string; user: AuthUser }>,
    ) {
      state.isAuthenticated = true;
      state.email = action.payload.email;
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      if (typeof window !== "undefined") {
        localStorage.setItem(
          AUTH_KEY,
          JSON.stringify({
            email: state.email,
            accessToken: state.accessToken,
            user: state.user,
          }),
        );
      }
    },
    logout(state) {
      state.isAuthenticated = false;
      state.email = null;
      state.accessToken = null;
      state.user = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_KEY);
      }
    },
    hydrateAuth(state) {
      const next = loadAuth();
      state.isAuthenticated = next.isAuthenticated;
      state.email = next.email;
      state.accessToken = next.accessToken;
      state.user = next.user;
    },
  },
});

export const { login, logout, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
