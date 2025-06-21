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
   * Sync guest session to user account
   */
  async syncToUser(
    userId: string
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const sessionId = this.getGuestSessionId();

    try {
      const response = await fetch("/api/guest/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestSessionId: sessionId,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Clear guest session data after successful sync
        this.clearGuestSession();
      }

      return result;
    } catch (error) {
      console.error("Error syncing guest session:", error);
      return {
        success: false,
        message: "Failed to sync guest session",
      };
    }
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
