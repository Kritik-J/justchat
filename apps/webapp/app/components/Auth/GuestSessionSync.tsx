import { useState, useEffect } from "react";
import { Button } from "@justchat/ui/components/button";
import { guestSessionClient } from "~/services/guestSession.client";

interface GuestSessionSyncProps {
  userId: string;
  onSyncComplete?: () => void;
}

export default function GuestSessionSync({
  userId,
  onSyncComplete,
}: GuestSessionSyncProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [syncMessage, setSyncMessage] = useState("");
  const [hasGuestData, setHasGuestData] = useState(false);

  useEffect(() => {
    // Check if user has guest session data
    const hasData = guestSessionClient.hasGuestSession();
    setHasGuestData(hasData);
  }, []);

  const handleSync = async () => {
    if (!hasGuestData) return;

    setIsSyncing(true);
    setSyncStatus("syncing");
    setSyncMessage("Syncing your guest conversations...");

    try {
      const result = await guestSessionClient.syncToUser(userId);

      if (result.success) {
        setSyncStatus("success");
        setSyncMessage(
          `Successfully synced ${result.data?.threadsSynced || 0} conversations!`
        );
        setHasGuestData(false);
        onSyncComplete?.();
      } else {
        setSyncStatus("error");
        setSyncMessage(result.message || "Failed to sync guest session");
      }
    } catch (error) {
      setSyncStatus("error");
      setSyncMessage("An error occurred while syncing");
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!hasGuestData) {
    return null;
  }

  return (
    <div className="bg-muted/50 border rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-sm mb-1">Guest Session Detected</h3>
          <p className="text-sm text-muted-foreground mb-3">
            We found conversations from your guest session. Would you like to
            sync them to your account?
          </p>

          {syncStatus !== "idle" && (
            <div className="flex items-center gap-2 text-sm">
              {syncStatus === "syncing" && (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-muted-foreground">{syncMessage}</span>
                </>
              )}
              {syncStatus === "success" && (
                <>
                  <span className="text-green-600">✓</span>
                  <span className="text-green-600">{syncMessage}</span>
                </>
              )}
              {syncStatus === "error" && (
                <>
                  <span className="text-red-600">✗</span>
                  <span className="text-red-600">{syncMessage}</span>
                </>
              )}
            </div>
          )}
        </div>

        {syncStatus === "idle" && (
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            size="sm"
            className="ml-4"
          >
            Sync Conversations
          </Button>
        )}
      </div>
    </div>
  );
}
