import { ThreadModel, MessageModel } from "@justchat/database";
import { streamGenerate } from "./llmProvider.server";
import type { ChatCompletionMessageParam } from "openai/resources";

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
    guestSessionId?: string
  ): AsyncGenerator<string, void, unknown> {
    // Save user message
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

    // Fetch full message history for the thread
    const historyDocs = await MessageModel.find({ thread: threadId }).sort({
      createdAt: 1,
    });
    const history: ChatCompletionMessageParam[] = historyDocs.map((msgDoc) => ({
      role: msgDoc.role as "user" | "assistant",
      content: msgDoc.content,
    }));

    history.push({ role: "user", content });

    let aiContent = "";
    for await (const chunk of streamGenerate(llm, history, settings)) {
      aiContent += chunk;
      yield chunk;
    }

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

  async getMessages(threadId: string) {
    return MessageModel.find({ thread: threadId }).sort({ createdAt: 1 });
  }

  async uploadAttachment(file: File) {
    throw new Error("Not implemented");
  }

  async branchThread(threadId: string, userId: string, branchName: string) {
    throw new Error("Not implemented");
  }
}

export const chatService = new ChatService();
