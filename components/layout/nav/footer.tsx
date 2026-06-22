"use client";
import React from "react";
import Link from "next/link";
import { Icon } from "../../icon";
import { useLayout } from "../layout-context";

export const Footer = () => {
  const { globalSettings } = useLayout();
  const { header, footer } = globalSettings!;
  const legalLinks = [
    { href: "/confidentialite", label: "Confidentialite" },
    { href: "/suppression-compte", label: "Suppression de compte" },
  ];

  return (
    <footer className="border-t border-white/8 bg-black/35 pt-20 backdrop-blur-xl">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mt-12 flex flex-col flex-wrap items-center gap-6 border-t py-6 md:flex-row md:justify-between">
          <div className="order-last flex justify-center md:order-first md:justify-start">
            <Link href="/" aria-label="go home">
              <Icon
                parentColor={header!.color!}
                data={{ ...header!.icon, size: "small" }}
              />
            </Link>
            <span className="ml-2 self-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} {header?.name}, Tous droits réservés
            </span>
          </div>

          <div className="order-first flex flex-wrap items-center justify-center gap-4 text-sm md:order-none">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-muted-foreground duration-150 hover:text-accent-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="order-first flex justify-center gap-6 text-sm md:order-last md:justify-end">
            {footer?.social?.map((link, index) => (
              <Link
                key={`${link!.icon}${index}`}
                href={link!.url!}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon
                  data={{ ...link!.icon, size: "small" }}
                  className="block text-muted-foreground hover:text-primary"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
