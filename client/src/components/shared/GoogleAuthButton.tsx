"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { googleAuth } from "@/features/auth/api/auth.api";
import { cn } from "@/lib/utils";

interface GoogleAuthButtonProps {
  role: "candidate" | "recruiter";
  text?: string;
  className?: string;
  onSuccessRedirect?: string;
}

export function GoogleAuthButton({
  role,
  text = "Continue with Google",
  className,
  onSuccessRedirect,
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await googleAuth({
          accessToken: tokenResponse.access_token,
          role,
        });

        toast.success(response.message);
        dispatch(setUser(response.user));

        if (onSuccessRedirect) {
          router.push(onSuccessRedirect);
        } else if (response.user.role === "candidate") {
          router.push("/candidate");
        } else if (response.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/recruiter/dashboard");
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Google authentication failed.",
        );
      }
    },
    onError: () => {
      toast.error("Google authentication failed.");
    },
  });

  return (
    <button
      type="button"
      onClick={() => handleGoogleLogin()}
      className={cn(
        "flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 font-medium text-foreground transition hover:bg-accent cursor-pointer shadow-xs",
        className,
      )}
    >
      <FcGoogle size={22} />
      {text}
    </button>
  );
}

export default GoogleAuthButton;
