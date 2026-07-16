"use client";

import { useEffect } from "react";
import { getCurrentUser } from "../api/auth.api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearUser,
  setInitialized,
  setLoading,
  setUser,
} from "@/store/slices/authSlice";

interface AuthInitializerProps {
  children: React.ReactNode;
}

export default function AuthInitializer({ children }: AuthInitializerProps) {

  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const initialized = useAppSelector((state) => state.auth.initialized);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  useEffect(() => {
    console.log("Auth State", {
      user,
      isAuthenticated,
      initialized,
      isLoading,
    });
  }, [user, isAuthenticated, initialized, isLoading]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch(setLoading(true));

        const response = await getCurrentUser();

        dispatch(setUser(response.user));
      } catch {
        dispatch(clearUser());
      } finally {
        dispatch(setLoading(false));
        dispatch(setInitialized(true));
      }
    };

    initializeAuth();
  }, [dispatch]);

  return <>{children}</>;
}
