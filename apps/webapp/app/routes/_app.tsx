import type { Route } from "./+types/_app";

import AppLayout from "~/components/Layouts/AppLayout";
import { chatService } from "~/services/chat.server";
import type { LoaderFunctionArgs } from "react-router";
import { ChatProvider } from "~/contexts/chat";
import { authService } from "~/services/auth.server";
import { llmService } from "~/services/db/llm.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authService.getUser(request);

  let threads: { _id: string; title?: string }[] = [];

  if (user) {
    const rawThreads = await chatService.listThreads(user._id);

    threads = rawThreads.map((t: any) => ({
      _id: t._id.toString(),
      title: t.title,
    }));
  }

  const models = await llmService.findAll();

  return { threads, models: models.documents };
}
export default function Layout({ loaderData }: Route.ComponentProps) {
  return (
    <ChatProvider models={loaderData.models}>
      <AppLayout threads={loaderData.threads} />
    </ChatProvider>
  );
}
