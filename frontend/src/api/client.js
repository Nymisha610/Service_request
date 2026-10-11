import { API_BASE_URL } from "../config";

export class ApiError extends Error {
  constructor(message, { status = 0, code = "unknown", fields = {} } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

/** Small fetch wrapper: JSON in, JSON out, and every failure becomes an ApiError. */
export async function request(path, options = {}) {
  const headers = { Accept: "application/json", ...options.headers };
  if (options.body) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      "Cannot reach the server. Check your connection and try again in a moment.",
      { code: "network_error" }
    );
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // Non-JSON body (e.g. an HTML error page from a proxy). Handled below.
  }

  if (!response.ok) {
    const apiError = payload?.error;
    const fallback =
      response.status >= 500
        ? `The server is having trouble right now (error ${response.status}). Please try again in a moment.`
        : `The request was rejected (error ${response.status}).`;
    throw new ApiError(apiError?.message || fallback, {
      status: response.status,
      code: apiError?.code,
      fields: apiError?.fields,
    });
  }

  if (payload === null) {
    throw new ApiError("The server sent a response we could not read.", {
      status: response.status,
      code: "invalid_response",
    });
  }
  return payload;
}
