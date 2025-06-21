import type { Route } from "./+types/_app";

import AppLayout from "~/components/Layouts/AppLayout";
import { chatService } from "~/services/chat.server";
import type { LoaderFunctionArgs } from "react-router";
import { ChatProvider } from "~/contexts/chat";
import { authService } from "~/services/auth.server";
import { llmService } from "~/services/db/llm.server";

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

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authService.getUser(request);

  let threads: { _id: string; title?: string }[] = [];

  if (user) {
    // Load user threads
    const rawThreads = await chatService.listThreads(user._id);
    threads = rawThreads.map((t: any) => ({
      _id: t._id.toString(),
      title: t.title,
    }));
  } else {
    // Load guest threads from cookie
    const cookieHeader = request.headers.get("cookie");
    const guestSessionId = getCookieValue(cookieHeader, "guestSessionId");

    if (guestSessionId) {
      const rawThreads = await chatService.listThreads(
        undefined,
        guestSessionId
      );
      threads = rawThreads.map((t: any) => ({
        _id: t._id.toString(),
        title: t.title,
      }));
    }
  }

  const models = await llmService.findAll();

  return { threads, models: models.documents, user };
}
export default function Layout({ loaderData }: Route.ComponentProps) {
  return (
    <ChatProvider
      models={loaderData.models}
      initialThreads={loaderData.threads}
    >
      <AppLayout />
    </ChatProvider>
  );
}
