import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@justchat/ui/components/dialog";
import { Button } from "@justchat/ui/components/button";
import { Input } from "@justchat/ui/components/input";
import { toast } from "@justchat/ui/components/sonner";
import { useChat } from "~/contexts/chat";
import { useState, useEffect } from "react";
import type { Thread } from "~/contexts/chat";
import { Link, Copy } from "@justchat/ui/icons";

type ShareThreadDialogProps = {
  thread: Thread | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShareThreadDialog({
  thread,
  open,
  onOpenChange,
}: ShareThreadDialogProps) {
  const { shareThread } = useChat();
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (thread?.shareId) {
      setSharedUrl(`${window.location.origin}/share/${thread.shareId}`);
    } else {
      setSharedUrl(null);
    }
  }, [thread, open]);

  if (!thread) return null;

  const handleAction = async () => {
    const isUpdate = !!thread.shareId;
    const shareId = await shareThread(thread._id);
    if (shareId) {
      const url = `${window.location.origin}/share/${shareId}`;
      setSharedUrl(url);
      await navigator.clipboard.writeText(url);
      if (isUpdate) {
        toast.success("Public link updated and copied to clipboard!");
      } else {
        toast.success("Public link created and copied to clipboard!");
      }
    }
  };

  const handleCopyLink = async () => {
    if (sharedUrl) {
      await navigator.clipboard.writeText(sharedUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const isShared = !!sharedUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isShared ? "Public link to chat" : "Share public link to chat"}
          </DialogTitle>
          <DialogDescription>
            Your name, custom instructions, and any messages you add after
            sharing won't be private.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 mt-4">
          <Input
            value={sharedUrl || `https://justchat.ai/share/...`}
            readOnly
          />
          {isShared ? (
            <Button onClick={handleCopyLink} className="cursor-pointer">
              <Copy className="mr-2 h-4 w-4" />
              Copy link
            </Button>
          ) : (
            <Button onClick={handleAction} className="cursor-pointer">
              <Link className="mr-2 h-4 w-4" />
              Create link
            </Button>
          )}
        </div>

        {isShared && (
          <p className="text-sm text-muted-foreground mt-2">
            Anyone with the link can view this chat.
          </p>
        )}

        {!isShared && thread?.shareId && (
          <p className="text-sm text-muted-foreground mt-2">
            A past version of this chat has already been shared. Manage
            previously shared chats via Settings.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
