import { get, post } from "./client";

export function login(payload) {
  return post("/api/auth/login", payload, undefined, { auth: false });
}

export function register(payload) {
  return post("/api/auth/register", payload, undefined, { auth: false });
}

export function getCurrentUser() {
  return get("/api/auth/me");
}
