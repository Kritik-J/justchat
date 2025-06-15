import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { messageService } from "~/services/db/message.server";
import { threadService } from "~/services/db/thread.server";
import { authService } from "~/services/auth.server";
import type { ObjectId } from "mongoose";

class ChatService {
  async generateResponse(prompt: string) {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt,
      });
      return {
        success: true,
        text,
      };
    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    }
  }

  // TODO: Design the service
  // User will be able to chat with the AI
  // User will be able to upload files to the AI (limit formats, size, etc.)
  // Figure out the best way to handle the threads, messages
}

export const chatService = new ChatService();

export async function handleChatMessage(request: Request) {
  const user = await authService.getUser(request);

  console.log("User from session:", user);

  if (!user) {
    return { success: false, message: "User not found" };
  }

  const formData = await request.formData();

  const message = formData.get("message") as string;
  console.log("Message from form:", message);

  if (!message) {
    return { success: false, message: "Message is required" };
  }

  try {
    // Get or create a thread for the user
    let thread = await threadService.findOne({
      user: user._id,
    });

    console.log("Existing thread:", thread);

    if (!thread) {
      thread = await threadService.create({
        user: user._id,
        title: "New Chat",
        model_name: "gpt-4o-mini",
      });

      console.log("Created new thread:", thread);
    }

    // Store user message
    const userMessage = await messageService.create({
      content: message,
      role: "user",
      model_name: "gpt-4o-mini",
      thread: thread._id,
    });

    console.log("Created user message:", userMessage);

    const response = await chatService.generateResponse(message);

    // Store AI response
    const assistantMessage = await messageService.create({
      content: response.text,
      role: "assistant",
      thread: thread._id,
      model_name: "gpt-4o-mini",
    });

    return {
      success: true,
      messages: [userMessage, assistantMessage],
    };
  } catch (error) {
    console.error("Error processing chat message:", error);
    return { success: false, message: "Failed to process message" };
  }
}
