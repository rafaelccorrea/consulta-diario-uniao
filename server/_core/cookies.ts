import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if ((req as Request & { protocol?: string }).protocol === "https") return true;
  const headers = (req as Request & { headers?: Record<string, string | string[] | undefined> }).headers;
  const forwardedProto = headers?.["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : String(forwardedProto).split(",");
  return protoList.some((proto: string) => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(req: Request): {
  domain?: string;
  httpOnly: boolean;
  path: string;
  sameSite: string;
  secure: boolean;
} {
  return {
    domain: undefined,
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req),
  };
}
