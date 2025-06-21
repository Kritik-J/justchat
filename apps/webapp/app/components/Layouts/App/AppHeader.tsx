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
import {
  LogOutIcon,
  PackageIcon,
  SettingsIcon,
  LogInIcon,
} from "@justchat/ui/icons";
import { useSubmit, useNavigate } from "react-router";
import type { IUser } from "@justchat/database";

interface AppHeaderProps {
  user: IUser | null;
}

export default function AppHeader({ user }: AppHeaderProps) {
  const { open, isMobile } = useSidebar();
  const submit = useSubmit();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await submit(null, { method: "post", action: "/auth/logout" });
    navigate(0);
  };

  return (
    <div className="h-12 flex items-center justify-between inset-x-0 px-4 bg-background sticky top-0 z-10">
      <div>{(!open || isMobile) && <SidebarTrigger />}</div>

      <div>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="size-7 cursor-pointer">
                <AvatarFallback>
                  {user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
                <AvatarImage
                  src={`https://github.com/${user.email.split("@")[0]}.png`}
                />
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuItem>
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuItem>
                <PackageIcon className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleLogout}>
                <LogOutIcon className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="mt-2">
            <a
              href="/auth/magic-link"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <LogInIcon className="w-4 h-4 mr-2" />
              Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
