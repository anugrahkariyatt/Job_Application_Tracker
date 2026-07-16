"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppSelector } from "@/store/hooks";
import type { UserRole } from "@/types/auth.types";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();

  const { user, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (initialized && user && !allowedRoles.includes(user.role)) {
      router.replace("/test");
    }
  }, [initialized, user, allowedRoles, router]);

  if (!initialized) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
