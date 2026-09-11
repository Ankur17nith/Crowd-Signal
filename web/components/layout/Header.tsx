"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NetworkBadge } from "./NetworkBadge";
import { WalletModal } from "./WalletModal";

interface HeaderProps {
  isDemoMode?: boolean;
  onToggleDemo?: () => void;
}

export function Header({ isDemoMode, onToggleDemo }: HeaderProps) {
  const pathname = usePathname();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const navLinks = [
    { label: "Overview", href: "/" },
    { label: "Markets", href: "/markets" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Developers", href: "/developers" },
    { label: "Docs", href: "/docs" },
  ];

  const handleConnect = () => {
    // Default simulated connection to verified predictor 0x71A...92F
    setWalletAddress("0x71A9908C8E645d9441faB8B33Af671239c36892F");
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-brand via-brand-dark to-slate-900 border border-brand/40 flex items-center justify-center font-mono font-black text-xs text-black">
                CS
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-bold text-sm tracking-tight text-white group-hover:text-brand transition-colors">
                  CROWDSIGNAL
                </span>
                <span className="text-[9px] font-mono text-slate-500 -mt-1 tracking-wider uppercase">
                  Somnia Oracle
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                      isActive
                        ? "text-brand bg-brand/10 font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-surface-subtle"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            <NetworkBadge isDemoMode={isDemoMode} onToggleDemo={onToggleDemo} />

            {/* Wallet Button */}
            {!walletAddress ? (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="px-3.5 py-1.5 bg-brand hover:bg-brand-subtle text-black font-mono font-bold text-xs rounded transition-colors uppercase tracking-wider"
              >
                Connect Wallet
              </button>
            ) : (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-surface-subtle hover:bg-surface-elevated border border-surface-border rounded font-mono text-xs text-white transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="md:hidden flex items-center justify-around border-t border-surface-border/60 bg-surface-subtle/50 px-2 py-1.5 text-xs font-mono">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 py-1 rounded ${
                  isActive ? "text-brand bg-brand/10 font-medium" : "text-slate-400"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </header>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        address={walletAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onSwitchNetwork={() => {}}
      />
    </>
  );
}
