"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div
      className="w-64 h-screen bg-[#1a1a1e] text-white flex flex-col items-center py-8 border-r border-[#2b2b33]"
    >
      {/* LOGO */}
      <div className="flex flex-col items-center mb-10">
        <Image
          src="/tes-logo.png"
          alt="StorySignal Logo"
          width={68}
          height={68}
          className="mb-2 opacity-90"
        />

        <div className="text-xl font-bold tracking-wide flex items-start">
          StorySignal
          <span className="text-[10px] align-super ml-[2px] text-[#ee9d1a]">
            ™
          </span>
        </div>
      </div>

      {/* MENU */}
      <nav className="w-full px-4">
        <SidebarItem href="/" label="Analyze" pathname={pathname} />
        <SidebarItem href="/history" label="History" pathname={pathname} />
        <SidebarItem href="/profile" label="Profile" pathname={pathname} />
      </nav>

      {/* BOTTOM EMPTY AREA FOR FUTURE GRAPH */}
      <div className="flex-1 w-full flex items-center justify-center mt-6">
        {/* Placeholder for future archetype-circle graph */}
      </div>
    </div>
  );
}

function SidebarItem({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const active = pathname === href;

  return (
    <Link href={href}>
      <div
        className={`w-full py-3 px-4 rounded-lg cursor-pointer mb-2 transition
          ${
            active
              ? "bg-[#4e4b5c] text-white font-semibold"
              : "text-gray-300 hover:bg-[#2e2e35]"
          }
        `}
      >
        {label}
      </div>
    </Link>
  );
}


