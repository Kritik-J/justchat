import { SidebarTrigger, useSidebar } from "@justchat/ui/components/sidebar";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@justchat/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@justchat/ui/components/dropdown-menu";
import { LogOutIcon, PackageIcon, SettingsIcon } from "@justchat/ui/icons";

export default function AppHeader() {
  const { open, isMobile } = useSidebar();
  return (
    <div className="h-12 flex items-center justify-between inset-x-0 px-4 bg-background sticky top-0 z-10">
      <div>{(!open || isMobile) && <SidebarTrigger />}</div>

      <div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="size-7">
              <AvatarFallback>K</AvatarFallback>
              <AvatarImage src="https://github.com/Kritik-J.png" />
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuItem>
              <PackageIcon className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </DropdownMenuItem>

            <DropdownMenuItem>
              <LogOutIcon className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
