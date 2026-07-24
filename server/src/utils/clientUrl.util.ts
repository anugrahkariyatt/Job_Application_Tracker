import { Request } from "express";

export const getClientUrl = (req?: Request | string): string => {
  if (typeof req === "string" && req.trim()) {
    return req.trim().replace(/\/$/, "");
  }

  const expressReq = req as Request | undefined;

  if (expressReq) {
    const origin = expressReq.get("origin");
    if (origin && typeof origin === "string" && origin.trim()) {
      const trimmedOrigin = origin.trim().replace(/\/$/, "");
      if (
        process.env.NODE_ENV !== "production" ||
        (!trimmedOrigin.includes("localhost") && !trimmedOrigin.includes("127.0.0.1"))
      ) {
        return trimmedOrigin;
      }
    }

    const referer = expressReq.get("referer");
    if (referer && typeof referer === "string" && referer.trim()) {
      try {
        const url = new URL(referer);
        const originFromReferer = url.origin.replace(/\/$/, "");
        if (
          process.env.NODE_ENV !== "production" ||
          (!originFromReferer.includes("localhost") && !originFromReferer.includes("127.0.0.1"))
        ) {
          return originFromReferer;
        }
      } catch {
      }
    }
  }

  if (process.env.CLIENT_URL) {
    const envUrl = process.env.CLIENT_URL.trim().replace(/\/$/, "");
    if (
      process.env.NODE_ENV === "production" &&
      (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))
    ) {
      return "https://job-application-tracker-azure-eight.vercel.app";
    }
    return envUrl;
  }

  if (process.env.NODE_ENV === "production") {
    return "https://job-application-tracker-azure-eight.vercel.app";
  }

  return "http://localhost:3000";
};
