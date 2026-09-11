import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-surface-border bg-surface-subtle/50 py-8 px-4 sm:px-6 mt-16 font-mono text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand Meta */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">CROWDSIGNAL</span>
            <span className="text-[10px] text-brand border border-brand/30 px-1.5 py-0.5 rounded bg-brand/10">
              SOMNIA TESTNET 50312
            </span>
          </div>
          <p className="text-slate-500 text-[11px] font-sans">
            Event Intelligence & Verifiable Prediction Reputation for DreamDEX Event Contracts.
          </p>
          <p className="text-slate-500 text-[11px] font-sans">
            Built for the Somnia × DreamDEX Event Contracts Hackathon on DoraHacks.
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-slate-400">
          <Link href="/developers" className="hover:text-brand transition-colors">
            Developers
          </Link>
          <Link href="/docs" className="hover:text-brand transition-colors">
            Docs
          </Link>
          <a
            href="https://shannon-explorer.somnia.network"
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand transition-colors"
          >
            Shannon Explorer
          </a>
          <a
            href="https://docs.dreamdex.io"
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand transition-colors"
          >
            DreamDEX Docs
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
