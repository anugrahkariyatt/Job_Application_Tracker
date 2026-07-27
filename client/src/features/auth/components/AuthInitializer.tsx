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
  "/about",
  "/contact",
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

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );

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

    if (isAuthenticated) {
      // Authenticated users accessing auth forms get redirected to their dashboard
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
      // Unauthenticated users accessing private pages get redirected to login
      if (!isPublic) {
        router.push("/login");
      }
    }
  }, [initialized, isAuthenticated, pathname, router, isPublic, user?.role]);

  // FIX: Do NOT block rendering on public routes!
  // Only show the full-screen loader on private/protected routes while verifying auth state.
  if (!initialized && !isPublic) {
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