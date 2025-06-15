import AppLayout from "~/components/Layouts/AppLayout";
import { chatService } from "~/services/chat.server";
import { getUserSession } from "~/services/sessionStorage.server";
import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getUserSession(request);
  const userId = session.get("userId") as string | undefined;
  let threads: { _id: string; title?: string }[] = [];
  if (userId) {
    const rawThreads = await chatService.listThreads(userId);
    threads = rawThreads.map((t: any) => ({
      _id: t._id.toString(),
      title: t.title,
    }));
  }
  return { threads };
}
export default function Layout() {
  const { threads } = useLoaderData() as {
    threads: { _id: string; title?: string }[];
  };
  return <AppLayout threads={threads} />;
}
