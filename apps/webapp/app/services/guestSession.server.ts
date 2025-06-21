import { ThreadModel, MessageModel } from "@justchat/database";
import { logger } from "@justchat/logger";

class GuestSessionService {
  /**
   * Sync all guest data to a user account
   */
  async syncGuestToUser(guestSessionId: string, userId: string) {
    if (!guestSessionId || !userId) {
      throw new Error("Guest session ID or user ID are required");
    }

    logger.info(
      `Starting sync: guest session ${guestSessionId} to user ${userId}`
    );

    try {
      // First, check if there's any guest data to sync
      const guestThreads = await ThreadModel.find({ guestSessionId });
      const guestMessages = await MessageModel.find({ guestSessionId });

      if (guestThreads.length === 0 && guestMessages.length === 0) {
        logger.info(`No guest data found for session ${guestSessionId}`);
        return {
          threadsSynced: 0,
          messagesSynced: 0,
        };
      }

      logger.info(
        `Found ${guestThreads.length} threads and ${guestMessages.length} messages to sync`
      );

      // Update all threads for this guest session
      const threadResult = await ThreadModel.updateMany(
        { guestSessionId },
        {
          $set: { user: userId },
          $unset: { guestSessionId: "" },
          updatedAt: new Date(),
        }
      );

      // Update all messages for this guest session
      const messageResult = await MessageModel.updateMany(
        { guestSessionId },
        {
          $set: { user: userId },
          $unset: { guestSessionId: "" },
          updatedAt: new Date(),
        }
      );

      logger.info(
        `Sync completed: ${threadResult.modifiedCount} threads and ${messageResult.modifiedCount} messages synced`
      );

      return {
        threadsSynced: threadResult.modifiedCount,
        messagesSynced: messageResult.modifiedCount,
      };
    } catch (error) {
      logger.error("Error syncing guest data:", error);
      throw error;
    }
  }

  /**
   * Clean up expired guest sessions (older than 30 days)
   */
  async cleanupExpiredGuestSessions() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    try {
      // Find expired guest threads
      const expiredThreads = await ThreadModel.find({
        guestSessionId: { $exists: true },
        updatedAt: { $lt: thirtyDaysAgo },
      });

      const threadIds = expiredThreads.map((thread) => thread._id);

      // Delete expired messages
      const messageResult = await MessageModel.deleteMany({
        thread: { $in: threadIds },
      });

      // Delete expired threads
      const threadResult = await ThreadModel.deleteMany({
        _id: { $in: threadIds },
      });

      logger.info(
        `Cleanup completed: ${threadResult.deletedCount} threads and ${messageResult.deletedCount} messages deleted`
      );

      return {
        threadsDeleted: threadResult.deletedCount,
        messagesDeleted: messageResult.deletedCount,
      };
    } catch (error) {
      logger.error("Error cleaning up expired guest sessions:", error);
      throw error;
    }
  }
}

export const guestSessionService = new GuestSessionService();
