"use client";
import React from "react";
import Link from "next/link";
import { useLayout } from "../layout-context";

export const Footer = () => {
  const { globalSettings } = useLayout();
  const { header } = globalSettings!;

  return (
    <footer className="border-b bg-white pt-20 dark:bg-transparent">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mt-12 flex flex-col gap-6 border-t py-6 md:flex-row md:items-center md:justify-between">
          <div className="order-last text-center md:order-first md:text-left">
            <Link href="/" aria-label="go home" className="text-base font-semibold">
              {header?.name}
            </Link>
            <p className="text-muted-foreground mt-2 text-sm">
              © {new Date().getFullYear()} {header?.name}. Tous droits reserves.
            </p>
          </div>

          <div className="order-first flex flex-wrap justify-center gap-6 text-sm md:order-last md:justify-end">
            <Link href="/">Accueil</Link>
            <Link href="/privacy">Confidentialite</Link>
            <Link href="/delete-account">Suppression de compte</Link>
            <Link href="mailto:support@hous.sk">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
