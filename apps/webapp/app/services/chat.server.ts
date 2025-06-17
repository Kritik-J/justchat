import { ThreadModel, MessageModel } from "@justchat/database";
import { streamGenerate } from "./llmProvider.server";
import type { ChatCompletionMessageParam } from "openai/resources";
import { logger } from "@justchat/logger";

class ChatService {
  async startThread(userId: string, title?: string) {
    if (!userId) throw new Error("User ID is required");
    const thread = await ThreadModel.create({
      user: userId,
      title: title || "New Chat",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return thread;
  }

  async listThreads(userId: string) {
    return ThreadModel.find({ user: userId }).sort({ updatedAt: -1 });
  }

  async *sendMessage(
    threadId: string,
    userId: string | undefined,
    content: string,
    llm: string,
    settings: Record<string, any> = {},
    attachments?: any[],
    guestSessionId?: string,
    assistantMsgId?: string
  ): AsyncGenerator<string, void, unknown> {
    // Save user message only if not retrying an assistant message
    if (!assistantMsgId) {
      await MessageModel.create({
        thread: threadId,
        user: userId || undefined,
        guestSessionId: userId ? undefined : guestSessionId,
        content,
        model_name: llm,
        role: "user",
        createdAt: new Date(),
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
    for await (const chunk of streamGenerate(llm, history, settings)) {
      aiContent += chunk;
      yield chunk;
    }

    if (assistantMsgId) {
      await MessageModel.findByIdAndUpdate(assistantMsgId, {
        content: aiContent,
        model_name: llm,
        updatedAt: new Date(),
      });
    } else {
      await MessageModel.create({
        thread: threadId,
        user: null,
        guestSessionId: userId ? undefined : guestSessionId,
        content: aiContent,
        model_name: llm,
        role: "assistant",
        createdAt: new Date(),
      });
    }
  }

  async getMessages(threadId: string) {
    return MessageModel.find({ thread: threadId }).sort({ created_at: 1 });
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
}

export const chatService = new ChatService();
