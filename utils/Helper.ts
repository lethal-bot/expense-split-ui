/**
 * Retrieves the authorization token from localStorage.
 * Includes a check for `window` to prevent crashes during Next.js server-side rendering (SSR).
 */
export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

/**
 * Retrieves and parses the user object from localStorage.
 * Includes a check for `window` and handles JSON parsing exceptions gracefully.
 */
export const getUser = <T = any>(): T | null => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr) as T;
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        return null;
      }
    }
  }
  return null;
};
