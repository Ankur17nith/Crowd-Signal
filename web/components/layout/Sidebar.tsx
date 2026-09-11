"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useAccount } from "wagmi";

interface SidebarProps {
  onCloseMobile?: () => void;
}

const NAV_ITEMS = [
  { label: "Overview", href: "/", icon: "grid_view" },
  { label: "Markets", href: "/markets", icon: "candlestick_chart" },
  { label: "Leaderboard", href: "/leaderboard", icon: "trophy" },
  { label: "Developers", href: "/developers", icon: "terminal" },
  { label: "Docs", href: "/docs", icon: "description" },
];

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();

  const isNavActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="h-full w-60 bg-[#131313] border-r border-[#292929] flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center gap-2.5 border-b border-[#292929]">
          <Logo size={26} />
          <span className="text-[15px] font-semibold text-[#F5F5F5] tracking-tight">
            CrowdSignal
          </span>
          <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1A1A1A] text-[#707070] border border-[#292929]">
            v1.2
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 p-2">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-2.5 px-3 py-2 rounded text-[13px] transition-colors ${
                  active
                    ? "bg-[#202020] text-[#F5F5F5] font-medium"
                    : "text-[#A1A1A1] hover:bg-[#1A1A1A] hover:text-[#F5F5F5]"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Network & Wallet Status */}
      <div className="p-3 border-t border-[#292929] flex flex-col gap-2">
        {/* Network Telemetry Pill */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded text-[12px]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4DA3FF]" />
            <span className="text-[12px] text-[#A1A1A1]">Somnia Shannon</span>
          </div>
          <span
            className="material-symbols-outlined text-[15px] text-[#707070]"
            title="Telemetry Synchronized"
          >
            sensors
          </span>
        </div>

        {/* Account / Wallet Pill */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#0D0D0D] border border-[#202020]">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="material-symbols-outlined text-[15px] text-[#707070] shrink-0">
              account_balance_wallet
            </span>
            <span className="text-[11px] font-mono text-[#F5F5F5] truncate">
              {isConnected && address
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                : "Public Observer"}
            </span>
          </div>
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isConnected ? "bg-[#4DA3FF]" : "bg-[#707070]"
            }`}
          />
        </div>
      </div>
    </aside>
  );
}
