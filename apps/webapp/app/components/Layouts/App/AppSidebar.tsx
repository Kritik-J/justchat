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
import { useChat, type Thread } from "~/contexts/chat";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@justchat/ui/components/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@justchat/ui/components/dialog";
import { useState } from "react";
import { Button } from "@justchat/ui/components/button";
import { toast } from "@justchat/ui/components/sonner";
import { ShareThreadDialog } from "~/components/ShareThreadDialog";

export default function AppSidebar() {
  const { threads, removeThread, updateThread } = useChat();
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameThreadId, setRenameThreadId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharingThread, setSharingThread] = useState<Thread | null>(null);

  return (
    <>
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
              <a
                href="/"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <PlusIcon className="size-4" />
                New Chat
              </a>
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
                  {threads.map((thread, index) => (
                    <SidebarMenuItem key={index}>
                      <div className="flex items-center w-full">
                        <SidebarMenuButton asChild>
                          <Link
                            to={`/chat/${thread._id}`}
                            className="flex-1 truncate"
                          >
                            <span>{thread.title || "New Chat"}</span>
                          </Link>
                        </SidebarMenuButton>
                        <div className="ml-auto opacity-0 group-hover/menu-item:opacity-100">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <EllipsisIcon className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSharingThread(thread);
                                  setShareDialogOpen(true);
                                }}
                              >
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.preventDefault();
                                  setRenameThreadId(thread._id);
                                  setRenameValue(thread.title || "");
                                  setRenameOpen(true);
                                }}
                              >
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.preventDefault();
                                  removeThread(thread._id);
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
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

        <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Thread</DialogTitle>
            </DialogHeader>
            <input
              className="w-full border rounded px-2 py-1 mt-2"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="default"
                  onClick={async () => {
                    if (renameThreadId && renameValue.trim()) {
                      await updateThread(renameThreadId, {
                        title: renameValue.trim(),
                      });
                    }
                    setRenameOpen(false);
                  }}
                >
                  Save
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Sidebar>
      <ShareThreadDialog
        thread={sharingThread}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
    </>
  );
}
