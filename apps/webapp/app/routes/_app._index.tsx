import ChatInput from "~/components/Chat/ChatInput";
import type { Route } from "./+types/_app._index";
import ChatList from "~/components/Chat/ChatList";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Page() {
  return (
    <div className="p-4 h-full w-full grid grid-rows-[1fr_auto]">
      <ChatList />

      <ChatInput />
    </div>
  );
}
