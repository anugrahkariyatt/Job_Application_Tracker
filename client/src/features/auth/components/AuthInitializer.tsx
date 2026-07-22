"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser } from "../api/auth.api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearUser,
  setInitialized,
  setLoading,
  setUser,
} from "@/store/slices/authSlice";
import { Loader2 } from "lucide-react";

interface AuthInitializerProps {
  children: React.ReactNode;
}

const PUBLIC_PATHS = [
  "/",
  "/pricing",
  "/login",
  "/register",
  "/register/candidate",
  "/register/recruiter",
  "/test",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export default function AuthInitializer({ children }: AuthInitializerProps) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const initialized = useAppSelector((state) => state.auth.initialized);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch(setLoading(true));
        const response = await getCurrentUser();
        if (response.success && response.user) {
          dispatch(setUser(response.user));
        } else {
          dispatch(clearUser());
        }
      } catch {
        dispatch(clearUser());
      } finally {
        dispatch(setLoading(false));
        dispatch(setInitialized(true));
      }
    };

    initializeAuth();
  }, [dispatch]);

  useEffect(() => {
    if (!initialized) return;

    const isPublic = PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(path + "/"),
    );
    if (isAuthenticated) {
      // Authenticated users shouldn't see login or registration pages
      if (
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/register/candidate" ||
        pathname === "/register/recruiter"
      ) {
        if (user?.role === "candidate") {
          router.push("/candidate");
        } else if (user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/recruiter/dashboard");
        }
      }
    } else {
      // Unauthenticated users trying to access private dashboard pages are redirected
      if (!isPublic) {
        router.push("/login");
      }
    }
  }, [initialized, isAuthenticated, pathname, router]);

  // Show a full screen loading indicator during authentication checks to prevent flicker
  if (!initialized || (isLoading && !isAuthenticated)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Loading your session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
