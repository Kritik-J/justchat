import { ThreadModel, MessageModel, type IThread } from "@justchat/database";
import { streamGenerateWithWebSearch } from "./llmProvider.server";
import type { ChatCompletionMessageParam } from "openai/resources";
import { generateShareId } from "~/utils/shareUtils";

type Thread = {
  _id: string;
  title?: string;
};

class ChatService {
  async startThread(
    userId?: string,
    title?: string,
    guestSessionId?: string,
    model: string = "gemini"
  ) {
    if (!userId && !guestSessionId) {
      throw new Error("Either userId or guestSessionId is required");
    }

    const thread = await ThreadModel.create({
      user: userId || null,
      guestSessionId: userId ? undefined : guestSessionId,
      title: title || "New Chat",
      model_name: model,
      is_active: true,
      settings: {
        temperature: 0.5,
        max_tokens: 1000,
        system_prompt: "",
      },
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return thread;
  }

  async listThreads(userId?: string, guestSessionId?: string) {
    if (guestSessionId && !userId) {
      return ThreadModel.find({
        guestSessionId,
        is_active: true,
      }).sort({ updatedAt: -1 });
    }

    if (!userId) {
      return [];
    }

    return ThreadModel.find({ user: userId, is_active: true }).sort({
      updatedAt: -1,
    });
  }

  async getMessages(threadId: string, guestSessionId?: string) {
    return MessageModel.find({ thread: threadId }).sort({ created_at: 1 });
  }

  async *sendMessage(
    threadId: string,
    userId: string | undefined,
    content: string,
    llm: string,
    settings: Record<string, any> = {},
    attachments?: any[],
    guestSessionId?: string,
    assistantMsgId?: string,
    enableWebSearch: boolean = false
  ): AsyncGenerator<string, { messageId: string }, unknown> {
    // Save user message only if not retrying an assistant message
    if (!assistantMsgId) {
      await MessageModel.create({
        thread: threadId,
        guestSessionId: userId ? undefined : guestSessionId,
        content,
        model_name: llm,
        role: "user",
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments,
      });
    }

    let historyDocs;
    if (assistantMsgId) {
      const assistantMsg = await MessageModel.findById(assistantMsgId);
      if (!assistantMsg) throw new Error("Assistant message not found");
      historyDocs = await MessageModel.find({
        thread: threadId,
        created_at: { $lt: assistantMsg.created_at },
      }).sort({ created_at: 1 });
    } else {
      historyDocs = await MessageModel.find({ thread: threadId }).sort({
        created_at: 1,
      });
    }
    const history: ChatCompletionMessageParam[] = historyDocs.map((msgDoc) => ({
      role: msgDoc.role as "user" | "assistant",
      content: msgDoc.content,
    }));

    if (!assistantMsgId) {
      history.push({ role: "user", content });
    }

    let aiContent = "";
    for await (const chunk of streamGenerateWithWebSearch(
      llm,
      history,
      settings,
      enableWebSearch
    )) {
      aiContent += chunk;
      yield chunk;
    }

    let finalMessageId: string;

    if (assistantMsgId) {
      console.log(`[RETRY] Updating existing message: ${assistantMsgId}`);
      await MessageModel.findByIdAndUpdate(assistantMsgId, {
        content: aiContent,
        model_name: llm,
        updatedAt: new Date(),
      });
      finalMessageId = assistantMsgId;
      console.log(`[RETRY] Updated message ID: ${finalMessageId}`);
    } else {
      console.log(`[NEW] Creating new message for thread: ${threadId}`);
      const newMessage = await MessageModel.create({
        thread: threadId,
        guestSessionId: userId ? undefined : guestSessionId,
        content: aiContent,
        model_name: llm,
        role: "assistant",
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      finalMessageId = (newMessage._id as any).toString();
      console.log(`[NEW] Created message ID: ${finalMessageId}`);
    }

    return { messageId: finalMessageId };
  }

  async uploadAttachment(file: File) {
    throw new Error("Not implemented");
  }

  async branchThread(threadId: string, userId: string, branchName: string) {
    throw new Error("Not implemented");
  }

  async getLatestAssistantMessage(threadId: string) {
    return MessageModel.findOne({ thread: threadId, role: "assistant" }).sort({
      created_at: -1,
    });
  }

  async deleteThread(threadId: string) {
    await ThreadModel.findByIdAndDelete(threadId);
  }

  async getThread(threadId: string) {
    return ThreadModel.findById(threadId);
  }

  async updateThread(threadId: string, updates: Partial<Thread>) {
    await ThreadModel.findByIdAndUpdate(threadId, updates);
  }

  async shareThread(threadId: string): Promise<string> {
    const thread = await ThreadModel.findById(threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }

    // Generate unique share ID
    const shareId = generateShareId();

    // Update thread with share ID
    await ThreadModel.findByIdAndUpdate(threadId, { shareId });

    return shareId;
  }

  async getThreadByShareId(shareId: string): Promise<IThread | null> {
    return ThreadModel.findOne({ shareId, is_active: true });
  }

  async forkThread(
    shareId: string,
    userId?: string,
    guestSessionId?: string,
    title?: string
  ): Promise<string> {
    if (!userId && !guestSessionId) {
      throw new Error("Either userId or guestSessionId is required");
    }

    // Get the shared thread
    const sharedThread = await this.getThreadByShareId(shareId);
    if (!sharedThread) {
      throw new Error("Shared thread not found");
    }

    // Get all messages from the shared thread
    const messages = await MessageModel.find({
      thread: sharedThread._id,
    }).sort({ created_at: 1 });

    // Create new thread with similar settings but new ownership
    const newThread = await ThreadModel.create({
      user: userId || null,
      guestSessionId: userId ? undefined : guestSessionId,
      title: title || `${sharedThread.title} (forked)`,
      model_name: sharedThread.model_name,
      is_active: true,
      settings: sharedThread.settings,
      metadata: { ...sharedThread.metadata, forkedFrom: sharedThread._id },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Copy all messages to the new thread
    if (messages.length > 0) {
      const newMessages = messages.map((msg) => ({
        thread: newThread._id,
        guestSessionId: userId ? undefined : guestSessionId,
        content: msg.content,
        model_name: msg.model_name,
        role: msg.role,
        metadata: msg.metadata,
        createdAt: msg.created_at,
        updatedAt: new Date(),
      }));

      await MessageModel.insertMany(newMessages);
    }

    return newThread._id.toString();
  }
}

export const chatService = new ChatService();
