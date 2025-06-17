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
import { EllipsisIcon } from "@justchat/ui/icons";
import Upgrade from "./Upgrade";
import { Link } from "react-router";

// Thread type
type Thread = {
  _id: string;
  title?: string;
};

export default function AppSidebar({ threads }: { threads: Thread[] }) {
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
