/**
 * Simple guest session management
 */

class GuestSessionClient {
  private readonly SESSION_ID_KEY = "guestSessionId";
  private readonly COOKIE_NAME = "guestSessionId";

  /**
   * Get or create a guest session ID
   */
  getGuestSessionId(): string {
    let sessionId = localStorage.getItem(this.SESSION_ID_KEY);

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(this.SESSION_ID_KEY, sessionId);
    }

    // Also set as cookie for server-side access
    this.setCookie(this.COOKIE_NAME, sessionId, 30);

    return sessionId;
  }

  /**
   * Set a cookie
   */
  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }

  /**
   * Check if user has guest session
   */
  hasGuestSession(): boolean {
    return !!localStorage.getItem(this.SESSION_ID_KEY);
  }

  /**
   * Clear guest session
   */
  clearGuestSession(): void {
    localStorage.removeItem(this.SESSION_ID_KEY);
    // Also clear the cookie
    document.cookie = `${this.COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }

  /**
   * Get debug info for testing
   */
  getDebugInfo() {
    return {
      hasSession: this.hasGuestSession(),
      sessionId: this.getGuestSessionId(),
      localStorage: {
        guestSessionId: localStorage.getItem(this.SESSION_ID_KEY),
      },
      cookies: document.cookie,
    };
  }
}

export const guestSessionClient = new GuestSessionClient();
