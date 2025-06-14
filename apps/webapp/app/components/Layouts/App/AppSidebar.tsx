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

export default function AppSidebar() {
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
                {Array.from({ length: 10 }).map((_, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild>
                      <Link to={`/chat/${index + 1}`}>
                        <span>Chat {index + 1}</span>

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
