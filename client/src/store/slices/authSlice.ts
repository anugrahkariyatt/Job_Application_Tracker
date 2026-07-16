import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types/auth.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },
  },
});

export const { setUser, clearUser, setLoading, setInitialized } =
  authSlice.actions;

export default authSlice.reducer;
