import { request } from "./client";
import { toApiPayload } from "../utils/payload";

export function getHealth() {
  return request("/api/health");
}

export async function fetchServiceRequests() {
  const payload = await request("/api/requests");
  return payload.data;
}

export function createServiceRequest(form) {
  return request("/api/requests", {
    method: "POST",
    body: JSON.stringify(toApiPayload(form)),
  });
}
