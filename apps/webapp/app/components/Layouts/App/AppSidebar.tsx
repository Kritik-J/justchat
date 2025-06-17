import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenu,
  SidebarMenuAction,
} from "@justchat/ui/components/sidebar";
import { EllipsisIcon, PlusIcon } from "@justchat/ui/icons";
import Upgrade from "./Upgrade";
import { Link } from "react-router";
import { useChat } from "~/contexts/chat";

// Thread type
type Thread = {
  _id: string;
  title?: string;
};

export default function AppSidebar() {
  const { threads } = useChat();

  return (
    <Sidebar className="!border-r-0">
      <SidebarHeader className="items-center justify-between flex-row h-12">
        <Link to="/">
          <img src="/logos/quest.svg" alt="Quest" className="h-7 w-7" />
        </Link>
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="px-2 mb-2">
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <PlusIcon className="size-4" />
              New Chat
            </Link>
          </div>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {threads.length === 0 && (
                  <div className="p-2 text-muted-foreground text-sm">
                    No chats yet
                  </div>
                )}
                {threads.map((thread) => (
                  <SidebarMenuItem key={thread._id}>
                    <SidebarMenuButton asChild>
                      <Link to={`/chat/${thread._id}`}>
                        <span>{thread.title || "New Chat"}</span>
                        <SidebarMenuAction showOnHover>
                          <EllipsisIcon className="size-4" />
                        </SidebarMenuAction>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Upgrade />
      </SidebarFooter>
    </Sidebar>
  );
}
