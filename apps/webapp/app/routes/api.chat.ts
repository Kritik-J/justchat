import { handleChatMessage } from "~/services/chat.server";

export async function action({ request }: { request: Request }) {
  return handleChatMessage(request);
}
