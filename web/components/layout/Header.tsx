"use client";

import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Logo } from "@/components/ui/Logo";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);

  return (
    <header className="fixed top-0 left-0 lg:left-60 right-0 h-14 bg-[#131313] z-40 border-b border-[#292929]">
      <div className="h-14 px-4 lg:px-6 flex items-center justify-between">
        {/* Left Side: Mobile Menu Button & Mobile Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 rounded text-[#A1A1A1] hover:text-[#F5F5F5] hover:bg-[#1A1A1A] transition-colors"
            aria-label="Open Navigation"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>

          <div className="flex items-center gap-2 lg:hidden">
            <Logo size={24} />
            <span className="text-[14px] font-semibold text-[#F5F5F5]">CrowdSignal</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#1A1A1A] text-[#A1A1A1] border border-[#292929]">
              Testnet Alpha
            </span>
          </div>
        </div>

        {/* Right Side: Network Badge + Wallet Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-[#1A1A1A] border border-[#292929]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4DA3FF]" />
            <span className="text-[12px] text-[#F5F5F5] font-medium">Somnia Shannon</span>
          </div>

          {isConnected && address ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                className="h-8 px-3 rounded bg-[#1A1A1A] hover:bg-[#202020] text-[#F5F5F5] border border-[#292929] text-[12px] font-mono transition-colors flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#4DA3FF]" />
                <span>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
              </button>

              {showWalletDropdown && (
                <div className="absolute right-0 mt-1 w-48 bg-[#1A1A1A] border border-[#292929] rounded shadow-xl py-1 z-50">
                  <div className="px-3 py-2 border-b border-[#202020]">
                    <div className="text-[10px] text-[#707070] uppercase">Connected Wallet</div>
                    <div className="text-[11px] font-mono text-[#F5F5F5] truncate mt-0.5">{address}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      disconnect();
                      setShowWalletDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] text-[#E7A94B] hover:bg-[#202020] transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[15px]">logout</span>
                    <span>Disconnect</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (connectors.length > 0) {
                  connect({ connector: connectors[0] });
                }
              }}
              className="h-8 px-3.5 rounded bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#0D0D0D] text-[12px] font-medium transition-colors flex items-center gap-1.5"
            >
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
