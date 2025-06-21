import crypto from "crypto";
import {
  MessageModel,
  ThreadModel,
  UserRole,
  type IUser,
} from "@justchat/database";

import { userService } from "./db/user.server";
import { verificationService } from "./db/verification.server";
import { emailService } from "./email.server";
import {
  commitSession,
  destroySession,
  getSession,
  getUserSession,
} from "./sessionStorage.server";
import { redirect } from "react-router";
import { magicLinkPath, magicLinkVerifyPath } from "~/utils/pathBuilder";
import { env } from "~/env.server";

class AuthService {
  #hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  async createUserSession(userId: string, redirectTo = "/") {
    const session = await getSession();
    session.set("userId", userId);

    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  async initiateLogin(email: string, guestSessionId?: string) {
    let user = await userService.findOne({ email });

    if (!user) {
      user = await userService.create({ email });
    }

    const token = crypto.randomUUID();

    const verification = await verificationService.create({
      identifier: email,
      token: this.#hashToken(token),
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Build magic link URL with guest session ID if provided
    let magicLinkUrl = `${env.APP_URL}${magicLinkVerifyPath(token, email)}`;
    if (guestSessionId) {
      magicLinkUrl += `&guestSessionId=${guestSessionId}`;
    }

    // TODO: Use queue and add rate limiter
    await emailService.sendMagicLink(email, magicLinkUrl, "10");

    return {
      success: true,
      message: "Magic link sent to email",
    };
  }

  async verifyLogin(token: string) {
    const hashedToken = this.#hashToken(token);
    const verification = await verificationService.findOne({
      token: hashedToken,
    });

    if (!verification) {
      return { success: false, message: "Invalid token" };
    }

    if (verification.expires_at < new Date()) {
      return { success: false, message: "Token expired" };
    }

    const user = await userService.findOne({ email: verification.identifier });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    await verificationService.delete({ _id: verification._id });

    return { success: true, message: "Token verified", user };
  }

  async logout(request: Request) {
    const session = await getUserSession(request);

    if (session) {
      await destroySession(session);
    }

    return {
      success: true,
      message: "User logged out",
    };
  }

  async getUser(request: Request) {
    const session = await getUserSession(request);

    if (!session) {
      return null;
    }

    const user = await userService.findOne({ _id: session.get("userId") });

    if (!user) {
      return null;
    }

    return user;
  }

  async requireUser(request: Request, redirectTo?: string) {
    const user = await this.getUser(request);

    if (!user) {
      throw redirect(redirectTo || magicLinkPath());
    }

    return user;
  }

  async requireAdmin(request: Request, redirectTo?: string) {
    const user = await this.requireUser(request, redirectTo);

    if (user.role !== UserRole.ADMIN) {
      throw redirect(redirectTo || magicLinkPath());
    }

    return user;
  }

  async syncGuestChatsToUser(guestSessionId: string, userId: string) {
    if (!guestSessionId || !userId) return;

    // Update messages
    await MessageModel.updateMany(
      { guestSessionId },
      { $set: { user: userId }, $unset: { guestSessionId: "" } }
    );

    // Update threads (if you store guestSessionId on threads)
    await ThreadModel.updateMany(
      { guestSessionId },
      { $set: { user: userId }, $unset: { guestSessionId: "" } }
    );
  }
}

export const authService = new AuthService();
