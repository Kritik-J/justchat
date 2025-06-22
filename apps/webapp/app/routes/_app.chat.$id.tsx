import { useLoaderData } from "react-router";
import { chatService } from "~/services/chat.server";
import { getUserSession } from "~/services/sessionStorage.server";
import type { LoaderFunctionArgs } from "react-router";
import ChatView from "~/components/Chat/ChatView";

function getCookieValue(
  cookieHeader: string | null,
  name: string
): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split("=");
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const threadId = params.id;
  if (!threadId) throw new Response("Thread ID required", { status: 400 });

  const thread = await chatService.getThread(threadId);
  if (!thread) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await getUserSession(request);
  const userId = session.get("userId") as string | undefined;

  let guestSessionId: string | undefined = undefined;
  if (!userId) {
    const cookieHeader = request.headers.get("cookie");
    const guestSessionIdFromCookie = getCookieValue(
      cookieHeader,
      "guestSessionId"
    );
    guestSessionId = guestSessionIdFromCookie || undefined;
  }

  const messages = await chatService.getMessages(threadId);
  const formatted = messages.map((msg: any) => ({
    _id: msg._id.toString(),
    id: msg._id.toString(),
    content: msg.content,
    role: msg.role,
    createdAt: msg.createdAt,
  }));
  return { messages: formatted, threadId, userId, guestSessionId };
}

export default function Page() {
  const { messages, threadId, userId, guestSessionId } = useLoaderData();

  return (
    <ChatView
      initialMessages={messages}
      threadId={threadId}
      userId={userId}
      guestSessionId={guestSessionId}
    />
  );
}
