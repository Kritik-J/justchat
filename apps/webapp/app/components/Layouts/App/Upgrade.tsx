import React from "react";
import { Button } from "@justchat/ui/components/button";
import { Sparkles } from "@justchat/ui/icons";

export default function Upgrade() {
  return (
    <div className="flex flex-col gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-md">
          <Sparkles className="w-4 h-4 text-neutral-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            Upgrade to Pro
          </h3>
          <p className="text-xs text-neutral-500">Unlock premium features</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1 text-xs text-neutral-600">
        <div className="flex items-center gap-1.5">
          <span className="w-1 h-1 bg-neutral-400 rounded-full" />
          14-day free trial
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1 h-1 bg-neutral-400 rounded-full" />
          Unlimited access
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1 h-1 bg-neutral-400 rounded-full" />
          Priority support
        </div>
      </div>

      <Button
        size="sm"
        className="w-full h-8 text-sm font-medium bg-neutral-900 hover:bg-neutral-800 text-white"
      >
        Upgrade Now
      </Button>
    </div>
  );
}
