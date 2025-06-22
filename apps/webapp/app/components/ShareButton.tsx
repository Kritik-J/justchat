import { useState } from "react";
import { Button } from "@justchat/ui/components/button";
import { ShareIcon } from "@justchat/ui/icons";
import { toast } from "@justchat/ui/components/sonner";

interface ShareButtonProps {
  threadId: string;
}

export function ShareButton({ threadId }: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/chat/share-thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId }),
      });

      if (response.ok) {
        const { shareId } = await response.json();
        const shareUrl = `${window.location.origin}/share/${shareId}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Thread shared! Link copied to clipboard.");
      } else {
        toast.error("Failed to share thread");
      }
    } catch (error) {
      toast.error("Failed to share thread");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <ShareIcon className="h-4 w-4" />
      {isLoading ? "Sharing..." : "Share"}
    </Button>
  );
}
