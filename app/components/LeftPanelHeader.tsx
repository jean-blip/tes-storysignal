"use client";

import Image from "next/image";

export default function LeftPanelHeader({
  email,
  onSignOut,
  onOpenDrawer,
}: {
  email: string | null;
  onSignOut: () => void;
  onOpenDrawer: () => void;
}) {
  return (
    <div className="flex flex-col mb-4">
      {/* Logo + StorySignal™ on one row */}
      <div className="flex items-center gap-3 mb-2">
        <Image
          src="/tes-logo.png"
          alt="StorySignal logo"
          width={34}
          height={34}
          className="opacity-95"
        />

        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold tracking-wide">StorySignal</span>
          <span className="text-[#ee9d1a] text-base font-bold">™</span>
        </div>
      </div>

      {/* Email + Sign out or Sign in */}
      <div className="text-sm opacity-80 mb-3 ml-[2px]">
        {email ? (
          <>
            <span>{email}</span>
            <button
              onClick={onSignOut}
              className="underline opacity-80 hover:opacity-100 ml-1"
            >
              • Sign out
            </button>
          </>
        ) : (
          <button
            onClick={onOpenDrawer}
            className="underline opacity-80 hover:opacity-100"
          >
            Sign in / Create account
          </button>
        )}
      </div>
    </div>
  );
}
