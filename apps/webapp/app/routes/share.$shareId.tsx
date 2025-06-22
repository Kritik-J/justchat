import type { LoaderFunctionArgs } from "react-router";
import { chatService } from "~/services/chat.server";
import { SharedThreadView } from "~/components/SharedThreadView";

export async function loader({ params }: LoaderFunctionArgs) {
  const { shareId } = params;

  if (!shareId) {
    throw new Response("Share ID is required", { status: 400 });
  }

  try {
    const thread = await chatService.getThreadByShareId(shareId);

    if (!thread) {
      throw new Response("Shared thread not found", { status: 404 });
    }

    const messages = await chatService.getMessages(thread._id.toString());

    return new Response(JSON.stringify({ thread, messages }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    throw new Response("Failed to load shared thread", { status: 500 });
  }
}

export default function SharedThreadPage() {
  return <SharedThreadView />;
}
